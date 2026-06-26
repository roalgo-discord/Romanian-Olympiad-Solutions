// Links from our solution entries to kilonova.ro.
// The map is generated/refreshed by `npm run kilonova` (scripts/fetch-kilonova.mjs)
// and committed, so the build never needs network access to Kilonova.
import map from "../../content/kilonova-map.json";

export interface KilonovaProblem {
  id: number;
  name: string;
  url: string;
}

/** A combined editorial → a Kilonova list (+ its problems). For a hand-pinned
 *  set of problems with no single list, listId/listName/listUrl are null. */
export interface KilonovaListLink {
  kind: "list";
  listId: number | null;
  listName: string | null;
  listUrl: string | null;
  problems: KilonovaProblem[];
}

/** A single-problem solution → one Kilonova problem. */
export interface KilonovaProblemLink {
  kind: "problem";
  problem: KilonovaProblem;
}

export type KilonovaLink = KilonovaListLink | KilonovaProblemLink;

const data = map as Record<string, KilonovaLink>;

export function getKilonova(entryId: string): KilonovaLink | undefined {
  return data[entryId];
}
