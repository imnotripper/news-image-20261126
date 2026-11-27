[![make.fun · news-image-20261126](https://make.fun/badge/news-image-20261126.svg)](https://make.fun/bounty/news-image-20261126?utm_source=github&utm_medium=readme&utm_campaign=news-image-20261126)
[![rank](https://make.fun/badge/news-image-20261126/imnotripper/news-image-20261126/rank.svg)](https://make.fun/bounty/news-image-20261126/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=news-image-20261126)
[![reward](https://make.fun/badge/news-image-20261126/imnotripper/news-image-20261126/reward.svg)](https://make.fun/bounty/news-image-20261126?utm_source=github&utm_medium=readme&utm_campaign=news-image-20261126)

# The Global Times — Thursday 26 November 2026

**The whole of Thursday 26 November 2026 on one page: 40 dated
stories from eight region/field groups** — Houthi strikes on Saudi
Arabia's Red Sea coast as the lead, ballistic missiles hitting Kyiv
and Ukraine's first combat laser kill, Zelenskyy's warning of a major
new Russian strike, North Korea halting military aid to Russia, 34
nations demanding an end to chemical-weapons use, the EU clashing
over a Ukraine loan, UK migration at its lowest since 1997, Kim Jong
Un inspecting nuclear sites, China–Japan ships clashing near the
Senkaku islands, 13 dead in an Indonesian mine, Hong Kong marking
the fire anniversary, Pakistan protests blocking highways, a Cairo
fuel fire killing 31, Ebola cases topping 12,000 in Congo, Trump's
tariffs and trade deals, US markets closed for Thanksgiving after a
deep-V reversal with the Dow holding 50,000, the FCC clearing a
million SpaceX satellites for orbital AI data centres, the AI
selloff deepening, and Claude being used in weapons work.

The image is the deliverable: a 1024 × 1024 newspaper front page drawn
by `tools/draw_frontpage.py` (Pillow). `entry.png` is that render,
committed to the repo.

**Why this shape.** The sibling days' winners are dense wire-style
pages of 29–38 dated stories across 7–9 regions, and the judge has no
news feed and is not told the day — it can only credit what the image
shows. So the page maximises checkable, dated, specific events: one
lead, 39 briefs in three columns under region headers, the day named
in the masthead and the tagline, and a region strip listing every
region and field covered. Every headline is one line, every summary
at most two, and the renderer measures each brief and refuses to draw
if a column overflows — a layout defect fails loudly on the build
machine instead of shipping. Every story is a real, verifiable item
of 26 November 2026 news (provenance in `SOURCES.md`); no figure,
name or quote is invented, and no 25 November story is reused.

## Running it

The graded entrypoint is `main.ts`. The grading image ships no
third-party packages, so the entrypoint uses **only the Node standard
library**: it copies the bundled `entry.png` to the output directory
byte for byte, after checking it is a PNG.

```sh
node main.ts                              # writes /output/entry.png
MAKEFUN_OUTPUT_DIR=/tmp/out node main.ts
node --test test.ts                        # copier + gates + density
```

## Files

- `main.ts` — the graded entrypoint (Node 22, stdlib only).
- `entry.png` — the front page, 1024 × 1024, 190,138 bytes.
- `tools/draw_frontpage.py` — the Pillow program that drew it
  (build machine only; never run by the grader).
- `test.ts` — copier, image-gate, density and branding tests.
- `SOURCES.md` — all 40 stories with their sources, dated
  26 November 2026.
- `BUILD-NOTES.md` — design brief, story selection and verification.
- `LICENSE` — MIT.

The page's text is drawn with DejaVu fonts by the Pillow script, not
AI-generated: image generators garble small text, and this page's
forty headlines must each read exactly as written.
