const RETURN_BASE = "https://construtech.invalid";

/**
 * Restrict post-login return paths to the private application.
 * Does not replace backend authorization or membership checks.
 */
export function safeReturnTo(value) {
  if (typeof value !== "string" || value.length > 2048) return "/app";
  if (!/^\/app(?:\/|[?#]|$)/.test(value)) return "/app";
  if (/[\\\u0000-\u001f\u007f]/.test(value)) return "/app";
  // Reject raw or percent-encoded ".." path segments before URL canonicalization.
  // WHATWG URL parsing would otherwise collapse them, concealing traversal.
  const rawPath = value.split(/[?#]/, 1)[0];
  if (/(?:^|\/)(?:\.|%2e){2}(?:\/|$)/i.test(rawPath)) return "/app";
  try {
    const url = new URL(value, RETURN_BASE);
    if (url.origin !== RETURN_BASE) return "/app";
    if (url.pathname !== "/app" && !url.pathname.startsWith("/app/")) return "/app";
    // Reject encoded separators and percent re-encoding in route path.
    if (/%(?:2f|5c|25)/i.test(url.pathname)) return "/app";
    return url.pathname + url.search + url.hash;
  } catch {
    return "/app";
  }
}
