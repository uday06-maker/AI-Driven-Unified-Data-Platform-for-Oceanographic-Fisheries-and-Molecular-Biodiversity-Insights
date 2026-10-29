import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const publicDir = path.resolve('public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// Full SVG for standard icon
const svgStandard = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#032b43" />
      <stop offset="40%" stop-color="#025a7a" />
      <stop offset="100%" stop-color="#008080" />
    </linearGradient>
    <linearGradient id="wave1" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#38bdf8" stop-opacity="0.9" />
      <stop offset="100%" stop-color="#2dd4bf" stop-opacity="0.95" />
    </linearGradient>
    <linearGradient id="wave2" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#0284c7" stop-opacity="0.8" />
      <stop offset="100%" stop-color="#0ea5e9" stop-opacity="0.8" />
    </linearGradient>
    <linearGradient id="crestGlow" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#ffffff" stop-opacity="0.95" />
      <stop offset="100%" stop-color="#bae6fd" stop-opacity="0.2" />
    </linearGradient>
    <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="8" result="blur" />
      <feComposite in="SourceGraphic" in2="blur" operator="over" />
    </filter>
  </defs>

  <!-- Background rounded canvas -->
  <rect width="512" height="512" rx="108" fill="url(#bgGrad)" />

  <!-- Outer Pulse Ring -->
  <circle cx="256" cy="256" r="210" fill="none" stroke="#38bdf8" stroke-width="4" stroke-opacity="0.3" stroke-dasharray="12 12" />

  <!-- Geometric Depth Grid / Radar -->
  <circle cx="256" cy="256" r="160" fill="none" stroke="#2dd4bf" stroke-width="2" stroke-opacity="0.25" />
  <circle cx="256" cy="256" r="100" fill="none" stroke="#2dd4bf" stroke-width="2" stroke-opacity="0.2" />
  <line x1="256" y1="46" x2="256" y2="466" stroke="#38bdf8" stroke-width="1.5" stroke-opacity="0.25" stroke-dasharray="6 6" />
  <line x1="46" y1="256" x2="466" y2="256" stroke="#38bdf8" stroke-width="1.5" stroke-opacity="0.25" stroke-dasharray="6 6" />

  <!-- Layer 1 Deep Surge Wave -->
  <path d="M 50 360 C 130 380, 190 320, 260 340 C 330 360, 390 410, 462 380 L 462 450 C 420 470, 340 480, 256 480 C 172 480, 92 470, 50 450 Z" fill="url(#wave2)" />

  <!-- Layer 2 High Dynamic Tsunami / Ocean Crest Wave -->
  <path d="M 60 330 C 130 260, 210 240, 280 290 C 340 330, 390 310, 452 250 C 440 330, 410 390, 350 420 C 270 435, 170 410, 60 330 Z" fill="url(#wave1)" filter="url(#glow)" />

  <!-- Crest Foam Line -->
  <path d="M 75 320 C 145 250, 215 230, 280 280 C 340 320, 395 300, 448 245" fill="none" stroke="url(#crestGlow)" stroke-width="8" stroke-linecap="round" />

  <!-- Data Mining K-Means Cluster Nodes & Connecting Edges -->
  <!-- Cluster 1: Ocean Physics -->
  <line x1="160" y1="180" x2="230" y2="140" stroke="#fcd34d" stroke-width="3" stroke-opacity="0.7" />
  <line x1="230" y1="140" x2="290" y2="175" stroke="#fcd34d" stroke-width="3" stroke-opacity="0.7" />
  <line x1="290" y1="175" x2="360" y2="130" stroke="#fcd34d" stroke-width="3" stroke-opacity="0.7" />
  <line x1="290" y1="175" x2="256" y2="240" stroke="#38bdf8" stroke-width="3" stroke-opacity="0.8" stroke-dasharray="4 4" />

  <!-- Node Dots -->
  <circle cx="160" cy="180" r="14" fill="#fbbf24" stroke="#ffffff" stroke-width="3" />
  <circle cx="230" cy="140" r="18" fill="#f59e0b" stroke="#ffffff" stroke-width="4" filter="url(#glow)" />
  <circle cx="290" cy="175" r="13" fill="#38bdf8" stroke="#ffffff" stroke-width="3" />
  <circle cx="360" cy="130" r="20" fill="#34d399" stroke="#ffffff" stroke-width="4" filter="url(#glow)" />
  <circle cx="256" cy="240" r="16" fill="#06b6d4" stroke="#ffffff" stroke-width="4" />

  <!-- Center Core Beacon Icon: Stylized Samudra Compass Star -->
  <polygon points="256,70 266,105 300,105 272,125 282,160 256,138 230,160 240,125 212,105 246,105" fill="#ffffff" filter="url(#glow)" />

  <!-- Brand Typography Badge -->
  <rect x="136" y="420" width="240" height="42" rx="21" fill="#021f33" fill-opacity="0.85" stroke="#38bdf8" stroke-width="2" />
  <text x="256" y="447" font-family="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="20" font-weight="800" fill="#f8fafc" text-anchor="middle" letter-spacing="3">SAMUDRA</text>
</svg>`;

// Maskable SVG with 20% safe zone padding (no sharp corners, full bleed background)
const svgMaskable = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <linearGradient id="bgGradM" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#032b43" />
      <stop offset="40%" stop-color="#025a7a" />
      <stop offset="100%" stop-color="#008080" />
    </linearGradient>
    <linearGradient id="wave1M" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#38bdf8" stop-opacity="0.9" />
      <stop offset="100%" stop-color="#2dd4bf" stop-opacity="0.95" />
    </linearGradient>
    <linearGradient id="crestGlowM" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#ffffff" stop-opacity="0.95" />
      <stop offset="100%" stop-color="#bae6fd" stop-opacity="0.2" />
    </linearGradient>
  </defs>

  <!-- Full-bleed background for maskable target -->
  <rect width="512" height="512" fill="url(#bgGradM)" />

  <!-- Scaled content inside safe zone (approx 75% center) -->
  <g transform="translate(64, 64) scale(0.75)">
    <!-- Outer Pulse Ring -->
    <circle cx="256" cy="256" r="210" fill="none" stroke="#38bdf8" stroke-width="5" stroke-opacity="0.35" stroke-dasharray="14 14" />
    <circle cx="256" cy="256" r="160" fill="none" stroke="#2dd4bf" stroke-width="3" stroke-opacity="0.3" />

    <!-- Layer 1 Deep Surge Wave -->
    <path d="M 50 360 C 130 380, 190 320, 260 340 C 330 360, 390 410, 462 380 L 462 450 C 420 470, 340 480, 256 480 C 172 480, 92 470, 50 450 Z" fill="#0284c7" fill-opacity="0.8" />

    <!-- Layer 2 Wave -->
    <path d="M 60 330 C 130 260, 210 240, 280 290 C 340 330, 390 310, 452 250 C 440 330, 410 390, 350 420 C 270 435, 170 410, 60 330 Z" fill="url(#wave1M)" />
    <path d="M 75 320 C 145 250, 215 230, 280 280 C 340 320, 395 300, 448 245" fill="none" stroke="url(#crestGlowM)" stroke-width="10" stroke-linecap="round" />

    <!-- K-Means Data Nodes -->
    <line x1="160" y1="180" x2="230" y2="140" stroke="#fcd34d" stroke-width="4" stroke-opacity="0.8" />
    <line x1="230" y1="140" x2="290" y2="175" stroke="#fcd34d" stroke-width="4" stroke-opacity="0.8" />
    <line x1="290" y1="175" x2="360" y2="130" stroke="#fcd34d" stroke-width="4" stroke-opacity="0.8" />
    <line x1="290" y1="175" x2="256" y2="240" stroke="#38bdf8" stroke-width="4" stroke-opacity="0.9" stroke-dasharray="5 5" />

    <circle cx="160" cy="180" r="16" fill="#fbbf24" stroke="#ffffff" stroke-width="4" />
    <circle cx="230" cy="140" r="20" fill="#f59e0b" stroke="#ffffff" stroke-width="5" />
    <circle cx="290" cy="175" r="15" fill="#38bdf8" stroke="#ffffff" stroke-width="4" />
    <circle cx="360" cy="130" r="22" fill="#34d399" stroke="#ffffff" stroke-width="5" />
    <circle cx="256" cy="240" r="18" fill="#06b6d4" stroke="#ffffff" stroke-width="5" />

    <polygon points="256,70 266,105 300,105 272,125 282,160 256,138 230,160 240,125 212,105 246,105" fill="#ffffff" />
    
    <rect x="136" y="420" width="240" height="42" rx="21" fill="#021f33" fill-opacity="0.9" stroke="#38bdf8" stroke-width="2" />
    <text x="256" y="447" font-family="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="20" font-weight="800" fill="#f8fafc" text-anchor="middle" letter-spacing="3">SAMUDRA</text>
  </g>
</svg>`;

async function buildIcons() {
  fs.writeFileSync(path.join(publicDir, 'icon.svg'), svgStandard);
  fs.writeFileSync(path.join(publicDir, 'favicon.svg'), svgStandard);

  const stdBuffer = Buffer.from(svgStandard);
  const maskBuffer = Buffer.from(svgMaskable);

  // 192x192 PNG
  await sharp(stdBuffer)
    .resize(192, 192)
    .png()
    .toFile(path.join(publicDir, 'pwa-192x192.png'));
  console.log('Created pwa-192x192.png');

  // 512x512 PNG
  await sharp(stdBuffer)
    .resize(512, 512)
    .png()
    .toFile(path.join(publicDir, 'pwa-512x512.png'));
  console.log('Created pwa-512x512.png');

  // 512x512 Maskable PNG
  await sharp(maskBuffer)
    .resize(512, 512)
    .png()
    .toFile(path.join(publicDir, 'pwa-maskable-512x512.png'));
  console.log('Created pwa-maskable-512x512.png');

  // 180x180 Apple Touch Icon
  await sharp(stdBuffer)
    .resize(180, 180)
    .png()
    .toFile(path.join(publicDir, 'apple-touch-icon.png'));
  console.log('Created apple-touch-icon.png');
}

buildIcons().catch(err => {
  console.error(err);
  process.exit(1);
});
