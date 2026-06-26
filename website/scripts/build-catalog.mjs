/**
 * build-catalog.mjs — the indexer.
 *
 * Walks the Romanian-Olympiad-Solutions folders and turns the (deliberately
 * messy) directory structure into a clean, typed catalog the site renders from.
 *
 * It is STRUCTURE-AGNOSTIC: instead of assuming a fixed depth, it classifies
 * each path segment by pattern (year / grade / round / sub-group), so it copes
 * with OJI's grade folders, Baraj's "Lot N" folders, the extra contest-name
 * level under "Other Romanian contests", single-file years, casing variants,
 * etc.
 *
 * Source folder resolution (first that exists wins):
 *   1. $SOLUTIONS_DIR
 *   2. ".."  (the website lives in a /website subfolder of the repo)
 *
 * Manual fixes live in content/overrides.json and never touch the source files.
 *
 * Output: src/data/catalog.json
 */
import { readFileSync, writeFileSync, existsSync, readdirSync, statSync, mkdirSync } from "node:fs";
import { join, resolve, dirname, extname, basename } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

/** Editable metadata for the known top-level categories. Unknown categories are
 *  auto-derived from their folder name. Edit labels here to taste. */
const CATEGORY_META = {
  "OJI (regional olympiad)": {
    slug: "oji",
    name: { ro: "OJI — Olimpiada Județeană", en: "OJI — County Olympiad" },
    grades: true,
  },
  "ONI (national olympiad)": {
    slug: "oni",
    name: { ro: "ONI — Olimpiada Națională", en: "ONI — National Olympiad" },
    grades: true,
  },
  "Baraj + Lot Juniori (EJOI team selection tests)": {
    slug: "baraj-lot-juniori",
    name: { ro: "Baraj + Lot Juniori", en: "Junior Team Selection (EJOI)" },
  },
  "Baraj + Lot Seniori (IOI team selection tests)": {
    slug: "baraj-lot-seniori",
    name: { ro: "Baraj + Lot Seniori", en: "Senior Team Selection (IOI)" },
  },
  "IIOT (team olympiad)": {
    slug: "iiot",
    name: { ro: "IIOT — Olimpiada pe echipe", en: "IIOT — Team Olympiad" },
  },
  "InfoPro (pandemic training contests)": {
    slug: "infopro",
    name: { ro: "InfoPro — Antrenamente", en: "InfoPro — Training Contests" },
  },
  "Other Romanian contests": {
    slug: "other",
    name: { ro: "Alte concursuri românești", en: "Other Romanian Contests" },
  },
};

/** Viewable file kinds. Anything not listed here is ignored. */
const KIND_BY_EXT = {
  ".pdf": "pdf",
  ".txt": "text",
  ".md": "text",
  ".htm": "html",
  ".html": "html",
  ".docx": "doc",
  ".doc": "doc",
  ".cpp": "code",
  ".c": "code",
};

/** Folders/files to never descend into or index. */
const IGNORE = new Set([
  "node_modules", ".git", "website", "dist", ".astro", ".vercel",
  ".github", ".gitignore", "readme.md", "license", "license.md",
  // section README/index files that aren't solutions
  "juniors.md", "seniors.md", "about.md", "index.md", "contributing.md",
]);

const ROMAN = { "05": "V", "06": "VI", "07": "VII", "08": "VIII", "09": "IX",
  "10": "X", "11": "XI", "12": "XII", "5": "V", "6": "VI", "7": "VII",
  "8": "VIII", "9": "IX" };

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function stripDiacritics(s) {
  return s.normalize("NFD").replace(/[̀-ͯ]/g, "");
}

function slugify(s) {
  return stripDiacritics(String(s))
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-") || "x";
}

/** Turn a raw file/folder name into a human title. */
function titleize(raw) {
  let s = raw.replace(/\.[A-Za-z0-9]+$/, ""); // drop extension
  s = s.replace(/[_]+/g, " ").replace(/\s{2,}/g, " ").trim();
  // Drop very common "solution" noise words so the problem name stands out,
  // but keep the string non-empty.
  const cleaned = s
    .replace(/\b(sol(utie|utii|ution)?|descriere(a)?|rezolvare(a)?|indicatie|editorial(ul)?)\b/gi, "")
    .replace(/[-–]+/g, " ")
    .replace(/\s{2,}/g, " ")
    .trim();
  const out = cleaned.length >= 2 ? cleaned : s;
  return out.charAt(0).toUpperCase() + out.slice(1);
}

/**
 * Recognize a year segment, including olympiad "season" ranges that span two
 * calendar years (IIOT etc.): "2019-20", "2016-17", "2019-2020". Returns the
 * START year plus a human "season" label, or null. Single years have season=null.
 */
function parseYearSeg(seg) {
  const t = seg.trim();
  if (/^(19|20)\d{2}$/.test(t)) return { year: Number(t), season: null };
  let m = t.match(/^(20\d{2})\s*[-–]\s*(\d{2})$/); // 2019-20
  if (m) return { year: Number(m[1]), season: `${m[1]}-${m[2]}` };
  m = t.match(/^(20\d{2})\s*[-–]\s*(20\d{2})$/); // 2019-2020
  if (m) return { year: Number(m[1]), season: `${m[1]}-${m[2].slice(2)}` };
  return null;
}

/** Grade folders: "05".."12", "5".."12", "11-12", "9-10", roman "V".."XII". */
function asGrade(s) {
  const t = s.trim();
  if (/^(0?[5-9]|1[0-2])$/.test(t)) {
    const key = t.length === 1 ? t : t.replace(/^0/, "0").padStart(2, "0");
    const k = t.length === 1 ? t : t;
    return { label: ROMAN[k] || ROMAN[key] || t, kind: "grade" };
  }
  const range = t.match(/^(\d{1,2})\s*[-–]\s*(\d{1,2})$/);
  if (range) {
    const a = ROMAN[range[1]] || range[1];
    const b = ROMAN[range[2]] || range[2];
    return { label: `${a}–${b}`, kind: "grade" };
  }
  if (/^(V|VI|VII|VIII|IX|X|XI|XII)(\s*[-–]\s*(V|VI|VII|VIII|IX|X|XI|XII))?$/.test(t)) {
    return { label: t.replace(/\s*-\s*/, "–"), kind: "grade" };
  }
  return null;
}

/** Round folders: "Lot 1".."Lot 9", "Baraj", "baraj", "lot 6", "Lot". */
function asRound(s) {
  const t = s.trim();
  const lot = t.match(/^lot\s*(\d+)?$/i);
  if (lot) return { label: lot[1] ? `Lot ${lot[1]}` : "Lot", kind: "round" };
  if (/^baraj/i.test(t)) return { label: "Baraj", kind: "round" };
  return null;
}

// ---------------------------------------------------------------------------
// Walk
// ---------------------------------------------------------------------------

/** Minimal .env loader (so local dev can pin SOLUTIONS_DIR without exporting). */
function loadDotEnv() {
  const p = join(ROOT, ".env");
  if (!existsSync(p)) return;
  for (const line of readFileSync(p, "utf8").split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/i);
    if (m && !process.env[m[1]]) {
      process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
    }
  }
}

function resolveSolutionsDir() {
  loadDotEnv();
  const candidates = [process.env.SOLUTIONS_DIR, resolve(ROOT, "..")].filter(Boolean);
  for (const c of candidates) {
    const p = resolve(c);
    if (existsSync(p) && statSync(p).isDirectory()) {
      // Heuristic: a real solutions dir contains at least one known category.
      const entries = readdirSync(p);
      if (entries.some((e) => CATEGORY_META[e] || /olympiad|contest|Lot|Baraj/i.test(e))) {
        return p;
      }
    }
  }
  return null;
}

function walk(dir, rel, files) {
  for (const entry of readdirSync(dir)) {
    if (IGNORE.has(entry.toLowerCase())) continue;
    const abs = join(dir, entry);
    const childRel = rel ? `${rel}/${entry}` : entry;
    const st = statSync(abs);
    if (st.isDirectory()) {
      walk(abs, childRel, files);
    } else if (st.isFile()) {
      files.push(childRel);
    }
  }
  return files;
}

// ---------------------------------------------------------------------------
// Build
// ---------------------------------------------------------------------------

function loadOverrides() {
  const p = join(ROOT, "content", "overrides.json");
  if (!existsSync(p)) return {};
  try {
    return JSON.parse(readFileSync(p, "utf8"));
  } catch (e) {
    console.warn(`[indexer] could not parse overrides.json: ${e.message}`);
    return {};
  }
}

function categoryMetaFor(name) {
  if (CATEGORY_META[name]) return { ...CATEGORY_META[name], repoName: name };
  // Auto-derive: "Foo Bar (some gloss)" -> label "Foo Bar", gloss "some gloss".
  const m = name.match(/^(.*?)\s*\(([^)]+)\)\s*$/);
  const label = (m ? m[1] : name).trim();
  const gloss = m ? m[2].trim() : "";
  return {
    slug: slugify(label),
    name: { ro: label, en: gloss ? `${label} — ${gloss}` : label },
    repoName: name,
  };
}

function main() {
  const SRC = resolveSolutionsDir();
  if (!SRC) {
    console.error(
      "[indexer] No solutions folder found.\n" +
        "  Set SOLUTIONS_DIR to the repo that holds the solution folders,\n" +
        "  e.g.  SOLUTIONS_DIR=../ npm run index\n" +
        "  Writing an EMPTY catalog so the site can still build."
    );
    writeCatalog({ source: null, categories: [], entries: [] });
    return;
  }

  console.log(`[indexer] reading solutions from: ${SRC}`);
  const overrides = loadOverrides();
  const allFiles = walk(SRC, "", []);

  /** @type {Map<string, any>} */
  const categories = new Map();
  const entries = [];
  const usedIds = new Set();

  for (const repoPath of allFiles) {
    const ext = extname(repoPath).toLowerCase();
    const kind = KIND_BY_EXT[ext];
    if (!kind) continue; // not a viewable solution file

    const segments = repoPath.split("/");
    if (segments.length < 2) continue; // file at repo root, skip
    const categoryName = segments[0];
    const fileName = segments[segments.length - 1];
    const middle = segments.slice(1, -1);

    const meta = categoryMetaFor(categoryName);
    if (!categories.has(meta.slug)) {
      categories.set(meta.slug, {
        slug: meta.slug,
        repoName: categoryName,
        name: meta.name,
        years: new Set(),
        count: 0,
      });
    }
    const cat = categories.get(meta.slug);

    // Classify the middle segments.
    let year = null;
    let season = null; // e.g. "2019-20" for IIOT seasons; null for single years
    let bucket = null; // round or grade
    const groups = []; // leftover labels (e.g. contest name under "Other")
    for (const seg of middle) {
      if (!year) {
        const y = parseYearSeg(seg);
        if (y) {
          year = y.year;
          season = y.season;
          continue;
        }
      }
      const r = asRound(seg) || asGrade(seg);
      if (r && !bucket) {
        bucket = r;
        continue;
      }
      groups.push(seg);
    }
    // A season range may also appear in the filename, e.g. "Runda 1 2022-23.pdf".
    if (!year) {
      const sm = fileName.match(/(20\d{2})\s*[-–]\s*(\d{2,4})/);
      if (sm) {
        const y = parseYearSeg(`${sm[1]}-${sm[2]}`);
        if (y) { year = y.year; season = y.season; }
      }
    }
    // A single file may itself encode the year/grade, e.g. "OJI 2004 IX.pdf"
    // or "Lot 1 Juniori 2024.pdf". Recover year from the filename if needed.
    if (!year) {
      const ym = fileName.match(/(19|20)\d{2}/);
      if (ym) year = Number(ym[0]);
    }

    const group = groups.join(" / ") || null;
    const groupSlug = group ? slugify(group) : null;
    const bucketSlug = bucket ? slugify(bucket.label) : null;

    // Build a unique, hierarchical id == URL path (without /lang).
    const idParts = [meta.slug];
    if (groupSlug) idParts.push(groupSlug);
    if (year) idParts.push(String(year));
    if (bucketSlug) idParts.push(bucketSlug);
    idParts.push(slugify(basename(fileName, extname(fileName))));
    let id = idParts.join("/");
    let n = 2;
    while (usedIds.has(id)) id = `${idParts.join("/")}-${n++}`;
    usedIds.add(id);

    const ov = overrides[repoPath] || {};
    const entry = {
      id,
      category: meta.slug,
      group,
      groupSlug,
      year,
      season, // e.g. "2019-20" for season-range folders, else null
      bucket: bucket ? { ...bucket, slug: bucketSlug } : null,
      title: ov.title || titleize(fileName),
      summary: ov.summary || null, // { ro, en } or string, optional
      tags: ov.tags || [],
      file: {
        name: fileName,
        ext: ext.replace(".", ""),
        kind,
        repoPath,
      },
    };
    entries.push(entry);
    cat.count++;
    if (year) cat.years.add(year);
  }

  const catalogCategories = [...categories.values()]
    .map((c) => ({
      slug: c.slug,
      repoName: c.repoName,
      name: c.name,
      count: c.count,
      years: [...c.years].sort((a, b) => b - a),
    }))
    .sort((a, b) => b.count - a.count);

  writeCatalog({ source: SRC, categories: catalogCategories, entries });
}

function writeCatalog({ source, categories, entries }) {
  const catalog = {
    // generatedAt is intentionally omitted to keep builds reproducible.
    source,
    counts: { categories: categories.length, entries: entries.length },
    categories,
    entries,
  };
  const out = join(ROOT, "src", "data", "catalog.json");
  mkdirSync(dirname(out), { recursive: true });
  writeFileSync(out, JSON.stringify(catalog, null, 0));
  console.log(
    `[indexer] wrote ${entries.length} entries across ${categories.length} categories -> ${out}`
  );
}

main();
