const room = document.getElementById("room");
const ASSET_VERSION = "20260309";

const WALL_ANGLES = {
  wall_minus3: -90,
  wall_minus2: -60,
  wall_minus1: -30,
  wall_0: 0,
  wall_1: 30,
  wall_2: 60,
  wall_3: 90
};

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
  "wall_minus3", "wall_minus2", "wall_minus1",
  "wall_0",
  "wall_1", "wall_2", "wall_3"
];

const LAYOUT = Object.fromEntries(
  WALL_NAMES.map((wallName, wallIndex) => [
    wallName,
    [
      { x: 30, y: 45, w: 36, h: 32, art: wallIndex * 2, frame: wallIndex % 2 === 0 ? "wood" : "white" },
      { x: 70, y: 45, w: 36, h: 32, art: wallIndex * 2 + 1, frame: wallIndex % 2 === 0 ? "white" : "wood" }
    ]
  ])
);

function buildFrame(slot, wallName) {
  const container = document.createElement("div");
  container.className = "frame-container";
  container.style.width = slot.w + "%";
  container.style.height = slot.h + "%";
  container.style.top = slot.y + "%";
  container.style.left = slot.x + "%";

  if (slot.frame === 'white') {
    container.style.borderColor = '#ffffff';
    container.style.borderLeftColor = '#f5f5f5';
    container.style.borderTopColor = '#f5f5f5';
    container.style.borderRightColor = '#e0e0e0';
    container.style.borderBottomColor = '#e0e0e0';
    container.style.boxShadow = '0 20px 40px rgba(0,0,0,0.2), inset 0 0 0 1px rgba(0,0,0,0.1)';
  }

  const artObj = ARTWORKS[slot.art % ARTWORKS.length];
  const img = document.createElement("img");
  img.src = artObj.image;
  img.alt = "Abstract Art";
  img.loading = "eager";
  img.decoding = "sync";

  container.appendChild(img);
  return container;
}

function renderWalls() {
  Object.keys(LAYOUT).forEach(wallName => {
    const wallEl = document.getElementById(wallName);
    if (!wallEl) return;
    wallEl.querySelectorAll(".frame-container").forEach(f => f.remove());
    LAYOUT[wallName].forEach(slot => wallEl.appendChild(buildFrame(slot, wallName)));
  });
}

// Generate geodesic dome SVG pattern
function buildGeodesicCeiling() {
  const el = document.getElementById("ceilingDome");
  if (!el) return;

  const size = 2000;
  const cx = size / 2;
  const cy = size / 2;
  const maxR = size * 0.46;
  const rings = 12;
  const lines = [];

  // Generate ring points
  const ringPts = [[{ x: cx, y: cy }]];
  for (let r = 1; r <= rings; r++) {
    const radius = (r / rings) * maxR;
    const count = r * 6;
    const pts = [];
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2 - Math.PI / 2;
      pts.push({
        x: cx + radius * Math.cos(angle),
        y: cy + radius * Math.sin(angle)
      });
    }
    ringPts.push(pts);
  }

  // Connect rings with triangulation lines
  for (let r = 1; r <= rings; r++) {
    const outer = ringPts[r];
    const inner = ringPts[r - 1];
    const ratio = outer.length / inner.length;

    // Lines along ring (circumferential)
    for (let i = 0; i < outer.length; i++) {
      const next = (i + 1) % outer.length;
      lines.push(`M${outer[i].x},${outer[i].y}L${outer[next].x},${outer[next].y}`);
    }

    // Lines to inner ring (radial + diagonal for triangulation)
    for (let i = 0; i < outer.length; i++) {
      const innerIdx = Math.min(Math.floor(i / ratio), inner.length - 1);
      lines.push(`M${outer[i].x},${outer[i].y}L${inner[innerIdx].x},${inner[innerIdx].y}`);
    }
  }

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}">
    <defs>
      <radialGradient id="dsky">
        <stop offset="0%" stop-color="#d0dae6" stop-opacity="0.95"/>
        <stop offset="40%" stop-color="#b8c8d8" stop-opacity="0.9"/>
        <stop offset="100%" stop-color="#8a9aac" stop-opacity="0.85"/>
      </radialGradient>
    </defs>
    <circle cx="${cx}" cy="${cy}" r="${maxR + 80}" fill="url(#dsky)"/>
    <path d="${lines.join('')}" stroke="#4a545e" stroke-width="2.5" fill="none" opacity="0.5"/>
    <circle cx="${cx}" cy="${cy}" r="${maxR}" fill="none" stroke="#3a4248" stroke-width="6" opacity="0.6"/>
    <circle cx="${cx}" cy="${cy}" r="18" fill="#5a646e" opacity="0.7"/>
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
  renderWalls();
  buildGeodesicCeiling();

  await preloadMarble();
  await nextPaint();

  document.body.classList.remove("app-loading");
}

// Camera setup
room.style.transform = "translateZ(-500px) rotateX(6deg)";

initializeScene();
