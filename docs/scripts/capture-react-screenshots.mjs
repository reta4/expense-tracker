/**
 * Capture React app page screenshots into docs/react-screenshots/.
 * Requires: frontend dev server running (npm run dev), Playwright installed at repo root.
 *
 * Usage: node docs/scripts/capture-react-screenshots.mjs
 */
import { chromium } from 'playwright';
import { mkdir } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_DIR = join(__dirname, '..', 'react-screenshots');
const BASE_URL = process.env.SCREENSHOT_BASE_URL || 'http://localhost:5173';

const PAGES = [
  { file: '01-login.png', path: '/login', waitFor: '.auth-card, .et-auth-card, form' },
  { file: '02-register.png', path: '/register', waitFor: '.auth-card, .et-auth-card, form' },
  { file: '03-forgot-password.png', path: '/forgot-password', waitFor: '.auth-card, .et-auth-card, form' },
  { file: '04-home.png', path: '/dev/screenshot?view=home', waitFor: '.et-page, .app-page-shell' },
  { file: '05-analysis.png', path: '/dev/screenshot?view=analysis', waitFor: '.av-page, .app-page-shell' },
];

async function capturePage(page, { file, path, waitFor }) {
  const url = `${BASE_URL}${path}`;
  await page.goto(url, { waitUntil: 'networkidle', timeout: 60_000 });
  await page.waitForSelector(waitFor, { timeout: 30_000 });
  await page.waitForTimeout(600);
  await page.screenshot({
    path: join(OUT_DIR, file),
    fullPage: true,
  });
  console.log(`Saved ${file}`);
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true });

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 900 },
    deviceScaleFactor: 1,
    colorScheme: 'light',
  });
  const page = await context.newPage();

  for (const entry of PAGES) {
    await capturePage(page, entry);
  }

  await browser.close();
  console.log(`\nDone. Screenshots saved to ${OUT_DIR}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
