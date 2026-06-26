// Typed access to the generated catalog. Run `npm run index` to (re)generate
// src/data/catalog.json from the solution folders.
import raw from "./catalog.json";

export type Lang = "ro" | "en";
export type Localized = { ro: string; en: string };

export interface Bucket {
  label: string;
  kind: "round" | "grade";
  slug: string;
}

export interface FileRef {
  name: string;
  ext: string;
  kind: "pdf" | "text" | "html" | "doc" | "code";
  repoPath: string;
}

export interface Entry {
  id: string;
  category: string;
  group: string | null;
  groupSlug: string | null;
  year: number | null;
  season: string | null;
  bucket: Bucket | null;
  title: string;
  summary: Localized | string | null;
  tags: string[];
  file: FileRef;
}

export interface Category {
  slug: string;
  repoName: string;
  name: Localized;
  count: number;
  years: number[];
}

interface Catalog {
  source: string | null;
  counts: { categories: number; entries: number };
  categories: Category[];
  entries: Entry[];
}

const catalog = raw as unknown as Catalog;

export const CATEGORIES = catalog.categories;
export const ENTRIES = catalog.entries;
export const COUNTS = catalog.counts;

export function getCategory(slug: string): Category | undefined {
  return CATEGORIES.find((c) => c.slug === slug);
}

export function entriesOfCategory(slug: string): Entry[] {
  return ENTRIES.filter((e) => e.category === slug);
}

export function entriesOfYear(catSlug: string, year: number): Entry[] {
  return ENTRIES.filter((e) => e.category === catSlug && e.year === year);
}

export function getEntry(id: string): Entry | undefined {
  return ENTRIES.find((e) => e.id === id);
}

/** Group entries by their sub-group (contest name) then bucket (round/grade). */
export function groupEntries(entries: Entry[]): Array<{
  group: string | null;
  buckets: Array<{ label: string | null; kind: string | null; entries: Entry[] }>;
}> {
  const byGroup = new Map<string | null, Entry[]>();
  for (const e of entries) {
    const key = e.group;
    if (!byGroup.has(key)) byGroup.set(key, []);
    byGroup.get(key)!.push(e);
  }
  const result = [];
  for (const [group, list] of byGroup) {
    const byBucket = new Map<string, Entry[]>();
    for (const e of list) {
      const key = e.bucket ? e.bucket.label : "__none__";
      if (!byBucket.has(key)) byBucket.set(key, []);
      byBucket.get(key)!.push(e);
    }
    const buckets = [...byBucket.entries()].map(([label, es]) => ({
      label: label === "__none__" ? null : label,
      kind: es[0].bucket?.kind ?? null,
      entries: es.sort((a, b) => a.title.localeCompare(b.title)),
    }));
    buckets.sort((a, b) => (a.label ?? "").localeCompare(b.label ?? "", undefined, { numeric: true }));
    result.push({ group, buckets });
  }
  result.sort((a, b) => (a.group ?? "").localeCompare(b.group ?? ""));
  return result;
}

/** Display label for an entry's year — the season range when present (e.g.
 *  "2019-20"), otherwise the plain year. */
export function yearLabel(entry: Pick<Entry, "year" | "season">): string {
  return entry.season ?? (entry.year != null ? String(entry.year) : "");
}

/** Season label for a (category, year) pair, if its entries carry one. */
export function seasonForYear(catSlug: string, year: number): string | null {
  const e = ENTRIES.find((x) => x.category === catSlug && x.year === year && x.season);
  return e?.season ?? null;
}

/** Resolve a possibly-localized summary to a string for the given language. */
export function localizeSummary(s: Entry["summary"], lang: Lang): string | null {
  if (!s) return null;
  if (typeof s === "string") return s;
  return s[lang] ?? s.ro ?? s.en ?? null;
}
