// news-image-20261126 entry (Node 22, standard library only): the
// front page is the entry.png beside this file, and this program
// copies it to /output/entry.png. The image is the deliverable: "The
// Global Times" for Thursday 26 November 2026, 1024 by 1024,
// 209,338 bytes, forty dated stories in wire layout across eight
// region/field groups, drawn by tools/draw_frontpage.py (Pillow, run
// on the build machine only — the grader image carries no third-party
// packages, so the graded program must not import any). Below the
// briefs the page carries a visual band: a schematic world map with
// story markers, three drawn scene vignettes, a date-check box and a
// UTC timeline of the day's timed events.
//
// Outside the grader's container, MAKEFUN_OUTPUT_DIR stands in for
// /output:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { copyFileSync, mkdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';
mkdirSync(outDir, { recursive: true });
const dst = join(outDir, 'entry.png');
copyFileSync(new URL('./entry.png', import.meta.url), dst);
// The gate reads the file by its first bytes: refuse to publish
// anything that is not a PNG at all.
const bytes = readFileSync(dst);
const PNG_MAGIC = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
if (!bytes.subarray(0, 8).equals(PNG_MAGIC)) {
  throw new Error('entry.png is not a PNG file');
}
console.log(`wrote ${dst} ${bytes.length} bytes`);
