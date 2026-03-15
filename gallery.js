import {
  ASSET_VERSION,
  FRAME_HOVER_SRC,
  FRAME_WINDOW,
  GALLERY_WALL_SRC,
  loadStickerPacks
} from "./app-data.js";

const sceneImage = document.getElementById("galleryScene");
const lightLayer = document.getElementById("galleryLightLayer");
const hitLayer = document.getElementById("galleryHitLayer");
const darknessSlider = document.getElementById("galleryDarkness");
const DARKNESS_STORAGE_KEY = "sticker-museum-gallery-darkness";

const FRAME_INNER = {
  left: Number.parseFloat(FRAME_WINDOW.left),
  top: Number.parseFloat(FRAME_WINDOW.top),
  width: Number.parseFloat(FRAME_WINDOW.width),
  height: Number.parseFloat(FRAME_WINDOW.height)
};

const HOTSPOTS = [
  { packIndex: 5, left: 10.1, top: 45.8, width: 10.55, height: 16.9, tiltY: 46, tiltZ: 0, scale: 1.08, originX: "100%" },
  { packIndex: 3, left: 21.15, top: 47.18, width: 9.05, height: 14.15, tiltY: 28, tiltZ: 0, scale: 1.045, originX: "100%" },
  { packIndex: 4, left: 32.52, top: 48, width: 7.82, height: 12.5, tiltY: 12, tiltZ: 0, scale: 1.015, originX: "100%" },
  { packIndex: 0, left: 42.14, top: 48.43, width: 7.42, height: 11.64, tiltY: 2, tiltZ: 0, scale: 1, originX: "60%" },
  { packIndex: 2, left: 50.44, top: 48.43, width: 7.42, height: 11.64, tiltY: -2, tiltZ: 0, scale: 1, originX: "40%" },
  { packIndex: 1, left: 59.34, top: 48, width: 7.82, height: 12.5, tiltY: -12, tiltZ: 0, scale: 1.015, originX: "0%" },
  { packIndex: 7, left: 68.98, top: 47.18, width: 9.05, height: 14.15, tiltY: -28, tiltZ: 0, scale: 1.045, originX: "0%" },
  { packIndex: 6, left: 78.35, top: 45.8, width: 10.55, height: 16.9, tiltY: -46, tiltZ: 0, scale: 1.08, originX: "0%" }
];
const LIGHT_GROUPS = [
  [0, 1],
  [2, 3],
  [4, 5],
  [6, 7]
];
const WALL_START_CURVE = [
  [0, 16.81],
  [3.59, 17.08],
  [10.08, 18.61],
  [18.52, 22.08],
  [27.42, 26.39],
  [36.88, 29.86],
  [50, 31.53],
  [63.12, 29.86],
  [72.58, 26.39],
  [81.48, 22.08],
  [89.92, 18.61],
  [96.41, 17.08],
  [100, 16.81]
];

sceneImage.src = GALLERY_WALL_SRC;
sceneImage.loading = "eager";
sceneImage.decoding = "sync";

function clampDarkness(level) {
  return Math.max(0, Math.min(1, level));
}

function syncDarkness(level) {
  const normalized = clampDarkness(level);
  document.documentElement.style.setProperty("--gallery-darkness-level", normalized.toFixed(3));
  return normalized;
}

function restoreDarknessLevel() {
  try {
    const storedLevel = window.localStorage.getItem(DARKNESS_STORAGE_KEY);
    const parsedLevel = Number.parseFloat(storedLevel ?? "");
    if (Number.isFinite(parsedLevel)) {
      return clampDarkness(parsedLevel);
    }
  } catch {
    // Ignore storage access failures and fall back to the slider's default value.
  }

  return clampDarkness(Number(darknessSlider?.value ?? 0) / 100);
}

function saveDarknessLevel(level) {
  try {
    window.localStorage.setItem(DARKNESS_STORAGE_KEY, String(clampDarkness(level)));
  } catch {
    // Ignore storage access failures so the slider still works.
  }
}

function applyDarkness(level, { persist = true } = {}) {
  const normalized = syncDarkness(level);

  if (darknessSlider) {
    darknessSlider.value = String(Math.round(normalized * 100));
  }

  if (persist) {
    saveDarknessLevel(normalized);
  }
}

function getGalleryPreview(pack) {
  return pack.cover || pack.stickers?.[0]?.preview || pack.stickers?.[0]?.file || "";
}

function getWallStartTop(xPercent) {
  for (let index = 1; index < WALL_START_CURVE.length; index += 1) {
    const [prevX, prevY] = WALL_START_CURVE[index - 1];
    const [nextX, nextY] = WALL_START_CURVE[index];
    if (xPercent <= nextX) {
      const progress = (xPercent - prevX) / Math.max(nextX - prevX, 0.0001);
      return prevY + (nextY - prevY) * progress;
    }
  }
  return WALL_START_CURVE[WALL_START_CURVE.length - 1][1];
}

async function renderGallery() {
  const packs = await loadStickerPacks();
  const fragment = document.createDocumentFragment();
  const lightFragment = document.createDocumentFragment();

  HOTSPOTS.forEach((slot) => {
    const pack = packs[slot.packIndex];
    if (!pack) return;

    const link = document.createElement("a");
    link.className = "gallery-hotspot";
    link.classList.add("gallery-hotspot--lit");
    link.href = `./viewer.html?pack=${slot.packIndex}&v=${ASSET_VERSION}`;
    link.style.left = `${slot.left}%`;
    link.style.top = `${slot.top}%`;
    link.style.width = `${slot.width}%`;
    link.style.height = `${slot.height}%`;
    link.style.setProperty("--slot-tilt-y", `${slot.tiltY ?? 0}deg`);
    link.style.setProperty("--slot-tilt-z", `${slot.tiltZ ?? 0}deg`);
    link.style.setProperty("--slot-scale", `${slot.scale ?? 1}`);
    link.style.setProperty("--slot-hover-scale", `${(slot.scale ?? 1) + 0.035}`);
    link.style.setProperty("--slot-origin-x", slot.originX ?? "50%");
    link.setAttribute("aria-label", `${pack.title} 보기`);

    const artWindow = document.createElement("span");
    artWindow.className = "gallery-hotspot__art";
    artWindow.style.left = `${FRAME_INNER.left}%`;
    artWindow.style.top = `${FRAME_INNER.top}%`;
    artWindow.style.width = `${FRAME_INNER.width}%`;
    artWindow.style.height = `${FRAME_INNER.height}%`;

    const artImage = document.createElement("img");
    artImage.className = "gallery-hotspot__art-media";
    artImage.src = getGalleryPreview(pack);
    artImage.alt = "";
    artImage.loading = "eager";
    artImage.decoding = "sync";

    const frameImage = document.createElement("img");
    frameImage.className = "gallery-hotspot__frame";
    frameImage.src = FRAME_HOVER_SRC;
    frameImage.alt = "";
    frameImage.loading = "eager";
    frameImage.decoding = "sync";

    artWindow.appendChild(artImage);
    link.appendChild(artWindow);
    link.appendChild(frameImage);

    const srOnly = document.createElement("span");
    srOnly.className = "sr-only";
    srOnly.textContent = pack.title;
    link.appendChild(srOnly);
    fragment.appendChild(link);
  });

  LIGHT_GROUPS.forEach((group, groupIndex) => {
    const slots = group.map((slotIndex) => HOTSPOTS[slotIndex]).filter(Boolean);
    if (!slots.length) return;

    const left = Math.min(...slots.map((slot) => slot.left));
    const right = Math.max(...slots.map((slot) => slot.left + slot.width));
    const center = (left + right) / 2;
    const span = right - left;
    const fixtureDrop = groupIndex === 0 || groupIndex === LIGHT_GROUPS.length - 1 ? 3.35 : 1.15;
    const fixtureTop = getWallStartTop(center) + fixtureDrop;
    const beamBottom = Math.max(...slots.map((slot) => slot.top + slot.height * 1.08));
    const spread = span * (groupIndex === 0 || groupIndex === 3 ? 1.38 : 1.32);
    const beamHeight = Math.max(38, beamBottom - fixtureTop);
    const rotate = center < 50 ? Math.max(-8, (center - 50) * 0.16) : Math.min(8, (center - 50) * 0.16);

    const spotlight = document.createElement("div");
    spotlight.className = "gallery-spotlight";
    spotlight.style.left = `${center - spread / 2}%`;
    spotlight.style.top = `${fixtureTop}%`;
    spotlight.style.width = `${spread}%`;
    spotlight.style.height = `${beamHeight}%`;
    spotlight.style.setProperty("--spot-rotate", `${rotate}deg`);
    spotlight.style.setProperty("--spot-fixture-shift", "0%");

    spotlight.innerHTML = `
      <span class="gallery-spotlight__stem"></span>
      <span class="gallery-spotlight__head"></span>
      <span class="gallery-spotlight__beam-soft"></span>
      <span class="gallery-spotlight__beam"></span>
      <span class="gallery-spotlight__pool"></span>
    `;

    lightFragment.appendChild(spotlight);
  });

  lightLayer.replaceChildren(lightFragment);
  hitLayer.replaceChildren(fragment);
}

renderGallery();

if (darknessSlider) {
  darknessSlider.addEventListener("input", (event) => {
    const level = Number(event.currentTarget.value) / 100;
    applyDarkness(level);
  });
}

applyDarkness(restoreDarknessLevel(), { persist: false });
