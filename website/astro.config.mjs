// @ts-check
import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";
import pagefind from "astro-pagefind";
import { SITE } from "./src/config/site.mjs";

// https://astro.build/config
export default defineConfig({
  site: SITE.url,
  // We drive locale routing ourselves via a [lang] dynamic segment (see
  // src/pages/[lang]/), which keeps full control over RO/EN content and
  // hreflang tags. Astro's i18n block is enabled only so the sitemap and
  // tooling know about the locales.
  i18n: {
    defaultLocale: /** @type {(typeof SITE.langs)[number]} */ (SITE.defaultLang),
    locales: [...SITE.langs],
    routing: {
      prefixDefaultLocale: true,
      redirectToDefaultLocale: false,
    },
  },
  integrations: [
    pagefind(),
    sitemap({
      i18n: {
        defaultLocale: /** @type {string} */ (SITE.defaultLang),
        locales: { ro: "ro", en: "en" },
      },
    }),
  ],
  build: {
    // Cleaner URLs: /en/oji/ instead of /en/oji.html
    format: "directory",
  },
});
