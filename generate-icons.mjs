/**
 * generate-icons.mjs
 * Run: node generate-icons.mjs
 * Requires: npm install sharp
 *
 * Generates all PWA icon sizes from a single source SVG.
 * Place this file in your project root and run it once.
 */

import sharp from 'sharp'
import { mkdirSync, writeFileSync } from 'fs'
import { join } from 'path'

const SIZES = [72, 96, 128, 144, 152, 192, 384, 512]
const OUT_DIR = './public/icons'

// Inline SVG — the "R" logo matching your Reasmart brand
// background: sage-600 (#437266), rounded square, white "R"
const SVG = (size) => {
  const r = Math.round(size * 0.22)   // border-radius
  const fontSize = Math.round(size * 0.52)
  const pad = Math.round(size * 0.12)
  return Buffer.from(`
<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <defs>
    <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#6EBF9E"/>
      <stop offset="100%" stop-color="#2d5a4a"/>
    </linearGradient>
  </defs>
  <!-- Background rounded rect -->
  <rect width="${size}" height="${size}" rx="${r}" ry="${r}" fill="url(#g)"/>
  <!-- Subtle inner highlight -->
  <rect x="${pad}" y="${pad}" width="${size - pad * 2}" height="${size / 2}" rx="${r * 0.7}" ry="${r * 0.7}" fill="rgba(255,255,255,0.07)"/>
  <!-- Letter R -->
  <text
    x="50%"
    y="54%"
    font-family="Georgia, 'Times New Roman', serif"
    font-weight="700"
    font-size="${fontSize}"
    fill="white"
    text-anchor="middle"
    dominant-baseline="middle"
    letter-spacing="-1"
  >R</text>
</svg>`)
}

mkdirSync(OUT_DIR, { recursive: true })

console.log('🎨 Generating Reasmart PWA icons...\n')

for (const size of SIZES) {
  const outPath = join(OUT_DIR, `icon-${size}x${size}.png`)
  await sharp(SVG(size), { density: 144 })
    .resize(size, size)
    .png({ quality: 100, compressionLevel: 9 })
    .toFile(outPath)
  console.log(`  ✓ icon-${size}x${size}.png`)
}

// Also write a favicon.png (32x32) to public/
const faviconPath = './public/favicon.png'
await sharp(SVG(32), { density: 144 })
  .resize(32, 32)
  .png()
  .toFile(faviconPath)
console.log(`  ✓ favicon.png`)

// Create a placeholder screenshot folder
mkdirSync('./public/screenshots', { recursive: true })
writeFileSync('./public/screenshots/.gitkeep', '')

console.log('\n✅ All icons generated in /public/icons/')
console.log('📌 Next: add the <link> tags to your index.html (see instructions below)\n')
