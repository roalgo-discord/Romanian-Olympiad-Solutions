import { ui, DEFAULT_LANG, LANGS, type Lang, type UiKey } from "./ui";

/** Get the active language from a URL/pathname (/ro/..., /en/...). */
export function langFromUrl(url: URL): Lang {
  const seg = url.pathname.split("/")[1];
  return (LANGS as readonly string[]).includes(seg) ? (seg as Lang) : DEFAULT_LANG;
}

export function isLang(x: string): x is Lang {
  return (LANGS as readonly string[]).includes(x);
}

/** Returns a translator bound to a language, with {var} interpolation. */
export function useTranslations(lang: Lang) {
  return function t(key: UiKey, vars?: Record<string, string | number>): string {
    let s: string = ui[lang][key] ?? ui[DEFAULT_LANG][key] ?? String(key);
    if (vars) for (const [k, v] of Object.entries(vars)) s = s.replaceAll(`{${k}}`, String(v));
    return s;
  };
}

/** Build a localized path. localPath("/oji", "en") -> "/en/oji/". */
export function localePath(path: string, lang: Lang): string {
  const clean = path.replace(/^\/+|\/+$/g, "");
  return clean ? `/${lang}/${clean}/` : `/${lang}/`;
}

/** Swap the language prefix on the current pathname (for the lang switcher). */
export function switchLangPath(pathname: string, to: Lang): string {
  const parts = pathname.split("/").filter(Boolean);
  if (parts.length && isLang(parts[0])) parts[0] = to;
  else parts.unshift(to);
  return "/" + parts.join("/") + "/";
}
