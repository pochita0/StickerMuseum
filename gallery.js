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
const DEFAULT_DARKNESS_SLIDER_VALUE = 72;
let lightMapCanvas = null;
let lightMapImage = null;
let lightMapAnimationFrame = 0;
let spotlightConfigs = [];
let lightLayerResizeObserver = null;

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

  return clampDarkness(Number(darknessSlider?.value ?? DEFAULT_DARKNESS_SLIDER_VALUE) / 100);
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

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function getFixtureSize() {
  const viewportWidth = window.innerWidth || 1440;
  return {
    width: clamp(viewportWidth * 0.0235, 34, 46),
    height: clamp(viewportWidth * 0.0115, 17, 22)
  };
}

function buildSpotlightConfig(group, groupIndex) {
  const slots = group.map((slotIndex) => HOTSPOTS[slotIndex]).filter(Boolean);
  if (!slots.length) return null;

  const isEdgeGroup = groupIndex === 0 || groupIndex === LIGHT_GROUPS.length - 1;
  const left = Math.min(...slots.map((slot) => slot.left));
  const right = Math.max(...slots.map((slot) => slot.left + slot.width));
  const center = (left + right) / 2;
  const span = right - left;
  const fixtureDrop = isEdgeGroup ? 3.35 : 1.15;
  const fixtureTop = getWallStartTop(center) + fixtureDrop;
  const beamBottom = Math.max(...slots.map((slot) => slot.top + slot.height * 1.08));
  const spread = span * (isEdgeGroup ? 1.38 : 1.32);
  const beamHeight = Math.max(38, beamBottom - fixtureTop);
  const rotate = center < 50 ? Math.max(-8, (center - 50) * 0.16) : Math.min(8, (center - 50) * 0.16);

  return {
    center,
    fixtureTop,
    spread,
    beamHeight,
    rotate,
    intensity: isEdgeGroup ? 1.08 : 0.96,
    fixtureRotate: center < 50 ? 9 : -9,
    isEdgeGroup
  };
}

function ensureLightMapAssets() {
  if (!lightMapCanvas) {
    lightMapCanvas = document.createElement("canvas");
  }

  if (!lightMapImage) {
    lightMapImage = document.createElement("img");
    lightMapImage.className = "gallery-light-map";
    lightMapImage.alt = "";
    lightMapImage.setAttribute("aria-hidden", "true");
    lightMapImage.decoding = "async";
  }

  return { canvas: lightMapCanvas, image: lightMapImage };
}

function drawBeamPolygon(ctx, topHalfWidth, bottomHalfWidth, height) {
  ctx.beginPath();
  ctx.moveTo(-topHalfWidth, 0);
  ctx.lineTo(topHalfWidth, 0);
  ctx.lineTo(bottomHalfWidth, height);
  ctx.lineTo(-bottomHalfWidth, height);
  ctx.closePath();
}

function drawSpotlightBeam(ctx, config, layerWidth, layerHeight) {
  const fixtureSize = getFixtureSize();
  const fixtureRotateRad = (config.fixtureRotate * Math.PI) / 180;
  const lensOffsetX = fixtureSize.width * -0.16;
  const lensOffsetY = fixtureSize.height * 0.1;
  const rotatedLensOffsetX = lensOffsetX * Math.cos(fixtureRotateRad) - lensOffsetY * Math.sin(fixtureRotateRad);
  const rotatedLensOffsetY = lensOffsetX * Math.sin(fixtureRotateRad) + lensOffsetY * Math.cos(fixtureRotateRad);
  const x = layerWidth * (config.center / 100) + rotatedLensOffsetX;
  const y = layerHeight * (config.fixtureTop / 100) + rotatedLensOffsetY + fixtureSize.height * 0.58;
  const beamHeight = layerHeight * (config.beamHeight / 100);
  const spread = layerWidth * (config.spread / 100);
  const intensity = config.intensity;

  ctx.save();
  ctx.translate(x, y);
  ctx.rotate((config.rotate * Math.PI) / 180);
  ctx.globalCompositeOperation = "screen";

  ctx.save();
  ctx.filter = "blur(16px)";
  const headGlow = ctx.createRadialGradient(0, beamHeight * 0.04, 0, 0, beamHeight * 0.04, spread * 0.12);
  headGlow.addColorStop(0, `rgba(255, 249, 233, ${0.38 * intensity})`);
  headGlow.addColorStop(0.45, `rgba(255, 241, 209, ${0.16 * intensity})`);
  headGlow.addColorStop(1, "rgba(255, 236, 198, 0)");
  ctx.fillStyle = headGlow;
  ctx.beginPath();
  ctx.ellipse(0, beamHeight * 0.05, spread * 0.12, beamHeight * 0.06, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  ctx.save();
  ctx.filter = "blur(6px)";
  const outerGradient = ctx.createLinearGradient(0, 0, 0, beamHeight);
  outerGradient.addColorStop(0, `rgba(255, 240, 206, ${0.2 * intensity})`);
  outerGradient.addColorStop(0.3, `rgba(255, 236, 198, ${0.12 * intensity})`);
  outerGradient.addColorStop(0.68, `rgba(255, 236, 198, ${0.06 * intensity})`);
  outerGradient.addColorStop(1, "rgba(255, 236, 198, 0)");
  ctx.fillStyle = outerGradient;
  drawBeamPolygon(ctx, spread * 0.04, spread * 0.54, beamHeight);
  ctx.fill();
  ctx.restore();

  ctx.save();
  ctx.filter = "blur(3px)";
  const midGradient = ctx.createLinearGradient(0, 0, 0, beamHeight);
  midGradient.addColorStop(0, `rgba(255, 246, 221, ${0.28 * intensity})`);
  midGradient.addColorStop(0.34, `rgba(255, 243, 213, ${0.18 * intensity})`);
  midGradient.addColorStop(0.7, `rgba(255, 236, 198, ${0.08 * intensity})`);
  midGradient.addColorStop(1, "rgba(255, 236, 198, 0)");
  ctx.fillStyle = midGradient;
  drawBeamPolygon(ctx, spread * 0.026, spread * 0.38, beamHeight);
  ctx.fill();
  ctx.restore();

  ctx.save();
  ctx.filter = "blur(1.5px)";
  const coreGradient = ctx.createLinearGradient(0, 0, 0, beamHeight);
  coreGradient.addColorStop(0, `rgba(255, 252, 241, ${0.78 * intensity})`);
  coreGradient.addColorStop(0.32, `rgba(255, 248, 226, ${0.46 * intensity})`);
  coreGradient.addColorStop(0.72, `rgba(255, 241, 209, ${0.16 * intensity})`);
  coreGradient.addColorStop(1, "rgba(255, 236, 198, 0)");
  ctx.fillStyle = coreGradient;
  drawBeamPolygon(ctx, spread * 0.012, spread * 0.15, beamHeight);
  ctx.fill();
  ctx.restore();

  ctx.save();
  ctx.filter = "blur(12px)";
  const sideFeather = ctx.createLinearGradient(-spread * 0.48, beamHeight * 0.14, spread * 0.48, beamHeight * 0.14);
  sideFeather.addColorStop(0, "rgba(255, 236, 198, 0)");
  sideFeather.addColorStop(0.16, `rgba(255, 236, 198, ${0.12 * intensity})`);
  sideFeather.addColorStop(0.5, `rgba(255, 244, 214, ${0.18 * intensity})`);
  sideFeather.addColorStop(0.84, `rgba(255, 236, 198, ${0.12 * intensity})`);
  sideFeather.addColorStop(1, "rgba(255, 236, 198, 0)");
  ctx.fillStyle = sideFeather;
  drawBeamPolygon(ctx, spread * 0.02, spread * 0.28, beamHeight);
  ctx.fill();
  ctx.restore();

  ctx.save();
  ctx.filter = "blur(10px)";
  const reflectGradient = ctx.createLinearGradient(0, beamHeight * 0.56, 0, beamHeight);
  reflectGradient.addColorStop(0, "rgba(255, 236, 198, 0)");
  reflectGradient.addColorStop(0.54, `rgba(255, 241, 209, ${0.08 * intensity})`);
  reflectGradient.addColorStop(1, `rgba(255, 236, 198, ${0.16 * intensity})`);
  ctx.fillStyle = reflectGradient;
  ctx.translate(0, beamHeight * 0.56);
  drawBeamPolygon(ctx, spread * 0.1, spread * 0.34, beamHeight * 0.46);
  ctx.fill();
  ctx.restore();

  ctx.save();
  ctx.filter = "blur(18px)";
  const poolGradient = ctx.createRadialGradient(0, beamHeight * 0.98, 0, 0, beamHeight * 0.98, spread * 0.28);
  poolGradient.addColorStop(0, `rgba(255, 249, 233, ${0.28 * intensity})`);
  poolGradient.addColorStop(0.34, `rgba(255, 241, 209, ${0.16 * intensity})`);
  poolGradient.addColorStop(0.68, `rgba(255, 236, 198, ${0.08 * intensity})`);
  poolGradient.addColorStop(1, "rgba(255, 236, 198, 0)");
  ctx.fillStyle = poolGradient;
  ctx.beginPath();
  ctx.ellipse(0, beamHeight * 0.98, spread * 0.3, beamHeight * 0.08, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  ctx.restore();
}

function renderLightMap() {
  if (!lightLayer || !spotlightConfigs.length) return;

  const { canvas, image } = ensureLightMapAssets();
  const width = lightLayer.clientWidth;
  const height = lightLayer.clientHeight;
  if (!width || !height) return;

  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = Math.round(width * dpr);
  canvas.height = Math.round(height * dpr);

  const ctx = canvas.getContext("2d");
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, width, height);

  spotlightConfigs.forEach((config) => {
    drawSpotlightBeam(ctx, config, width, height);
  });

  image.src = canvas.toDataURL("image/png");
}

function scheduleLightMapRender() {
  if (lightMapAnimationFrame) {
    cancelAnimationFrame(lightMapAnimationFrame);
  }

  lightMapAnimationFrame = window.requestAnimationFrame(() => {
    lightMapAnimationFrame = 0;
    renderLightMap();
  });
}

function createLightFixture(config) {
  const fixture = document.createElement("span");
  fixture.className = "gallery-light-fixture";
  fixture.style.left = `${config.center}%`;
  fixture.style.top = `${config.fixtureTop}%`;
  fixture.style.setProperty("--fixture-rotate", `${config.fixtureRotate}deg`);
  fixture.setAttribute("aria-hidden", "true");
  return fixture;
}

function setupLightMapObserver() {
  if (lightLayerResizeObserver || !lightLayer) return;

  if ("ResizeObserver" in window) {
    lightLayerResizeObserver = new ResizeObserver(() => {
      scheduleLightMapRender();
    });
    lightLayerResizeObserver.observe(lightLayer);
  }

  window.addEventListener("resize", scheduleLightMapRender, { passive: true });
}

async function renderGallery() {
  const packs = await loadStickerPacks();
  const fragment = document.createDocumentFragment();
  const lightFragment = document.createDocumentFragment();
  const { image } = ensureLightMapAssets();

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

  spotlightConfigs = LIGHT_GROUPS.map(buildSpotlightConfig).filter(Boolean);
  lightFragment.appendChild(image);

  spotlightConfigs.forEach((config) => {
    lightFragment.appendChild(createLightFixture(config));
  });

  lightLayer.replaceChildren(lightFragment);
  hitLayer.replaceChildren(fragment);
  setupLightMapObserver();
  scheduleLightMapRender();
}

renderGallery();

if (darknessSlider) {
  darknessSlider.addEventListener("input", (event) => {
    const level = Number(event.currentTarget.value) / 100;
    applyDarkness(level);
  });
}

applyDarkness(restoreDarknessLevel(), { persist: false });
