import {
  ASSET_VERSION,
  FRAME_GLOSS_MASK_SRC,
  FRAME_SRC,
  GALLERY_SCENE_SRC,
  loadStickerPacks
} from "./app-data.js";

const viewerPage = document.getElementById("viewerPage");
const viewerEmpty = document.getElementById("viewerEmpty");
const viewerBackground = document.getElementById("viewerBackground");
const viewerChannel = document.getElementById("viewerChannel");
const viewerSource = document.getElementById("viewerSource");
const viewerArt = document.getElementById("viewerArt");
const viewerVideo = document.getElementById("viewerVideo");
const viewerGold = document.getElementById("viewerGold");
const viewerFrameSheen = document.getElementById("viewerFrameSheen");
const viewerStrip = document.getElementById("viewerStrip");

const params = new URLSearchParams(window.location.search);
const requestedPackIndex = Number.parseInt(params.get("pack") ?? "", 10);
const requestedStickerIndex = Number.parseInt(params.get("sticker") ?? "", 10);

let packs = [];
let activePackIndex = 0;
let activeStickerIndex = 0;

viewerBackground.src = GALLERY_SCENE_SRC;
viewerGold.src = FRAME_SRC;
viewerFrameSheen.style.setProperty("--frame-gloss-mask", `url("${FRAME_GLOSS_MASK_SRC}")`);

function showEmptyState() {
  viewerPage.style.display = "none";
  viewerEmpty.style.display = "grid";
}

function getSafeIndex(index, length) {
  if (!Number.isInteger(index) || index < 0 || index >= length) {
    return 0;
  }
  return index;
}

function syncUrl() {
  const nextParams = new URLSearchParams(window.location.search);
  nextParams.set("pack", String(activePackIndex));
  nextParams.set("v", ASSET_VERSION);
  if (activeStickerIndex > 0) {
    nextParams.set("sticker", String(activeStickerIndex));
  } else {
    nextParams.delete("sticker");
  }
  window.history.replaceState({}, "", `./viewer.html?${nextParams.toString()}`);
}

function getTelegramChannelHandle(pack) {
  if (pack?.channelUrl) {
    try {
      const channelUrl = new URL(pack.channelUrl);
      const handle = channelUrl.pathname.replace(/^\/+/, "").replace(/\/+$/, "");
      if (handle) return handle;
    } catch {
      return "";
    }
  }

  if (!pack?.id) return "";
  const match = pack.id.match(/_([^_]+)_by_/i);
  if (!match) return "";
  const handle = match[1];
  return handle && handle !== "fStikBot" ? handle : "";
}

function renderActiveSticker() {
  const pack = packs[activePackIndex];
  if (!pack) {
    showEmptyState();
    return;
  }

  const sticker = pack.stickers[activeStickerIndex];
  if (!sticker) {
    showEmptyState();
    return;
  }

  const isVideo = sticker.kind === "video";
  const channelHandle = getTelegramChannelHandle(pack);
  const channelUrl = pack.channelUrl || (channelHandle ? `https://t.me/${channelHandle}` : "");

  if (channelUrl) {
    viewerChannel.hidden = false;
    viewerChannel.href = channelUrl;
    viewerChannel.textContent = "Channel";
    viewerChannel.setAttribute("aria-label", channelHandle ? `Channel @${channelHandle}` : "Channel link");
    viewerChannel.title = channelHandle ? `Channel @${channelHandle}` : "Channel link";
  } else {
    viewerChannel.hidden = true;
    viewerChannel.removeAttribute("href");
    viewerChannel.removeAttribute("title");
  }

  if (pack.sourceUrl) {
    viewerSource.hidden = false;
    viewerSource.href = pack.sourceUrl;
    viewerSource.textContent = "Sticker pack";
    viewerSource.setAttribute("aria-label", "Sticker pack");
  } else {
    viewerSource.hidden = true;
    viewerSource.removeAttribute("href");
    viewerSource.removeAttribute("title");
  }

  viewerVideo.pause();
  viewerVideo.currentTime = 0;
  viewerArt.hidden = isVideo;
  viewerVideo.hidden = !isVideo;

  if (isVideo) {
    viewerArt.src = sticker.preview || pack.cover;
    viewerArt.alt = `${pack.title} - ${sticker.title}`;
    viewerVideo.src = sticker.file;
    viewerVideo.poster = sticker.preview || pack.cover;
    viewerVideo.preload = "auto";
    viewerVideo.setAttribute("aria-label", `${pack.title} - ${sticker.title}`);
    viewerVideo.load();
    viewerVideo.play().catch(() => {});
  } else {
    viewerVideo.removeAttribute("src");
    viewerVideo.load();
    viewerArt.src = sticker.file || sticker.preview;
    viewerArt.alt = `${pack.title} - ${sticker.title}`;
  }

  [...viewerStrip.children].forEach((button, index) => {
    const isActive = index === activeStickerIndex;
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-pressed", isActive ? "true" : "false");
  });

  syncUrl();
}

function setActiveSticker(index) {
  const pack = packs[activePackIndex];
  if (!pack?.stickers?.length) return;
  activeStickerIndex = getSafeIndex(index, pack.stickers.length);
  renderActiveSticker();
}

function renderStrip() {
  const pack = packs[activePackIndex];
  if (!pack?.stickers?.length) {
    showEmptyState();
    return;
  }

  const fragment = document.createDocumentFragment();

  pack.stickers.forEach((sticker, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "viewer-thumb";
    button.setAttribute("aria-label", `${sticker.title} 보기`);
    button.setAttribute("aria-pressed", index === activeStickerIndex ? "true" : "false");

    const preview = document.createElement("span");
    preview.className = "viewer-thumb__preview";

    if (sticker.kind === "video") {
      const video = document.createElement("video");
      video.src = sticker.file;
      video.poster = sticker.preview || pack.cover;
      video.muted = true;
      video.loop = true;
      video.autoplay = true;
      video.playsInline = true;
      video.preload = "metadata";
      video.disablePictureInPicture = true;
      video.setAttribute("aria-hidden", "true");
      preview.appendChild(video);
    } else {
      const image = document.createElement("img");
      image.src = sticker.preview || sticker.file;
      image.alt = "";
      image.loading = "lazy";
      image.decoding = "async";
      preview.appendChild(image);
    }

    button.appendChild(preview);
    button.addEventListener("click", () => setActiveSticker(index));

    fragment.appendChild(button);
  });

  viewerStrip.replaceChildren(fragment);
  viewerStrip.querySelectorAll("video").forEach((video) => {
    video.play().catch(() => {});
  });
}

window.addEventListener("keydown", (event) => {
  const pack = packs[activePackIndex];
  if (!pack?.stickers?.length) return;

  if (event.key === "ArrowRight") {
    event.preventDefault();
    setActiveSticker((activeStickerIndex + 1) % pack.stickers.length);
  }

  if (event.key === "ArrowLeft") {
    event.preventDefault();
    setActiveSticker((activeStickerIndex - 1 + pack.stickers.length) % pack.stickers.length);
  }
});

async function initViewer() {
  packs = await loadStickerPacks();

  if (!packs.length) {
    showEmptyState();
    return;
  }

  activePackIndex = getSafeIndex(requestedPackIndex, packs.length);
  activeStickerIndex = getSafeIndex(requestedStickerIndex, packs[activePackIndex].stickers.length);

  viewerEmpty.style.display = "none";
  viewerPage.style.display = "";

  renderStrip();
  renderActiveSticker();
}

initViewer();
