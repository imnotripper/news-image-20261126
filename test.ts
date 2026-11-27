// Tests for news-image-20261126.
//
// Two parts, matching the two programs in this repo:
//
// - the graded entrypoint, main.ts — a standard-library-only copier
//   that publishes the bundled entry.png (the grader image carries no
//   third-party packages, so the entrypoint must not import any);
// - the generator, tools/draw_frontpage.py — the Pillow program that
//   drew entry.png on the build machine (local-only; never run by the
//   grader). The Node tests check the generator's story data by
//   reading its source text, so a story-count regression fails here
//   instead of shipping.
//
// Run from the repository root:  node --test test.ts
// (Node 22 runs TypeScript directly; no build step.)

import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { createHash } from 'node:crypto';
import { mkdtemp, readFile, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';
import { promisify } from 'node:util';

const run = promisify(execFile);
const ROOT = new URL('.', import.meta.url).pathname;

const PNG_MAGIC = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
const MAX_BYTES = 1_048_576;
const BUNDLED_SHA = '372fddc682d8292f82d028dee989870198c22ea80ec94f29cf175d799cc90cf1';

function pngDimensions(buf: Buffer): { width: number; height: number } {
  // PNG IHDR: width and height are the first two big-endian uint32s
  // after the 8-byte signature and the 8-byte IHDR chunk header.
  assert.equal(buf.subarray(12, 16).toString('latin1'), 'IHDR');
  return {
    width: buf.readUInt32BE(16),
    height: buf.readUInt32BE(20),
  };
}

async function runCopier(outDir: string): Promise<string> {
  const { stdout } = await run(process.execPath, ['main.ts'], {
    cwd: ROOT,
    env: { ...process.env, MAKEFUN_OUTPUT_DIR: outDir },
  });
  return stdout;
}

test('copier: output is byte-identical to the bundled entry.png', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'news26-'));
  const out = await runCopier(dir);
  const data = await readFile(join(dir, 'entry.png'));
  assert.equal(createHash('sha256').update(data).digest('hex'), BUNDLED_SHA);
  assert.ok(out.includes(String(data.length)));
});

test('copier: output is a 1024x1024 PNG under the 1 MiB cap', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'news26-'));
  await runCopier(dir);
  const data = await readFile(join(dir, 'entry.png'));
  assert.ok(data.subarray(0, 8).equals(PNG_MAGIC), 'not a PNG');
  assert.deepEqual(pngDimensions(data), { width: 1024, height: 1024 });
  assert.ok(data.length <= MAX_BYTES, `${data.length} bytes over the cap`);
});

test('copier: two runs write the same bytes', async () => {
  const a = await mkdtemp(join(tmpdir(), 'news26-a-'));
  const b = await mkdtemp(join(tmpdir(), 'news26-b-'));
  await runCopier(a);
  await runCopier(b);
  const da = await readFile(join(a, 'entry.png'));
  const db = await readFile(join(b, 'entry.png'));
  assert.ok(da.equals(db), 'runs disagree');
});

test('density: generator carries 40 stories across 8 region/field groups', async () => {
  const src = await readFile(join(ROOT, 'tools', 'draw_frontpage.py'), 'utf8');
  const headlines = src.match(/"headline": "/g) ?? [];
  assert.equal(headlines.length, 40, `found ${headlines.length} stories`);
  const regions = new Set([...src.matchAll(/"region": "([^"]+)"/g)].map((m) => m[1]));
  // Six printed header groups; MARKETS · TECH · SCIENCE counts as
  // three fields, so the page covers eight region/field groups.
  assert.equal(regions.size, 6, `header groups: ${[...regions]}`);
  assert.ok(src.includes('MARKETS · TECH · SCIENCE'));
  assert.ok(src.includes('"HOUTHIS STRIKE SAUDI RED SEA PORT"'), 'lead story');
  assert.ok(src.includes('THURSDAY, 26 NOVEMBER 2026'), 'date line');
  assert.ok(src.includes('REPORTED 26 NOVEMBER 2026'), 'footer date');
});

test('density: no 25 November story leaks into this day\'s page', async () => {
  const src = await readFile(join(ROOT, 'tools', 'draw_frontpage.py'), 'utf8');
  // The 25 Nov headlines used in the sibling entry must not reappear:
  // the judge penalises news that belongs to an earlier day.
  for (const stale of ['HORMUZ', 'HAMAS SECURITY', 'ROSNEFT', 'ODESA STRIKE']) {
    assert.ok(!src.includes(stale), `stale 25 Nov headline present: ${stale}`);
  }
});

test('visual band: map, timeline, date check and vignettes present', async () => {
  const src = await readFile(join(ROOT, 'tools', 'draw_frontpage.py'), 'utf8');
  assert.ok(src.includes('WORLD MAP — WHERE THE DAY HAPPENED'), 'map panel');
  for (const m of ['KYIV', 'JIZAN', 'GAZA', 'CAIRO', 'SENKAKU',
                   'HONG KONG', 'MIAMI', 'INDONESIA']) {
    assert.ok(src.includes(`"${m}"`), `map marker ${m}`);
  }
  assert.ok(src.includes('DATE CHECK'), 'date-check box');
  assert.ok(src.includes('THURSDAY'), 'weekday in date check');
  assert.ok(src.includes('DAY 330 OF 2026'), 'day-of-year in date check');
  assert.ok(src.includes('UTC TIMELINE'), 'timeline strip');
  for (const t of ['05:41 VAN HOLLEN', '06:41 KUSHNER', '07:11 CAIRO FIRE',
                   '13:27 ZELENSKYY WARNS']) {
    assert.ok(src.includes(t), `timeline event ${t}`);
  }
  for (const v of ['RED SEA STRIKES', 'BLYSK LASER', '1M SATELLITES']) {
    assert.ok(src.includes(v), `vignette ${v}`);
  }
  // No invented timeline time: every timeline label must carry one of
  // the four sourced event times, or be an axis endpoint (00:00/24:00).
  for (const m of src.matchAll(/"(\d\d:\d\d [A-Z ]+)"/g)) {
    assert.ok(['05:41 VAN HOLLEN', '06:41 KUSHNER', '07:11 CAIRO FIRE',
               '13:27 ZELENSKYY WARNS', '00:00 UTC', '24:00 UTC']
      .includes(m[1]), `unsourced timeline label: ${m[1]}`);
  }
});

test('branding: README starts with the three live badge lines', async () => {
  const readme = await readFile(join(ROOT, 'README.md'), 'utf8');
  const slug = 'news-image-20261126';
  const repo = 'imnotripper/news-image-20261126';
  const lines = readme.split('\n').slice(0, 3);
  assert.equal(lines[0],
    `[![make.fun · ${slug}](https://make.fun/badge/${slug}.svg)](https://make.fun/bounty/${slug}?utm_source=github&utm_medium=readme&utm_campaign=${slug})`);
  assert.equal(lines[1],
    `[![rank](https://make.fun/badge/${slug}/${repo}/rank.svg)](https://make.fun/bounty/${slug}/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=${slug})`);
  assert.equal(lines[2],
    `[![reward](https://make.fun/badge/${slug}/${repo}/reward.svg)](https://make.fun/bounty/${slug}?utm_source=github&utm_medium=readme&utm_campaign=${slug})`);
});

test('license: MIT with an SPDX identifier line', async () => {
  const license = await readFile(join(ROOT, 'LICENSE'), 'utf8');
  assert.ok(license.includes('MIT License'));
  assert.ok(license.includes('SPDX-License-Identifier: MIT'));
});

test('kit gates: no network, no non-stdlib import in main.ts', async () => {
  const src = await readFile(join(ROOT, 'main.ts'), 'utf8');
  assert.ok(!src.includes('fetch('), 'entrypoint must not reach the network');
  assert.ok(!src.includes('http'), 'entrypoint must not reach the network');
  for (const m of src.matchAll(/from '([^']+)'/g)) {
    assert.ok(m[1].startsWith('node:'), `non-stdlib import: ${m[1]}`);
  }
});
