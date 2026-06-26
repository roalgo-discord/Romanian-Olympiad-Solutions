// Server-only (build-time) access to the original solution files.
// Used to inline text/code solutions into the page as crawlable HTML.
import { readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import catalog from "../data/catalog.json";

const SOURCE: string | null = (catalog as { source: string | null }).source;
const MAX_BYTES = 512 * 1024; // don't inline absurdly large files

/** Read a text/code solution file from disk at build time. Returns null if the
 *  source folder is unavailable or the file is missing/too large/binary. */
export function readSolutionText(repoPath: string): string | null {
  if (!SOURCE) return null;
  try {
    const abs = join(SOURCE, repoPath);
    if (statSync(abs).size > MAX_BYTES) return null;
    const buf = readFileSync(abs);
    // crude binary guard: NUL byte => not text
    if (buf.includes(0)) return null;
    return decode(buf);
  } catch {
    return null;
  }
}

/** Romanian solution files are a mix of UTF-8 and legacy CP1250/ISO-8859-2.
 *  Try UTF-8; if it produces replacement chars, fall back to latin-ish. */
function decode(buf: Buffer): string {
  const utf8 = buf.toString("utf8");
  if (!utf8.includes("�")) return utf8;
  return buf.toString("latin1");
}
