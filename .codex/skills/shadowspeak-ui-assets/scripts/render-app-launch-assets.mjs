import fs from "node:fs/promises";
import path from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDir, "../../..");

function loadSharp() {
  const candidateRoots = [
    process.env.SHADOWSPEAK_NODE_MODULES,
    process.env.NODE_PATH,
    path.join(repoRoot, "node_modules"),
    path.join(repoRoot, "front-end", "node_modules"),
    path.join(repoRoot, "frontend", "node_modules"),
  ].filter(Boolean);

  for (const root of candidateRoots) {
    try {
      return createRequire(path.join(root, "sharp", "package.json"))("sharp");
    } catch {
      // Try the next known dependency location.
    }
  }

  try {
    return require("sharp");
  } catch (error) {
    throw new Error(
      [
        "Unable to load the 'sharp' package.",
        "Install it in this repo with `npm install --save-dev sharp`,",
        "or set SHADOWSPEAK_NODE_MODULES=/absolute/path/to/node_modules before running this script.",
        `Original error: ${error.message}`,
      ].join(" "),
    );
  }
}

const sharp = loadSharp();

const tokens = {
  primary: "#0E5A6A",
  primaryRgb: [14, 90, 106],
  muted: "#6B7280",
  mutedRgb: [107, 114, 128],
  bg: "#F7F5F0",
};

function argValue(name, fallback) {
  const index = process.argv.indexOf(name);
  if (index === -1) return fallback;
  return process.argv[index + 1] ?? fallback;
}

const outDir = path.resolve(argValue("--out", "tmp/ui-asset-experiment/1.1-app-launch"));

function waveformInnerSvg({ width = 512, height = 512, scale = 1 } = {}) {
  const cx = width / 2;
  const cy = height / 2;
  const bars = [
    { x: -180, h: 42, w: 42 },
    { x: -120, h: 168, w: 42 },
    { x: -60, h: 260, w: 42 },
    { x: 0, h: 340, w: 42 },
    { x: 60, h: 260, w: 42 },
    { x: 120, h: 168, w: 42 },
    { x: 180, h: 42, w: 42 },
  ];

  return bars
    .map(({ x, h, w }) => {
      const scaledW = w * scale;
      const scaledH = h * scale;
      if (h === w) {
        return `<circle cx="${cx + x * scale}" cy="${cy}" r="${scaledW / 2}" fill="${tokens.primary}"/>`;
      }

      return `<rect x="${cx + x * scale - scaledW / 2}" y="${cy - scaledH / 2}" width="${scaledW}" height="${scaledH}" rx="${scaledW / 2}" fill="${tokens.primary}"/>`;
    })
    .join("\n  ");
}

function svgShell(width, height, body) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <rect width="100%" height="100%" fill="none"/>
  ${body}
</svg>`;
}

function waveformSvg() {
  return svgShell(512, 512, waveformInnerSvg());
}

function wordmarkSvg() {
  return svgShell(
    1200,
    300,
    `<text x="50%" y="60%" text-anchor="middle"
    font-family="New York, Bodoni 72, Georgia, Times New Roman, serif"
    font-size="150" font-weight="600" fill="${tokens.primary}">ShadowSpeak</text>`,
  );
}

function splashLockupSvg() {
  return svgShell(
    1400,
    700,
    `<g transform="translate(700 175) scale(0.52) translate(-256 -256)">
    ${waveformInnerSvg()}
  </g>
  <text x="50%" y="430" text-anchor="middle"
    font-family="New York, Bodoni 72, Georgia, Times New Roman, serif"
    font-size="156" font-weight="600" fill="${tokens.primary}">ShadowSpeak</text>
  <text x="50%" y="535" text-anchor="middle"
    font-family="Avenir Next, Helvetica Neue, Arial, sans-serif"
    font-size="39" font-weight="600" letter-spacing="11" fill="${tokens.muted}">LISTEN. SHADOW. IMPROVE.</text>`,
  );
}

async function renderAsset({ name, svg, width, height, expectedRgb }) {
  const svgPath = path.join(outDir, `${name}.svg`);
  const webpPath = path.join(outDir, `${name}.webp`);
  const previewPath = path.join(outDir, `${name}-preview.png`);
  const sourcePng = await sharp(Buffer.from(svg)).png().toBuffer();
  const { offsetX, offsetY } = await measureAlphaOffset(sourcePng);
  const centeredSvg = centerSvg(svg, width, height, -offsetX, -offsetY);
  const centeredPng = await sharp(Buffer.from(centeredSvg)).png().toBuffer();

  await fs.writeFile(svgPath, centeredSvg);
  await sharp(centeredPng).webp({ lossless: true }).toFile(webpPath);
  await sharp({
    create: {
      width,
      height,
      channels: 4,
      background: tokens.bg,
    },
  })
    .composite([{ input: centeredPng, left: 0, top: 0 }])
    .png()
    .toFile(previewPath);

  const validation = await validateRasterizedAsset(webpPath, expectedRgb);
  return { name, svgPath, webpPath, previewPath, validation };
}

function centerSvg(svg, width, height, translateX, translateY) {
  const inner = svg.replace(/^<svg[^>]*>\s*/u, "").replace(/\s*<\/svg>\s*$/u, "");
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <rect width="100%" height="100%" fill="none"/>
  <g transform="translate(${formatNumber(translateX)} ${formatNumber(translateY)})">
${inner}
  </g>
</svg>`;
}

function formatNumber(value) {
  return Number.isInteger(value) ? String(value) : value.toFixed(3).replace(/0+$/u, "").replace(/\.$/u, "");
}

async function measureAlphaOffset(inputBuffer) {
  const image = sharp(inputBuffer).ensureAlpha();
  const metadata = await image.metadata();
  const raw = await image.raw().toBuffer();
  const { width, height, channels } = metadata;
  let minX = width;
  let minY = height;
  let maxX = -1;
  let maxY = -1;

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const alpha = raw[(y * width + x) * channels + 3];
      if (alpha > 0) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }

  if (maxX < minX || maxY < minY) {
    return { offsetX: 0, offsetY: 0 };
  }

  const canvasCenterX = (width - 1) / 2;
  const canvasCenterY = (height - 1) / 2;
  const bboxCenterX = (minX + maxX) / 2;
  const bboxCenterY = (minY + maxY) / 2;
  return {
    offsetX: bboxCenterX - canvasCenterX,
    offsetY: bboxCenterY - canvasCenterY,
  };
}

async function validateRasterizedAsset(assetPath, expectedRgb) {
  const image = sharp(assetPath).ensureAlpha();
  const metadata = await image.metadata();
  const raw = await image.raw().toBuffer();
  const width = metadata.width;
  const height = metadata.height;
  const channels = metadata.channels;
  const rgbSet = new Set();
  let transparent = 0;
  let partial = 0;
  let opaque = 0;

  function pixelAt(x, y) {
    const index = (y * width + x) * channels;
    return [raw[index], raw[index + 1], raw[index + 2], raw[index + 3]];
  }

  for (let index = 0; index < raw.length; index += channels) {
    const alpha = raw[index + 3];
    if (alpha === 0) transparent += 1;
    else if (alpha === 255) {
      opaque += 1;
      rgbSet.add(`${raw[index]},${raw[index + 1]},${raw[index + 2]}`);
    } else {
      partial += 1;
    }
  }

  const corners = [
    pixelAt(0, 0)[3],
    pixelAt(width - 1, 0)[3],
    pixelAt(0, height - 1)[3],
    pixelAt(width - 1, height - 1)[3],
  ];
  const expected = new Set(expectedRgb.map((rgb) => rgb.join(",")));
  const unexpected = [...rgbSet].filter((rgb) => !expected.has(rgb));

  return {
    size: [width, height],
    corners,
    transparent,
    partial,
    opaque,
    opaqueRgb: [...rgbSet].sort(),
    pass: corners.every((alpha) => alpha === 0) && unexpected.length === 0,
    unexpectedOpaqueRgb: unexpected,
  };
}

await fs.mkdir(outDir, { recursive: true });

const results = [];
results.push(
  await renderAsset({
    name: "brand_waveform_mark",
    svg: waveformSvg(),
    width: 512,
    height: 512,
    expectedRgb: [tokens.primaryRgb],
  }),
);
results.push(
  await renderAsset({
    name: "brand_wordmark_shadowspeak",
    svg: wordmarkSvg(),
    width: 1200,
    height: 300,
    expectedRgb: [tokens.primaryRgb],
  }),
);
results.push(
  await renderAsset({
    name: "splash_brand_lockup",
    svg: splashLockupSvg(),
    width: 1400,
    height: 700,
    expectedRgb: [tokens.primaryRgb, tokens.mutedRgb],
  }),
);

await fs.writeFile(
  path.join(outDir, "manifest.json"),
  JSON.stringify({ generatedAt: new Date().toISOString(), outDir, results }, null, 2),
);

console.log(JSON.stringify({ outDir, results: results.map(({ name, validation }) => ({ name, validation })) }, null, 2));
