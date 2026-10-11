/**
 * Takes the README screenshots from a running app with the demo league seeded.
 *
 *   npm run db:seed
 *   npm run build && npx next start -p 3100     (in another terminal; a production
 *                                               build has no dev-mode overlay)
 *   BASE_URL=http://localhost:3100 npm run screenshots   → docs/screenshots/*.png
 *
 * Phone-sized, light mode. Everything shown is demo data from prisma/seed.ts.
 */
import { chromium } from "@playwright/test";

const BASE_URL = process.env.BASE_URL ?? "http://localhost:3000";
const OUT = "docs/screenshots";

async function main() {
  const browser = await chromium.launch();
  const page = await browser.newPage({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
    colorScheme: "light",
  });

  const shots: [name: string, path: string][] = [
    ["home", "/"],
    ["table", "/l/demo-league"],
    ["players", "/l/demo-league/players"],
  ];
  for (const [name, path] of shots) {
    await page.goto(BASE_URL + path, { waitUntil: "networkidle" });
    await page.screenshot({ path: `${OUT}/${name}.png` });
    console.log(`saved ${OUT}/${name}.png`);
  }

  // A finished match with a few goals (Demo Blues 3-1 Demo Golds in the seed).
  await page.goto(`${BASE_URL}/l/demo-league/matches`, { waitUntil: "networkidle" });
  await page.getByRole("link", { name: /Demo Blues 3, Demo Golds 1/ }).click();
  await page.waitForURL(/\/matches\/.+/);
  await page.waitForLoadState("networkidle");
  await page.screenshot({ path: `${OUT}/match.png` });
  console.log(`saved ${OUT}/match.png`);

  // The share image chat apps show for that match link.
  const og = await page.request.get(`${page.url()}/opengraph-image`);
  const fs = await import("node:fs/promises");
  await fs.writeFile(`${OUT}/share-card.png`, await og.body());
  console.log(`saved ${OUT}/share-card.png`);

  await browser.close();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
