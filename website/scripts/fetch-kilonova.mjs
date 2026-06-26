/**
 * fetch-kilonova.mjs — link our solution pages to kilonova.ro.
 *
 * Two kinds of links are produced, because our archive has two shapes:
 *
 *   • "list"    — newer OJI/ONI years ship one combined PDF per class, which
 *                 maps 1:1 to a Kilonova class list ("OJI 2023 V"). We link the
 *                 whole list plus each problem in it.
 *   • "problem" — older years ship one file per problem. We match each file to a
 *                 single Kilonova problem by (contest, year, normalized name),
 *                 deliberately IGNORING round/class labels (every olympiad names
 *                 its rounds differently — "Lot N" here vs "Baraj N" there).
 *
 * For each of our categories we traverse one or more Kilonova "root" lists
 * (given by the maintainer), collect every leaf problem with its year(s), and
 * match. The result is written to the COMMITTED content/kilonova-map.json, so
 * the website build never needs network access.
 *
 * Refresh with:  npm run kilonova
 */
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { join, dirname, extname, basename } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const API = "https://kilonova.ro/api";
const CONCURRENCY = 6;

/**
 * Per our category: the Kilonova root list(s) to search, and (for OJI/ONI) the
 * prefix used by Kilonova's per-class lists. Add categories/roots here to grow
 * coverage. Root list IDs were provided by the maintainer.
 */
const SOURCES = {
  oji: { prefix: "OJI", roots: [452] },
  oni: { prefix: "ONI", roots: [507] },
  "baraj-lot-juniori": { roots: [689, 508] }, // Lot Juniori + Baraj Juniori
  "baraj-lot-seniori": { roots: [225, 516] }, // Lot Seniori + Baraj Seniori
  iiot: { roots: [128] },
  infopro: { roots: [239] },
  // OMI Iași (+2026), Cupa SEPI 2023, RoAlgo contest/weekly, Prosoft@NT, PreOJI,
  // Grigore Moisil, infO(1) Cup. "Other" is a bag of sub-contests; coverage is
  // partial (older editions of several of these are not on Kilonova).
  other: { roots: [149, 470, 464, 1397, 1429, 1366, 1048, 1545, 124] },
};

/** InfoPro is organized as "Etapa <round>, Grupa <A|B|C1|C2>", and our files are
 *  named by that grupa under a "Runda N" folder. Parent Etapa list ids (from
 *  list 239) — used when an editorial covers a whole etapa, not one grupa. */
const INFOPRO_ETAPA = { 1: 240, 2: 241, 3: 242, 4: 243 };
const ROMAN_N = { 1: "I", 2: "II", 3: "III", 4: "IV" };

const ROMAN = { 5: "V", 6: "VI", 7: "VII", 8: "VIII", 9: "IX", 10: "X", 11: "XI", 12: "XII" };

// ---------------------------------------------------------------------------
// Name handling
// ---------------------------------------------------------------------------

function stripDiacritics(s) {
  return s.normalize("NFD").replace(/[̀-ͯ]/g, "");
}

/** Long, unambiguous "solution" words removed even when glued into a token
 *  (e.g. "horsesolutie" -> "horse"). Short ones are handled as tokens below. */
const GLUED_NOISE = ["solutiile", "solutii", "solutia", "solutie", "descrierea", "descriereo", "descriere", "indicatii", "indicatie", "rezolvarea", "rezolvare", "editorialul", "editorial"];
/** Standalone tokens that are never a problem name. */
const TOKEN_NOISE = new Set(["sol", "ro", "en", "sd", "pb", "desc", "neoficial", "oficial", "final", "baraj", "lot", "juniori", "seniori", "onigim", "oji", "oni", "iiot", "problema", "pb1", "pb2", "pb3"]);

/** Turn a solution filename into candidate problem-name tokens. */
function nameTokens(rawStem) {
  let s = stripDiacritics(rawStem.toLowerCase());
  for (const w of GLUED_NOISE) s = s.split(w).join(" ");
  return s
    .split(/[^a-z0-9]+/)
    .filter(Boolean)
    .filter((t) => !TOKEN_NOISE.has(t) && !/^20\d\d$/.test(t)); // drop year tokens
}

/** Normalize a Kilonova problem name to its comparison key. */
function knKey(name) {
  return stripDiacritics(name.toLowerCase()).replace(/[^a-z0-9]+/g, "");
}

/** Tokens for matching a (yearless) bundle to a leaf list by title, e.g.
 *  "RoAlgo Contest #1 Editorial" vs the list "RoAlgo Contest #1". */
const TITLE_STOP = new Set(["editorial", "editorialul", "solutii", "solutie", "solutia", "descriere", "descrierea", "indicatie", "indicatii", "rezolvare", "de", "la", "si", "the", "pdf", "runda", "round", "final", "finala"]);
function titleTokens(str) {
  return stripDiacritics(String(str).toLowerCase())
    .split(/[^a-z0-9]+/)
    .filter((t) => t && !TITLE_STOP.has(t));
}

const ROUND_ROMAN = { i: 1, ii: 2, iii: 3, iv: 4, v: 5, vi: 6, vii: 7, viii: 8 };

/**
 * Normalized "round key" for matching a multi-problem bundle to a Kilonova round
 * list. Requires a round-type keyword (round/runda/baraj/lot/etapa) so we never
 * mistake an OJI class ("V") for a round. Returns e.g. "r2", "final",
 * "international", or null.
 */
function roundKeyOf(text) {
  // Drop years first so "Lot 2021 Baraj 1" keys off "Baraj 1", not "Lot 2021".
  const s = stripDiacritics(String(text).toLowerCase()).replace(/\b\d{4}\b/g, " ");
  if (/\bfinal/.test(s)) return "final";
  if (/\binternational/.test(s)) return "international";
  // "baraj/etapa/ziua" are distinctive enough to match even glued to the digit
  // ("solutiiBaraj1"); "round/runda/lot/day" need a boundary (avoid "pilot",
  // "around"). Baraj/etapa/ziua are tried first (they out-rank a leading "Lot").
  const patterns = [/(?:baraj|etapa|ziua)\s*([ivx]+|\d+)/g, /\b(?:round|runda|lot|day)\s*([ivx]+|\d+)\b/g];
  for (const re of patterns) {
    for (const m of s.matchAll(re)) {
      const n = /^\d+$/.test(m[1]) ? Number(m[1]) : ROUND_ROMAN[m[1]];
      if (n && n <= 12) return `r${n}`; // rounds are small; never a year
    }
  }
  return null;
}

/** Convert one of our grade labels / filename stems to Kilonova's class label. */
function toClass(raw) {
  const s = String(raw).trim().replace(/–/g, "-");
  if (/^[IVX]+(-[IVX]+)?$/i.test(s)) return s.toUpperCase();
  const parts = s.split("-").map((p) => ROMAN[Number(p)]);
  if (parts.every(Boolean)) return parts.join("-");
  return null;
}

/** Class read from the END of a combined-PDF stem, e.g. "OJI 2004 IX" -> "IX",
 *  "OJI 2004 XI-XII" -> "XI-XII". */
function trailingClass(stem) {
  const m = stem.match(/(?:^|[\s_-])([ivx]{1,4}(?:\s*-\s*[ivx]{1,4})?)\s*$/i);
  return m ? toClass(m[1]) : null;
}

/** Build a "list" link object from a leaf-like { listId, title, problems }. */
function makeListLink(leaf) {
  return {
    kind: "list",
    listId: leaf.listId,
    listName: leaf.title,
    listUrl: `https://kilonova.ro/problem_lists/${leaf.listId}`,
    problems: leaf.problems.map((p) => ({ id: p.id, name: p.name, url: `https://kilonova.ro/problems/${p.id}` })),
  };
}

/** Years referenced by a string, incl. season ranges "2022-23" / "2021-2022". */
function yearsOf(title) {
  const set = new Set();
  for (const m of title.matchAll(/20\d\d/g)) set.add(Number(m[0]));
  const span = title.match(/(20\d\d)\s*-\s*(\d\d)\b/); // "2022-23" -> 2023
  if (span) set.add(Number(span[1].slice(0, 2) + span[2]));
  return [...set];
}

// ---------------------------------------------------------------------------
// Kilonova API + traversal
// ---------------------------------------------------------------------------

async function api(path) {
  const res = await fetch(`${API}${path}`, { headers: { Accept: "application/json" } });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const json = await res.json();
  if (json.status !== "success") throw new Error(json.data || "api error");
  return json.data;
}

/** Collect all leaf lists (those that directly hold problems) reachable from the
 *  given roots, using a bounded pool of workers over a shared BFS queue. */
async function collectLeaves(rootIds) {
  const seen = new Set();
  const leaves = [];
  const queue = [...rootIds];

  async function worker() {
    while (queue.length) {
      const listId = queue.shift();
      if (listId == null || seen.has(listId)) continue;
      seen.add(listId);
      let d;
      try {
        d = await api(`/problemList/${listId}/complex`);
      } catch (e) {
        console.warn(`[kilonova] list ${listId} failed: ${e.message}`);
        continue;
      }
      const problems = d.problems || [];
      if (problems.length) {
        leaves.push({
          listId,
          title: d.list.title,
          problems: problems.map((p) => ({ id: p.id, name: p.name })),
        });
      }
      for (const s of d.list.sublists || []) if (!seen.has(s.id)) queue.push(s.id);
    }
  }

  await Promise.all(Array.from({ length: CONCURRENCY }, worker));
  return leaves;
}

// ---------------------------------------------------------------------------
// Build
// ---------------------------------------------------------------------------

async function main() {
  const catalogPath = join(ROOT, "src", "data", "catalog.json");
  if (!existsSync(catalogPath)) {
    console.error("[kilonova] run `npm run index` first (no catalog.json).");
    process.exit(1);
  }
  const { entries } = JSON.parse(readFileSync(catalogPath, "utf8"));

  const map = {};
  let nList = 0, nProblem = 0, nMiss = 0;

  for (const [category, src] of Object.entries(SOURCES)) {
    const catEntries = entries.filter((e) => e.category === category);
    if (!catEntries.length) continue;

    // Traverse this category's Kilonova roots once.
    console.log(`[kilonova] traversing ${category} (roots ${src.roots.join(", ")})…`);
    const leaves = await collectLeaves(src.roots);

    // Index leaves: by exact title (class lists), by year (problems), and by
    // year again carrying the leaf itself (for round-bundle list links).
    const leafByTitle = new Map();
    const byYear = new Map(); // year -> [{ key, id, name, cls }]
    const leavesByYear = new Map(); // year -> [{ ...leaf, round }]
    for (const leaf of leaves) {
      leafByTitle.set(leaf.title.trim().toLowerCase(), leaf);
      const ys = yearsOf(leaf.title);
      const cls = leaf.title.match(/\b([IVX]+(?:-[IVX]+)?)\s*$/i)?.[1]?.toUpperCase() ?? null;
      const round = roundKeyOf(leaf.title);
      for (const y of ys) {
        if (!byYear.has(y)) byYear.set(y, []);
        for (const p of leaf.problems) byYear.get(y).push({ key: knKey(p.name), id: p.id, name: p.name, cls });
        if (!leavesByYear.has(y)) leavesByYear.set(y, []);
        leavesByYear.get(y).push({ ...leaf, round });
      }
    }
    console.log(`[kilonova]   ${leaves.length} leaf lists, ${[...byYear.values()].reduce((a, b) => a + b.length, 0)} problems indexed`);

    const listLink = makeListLink;

    // Yearless bundle fallback: match a leaf whose distinctive title tokens are
    // all present in our entry's title (group + filename). Conservative —
    // requires every leaf token (incl. its number) to be present.
    const matchLeafByTitle = (entry, stem) => {
      const ours = new Set(titleTokens(`${entry.group || ""} ${stem}`));
      let best = null, bestLen = 1;
      for (const leaf of leaves) {
        const lt = titleTokens(leaf.title);
        if (lt.length < 2 || !lt.every((t) => ours.has(t))) continue;
        if (lt.length > bestLen) { bestLen = lt.length; best = leaf; }
      }
      return best;
    };

    for (const entry of catEntries) {
      const stem = basename(entry.file.name, extname(entry.file.name));

      // InfoPro: map "Runda N" + grupa (A/B/C1/C2) to "InfoPro Etapa <N>, Grupa <g>".
      if (category === "infopro") {
        const roundN = Number((`${entry.group || ""} ${stem}`.match(/runda[\s_-]*(\d)|(\d)/i) || [])[1] || 0);
        const roman = ROMAN_N[roundN];
        if (roman) {
          const norm = stem.replace(/_+/g, " "); // underscores are separators here
          const g = (norm.match(/c1|c2/i)?.[0] || norm.match(/(?:^|[\s-])([abc])(?:[\s-]|$)/i)?.[1] || "").toUpperCase();
          const leaf = g && leafByTitle.get(`infopro etapa ${roman}, grupa ${g}`.toLowerCase());
          if (leaf) { map[entry.id] = makeListLink(leaf); nList++; continue; }
          // whole-etapa editorial -> link the Etapa parent list
          map[entry.id] = { kind: "list", listId: INFOPRO_ETAPA[roundN], listName: `InfoPro Etapa ${roman}`, listUrl: `https://kilonova.ro/problem_lists/${INFOPRO_ETAPA[roundN]}`, problems: [] };
          nList++; continue;
        }
        nMiss++; continue;
      }

      // Candidate years: the entry's year (= season start) plus any years parsed
      // from the path, so season ranges like "2019-20" match either side.
      const years = [...new Set([entry.year, ...yearsOf(entry.file.repoPath)].filter(Boolean))];
      if (!years.length) {
        // No year at all (e.g. RoAlgo "Contest #N") — try a title match.
        const leaf = matchLeafByTitle(entry, stem);
        if (leaf) { map[entry.id] = listLink(leaf); nList++; } else { nMiss++; }
        continue;
      }

      // CASE list: the FILE ITSELF is a class -> a whole-class combined editorial
      // that maps to a Kilonova class list. Covers "05.pdf" directly under the
      // year, "OJI 2004 IX.pdf" (trailing class), and "08.pdf" sitting inside the
      // matching "08/" grade folder.
      const stemGrade = toClass(stem) || trailingClass(stem);
      const bucketGrade = entry.bucket?.kind === "grade" ? toClass(entry.bucket.label) : null;
      const isClassFile = stemGrade && (entry.bucket == null || bucketGrade === stemGrade);
      if (isClassFile && src.prefix) {
        const leaf = leafByTitle.get(`${src.prefix} ${years[0]} ${stemGrade}`.toLowerCase());
        if (leaf) { map[entry.id] = listLink(leaf); nList++; continue; }
      }

      // CASE problem: match a single problem by (year, normalized name).
      const tokens = nameTokens(stem);
      const cand = new Set([...tokens, tokens.join("")]);
      const ourCls = entry.bucket?.kind === "grade" ? toClass(entry.bucket.label) : null;
      const pool = tokens.length
        ? years.flatMap((y) => byYear.get(y) || []).filter((p) => cand.has(p.key))
        : [];
      if (pool.length) {
        const pick = (ourCls && pool.find((p) => p.cls === ourCls)) || pool[0];
        map[entry.id] = { kind: "problem", problem: { id: pick.id, name: pick.name, url: `https://kilonova.ro/problems/${pick.id}` } };
        nProblem++;
        continue;
      }

      // CASE round-bundle: a multi-problem file (a whole round/season) -> the
      // matching Kilonova round list, by round key (e.g. "Runda 2" == "Round II",
      // our "Lot N" == Kilonova "Baraj N").
      const rk = roundKeyOf(entry.bucket?.label || "") || roundKeyOf(stem);
      if (rk) {
        const leaf = years.flatMap((y) => leavesByYear.get(y) || []).find((l) => l.round === rk);
        if (leaf) { map[entry.id] = listLink(leaf); nList++; continue; }
      }

      // CASE title bundle: combined-class PDFs in mixed categories (e.g. "Other")
      // whose name+group cover a leaf title, like "RoAlgo PreOJI 2024 IX". The
      // year token in the title keeps this from matching across editions.
      const tleaf = matchLeafByTitle(entry, stem);
      if (tleaf) { map[entry.id] = listLink(tleaf); nList++; continue; }

      nMiss++;
    }
  }

  // Manual pins (content/kilonova-overrides.json) win over auto-matching — for
  // abbreviated/renamed files (e.g. "sol_reac" -> Kilonova "reactivi").
  const nOverride = await applyOverrides(map, new Set(entries.map((e) => e.id)));

  const out = join(ROOT, "content", "kilonova-map.json");
  writeFileSync(out, JSON.stringify(map, null, 2) + "\n");
  console.log(`\n[kilonova] list links: ${nList}, problem links: ${nProblem}, unmatched: ${nMiss}, overrides: ${nOverride}`);
  console.log(`[kilonova] wrote ${Object.keys(map).length} entries -> ${out}`);
}

/**
 * Apply manual overrides. Each key is one of our entry ids; the value pins it to
 * a Kilonova problem (`{ "problem": 724 }`) or a whole list (`{ "list": 341 }`).
 */
async function applyOverrides(map, validIds) {
  const p = join(ROOT, "content", "kilonova-overrides.json");
  if (!existsSync(p)) return 0;
  let ov;
  try {
    ov = JSON.parse(readFileSync(p, "utf8"));
  } catch (e) {
    console.warn(`[kilonova] could not parse kilonova-overrides.json: ${e.message}`);
    return 0;
  }
  let n = 0;
  for (const [id, spec] of Object.entries(ov)) {
    if (id.startsWith("_")) continue; // allow a "_README" key
    if (!validIds.has(id)) {
      console.warn(`[kilonova] override id not in catalog: ${id}`);
      continue;
    }
    try {
      if (spec.none) {
        delete map[id]; // suppress a wrong auto-match
        n++;
        console.log(`[kilonova] override ${id} -> removed`);
        continue;
      }
      if (spec.problem) {
        const d = await api(`/problem/${spec.problem}`);
        map[id] = { kind: "problem", problem: { id: spec.problem, name: d.name, url: `https://kilonova.ro/problems/${spec.problem}` } };
      } else if (spec.list) {
        const d = await api(`/problemList/${spec.list}/complex`);
        map[id] = makeListLink({ listId: spec.list, title: d.list.title, problems: d.problems || [] });
      } else if (Array.isArray(spec.problems)) {
        // A bundle that maps to a specific set of problems (e.g. a contest "day"),
        // with no single Kilonova list. Rendered as pills, no list button.
        const problems = [];
        for (const pid of spec.problems) {
          const d = await api(`/problem/${pid}`);
          problems.push({ id: pid, name: d.name, url: `https://kilonova.ro/problems/${pid}` });
        }
        map[id] = { kind: "list", listId: null, listName: spec.label ?? null, listUrl: null, problems };
      } else {
        console.warn(`[kilonova] override ${id} has no "problem", "list" or "problems"`);
        continue;
      }
      n++;
      const what = spec.problem ? `problem ${spec.problem}` : spec.list ? `list ${spec.list}` : `${spec.problems.length} problems`;
      console.log(`[kilonova] override ${id} -> ${what}`);
    } catch (e) {
      console.warn(`[kilonova] override ${id} failed: ${e.message}`);
    }
  }
  return n;
}

main().catch((e) => {
  console.error("[kilonova] failed:", e);
  process.exit(1);
});
