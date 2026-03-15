export const ASSET_VERSION = "20260316b";
export const FRAME_SRC = `./gold_frame_user_square_opaque.png?v=${ASSET_VERSION}`;
export const FRAME_HOVER_SRC = `./gold_frame_user_square_cutout.png?v=${ASSET_VERSION}`;
export const FRAME_GLOSS_MASK_SRC = `./gold_frame_gloss_mask.png?v=${ASSET_VERSION}`;
export const GALLERY_SCENE_SRC = `./gallery_scene_static_mirror_wall.png?v=${ASSET_VERSION}`;
export const GALLERY_WALL_SRC = `./gallery_scene_wall_refined4.png?v=${ASSET_VERSION}`;
export const GALLERY_SCENE_WIDTH = 2560;
export const GALLERY_SCENE_HEIGHT = 1440;
export const GALLERY_SCENE_ASPECT = GALLERY_SCENE_WIDTH / GALLERY_SCENE_HEIGHT;
export const FRAME_WINDOW = {
  left: "30.8%",
  top: "31.5%",
  width: "38.4%",
  height: "38.4%"
};
export const PACK_COUNT = 10;

const makeAbstractArt = ({ bg, a, b, c, variant }) => {
  let shapes = "";

  if (variant === 0) {
    shapes = `
      <ellipse cx="170" cy="230" rx="125" ry="145" fill="${a}" />
      <ellipse cx="342" cy="230" rx="125" ry="145" fill="${a}" />
      <rect x="214" y="90" width="84" height="280" rx="14" fill="${b}" />
      <ellipse cx="256" cy="228" rx="72" ry="122" fill="${c}" opacity="0.9" />
    `;
  } else if (variant === 1) {
    shapes = `
      <rect x="0" y="0" width="512" height="184" fill="${a}" opacity="0.35" />
      <rect x="0" y="184" width="512" height="184" fill="${b}" opacity="0.4" />
      <rect x="0" y="368" width="512" height="184" fill="${c}" opacity="0.45" />
      <ellipse cx="256" cy="278" rx="150" ry="128" fill="${a}" opacity="0.92" />
      <ellipse cx="256" cy="278" rx="84" ry="76" fill="${b}" opacity="0.95" />
    `;
  } else if (variant === 2) {
    shapes = `
      <rect x="54" y="84" width="404" height="380" rx="72" fill="${a}" />
      <rect x="102" y="132" width="308" height="284" rx="58" fill="${b}" />
      <ellipse cx="256" cy="274" rx="72" ry="104" fill="${c}" />
    `;
  } else {
    shapes = `
      <polygon points="60,80 180,70 238,220 100,236" fill="${a}" />
      <polygon points="272,58 458,80 420,238 250,214" fill="${b}" />
      <polygon points="120,280 388,292 350,468 146,456" fill="${c}" />
      <ellipse cx="258" cy="274" rx="74" ry="74" fill="${a}" opacity="0.7" />
    `;
  }

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 552">
      <rect width="512" height="552" fill="${bg}" />
      ${shapes}
      <rect x="0" y="0" width="512" height="552" fill="none" stroke="rgba(40,32,24,0.16)" stroke-width="3" />
    </svg>
  `;

  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
};

const ARTWORKS = [
  { image: makeAbstractArt({ bg: "#efe4d2", a: "#c6543f", b: "#e89f62", c: "#2f5f98", variant: 0 }) },
  { image: makeAbstractArt({ bg: "#d8e4f2", a: "#da5444", b: "#2f74b2", c: "#f2b362", variant: 1 }) },
  { image: makeAbstractArt({ bg: "#f4ece1", a: "#dc5f4b", b: "#f3b56f", c: "#3b67a8", variant: 2 }) },
  { image: makeAbstractArt({ bg: "#f1e8d8", a: "#4f77b2", b: "#d65b4d", c: "#f0b26b", variant: 3 }) },
  { image: makeAbstractArt({ bg: "#f4eee4", a: "#d05348", b: "#f2a95e", c: "#3a6ea2", variant: 0 }) },
  { image: makeAbstractArt({ bg: "#e6edf6", a: "#2f6ca7", b: "#d95f4c", c: "#f0b468", variant: 2 }) },
  { image: makeAbstractArt({ bg: "#f4ece3", a: "#cf5d4b", b: "#4c7cb7", c: "#efa862", variant: 1 }) },
  { image: makeAbstractArt({ bg: "#f6eede", a: "#d35648", b: "#f0b163", c: "#3566a4", variant: 2 }) },
  { image: makeAbstractArt({ bg: "#e9ecf5", a: "#3f70ad", b: "#da614f", c: "#edb06a", variant: 3 }) },
  { image: makeAbstractArt({ bg: "#efe4d4", a: "#d15a49", b: "#4a75ae", c: "#f2b56d", variant: 0 }) },
  { image: makeAbstractArt({ bg: "#f4ece2", a: "#dc5d4d", b: "#f0aa63", c: "#436fa9", variant: 1 }) },
  { image: makeAbstractArt({ bg: "#e8ecf2", a: "#3a6ca8", b: "#d85a4a", c: "#f0b56d", variant: 2 }) }
];

const DEFAULT_STICKER_PACKS = Array.from({ length: PACK_COUNT }, (_, packIndex) => {
  const start = (packIndex * 3) % ARTWORKS.length;
  const stickers = Array.from({ length: 8 }, (_, stickerIndex) => ({
    id: `pack-${packIndex + 1}-sticker-${stickerIndex + 1}`,
    title: `Sticker ${String(stickerIndex + 1).padStart(2, "0")}`,
    kind: "static",
    file: ARTWORKS[(start + stickerIndex) % ARTWORKS.length].image,
    preview: ARTWORKS[(start + stickerIndex) % ARTWORKS.length].image
  }));

  return {
    id: `pack-${packIndex + 1}`,
    title: `Sticker Pack ${String(packIndex + 1).padStart(2, "0")}`,
    sourceUrl: "",
    cover: stickers[0].preview,
    stickers
  };
});

function resolvePackAsset(packName, relativePath) {
  return `./packs/${packName}/${relativePath}?v=${ASSET_VERSION}`;
}

function normalizeManifestPack(manifest) {
  return {
    id: manifest.id,
    title: manifest.title || manifest.name,
    sourceUrl: manifest.source_url || "",
    channelUrl: manifest.channel_url || "",
    cover: resolvePackAsset(manifest.name, manifest.cover),
    stickers: manifest.stickers.map((sticker, stickerIndex) => ({
      id: sticker.id || `${manifest.id}-${stickerIndex + 1}`,
      title: sticker.title || `Sticker ${String(stickerIndex + 1).padStart(2, "0")}`,
      emoji: sticker.emoji || "",
      kind: sticker.kind || "static",
      file: resolvePackAsset(manifest.name, sticker.file),
      preview: sticker.preview
        ? resolvePackAsset(manifest.name, sticker.preview)
        : resolvePackAsset(manifest.name, sticker.file)
    }))
  };
}

export async function loadStickerPacks() {
  let stickerPacks = DEFAULT_STICKER_PACKS.slice();

  try {
    const indexResponse = await fetch(`./packs/index.json?v=${ASSET_VERSION}`, { cache: "no-store" });
    if (!indexResponse.ok) {
      return stickerPacks;
    }

    const packNames = await indexResponse.json();
    if (!Array.isArray(packNames) || !packNames.length) {
      return stickerPacks;
    }

    const manifests = await Promise.all(
      packNames.map(async (packName) => {
        const response = await fetch(`./packs/${packName}/manifest.json?v=${ASSET_VERSION}`, { cache: "no-store" });
        if (!response.ok) return null;
        return response.json();
      })
    );

    const realPacks = manifests.filter(Boolean).map(normalizeManifestPack);
    if (realPacks.length) {
      stickerPacks = [...realPacks, ...DEFAULT_STICKER_PACKS].slice(0, PACK_COUNT);
    }
  } catch (error) {
    console.error("Failed to load sticker packs", error);
  }

  return stickerPacks;
}
