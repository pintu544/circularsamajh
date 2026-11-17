/**
 * Build an absolute URL for redirects from the public-facing host.
 *
 * Behind Azure App Service's front end, `req.url` carries an internal host
 * that browsers cannot resolve, so a redirect built from it strands the user
 * on a DNS error page. The public host arrives in `x-forwarded-host`.
 */
export function publicUrl(req: Request, path: string): URL {
  const host =
    req.headers.get("x-forwarded-host") ??
    req.headers.get("host") ??
    "circularsamajh.azurewebsites.net";
  const proto =
    req.headers.get("x-forwarded-proto") ??
    (host.includes("localhost") || host.startsWith("127.") ? "http" : "https");
  // Only same-site paths may be redirect targets (no open redirects).
  const safePath = path.startsWith("/") && !path.startsWith("//") ? path : "/";
  return new URL(safePath, `${proto}://${host}`);
}
