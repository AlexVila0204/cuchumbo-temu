import "server-only";

export type TemuProduct = {
  url: string;
  title: string;
  image: string | null;
};

const TEMU_HOST = /(^|\.)temu\.com$/i;
const IMAGE_HOST = /(^|\.)kwcdn\.com$/i;
const URL_IN_TEXT = /https?:\/\/[^\s"'<>]+/i;
const FETCH_TIMEOUT_MS = 10_000;
const BROWSER_HEADERS = {
  "user-agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36",
  "accept-language": "es-419,es;q=0.9",
};

function parseTemuUrl(input: string): URL {
  const match = input.match(URL_IN_TEXT);
  if (!match) throw new Error("No URL found");
  const url = new URL(match[0]);
  if (url.protocol !== "https:" || !TEMU_HOST.test(url.hostname)) throw new Error("Not a Temu URL");
  return url;
}

function decodeEntities(text: string): string {
  return text
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

function readMeta(html: string, property: string): string | null {
  const pattern = new RegExp(`<meta[^>]+property="${property}"[^>]+content="([^"]*)"`, "i");
  const value = html.match(pattern)?.[1];
  return value ? decodeEntities(value) : null;
}

function cleanTitle(raw: string): string {
  return raw.replace(/\s*-\s*Temu\b.*$/i, "").replace(/\s+/g, " ").trim();
}

function safeImage(candidate: string | null): string | null {
  if (!candidate) return null;
  try {
    const url = new URL(candidate);
    return url.protocol === "https:" && IMAGE_HOST.test(url.hostname) ? url.toString() : null;
  } catch {
    return null;
  }
}

export async function fetchTemuProduct(input: string): Promise<TemuProduct> {
  const shareUrl = parseTemuUrl(input);
  const response = await fetch(shareUrl, {
    headers: BROWSER_HEADERS,
    redirect: "follow",
    signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
  });
  const finalUrl = new URL(response.url);
  if (!response.ok || !TEMU_HOST.test(finalUrl.hostname)) throw new Error("Temu page unavailable");

  const html = await response.text();
  const title = cleanTitle(readMeta(html, "og:title") ?? "");
  const image = safeImage(finalUrl.searchParams.get("thumb_url")) ?? safeImage(readMeta(html, "og:image"));

  return { url: shareUrl.toString(), title: title || "Producto de Temu", image };
}
