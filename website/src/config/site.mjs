// Central site configuration. Edit values here — everything else reads from this.
// Plain .mjs so both astro.config.mjs and the app can import it.

export const SITE = {
  /** Public canonical URL of the deployed site (no trailing slash). */
  url: "https://romanian-olympiad-solutions.vercel.app",

  /** Short brand shown in the header / <title> suffix. */
  brand: "RO Olympiad Solutions",

  /** Languages. First is the default. */
  langs: /** @type {const} */ (["ro", "en"]),
  defaultLang: "ro",

  /** Source GitHub repository that holds the solution files. */
  repo: {
    owner: "roalgo-discord",
    name: "Romanian-Olympiad-Solutions",
    branch: "main",
  },
};

/**
 * Base URL for viewing a file on github.com (HTML page with the PDF preview).
 * @param {string} repoPath POSIX path of the file within the repo
 */
export function githubBlobUrl(repoPath) {
  const { owner, name, branch } = SITE.repo;
  return `https://github.com/${owner}/${name}/blob/${branch}/${encodePath(repoPath)}`;
}

/**
 * Base URL for the raw file bytes (used to embed PDFs / fetch TXT).
 * @param {string} repoPath POSIX path of the file within the repo
 */
export function githubRawUrl(repoPath) {
  const { owner, name, branch } = SITE.repo;
  return `https://raw.githubusercontent.com/${owner}/${name}/${branch}/${encodePath(repoPath)}`;
}

/**
 * jsDelivr CDN URL for a repo file. Unlike raw.githubusercontent.com (which
 * serves PDFs as application/octet-stream + nosniff, forcing a download),
 * jsDelivr serves the correct Content-Type inline, so PDFs render in-page.
 * It is also a fast global CDN. Limit: files up to ~20 MB.
 * @param {string} repoPath POSIX path of the file within the repo
 */
export function githubCdnUrl(repoPath) {
  const { owner, name, branch } = SITE.repo;
  return `https://cdn.jsdelivr.net/gh/${owner}/${name}@${branch}/${encodePath(repoPath)}`;
}

/** Encode each path segment but keep the slashes. */
function encodePath(repoPath) {
  return repoPath.split("/").map(encodeURIComponent).join("/");
}
