const room = document.getElementById("room");
const reflectionShell = document.getElementById("roomReflectionShell");
const ASSET_VERSION = "20260308-0526";
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

// Layout using percentages (%) to adapt perfectly across the walls
const WALL_NAMES = [
  "wall_minus3",
  "wall_minus2",
  "wall_minus1",
  "wall_0",
  "wall_1",
  "wall_2",
  "wall_3"
];

const LAYOUT = Object.fromEntries(
  WALL_NAMES.map((wallName, wallIndex) => [
    wallName,
    [
      { x: 28, y: 36, w: 38, h: 34, art: wallIndex * 2, frame: wallIndex % 2 === 0 ? "wood" : "white" },
      { x: 72, y: 36, w: 38, h: 34, art: wallIndex * 2 + 1, frame: wallIndex % 2 === 0 ? "white" : "wood" }
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
  container.dataset.wallName = wallName;
  container.dataset.wallAngle = String(WALL_ANGLES[wallName] ?? 0);

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

    const refEl = document.getElementById(wallName + "_ref");
    if (refEl) {
      refEl.querySelectorAll(".frame-container").forEach(f => f.remove());
      LAYOUT[wallName].forEach(slot => refEl.appendChild(buildFrame(slot, wallName)));
    }
  });
}


function buildDome() {
  const container = document.getElementById("roomWalls");
  if (!container) return;

  container.querySelectorAll(".dome-ring").forEach(el => el.remove());

  const segments = 16;
  const domeHeight = 300;
  const baseRadius = 1400;
  const b = 361; // ellipse semi-minor axis (steeper dome, matches oculus at r=780)
  const baseY = -502; // wall top (matches cornice)
  const firstWall = container.querySelector(".wall");

  for (let i = 0; i < segments; i++) {
    const h0 = (i / segments) * domeHeight;
    const h1 = ((i + 1) / segments) * domeHeight;
    const hMid = (h0 + h1) / 2;

    const outerR = baseRadius * Math.sqrt(Math.max(0, 1 - (h0 / b) ** 2));
    const innerR = baseRadius * Math.sqrt(Math.max(0, 1 - (h1 / b) ** 2));

    const el = document.createElement("div");
    el.className = "dome-ring";

    // Disc sized to outer radius + overlap
    const size = (outerR + 20) * 2;
    el.style.width = size + "px";
    el.style.height = size + "px";
    el.style.marginLeft = -(size / 2) + "px";
    el.style.marginTop = -(size / 2) + "px";
    el.style.transform = `translateY(${baseY - hMid}px) rotateX(-90deg)`;

    // Lighting gradient: darker at base, brighter near oculus
    const t = i / (segments - 1);
    const lightness = 86 + t * 9; // 86% → 95%
    const saturation = Math.round(6 - t * 4); // 6% → 2%
    const colorBase = `hsl(215, ${saturation}%, ${lightness}%)`;
    const colorInner = `hsl(215, ${Math.max(1, saturation - 1)}%, ${Math.min(97, lightness + 1.5)}%)`;

    el.style.background = `radial-gradient(circle, ${colorInner} 0%, ${colorBase} 100%)`;

    // Mask: cut inner hole to create ring shape
    const maskR = Math.max(0, innerR - 3);
    el.style.webkitMask = `radial-gradient(circle, transparent ${maskR}px, black ${maskR + 4}px)`;
    el.style.mask = `radial-gradient(circle, transparent ${maskR}px, black ${maskR + 4}px)`;

    // Subtle shadow for depth between rings
    if (i > 0) {
      el.style.boxShadow = "inset 0 0 60px rgba(0, 0, 0, 0.025)";
    }

    container.insertBefore(el, firstWall);
  }
}

function preloadMarble() {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = () => resolve();
    img.src = `./marble_tile.png?v=${ASSET_VERSION}`;
  });
}

function waitForArtworkDecode() {
  const imgs = Array.from(document.querySelectorAll("#roomWalls .frame-container img"));
  return Promise.all(
    imgs.map((img) => {
      if (typeof img.decode === "function") {
        return img.decode().catch(() => {});
      }
      if (img.complete) {
        return Promise.resolve();
      }
      return new Promise((resolve) => {
        img.addEventListener("load", resolve, { once: true });
        img.addEventListener("error", resolve, { once: true });
      });
    })
  );
}

function nextPaint() {
  return new Promise((resolve) => {
    requestAnimationFrame(() => resolve());
    setTimeout(resolve, 50);
  });
}

async function initializeScene() {
  renderWalls();
  buildDome();

  await Promise.all([preloadMarble(), waitForArtworkDecode()]);
  await nextPaint();
  await nextPaint();
  await nextPaint();

  document.body.classList.remove("app-loading");
}

const baseTilt = 5;
room.style.transform = `translateZ(-500px) translateY(0px) rotateY(0deg) rotateX(${baseTilt}deg)`;

if (reflectionShell) {
  const mirrorY = 500;
  reflectionShell.style.transform = `translateZ(-500px) rotateX(0deg) translateY(${mirrorY}px) scaleY(-0.55) translateY(${-mirrorY}px)`;
}

initializeScene();

