import { headers } from "next/headers";
import { defaultLocale, locales, type Locale } from "./dictionaries";

/**
 * Picks the best supported locale from the request's `Accept-Language` header.
 * Falls back to `defaultLocale` when neither Italian nor English is preferred.
 */
export async function getLocale(): Promise<Locale> {
  const accept = (await headers()).get("accept-language") ?? "";

  const ranked = accept
    .split(",")
    .map((part) => {
      const [tag, ...params] = part.trim().split(";");
      const q = params.find((p) => p.trim().startsWith("q="));
      const weight = q ? Number.parseFloat(q.trim().slice(2)) : 1;
      return { base: tag.split("-")[0].toLowerCase(), q: Number.isNaN(weight) ? 0 : weight };
    })
    .filter((x) => x.base)
    .sort((a, b) => b.q - a.q);

  for (const { base } of ranked) {
    if ((locales as readonly string[]).includes(base)) return base as Locale;
  }

  return defaultLocale;
}
