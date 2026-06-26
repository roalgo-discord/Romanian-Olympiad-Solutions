# Romanian Olympiad Solutions — Website

A bilingual (Română / English), SEO-focused static website that makes the
solutions in the
[`roalgo-discord/Romanian-Olympiad-Solutions`](https://github.com/roalgo-discord/Romanian-Olympiad-Solutions)
repository easy to browse and search. It is designed to live **alongside** the
solutions repo (as a `/website` subfolder) and be rebuilt automatically whenever
solutions change.

> Status: **v1 scaffold complete and building.** 3,700+ pages generate from the
> existing folder structure with zero manual page authoring.

---

## Why it is built this way

The solutions are stored as `.pdf` / `.txt` (plus a few `.md` / `.docx` / `.htm`)
in **deliberately irregular** folders: depth varies per contest (OJI/ONI use
grade folders `05`–`12`; Baraj/Lot use `Lot N` / `Baraj`; "Other" adds a
contest-name level), casing is inconsistent (`Baraj` vs `baraj`), and some years
are a single file instead of a folder.

So the site is **generated from an indexer**, not hand-written:

```
solution folders  ──►  scripts/build-catalog.mjs  ──►  src/data/catalog.json  ──►  Astro  ──►  static HTML
   (messy)              (classifies each path)          (clean, typed)            (SSG)        (one page per item)
```

The indexer is **structure-agnostic**: instead of assuming a fixed depth, it
classifies each path segment by pattern (year / grade / round / sub-group), so
it copes with every layout variant in the repo. Manual corrections live in
`content/overrides.json` and never touch the source files.

### Tech choices

| Concern        | Choice | Reason |
|----------------|--------|--------|
| Generator      | **Astro 5** (static) | Ships zero JS by default → best SEO/perf for a content catalog; native i18n, content control |
| Bilingual      | `/ro/` + `/en/` routes, UI dictionary | UI chrome is translated; solution *content* stays in its original language |
| Theming        | CSS custom properties + `data-theme` | Light/dark + full re-brand by editing ~4 colors |
| Search         | **Pagefind** | Zero-backend, builds a static index, per-language, scales to thousands of pages |
| SEO            | static HTML, `sitemap`, `hreflang`, Open Graph, JSON-LD | PDFs index poorly; the HTML wrapper around each one is what ranks |
| Hosting        | **Vercel** | `vercel.json` included; custom domain gives the "separate site" |

---

## Project structure

```
website/                       (this folder — drop it into the solutions repo)
├── scripts/
│   ├── build-catalog.mjs      # the indexer (walks solution folders → catalog.json)
│   └── fetch-kilonova.mjs     # links solutions to "solve it" lists on kilonova.ro
├── content/
│   ├── overrides.json          # manual per-file title/summary/tags fixes
│   ├── kilonova-overrides.json # manual Kilonova pins (entry id → problem/list)
│   └── kilonova-map.json       # generated, COMMITTED map: entry id → Kilonova link
├── src/
│   ├── config/site.mjs        # ⭐ site URL, repo, languages — edit here
│   ├── data/
│   │   ├── catalog.json        # generated (gitignored)
│   │   └── catalog.ts          # typed access + grouping helpers
│   ├── i18n/ui.ts             # ⭐ RO/EN UI strings
│   ├── i18n/utils.ts          # t(), language routing helpers
│   ├── styles/theme.css       # ⭐ colors (blue/light-blue/white) + dark mode
│   ├── styles/global.css      # layout/components
│   ├── lib/source.ts          # build-time reader (inlines text solutions for SEO)
│   ├── components/            # Header, Footer, ThemeToggle, LangSwitch, Viewer…
│   ├── layouts/BaseLayout.astro
│   └── pages/
│       ├── index.astro                       # → /ro/
│       ├── 404.astro
│       └── [lang]/
│           ├── index.astro                   # home (category grid)
│           ├── search.astro                  # Pagefind search
│           ├── [category]/index.astro        # category → years
│           ├── [category]/[year]/index.astro # year → grouped solutions
│           └── solution/[...id].astro        # the document page (viewer + SEO)
├── astro.config.mjs
├── vercel.json
└── .env.example
```

⭐ = the files you will edit most often.

---

## Local development

```bash
npm install

# Point the indexer at a local clone of the solutions repo:
cp .env.example .env        # then set SOLUTIONS_DIR=...   (Windows: copy)
npm run dev                 # indexes, then starts Astro at http://localhost:4321
```

When the website lives as `/website` inside the solutions repo, `SOLUTIONS_DIR`
defaults to `..` and no `.env` is needed.

> Note on search: Pagefind builds its index from the final HTML, so **run
> `npm run build` once**. After that, the `astro-pagefind` integration serves the
> index in `npm run dev` too (and search is live on the deployed site).

### Scripts

| Command           | What it does |
|-------------------|--------------|
| `npm run index`   | Rebuild `src/data/catalog.json` from the solution folders |
| `npm run dev`     | Index + Astro dev server |
| `npm run build`   | Index + Astro build + Pagefind search index → `dist/` |
| `npm run preview` | Serve the built `dist/` locally |
| `npm run check`   | TypeScript/Astro diagnostics |

---

## How to customize

- **Colors / dark mode** — edit the `--brand-*` variables (and, if needed,
  the light/dark blocks) in `src/styles/theme.css`. The palette is built around
  the light blue `#90d5ff`; everything reads from these variables.
- **Site name (per language)** — the brand shown top-left and in titles is the
  `brand` key in `src/i18n/ui.ts` (RO = "ONI Ghid", EN = "Romanian Olympiad
  Solutions").
- **UI text (RO/EN)** — edit `src/i18n/ui.ts`. Both languages share the same keys.
- **Category names / slugs** — edit `CATEGORY_META` in `scripts/build-catalog.mjs`.
  Unknown categories are auto-derived from their folder name.
- **Fix a specific solution's title/summary/tags** — add an entry to
  `content/overrides.json`, keyed by the file's exact path in the solutions repo.
- **Site URL, GitHub repo, languages** — `src/config/site.mjs`.

---

## Deployment (Vercel)

1. Push this folder into the solutions repo as `/website` (or its own repo).
2. In Vercel: **New Project** → import the repo.
3. Set **Root Directory** = `website` (so `..` resolves to the solution folders).
4. Framework preset: **Astro** (build command `npm run build`, output `dist`).
5. Add a custom domain when ready — that is all "ship to a separate site" requires.

`vercel.json` already sets the build command, clean URLs, and the `/ → /ro/`
redirect. Update the canonical URL in `src/config/site.mjs` and the `Sitemap:`
line in `public/robots.txt` to your real domain.

### Adding new editorials (do you need to redeploy?)

The site is **static** — pages are generated at build time — so a rebuild has to
happen for new editorials to appear. But you don't trigger it by hand: because
the website lives in the **same repo** as the solutions, every push to GitHub
makes Vercel rebuild and redeploy automatically. The build runs the indexer
first, so it re-scans the folders, finds your new files, and generates their
pages (plus sitemap and search index). A few minutes later they are live.

The **only** thing that is not automatic is the **Kilonova links** for the new
files — `content/kilonova-map.json` is committed and only refreshes when you run
the matcher. So the recommended workflow when adding editorials:

```bash
# 1. add your new PDF/TXT files under the contest folders, then:
npm run kilonova        # refresh Kilonova links for the new files (needs internet)
npm run unmatched       # optional: see what still has no Kilonova match
git add -A
git commit -m "Add <contest> <year> editorials"
git push                # this redeploys the site AND ships the updated links
```

If you don't need Kilonova links updated, you can skip step 1's commands and just
push the files — the editorials still publish, only without a "Solve on Kilonova"
box until the next `npm run kilonova`. (You never need to run `npm run build`
yourself — Vercel does that on push.)

---

## How each solution is presented

- **PDF** → embedded inline in an `<iframe>` served via the **jsDelivr CDN**
  (`cdn.jsdelivr.net/gh/...`). This matters: `raw.githubusercontent.com` serves
  PDFs as `application/octet-stream` + `nosniff`, which forces a *download
  prompt*; jsDelivr serves the correct `application/pdf` inline so the file just
  renders. Buttons for **Open / View on GitHub / Download** are also provided.
- **TXT / MD / code** → the original text is read at build time and rendered
  inline as real HTML — this makes the actual solution content crawlable (good
  for SEO), not just a link.
- Every page has breadcrumbs, language-aware metadata, `hreflang`, and JSON-LD.

---

## "Solve on Kilonova" links

Solution pages show a **Solve on Kilonova** box linking to where the problem can
actually be solved on [kilonova.ro](https://kilonova.ro). Matching adapts to the
shape of each file:

- **list** (class) — newer OJI/ONI years ship one combined PDF per class, which
  maps 1:1 to a Kilonova class list (`OJI 2023 V`). We link the whole list plus a
  pill for every problem in it.
- **problem** — older years ship one file per problem. We match each file to a
  single Kilonova problem by **(contest, year, normalized name)**, deliberately
  ignoring round/class labels (every olympiad names rounds differently —
  `Lot N` here vs `Baraj N` there). Filename noise like `sol-`, `-descriere`,
  `_ro` is stripped before matching; duplicate names across classes are
  disambiguated by grade.
- **list** (round bundle) — a single PDF covering a whole round/season (IIOT
  rounds, team-selection baraje) maps to the matching Kilonova round list by a
  normalized "round key" (`Runda 2` == `Round II`, our `Lot N` == `Baraj N`),
  even when the day index is glued onto the name (`solutiiBaraj1` → Baraj 1) —
  again with a pill per problem.
- **list** (yearless) — numbered series with no year (`RoAlgo Contest #N`) match
  by title, keyed on the contest number.

`scripts/fetch-kilonova.mjs` traverses the maintainer-supplied Kilonova root
lists, indexes every problem with its year(s), matches our entries, and writes
the **committed** `content/kilonova-map.json`. The build only reads that JSON, so
**deploys never depend on Kilonova being online**.

```bash
npm run kilonova   # refresh the map (re-indexes, then traverses Kilonova; ~1-2 min)
```

Approximate coverage (linked / entries): OJI ~100%, ONI ~99%, Lot+Baraj Juniori
~98%, Lot+Baraj Seniori ~87%, InfoPro ~100%, IIOT ~88%, "Other" ~67% — about
**90% overall**.
The remaining misses are generically-named files (`pb1`), and sub-contests under
"Other" that aren't in the configured root lists.

To extend coverage, edit the `SOURCES` map in `scripts/fetch-kilonova.mjs` (map a
category to more Kilonova root list IDs) and re-run `npm run kilonova`.

### Manual pins (`content/kilonova-overrides.json`)

When a file's name differs too much from Kilonova's (abbreviations like
`sol_reac` vs `reactivi`, or renamed problems), pin it by hand. The key is the
solution entry id (the part after `/<lang>/solution/` in the page URL); the value
pins it to a Kilonova **problem**, a whole **list**, or an explicit set of
**problems** (for a contest "day" bundle that has no single list):

```json
{
  "oji/2004/ix/sol-reac":  { "problem": 724 },
  "oji/2009/x/solutii":    { "list": 341 },
  "oni/2002/xi-xii/ziua1": { "problems": [125, 126, 127] }
}
```

Overrides win over auto-matching. After editing, run `npm run kilonova` (it
fetches the problem/list name from Kilonova) and commit the updated map. Use
`npm run unmatched` to find candidates that still need pinning.

## Roadmap / next steps

- [ ] **PDF text extraction** (phase 2): extract the text layer from PDFs at
      build time and inline it (hidden/transcript block) so PDF solutions become
      fully crawlable and searchable — the biggest remaining SEO win.
- [ ] **Self-host solution files** option: copy referenced files into the build
      output so PDFs are served from your own domain instead of GitHub raw.
- [ ] Optional per-problem **EN titles/summaries** via `overrides.json`.
- [ ] Tag/difficulty taxonomy and filtered browsing.
- [ ] Reachability for the handful of year-less files (link them from the
      category page).

---

## Changelog

- **v2.0:** "Other" sub-contests linked via added roots (Prosoft@NT, PreOJI,
  Grigore Moisil, infO(1) Cup, OMI Iași 2026) + a title-overlap fallback for
  combined-class PDFs (`RoAlgo PreOJI 2024 IX`). Prosoft files filed under IIOT
  (they run alongside the IIOT final) pinned to their Prosoft lists. ~90% overall.
- **v1.9:** Readme/section `.md` files (`juniors.md`, `about.md`, …) are excluded
  from the catalog; added a `{ "none": true }` override to suppress a wrong
  auto-match (IIOT 2026 International Round); baraj-juniori 2019 pinned by order.
- **v1.8:** InfoPro linked (94%) via a dedicated `Runda N` + grupa `A/B/C1/C2` →
  `Etapa <N>, Grupa <g>` matcher; more seniori baraj pins (2007/2011/2013).
  Category pages are now adaptive: year-less categories (InfoPro, a one-off) are
  browsed by round/group instead of year.
- **v1.7:** ONI manual pins + a `problems: [...]` override kind (contest "day"
  bundles → an explicit problem set); class detector also resolves a grade-named
  file inside its grade folder (`08.pdf` in `08/`). OJI ~100%, ONI ~97%.
- **v1.6:** Manual Kilonova pins (`content/kilonova-overrides.json`) for
  abbreviated/renamed files; class detector now reads a trailing class from
  combined-PDF names (`OJI 2004 V.pdf`). OJI coverage 266/267.
- **v1.5:** Round-key matching also handles day indices glued onto the filename
  (`solutiiBaraj1` → Baraj 1), picking up older baraj/lot bundles filed under the
  `ONI/Lot YYYY Baraj N` lists. Coverage ~82%.
- **v1.4:** Round-bundle Kilonova links (a whole-round PDF → its Kilonova round
  list + per-problem pills) for IIOT and team-selection baraje; yearless series
  matching (RoAlgo `Contest #N`); the indexer now understands **season ranges**
  (`2019-20`, `2016-17`) so IIOT entries get proper years/labels instead of
  landing in "Other". Coverage ~80% overall.
- **v1.3:** Kilonova linking expanded to the whole archive — per-problem matches
  for older sets (filename → Kilonova problem by contest+year+name) plus
  per-class list links for combined-PDF years. ~1,300 solutions linked across
  OJI/ONI/Lot/Baraj/IIOT/Other via the `SOURCES` root-list config.
- **v1.2:** "Solve on Kilonova" links on solution pages — each OJI/ONI 2026
  class-PDF links to its Kilonova problem list plus every individual problem in
  it (`scripts/fetch-kilonova.mjs` → committed `content/kilonova-map.json`).
- **v1.1:** light-blue palette (`#90d5ff`); per-language site name (ONI Ghid /
  Romanian Olympiad Solutions); search box on the homepage; centered hero;
  PDFs embed inline via jsDelivr (no more download prompt); `astro-pagefind`
  integration so search also works in `dev` after one build; RO copy uses
  "repository-ul".
- **v1 (scaffold):** structure-agnostic indexer; bilingual RO/EN; light/dark
  theme with editable blue palette; home / category / year / solution pages;
  PDF embed + inline text rendering; Pagefind search; sitemap + hreflang +
  JSON-LD; Vercel config. Builds 3,782 pages from the current repo with 0 errors.
