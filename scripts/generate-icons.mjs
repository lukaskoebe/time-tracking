/**
 * Generates PWA icons. Uses sharp if available, otherwise falls back to SVG files.
 * Run once: node scripts/generate-icons.mjs
 */
import { writeFileSync } from 'node:fs'

let sharp
try {
  sharp = (await import('sharp')).default
} catch {
  sharp = null
}

const SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <rect width="512" height="512" rx="112" fill="#f8f3ee"/>
  <circle cx="256" cy="256" r="140" fill="none" stroke="#c26f6f" stroke-width="18"/>
  <line x1="256" y1="256" x2="256" y2="148" stroke="#c26f6f" stroke-width="16" stroke-linecap="round"/>
  <line x1="256" y1="256" x2="316" y2="296" stroke="#c26f6f" stroke-width="14" stroke-linecap="round"/>
  <circle cx="256" cy="256" r="12" fill="#c26f6f"/>
  <ellipse cx="148" cy="110" rx="28" ry="14" fill="#c26f6f" opacity="0.55" transform="rotate(-35 148 110)"/>
  <ellipse cx="176" cy="88" rx="28" ry="14" fill="#e8a87c" opacity="0.55" transform="rotate(-60 176 88)"/>
  <ellipse cx="112" cy="130" rx="24" ry="12" fill="#b8a0c8" opacity="0.55" transform="rotate(-15 112 130)"/>
  <ellipse cx="364" cy="110" rx="28" ry="14" fill="#c26f6f" opacity="0.55" transform="rotate(35 364 110)"/>
  <ellipse cx="336" cy="88" rx="28" ry="14" fill="#e8a87c" opacity="0.55" transform="rotate(60 336 88)"/>
  <ellipse cx="400" cy="130" rx="24" ry="12" fill="#b8a0c8" opacity="0.55" transform="rotate(15 400 130)"/>
  <ellipse cx="196" cy="410" rx="32" ry="13" fill="#8fba8f" opacity="0.65" transform="rotate(-25 196 410)"/>
  <ellipse cx="316" cy="410" rx="32" ry="13" fill="#8fba8f" opacity="0.65" transform="rotate(25 316 410)"/>
  <ellipse cx="256" cy="420" rx="28" ry="11" fill="#8fba8f" opacity="0.65"/>
</svg>`

const svgBuffer = Buffer.from(SVG)
const dir = new URL('../public/icons/', import.meta.url).pathname

if (sharp) {
  for (const size of [192, 512]) {
    const buf = await sharp(svgBuffer).resize(size, size).png().toBuffer()
    writeFileSync(`${dir}icon-${size}.png`, buf)
    console.log(`✓ icon-${size}.png`)
  }
} else {
  // Browsers accept SVG icons — write them and update manifest manually if needed
  writeFileSync(`${dir}icon.svg`, svgBuffer)
  console.log('✓ icon.svg  (install sharp for PNG generation: pnpm add -D sharp)')
}
