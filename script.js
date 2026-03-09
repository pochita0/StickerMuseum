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

  // Wispy cloud shapes for realism
  const clouds = [];
  const cloudData = [
    [cx - 200, cy - 180, 280, 90, 0.18],
    [cx + 150, cy - 100, 320, 70, 0.14],
    [cx - 80, cy + 200, 250, 60, 0.12],
    [cx + 280, cy + 100, 200, 80, 0.16],
    [cx - 300, cy + 50, 180, 55, 0.10],
    [cx + 50, cy - 280, 220, 65, 0.13],
  ];
  cloudData.forEach(([x, y, rx, ry, op]) => {
    clouds.push(`<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="white" opacity="${op}"/>`);
  });

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}">
    <defs>
      <radialGradient id="sky">
        <stop offset="0%" stop-color="#a8d4f0"/>
        <stop offset="35%" stop-color="#7bbde0"/>
        <stop offset="70%" stop-color="#5a9fc8"/>
        <stop offset="100%" stop-color="#3a7ca8"/>
      </radialGradient>
    </defs>
    <circle cx="${cx}" cy="${cy}" r="${maxR + 60}" fill="url(#sky)"/>
    ${clouds.join('\n    ')}
    <path d="${trianglePaths.join(' ')}" fill="rgba(160,210,240,0.06)" stroke="#3a4248" stroke-width="4" stroke-linejoin="round"/>
    <circle cx="${cx}" cy="${cy}" r="${maxR}" fill="none" stroke="#2a3038" stroke-width="10"/>
    <circle cx="${cx}" cy="${cy}" r="14" fill="#2a3038"/>
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
