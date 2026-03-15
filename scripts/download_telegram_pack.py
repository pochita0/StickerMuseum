#!/usr/bin/env python3
"""Download a Telegram sticker pack and write a manifest for the museum UI."""

from __future__ import annotations

import argparse
import json
import os
import re
import shutil
import sys
from pathlib import Path
from typing import Any, NoReturn
from urllib.error import HTTPError, URLError
from urllib.parse import urlencode, urlparse
from urllib.request import urlopen


API_BASE = "https://api.telegram.org"
FILE_BASE = "https://api.telegram.org/file"
PACK_NAME_RE = re.compile(r"^[A-Za-z0-9_]{3,}$")


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Download a Telegram sticker pack into a local folder."
    )
    parser.add_argument(
        "pack",
        help="Sticker pack URL or pack name. Example: https://t.me/addstickers/Nethery_aeri005_by_fStikBot",
    )
    parser.add_argument(
        "--output",
        default="packs",
        help="Output root directory. Default: packs",
    )
    parser.add_argument(
        "--token",
        default=os.environ.get("TELEGRAM_BOT_TOKEN", ""),
        help="Telegram bot token. Default: TELEGRAM_BOT_TOKEN env var",
    )
    parser.add_argument(
        "--force",
        action="store_true",
        help="Overwrite existing files",
    )
    return parser.parse_args()


def fail(message: str) -> NoReturn:
    print(f"error: {message}", file=sys.stderr)
    raise SystemExit(1)


def extract_pack_name(value: str) -> str:
    value = value.strip()
    parsed = urlparse(value)
    if parsed.scheme and parsed.netloc:
        path = parsed.path.strip("/")
        parts = [part for part in path.split("/") if part]
        if len(parts) >= 2 and parts[0] in {"addstickers", "stickers"}:
            pack_name = parts[1]
        elif parts:
            pack_name = parts[-1]
        else:
            fail("Could not read pack name from URL")
    else:
        pack_name = value

    if not PACK_NAME_RE.match(pack_name):
        fail(f"Invalid sticker pack name: {pack_name}")
    return pack_name


def api_request(token: str, method: str, **params: Any) -> Any:
    query = urlencode({key: value for key, value in params.items() if value is not None})
    url = f"{API_BASE}/bot{token}/{method}"
    if query:
        url = f"{url}?{query}"

    try:
        with urlopen(url) as response:
            payload = json.load(response)
    except HTTPError as exc:
        fail(f"{method} failed with HTTP {exc.code}")
    except URLError as exc:
        fail(f"{method} failed: {exc.reason}")

    if not payload.get("ok"):
        fail(f"{method} failed: {payload.get('description', 'unknown error')}")
    return payload["result"]


def ensure_dir(path: Path) -> None:
    path.mkdir(parents=True, exist_ok=True)


def download_url(url: str, destination: Path, force: bool) -> None:
    if destination.exists() and not force:
        return
    ensure_dir(destination.parent)
    with urlopen(url) as response, destination.open("wb") as handle:
        shutil.copyfileobj(response, handle)


def infer_extension(file_path: str, sticker: dict[str, Any]) -> str:
    suffix = Path(file_path).suffix.lower()
    if suffix:
        return suffix
    if sticker.get("is_animated"):
        return ".tgs"
    if sticker.get("is_video"):
        return ".webm"
    return ".webp"


def fetch_file(token: str, file_id: str) -> dict[str, Any]:
    return api_request(token, "getFile", file_id=file_id)


def download_telegram_file(
    token: str,
    file_id: str,
    destination: Path,
    force: bool,
) -> dict[str, Any]:
    file_info = fetch_file(token, file_id)
    file_path = file_info["file_path"]
    file_url = f"{FILE_BASE}/bot{token}/{file_path}"
    download_url(file_url, destination, force)
    return file_info


def choose_thumb_field(sticker: dict[str, Any]) -> dict[str, Any] | None:
    return sticker.get("thumbnail") or sticker.get("thumb")


def sticker_kind(sticker: dict[str, Any]) -> str:
    if sticker.get("is_animated"):
        return "animated"
    if sticker.get("is_video"):
        return "video"
    return "static"


def relative(path: Path, root: Path) -> str:
    return str(path.relative_to(root)).replace("\\", "/")


def main() -> None:
    args = parse_args()
    if not args.token:
        fail("Telegram bot token is required. Set TELEGRAM_BOT_TOKEN or pass --token.")

    pack_name = extract_pack_name(args.pack)
    sticker_set = api_request(args.token, "getStickerSet", name=pack_name)

    output_root = Path(args.output).expanduser().resolve()
    pack_dir = output_root / pack_name
    stickers_dir = pack_dir / "stickers"
    thumbs_dir = pack_dir / "thumbs"
    ensure_dir(stickers_dir)
    ensure_dir(thumbs_dir)

    manifest: dict[str, Any] = {
        "id": sticker_set["name"],
        "name": sticker_set["name"],
        "title": sticker_set.get("title", sticker_set["name"]),
        "source_url": f"https://t.me/addstickers/{sticker_set['name']}",
        "cover": "",
        "stickers": [],
    }

    cover_source: Path | None = None

    for index, sticker in enumerate(sticker_set["stickers"], start=1):
        file_info = fetch_file(args.token, sticker["file_id"])
        ext = infer_extension(file_info["file_path"], sticker)
        sticker_path = stickers_dir / f"{index:03d}{ext}"
        download_telegram_file(args.token, sticker["file_id"], sticker_path, args.force)

        thumb = choose_thumb_field(sticker)
        preview_path: Path | None = None
        if thumb and thumb.get("file_id"):
            thumb_info = fetch_file(args.token, thumb["file_id"])
            thumb_ext = Path(thumb_info["file_path"]).suffix.lower() or ".webp"
            preview_path = thumbs_dir / f"{index:03d}{thumb_ext}"
            download_telegram_file(args.token, thumb["file_id"], preview_path, args.force)
        elif sticker_kind(sticker) == "static":
            preview_path = sticker_path

        if cover_source is None and preview_path is not None:
            cover_source = preview_path
        elif cover_source is None:
            cover_source = sticker_path

        manifest["stickers"].append(
            {
                "id": sticker["file_unique_id"],
                "title": f"Sticker {index:02d}",
                "emoji": sticker.get("emoji", ""),
                "kind": sticker_kind(sticker),
                "file": relative(sticker_path, pack_dir),
                "preview": relative(preview_path, pack_dir) if preview_path else "",
                "width": sticker.get("width"),
                "height": sticker.get("height"),
            }
        )

    if cover_source is not None:
        cover_path = pack_dir / f"cover{cover_source.suffix.lower()}"
        if args.force or not cover_path.exists():
            shutil.copyfile(cover_source, cover_path)
        manifest["cover"] = relative(cover_path, pack_dir)

    manifest_path = pack_dir / "manifest.json"
    manifest_path.write_text(
        json.dumps(manifest, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )

    index_path = output_root / "index.json"
    if index_path.exists():
        try:
            index_data = json.loads(index_path.read_text(encoding="utf-8"))
        except json.JSONDecodeError:
            index_data = []
    else:
        index_data = []

    if not isinstance(index_data, list):
        index_data = []

    if pack_name not in index_data:
        index_data.append(pack_name)

    index_data = sorted(dict.fromkeys(index_data))
    index_path.write_text(
        json.dumps(index_data, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )

    print(f"Saved {len(manifest['stickers'])} stickers to {pack_dir}")
    print(f"Manifest: {manifest_path}")


if __name__ == "__main__":
    main()
