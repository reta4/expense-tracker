/**
 * Capture authenticated React screenshots (real account data).
 *
 * First run: a browser window opens — log in if prompted, then wait.
 * Later runs reuse docs/scripts/.pw-auth-profile (Firebase session).
 *
 * Usage: node docs/scripts/capture-authenticated-screenshots.mjs
 */
import { chromium } from 'playwright';
import { mkdir } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_DIR = join(__dirname, '..', 'react-screenshots');
const PROFILE_DIR = join(__dirname, '.pw-auth-profile');
const BASE_URL = process.env.SCREENSHOT_BASE_URL || 'http://localhost:5173';
const LOGIN_WAIT_MS = Number(process.env.SCREENSHOT_LOGIN_WAIT_MS || 120_000);

async function waitForHomeLoaded(page) {
  await page.goto(`${BASE_URL}/`, { waitUntil: 'load', timeout: 60_000 });
  await page.waitForFunction(
    () => document.querySelector('.et-hero-amount') && !document.querySelector('.app-skeleton'),
    { timeout: 90_000 },
  );
  await page.waitForTimeout(1_500);
}

async function waitForAnalysisLoaded(page) {
  await page.goto(`${BASE_URL}/dashboard`, { waitUntil: 'load', timeout: 60_000 });
  await page.waitForFunction(
    () => document.querySelector('.av-page') && !document.querySelector('.app-skeleton'),
    { timeout: 90_000 },
  );
  await page.waitForTimeout(1_500);
}

async function waitForAuthenticatedHome(page) {
  await page.goto(`${BASE_URL}/`, { waitUntil: 'load', timeout: 60_000 });

  const deadline = Date.now() + LOGIN_WAIT_MS;
  while (Date.now() < deadline) {
    const url = page.url();
    if (!url.includes('/login') && !url.includes('/register')) {
      try {
        await page.waitForSelector('.et-page, .av-page, .app-page-shell', { timeout: 5_000 });
        return;
      } catch {
        // still loading or redirecting
      }
    }
    await page.waitForTimeout(1_000);
  }

  throw new Error(
    'Not logged in after waiting. Open the Playwright browser, sign in, then run again.',
  );
}

async function captureHome(page) {
  await waitForHomeLoaded(page);
  await page.screenshot({ path: join(OUT_DIR, '04-home.png'), fullPage: true });
  console.log('Saved 04-home.png');
}

async function captureAnalysis(page) {
  await waitForAnalysisLoaded(page);
  await page.screenshot({ path: join(OUT_DIR, '05-analysis.png'), fullPage: true });
  console.log('Saved 05-analysis.png');
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true });

  console.log('Opening browser with saved profile (log in once if needed)...');
  const context = await chromium.launchPersistentContext(PROFILE_DIR, {
    headless: true,
    viewport: { width: 1280, height: 900 },
    deviceScaleFactor: 1,
    colorScheme: 'light',
  });

  const page = context.pages()[0] || await context.newPage();

  try {
    await waitForAuthenticatedHome(page);

    await captureHome(page);
    await captureAnalysis(page);

    console.log(`\nDone. Authenticated screenshots saved to ${OUT_DIR}`);
  } finally {
    await context.close();
  }
}

main().catch((err) => {
  console.error(err.message || err);
  process.exit(1);
});
