/**
 * Renders the app icons (PNG) from the SVG sources in public/icons. Re-run after
 * changing an SVG:  npx tsx scripts/make-icons.ts
 *
 *   icon-192.png, icon-512.png   home-screen icons (rounded square)
 *   maskable-512.png             full-bleed version; Android crops it to its own shape
 *   src/app/apple-icon.png       iOS "Add to Home Screen" (Next.js serves it automatically)
 */
import sharp from "sharp";

const outputs: [source: string, size: number, out: string][] = [
  ["public/icons/icon.svg", 192, "public/icons/icon-192.png"],
  ["public/icons/icon.svg", 512, "public/icons/icon-512.png"],
  ["public/icons/icon-maskable.svg", 512, "public/icons/maskable-512.png"],
  ["public/icons/icon-maskable.svg", 180, "src/app/apple-icon.png"],
];

for (const [source, size, out] of outputs) {
  await sharp(source).resize(size, size).png().toFile(out);
  console.log(`wrote ${out}`);
}
