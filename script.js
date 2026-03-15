const room = document.getElementById("room");
const detailViewer = document.getElementById("detailViewer");
const detailViewerBackdrop = document.getElementById("detailViewerBackdrop");
const detailViewerClose = document.getElementById("detailViewerClose");
const detailViewerTitle = document.getElementById("detailViewerTitle");
const detailViewerStatus = document.getElementById("detailViewerStatus");
const detailViewerCopy = document.getElementById("detailViewerCopy");
const detailStickerGrid = document.getElementById("detailStickerGrid");
const detailFrameArt = document.getElementById("detailFrameArt");
const detailFrameVideo = document.getElementById("detailFrameVideo");
const detailFrameGold = document.getElementById("detailFrameGold");
const frameHoverIndicator = document.getElementById("frameHoverIndicator");
const ASSET_VERSION = "20260312s";

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
  } else if (variant === 3) {
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

const WALL_NAMES = [
  "wall_minus2", "wall_minus1",
  "wall_0",
  "wall_1", "wall_2"
];

const SLOT_LAYOUT = Object.fromEntries(
  WALL_NAMES.map((wallName) => [
    wallName,
    [
      { x: 28, y: 49, w: 40 },
      { x: 72, y: 49, w: 40 }
    ]
  ])
);

// Place packs from the center wall outward so real packs stay visually balanced.
const DISPLAY_SLOT_ORDER = [
  { wallName: "wall_0", slotIndex: 0 },
  { wallName: "wall_0", slotIndex: 1 },
  { wallName: "wall_minus1", slotIndex: 1 },
  { wallName: "wall_1", slotIndex: 0 },
  { wallName: "wall_minus1", slotIndex: 0 },
  { wallName: "wall_1", slotIndex: 1 },
  { wallName: "wall_minus2", slotIndex: 0 },
  { wallName: "wall_2", slotIndex: 1 },
  { wallName: "wall_minus2", slotIndex: 1 },
  { wallName: "wall_2", slotIndex: 0 }
];

const PACK_COUNT = DISPLAY_SLOT_ORDER.length;

// Replace this array with real Telegram sticker pack data later.
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

let stickerPacks = DEFAULT_STICKER_PACKS.slice();

const LAYOUT = (() => {
  const assignments = Object.fromEntries(
    WALL_NAMES.map((wallName) => [
      wallName,
      SLOT_LAYOUT[wallName].map((slot) => ({ ...slot, pack: -1 }))
    ])
  );

  DISPLAY_SLOT_ORDER.forEach(({ wallName, slotIndex }, packIndex) => {
    assignments[wallName][slotIndex] = {
      ...SLOT_LAYOUT[wallName][slotIndex],
      pack: packIndex
    };
  });

  return assignments;
})();

// User frame image, reprocessed into a square-ready frame with transparent outer background.
const GOLD_FRAME_SRC = `./gold_frame_user_square_opaque.png?v=${ASSET_VERSION}`;
detailFrameGold.src = GOLD_FRAME_SRC;

let activePackIndex = -1;
let activeStickerIndex = 0;
let hoveredFrameEl = null;

function applyWallLighting(wallEl, slots) {
  if (!slots.length) return;

  const bounds = slots.reduce((acc, slot) => {
    const half = slot.w / 2;
    acc.left = Math.min(acc.left, slot.x - half);
    acc.right = Math.max(acc.right, slot.x + half);
    acc.top = Math.min(acc.top, slot.y - half);
    acc.bottom = Math.max(acc.bottom, slot.y + half);
    return acc;
  }, { left: Infinity, right: -Infinity, top: Infinity, bottom: -Infinity });

  wallEl.style.setProperty("--group-center-x", `${(bounds.left + bounds.right) / 2}%`);
  wallEl.style.setProperty("--group-center-y", `${((bounds.top + bounds.bottom) / 2) - 2}%`);
  wallEl.style.setProperty("--group-span", `${bounds.right - bounds.left}%`);
}

function buildFrame(slot) {
  const pack = stickerPacks[slot.pack % stickerPacks.length];
  const container = document.createElement("div");
  container.className = "frame-container";
  container.style.width = slot.w + "%";
  container.style.top = slot.y + "%";
  container.style.left = slot.x + "%";
  container.tabIndex = 0;
  container.setAttribute("role", "button");
  container.setAttribute("aria-label", `${pack.title} 열기`);
  container.dataset.packIndex = String(slot.pack);

  // Art image aligned to the inner opening of the frame.
  const artWindow = document.createElement("div");
  artWindow.className = "frame-art-window";

  const img = document.createElement("img");
  img.src = pack.cover;
  img.alt = pack.title;
  img.className = "frame-art";
  img.loading = "eager";
  img.decoding = "sync";
  artWindow.appendChild(img);
  container.appendChild(artWindow);

  // Real gold frame overlay
  const frameImg = document.createElement("img");
  frameImg.src = GOLD_FRAME_SRC;
  frameImg.alt = "";
  frameImg.className = "gold-frame";
  frameImg.loading = "eager";
  frameImg.decoding = "sync";
  container.appendChild(frameImg);

  container.addEventListener("click", () => openPack(slot.pack));
  container.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      openPack(slot.pack);
    }
  });

  return container;
}

function updateDetailFrame() {
  const pack = stickerPacks[activePackIndex];
  if (!pack) return;
  const sticker = pack.stickers[activeStickerIndex];
  const isVideo = sticker.kind === "video";
  detailFrameArt.hidden = isVideo;
  detailFrameVideo.hidden = !isVideo;

  if (isVideo) {
    detailFrameVideo.src = sticker.file;
    detailFrameVideo.poster = sticker.preview || pack.cover;
    detailFrameVideo.setAttribute("aria-label", `${pack.title} - ${sticker.title}`);
    detailFrameVideo.play().catch(() => {});
  } else {
    detailFrameVideo.pause();
    detailFrameVideo.removeAttribute("src");
    detailFrameVideo.load();
    detailFrameArt.src = sticker.file || sticker.preview;
    detailFrameArt.alt = `${pack.title} - ${sticker.title}`;
  }

  detailViewerStatus.textContent = `${activeStickerIndex + 1} / ${pack.stickers.length}`;
}

function renderStickerGrid(pack) {
  const fragment = document.createDocumentFragment();

  pack.stickers.forEach((sticker, stickerIndex) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "sticker-thumb";
    if (stickerIndex === activeStickerIndex) {
      button.classList.add("is-active");
    }
    button.setAttribute("aria-pressed", stickerIndex === activeStickerIndex ? "true" : "false");
    button.setAttribute("aria-label", `${sticker.title} 전시하기`);

    const preview = document.createElement("span");
    preview.className = "sticker-thumb__preview";

    const image = document.createElement("img");
    image.src = sticker.preview || sticker.file;
    image.alt = "";
    image.loading = "eager";
    image.decoding = "sync";
    preview.appendChild(image);
    button.appendChild(preview);
    button.addEventListener("click", () => {
      activeStickerIndex = stickerIndex;
      updateDetailFrame();
      renderStickerGrid(pack);
    });

    fragment.appendChild(button);
  });

  detailStickerGrid.replaceChildren(fragment);
}

function openPack(packIndex) {
  const pack = stickerPacks[packIndex];
  if (!pack) return;

  activePackIndex = packIndex;
  activeStickerIndex = 0;

  detailViewerTitle.textContent = pack.title;
  detailViewerCopy.textContent = pack.sourceUrl || `${pack.stickers.length} stickers`;
  updateDetailFrame();
  renderStickerGrid(pack);

  document.body.classList.add("viewer-open");
  detailViewer.setAttribute("aria-hidden", "false");
}

function closePackViewer() {
  document.body.classList.remove("viewer-open");
  detailViewer.setAttribute("aria-hidden", "true");
  detailFrameVideo.pause();
}

function pointInPolygon(x, y, points) {
  let inside = false;
  for (let i = 0, j = points.length - 1; i < points.length; j = i++) {
    const xi = points[i].x;
    const yi = points[i].y;
    const xj = points[j].x;
    const yj = points[j].y;
    const intersects = ((yi > y) !== (yj > y))
      && (x < ((xj - xi) * (y - yi)) / ((yj - yi) || 1e-7) + xi);
    if (intersects) inside = !inside;
  }
  return inside;
}

function getFrameHitRect(frameEl) {
  const probe = frameEl.querySelector(".frame-art-window") || frameEl;
  const rect = probe.getBoundingClientRect();

  if (rect.width < 2 || rect.height < 2) {
    return null;
  }

  if (
    rect.right < -80
    || rect.left > window.innerWidth + 80
    || rect.bottom < -80
    || rect.top > window.innerHeight + 80
  ) {
    return null;
  }

  const padX = Math.max(18, rect.width * 0.62);
  const padY = Math.max(18, rect.height * 0.62);

  return {
    left: rect.left - padX,
    right: rect.right + padX,
    top: rect.top - padY,
    bottom: rect.bottom + padY,
    centerX: rect.left + (rect.width / 2),
    centerY: rect.top + (rect.height / 2)
  };
}

function findFrameAtPoint(clientX, clientY) {
  const frames = [...document.querySelectorAll(".frame-container")];
  let bestFrame = null;
  let bestDistance = Infinity;

  frames.forEach((frameEl) => {
    const hitRect = getFrameHitRect(frameEl);
    if (!hitRect) return;
    if (
      clientX < hitRect.left
      || clientX > hitRect.right
      || clientY < hitRect.top
      || clientY > hitRect.bottom
    ) {
      return;
    }

    const distance = ((clientX - hitRect.centerX) ** 2) + ((clientY - hitRect.centerY) ** 2);
    if (distance < bestDistance) {
      bestDistance = distance;
      bestFrame = frameEl;
    }
  });

  return bestFrame;
}

function setHoveredFrame(frameEl) {
  if (hoveredFrameEl === frameEl) return;

  hoveredFrameEl = frameEl;

  document.body.classList.toggle("frame-hovering", Boolean(hoveredFrameEl));
  updateFrameHoverIndicator(hoveredFrameEl);
}

function updateFrameHoverIndicator(frameEl) {
  if (!frameHoverIndicator) return;

  if (!frameEl) {
    frameHoverIndicator.style.opacity = "0";
    frameHoverIndicator.style.width = "0px";
    frameHoverIndicator.style.height = "0px";
    return;
  }

  const rect = frameEl.getBoundingClientRect();
  if (rect.width < 6 || rect.height < 6) {
    frameHoverIndicator.style.opacity = "0";
    return;
  }

  const padX = Math.max(10, rect.width * 0.04);
  const padY = Math.max(10, rect.height * 0.04);
  const x = rect.left - padX;
  const y = rect.top - padY;
  const width = rect.width + padX * 2;
  const height = rect.height + padY * 2;

  frameHoverIndicator.style.transform = `translate(${x}px, ${y}px)`;
  frameHoverIndicator.style.width = `${width}px`;
  frameHoverIndicator.style.height = `${height}px`;
  frameHoverIndicator.style.opacity = "1";
}

function resolvePackAsset(packName, relativePath) {
  return `./packs/${packName}/${relativePath}?v=${ASSET_VERSION}`;
}

function normalizeManifestPack(manifest) {
  return {
    id: manifest.id,
    title: manifest.title || manifest.name,
    sourceUrl: manifest.source_url || "",
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

async function loadLocalStickerPacks() {
  try {
    const indexResponse = await fetch(`./packs/index.json?v=${ASSET_VERSION}`, { cache: "no-store" });
    if (!indexResponse.ok) return;

    const packNames = await indexResponse.json();
    if (!Array.isArray(packNames) || !packNames.length) return;

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
    console.error("Failed to load local sticker packs", error);
  }
}

detailViewerBackdrop.addEventListener("click", closePackViewer);
detailViewerClose.addEventListener("click", closePackViewer);
window.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closePackViewer();
  }
});

document.addEventListener("pointermove", (event) => {
  if (detailViewer.getAttribute("aria-hidden") === "false") {
    setHoveredFrame(null);
    return;
  }

  setHoveredFrame(findFrameAtPoint(event.clientX, event.clientY));
}, { passive: true });

document.addEventListener("pointerdown", () => {
  if (detailViewer.getAttribute("aria-hidden") === "false") {
    setHoveredFrame(null);
  }
}, { passive: true });

window.addEventListener("blur", () => {
  setHoveredFrame(null);
});

window.addEventListener("resize", () => {
  if (hoveredFrameEl) {
    updateFrameHoverIndicator(hoveredFrameEl);
  }
});

document.addEventListener("click", (event) => {
  if (detailViewer.getAttribute("aria-hidden") === "false") return;
  if (event.target.closest(".frame-container")) return;
  if (event.target.closest(".detail-viewer")) return;

  const frameEl = findFrameAtPoint(event.clientX, event.clientY);
  if (!frameEl) return;

  event.preventDefault();
  openPack(Number(frameEl.dataset.packIndex));
});

function renderWalls() {
  setHoveredFrame(null);
  Object.keys(LAYOUT).forEach(wallName => {
    const wallEl = document.getElementById(wallName);
    if (!wallEl) return;
    wallEl.querySelectorAll(".frame-container").forEach(f => f.remove());
    const slots = LAYOUT[wallName];
    applyWallLighting(wallEl, slots);
    slots.forEach(slot => wallEl.appendChild(buildFrame(slot, wallName)));
  });
}

// Generate geodesic dome SVG with proper triangle tessellation
function buildGeodesicCeiling() {
  const el = document.getElementById("ceilingDome");
  if (!el) return;

  const size = 2000;
  const cx = size / 2;
  const cy = size / 2;
  const maxR = size * 0.47;
  const rings = 16;
  const trianglePaths = [];

  // Generate concentric ring points (geodesic frequency: 6 per ring)
  const ringPts = [[{ x: cx, y: cy }]];
  for (let r = 1; r <= rings; r++) {
    const radius = (r / rings) * maxR;
    const count = r * 6;
    const pts = [];
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2 - Math.PI / 2;
      pts.push({
        x: +(cx + radius * Math.cos(angle)).toFixed(1),
        y: +(cy + radius * Math.sin(angle)).toFixed(1)
      });
    }
    ringPts.push(pts);
  }

  // Triangulate between adjacent rings using zipper algorithm
  // This ensures EVERY face is a proper triangle (not quad)
  for (let r = 1; r <= rings; r++) {
    const outer = ringPts[r];
    const inner = ringPts[r - 1];
    const nO = outer.length;
    const nI = inner.length;
    let iO = 0, iI = 0;

    while (iO < nO || iI < nI) {
      if (iI >= nI || (iO < nO && iO / nO <= iI / nI)) {
        // Triangle with outer edge
        const o0 = outer[iO % nO];
        const o1 = outer[(iO + 1) % nO];
        const i0 = inner[iI % nI];
        trianglePaths.push(`M${o0.x},${o0.y}L${o1.x},${o1.y}L${i0.x},${i0.y}Z`);
        iO++;
      } else {
        // Triangle with inner edge
        const i0 = inner[iI % nI];
        const i1 = inner[(iI + 1) % nI];
        const o0 = outer[iO % nO];
        trianglePaths.push(`M${i0.x},${i0.y}L${i1.x},${i1.y}L${o0.x},${o0.y}Z`);
        iI++;
      }
    }
  }

  const pathData = trianglePaths.join(' ');

  // Overcast cloud layer
  const clouds = [];
  const cloudData = [
    [cx, cy, 500, 200, 0.25],
    [cx - 150, cy - 180, 420, 160, 0.35],
    [cx + 220, cy - 80, 380, 130, 0.30],
    [cx - 280, cy + 120, 340, 110, 0.28],
    [cx + 120, cy + 220, 400, 140, 0.33],
    [cx - 50, cy + 50, 600, 250, 0.15],
    [cx - 380, cy - 120, 200, 70, 0.18],
    [cx + 380, cy - 180, 220, 80, 0.20],
    [cx - 180, cy + 320, 250, 90, 0.16],
    [cx + 300, cy + 280, 180, 60, 0.14],
  ];
  cloudData.forEach(([x, y, rx, ry, op]) => {
    clouds.push(`<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="white" opacity="${op}"/>`);
  });

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}">
    <defs>
      <radialGradient id="sky">
        <stop offset="0%" stop-color="#dce6ef"/>
        <stop offset="30%" stop-color="#c8d6e2"/>
        <stop offset="60%" stop-color="#b0c0d0"/>
        <stop offset="100%" stop-color="#8a9cae"/>
      </radialGradient>
      <linearGradient id="beamMetal" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#f4f8fc"/>
        <stop offset="18%" stop-color="#c7d1db"/>
        <stop offset="48%" stop-color="#56616e"/>
        <stop offset="72%" stop-color="#c9d1da"/>
        <stop offset="100%" stop-color="#2d353d"/>
      </linearGradient>
      <linearGradient id="beamSpecular" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="rgba(255,255,255,0)"/>
        <stop offset="34%" stop-color="rgba(255,255,255,0.05)"/>
        <stop offset="50%" stop-color="rgba(255,255,255,0.75)"/>
        <stop offset="66%" stop-color="rgba(255,255,255,0.06)"/>
        <stop offset="100%" stop-color="rgba(255,255,255,0)"/>
      </linearGradient>
      <radialGradient id="domeGloss" cx="46%" cy="24%" r="44%">
        <stop offset="0%" stop-color="rgba(255,255,255,0.92)"/>
        <stop offset="16%" stop-color="rgba(255,255,255,0.4)"/>
        <stop offset="36%" stop-color="rgba(255,255,255,0.12)"/>
        <stop offset="60%" stop-color="rgba(255,255,255,0.03)"/>
        <stop offset="100%" stop-color="rgba(255,255,255,0)"/>
      </radialGradient>
      <filter id="beam3d" x="-8%" y="-8%" width="116%" height="116%">
        <feDropShadow dx="2.8" dy="3.5" stdDeviation="1.8" flood-color="#081018" flood-opacity="0.58"/>
        <feDropShadow dx="-0.8" dy="-0.6" stdDeviation="0.7" flood-color="#f4f8fc" flood-opacity="0.32"/>
      </filter>
      <filter id="glossBlur" x="-12%" y="-12%" width="124%" height="124%">
        <feGaussianBlur stdDeviation="18"/>
      </filter>
    </defs>
    <!-- Overcast sky -->
    <circle cx="${cx}" cy="${cy}" r="${maxR + 60}" fill="url(#sky)"/>
    ${clouds.join('\n    ')}
    <!-- Broad dome gloss -->
    <ellipse cx="${cx - 60}" cy="${cy - 230}" rx="730" ry="290" fill="url(#domeGloss)" opacity="0.85" filter="url(#glossBlur)"/>
    <ellipse cx="${cx + 120}" cy="${cy - 40}" rx="500" ry="120" fill="url(#domeGloss)" opacity="0.24" filter="url(#glossBlur)" transform="rotate(-8 ${cx} ${cy})"/>
    <!-- Shadow layer — offset for depth -->
    <path d="${pathData}" fill="none" stroke="#0f151c" stroke-width="7.8" stroke-linejoin="round" opacity="0.32" transform="translate(3.1,3.8)"/>
    <!-- Main steel beams with drop shadow filter -->
    <path d="${pathData}" fill="rgba(215,228,238,0.05)" stroke="url(#beamMetal)" stroke-width="6.4" stroke-linejoin="round" filter="url(#beam3d)"/>
    <!-- Gloss pass across the beam faces -->
    <path d="${pathData}" fill="none" stroke="url(#beamSpecular)" stroke-width="4.6" stroke-linejoin="round" opacity="0.86"/>
    <!-- Highlight edge — top-left of beams -->
    <path d="${pathData}" fill="none" stroke="rgba(255,255,255,0.62)" stroke-width="1.5" stroke-linejoin="round" transform="translate(-1.1,-1.1)" opacity="0.82"/>
    <!-- Lower metallic shadow edge -->
    <path d="${pathData}" fill="none" stroke="rgba(20,26,34,0.46)" stroke-width="2.2" stroke-linejoin="round" transform="translate(1.2,1.6)" opacity="0.82"/>
    <!-- Outer rim — 3D thick ring -->
    <circle cx="${cx}" cy="${cy}" r="${maxR + 8}" fill="none" stroke="rgba(255,255,255,0.34)" stroke-width="4"/>
    <circle cx="${cx}" cy="${cy}" r="${maxR + 1}" fill="none" stroke="#161d26" stroke-width="14"/>
    <circle cx="${cx}" cy="${cy}" r="${maxR - 3}" fill="none" stroke="url(#beamMetal)" stroke-width="6"/>
    <circle cx="${cx}" cy="${cy}" r="${maxR - 6}" fill="none" stroke="rgba(255,255,255,0.42)" stroke-width="2.2" opacity="0.78"/>
    <!-- Center hub — 3D bolt -->
    <circle cx="${cx}" cy="${cy}" r="21" fill="#111820"/>
    <circle cx="${cx}" cy="${cy}" r="15" fill="url(#beamMetal)"/>
    <circle cx="${cx}" cy="${cy}" r="8" fill="#eef4fa" opacity="0.9"/>
  </svg>`;

  el.style.backgroundImage = `url("data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}")`;
}

function preloadMarble() {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = () => resolve();
    img.src = `./marble_tile.png?v=${ASSET_VERSION}`;
  });
}

function nextPaint() {
  return new Promise((resolve) => {
    requestAnimationFrame(() => resolve());
    setTimeout(resolve, 50);
  });
}

async function initializeScene() {
  await loadLocalStickerPacks();
  renderWalls();
  buildGeodesicCeiling();

  await preloadMarble();
  await nextPaint();

  document.body.classList.remove("app-loading");
}

// Camera setup
room.style.transform = "translateZ(-500px) rotateX(6deg)";

initializeScene();
