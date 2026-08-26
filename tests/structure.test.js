import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

test('page exposes calculator controls and accessible live results', async () => {
  const html = await readFile(new URL('../index.html', import.meta.url), 'utf8');
  for (const id of ['n1', 'e1', 'n2', 'e2', 'n3', 'e3']) {
    assert.match(html, new RegExp(`id="${id}"`));
    assert.match(html, new RegExp(`for="${id}"`));
  }
  assert.match(html, /id="score"[^>]*aria-live="polite"/);
  assert.match(html, /id="explanation-toggle"[^>]*aria-expanded="false"/);
  assert.match(html, /<script type="module" src="\.\/assets\/js\/app\.js"><\/script>/);
});

test('live score identifies its result heading to screen readers', async () => {
  const html = await readFile(new URL('../index.html', import.meta.url), 'utf8');
  assert.match(html, /id="score"[^>]*aria-labelledby="result-title"/);
});

test('page declares an inline favicon instead of requesting a missing file', async () => {
  const html = await readFile(new URL('../index.html', import.meta.url), 'utf8');
  assert.match(html, /<link rel="icon" href="data:image\/svg\+xml,/);
});

test('stylesheet contains visual tokens and responsive safeguards', async () => {
  const css = await readFile(new URL('../assets/css/styles.css', import.meta.url), 'utf8');
  assert.match(css, /--color-coral:\s*#d2543f/i);
  assert.match(css, /--color-blue:\s*#2f5fa8/i);
  assert.match(css, /--color-green:\s*#2e7355/i);
  assert.match(css, /@media\s*\(max-width:\s*900px\)/);
  assert.match(css, /@media\s*\(prefers-reduced-motion:\s*reduce\)/);
  assert.match(css, /:focus-visible/);
});

test('trimester inputs use an opaque high-contrast focus outline', async () => {
  const css = await readFile(new URL('../assets/css/styles.css', import.meta.url), 'utf8');
  assert.match(
    css,
    /\.trimester input:focus-visible\s*\{[^}]*outline:\s*3px solid var\(--trimester-color\);/s,
  );
});

test('progress uses the zero-to-ten scale represented by the goal marker', async () => {
  const html = await readFile(new URL('../index.html', import.meta.url), 'utf8');
  assert.match(html, /<progress id="progress" value="0" max="10">0<\/progress>/);
});
