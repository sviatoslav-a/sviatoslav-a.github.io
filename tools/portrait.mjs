// Deterministic halftone of a supplied photo, preserving the actual face.
// Usage: node tools/portrait.mjs /path/to/photo.jpg
// Publishes only derived, metadata-free masks; the original photo stays private.
import sharp from 'sharp';
import { mkdir } from 'node:fs/promises';

const input = process.argv[2];
if (!input) throw new Error('Pass the source portrait path');
const width = 880, height = 980, step = 5;
const pixels = await sharp(input).rotate()
  .extract({ left: 550, top: 320, width: 2200, height: 2450 })
  .resize(width, height).greyscale().raw().toBuffer();
// Remove only near-white background connected to the border, not facial highlights.
const background = new Uint8Array(width * height), queue = [];
const add = (i) => {
  if (i >= 0 && i < pixels.length && !background[i] && pixels[i] >= 244) {
    background[i] = 1; queue.push(i);
  }
};
for (let x = 0; x < width; x++) { add(x); add((height - 1) * width + x); }
for (let y = 0; y < height; y++) { add(y * width); add(y * width + width - 1); }
for (let n = 0; n < queue.length; n++) {
  const i = queue[n], x = i % width;
  if (x) add(i - 1);
  if (x < width - 1) add(i + 1);
  add(i - width); add(i + width);
}
await mkdir('public/images', { recursive: true });
for (const theme of ['dark', 'light']) {
  const circles = [];
  for (let y = 2; y < height; y += step) {
    for (let x = 2; x < width; x += step) {
      const i = y * width + x;
      if (background[i]) continue;
      const tone = Math.max(0, Math.min(1, (pixels[i] / 255 - .22) / .62));
      const density = theme === 'dark' ? tone ** 1.8 : (1 - tone) ** .85;
      const r = 2.25 * Math.sqrt(density);
      if (r < .25) continue;
      circles.push(`<circle cx="${x}" cy="${y}" r="${r.toFixed(2)}"/>`);
    }
  }
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}"><g fill="white">${circles.join('')}</g></svg>`;
  await sharp(Buffer.from(svg)).webp({ lossless: true }).toFile(`public/images/portrait-${theme}.webp`);
}
console.log('Created public/images/portrait-{dark,light}.webp (880×980, alpha, no source metadata)');
