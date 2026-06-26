/**
 * list-unmatched.mjs — write a report of solution pages that have NO Kilonova
 * link, so they can be reviewed/fixed by hand. Reads the generated catalog and
 * content/kilonova-map.json; writes unmatched-kilonova.md in the project root.
 *
 *   npm run unmatched      (runs the indexer first, then this)
 */
import { readFileSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

// Categories the Kilonova fetcher actually attempts (mirror of SOURCES keys).
const WITH_SOURCE = new Set(["oji", "oni", "baraj-lot-juniori", "baraj-lot-seniori", "iiot", "other"]);

const catalog = JSON.parse(readFileSync(join(ROOT, "src", "data", "catalog.json"), "utf8"));
const map = JSON.parse(readFileSync(join(ROOT, "content", "kilonova-map.json"), "utf8"));

const byCat = new Map(catalog.categories.map((c) => [c.slug, c]));
const unmatched = catalog.entries.filter((e) => !map[e.id]);

// group unmatched by category
const groups = new Map();
for (const e of unmatched) {
  if (!groups.has(e.category)) groups.set(e.category, []);
  groups.get(e.category).push(e);
}

const totalEntries = catalog.entries.length;
const lines = [];
lines.push("# Solutions without a Kilonova link", "");
lines.push(`Generated from the current catalog and \`content/kilonova-map.json\`. ` +
  `Regenerate with \`npm run unmatched\` (after \`npm run kilonova\`).`, "");
lines.push(`**${unmatched.length}** of **${totalEntries}** solution pages have no Kilonova match.`, "");

// summary table
lines.push("## Summary", "");
lines.push("| Category | Unmatched | Total | Note |", "|---|---:|---:|---|");
for (const cat of catalog.categories) {
  const u = (groups.get(cat.slug) || []).length;
  const note = WITH_SOURCE.has(cat.slug) ? "" : "no Kilonova source configured";
  lines.push(`| ${cat.name.en} | ${u} | ${cat.count} | ${note} |`);
}
lines.push("");

// per-category detail
for (const cat of catalog.categories) {
  const list = groups.get(cat.slug);
  if (!list || !list.length) continue;
  lines.push(`## ${cat.name.en} (${list.length} unmatched)`, "");
  list.sort((a, b) => (a.year || 0) - (b.year || 0) || a.file.repoPath.localeCompare(b.file.repoPath));
  for (const e of list) {
    const when = e.season || e.year || "—";
    const round = e.bucket ? ` · ${e.bucket.label}` : "";
    lines.push(`- **${when}**${round} — \`${e.file.repoPath}\` → [page](/ro/solution/${e.id}/)`);
  }
  lines.push("");
}

const out = join(ROOT, "unmatched-kilonova.md");
writeFileSync(out, lines.join("\n"));
console.log(`Wrote ${unmatched.length} unmatched entries -> ${out}`);
