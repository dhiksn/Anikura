import { NextRequest, NextResponse } from "next/server";

// Block only truly unsafe/unrelated origins. The stream extractor resolves HLS
// segments to CDN domains (e.g. dramiyos-cdn.com) that we must also proxy, so
// we use a denylist of obviously wrong hosts instead of an allowlist.
const BLOCKED_HOSTS = [
  "localhost",
  "127.0.0.1",
  "0.0.0.0",
  "169.254.",   // link-local
  "10.",         // private
  "192.168.",    // private
  "172.",        // private (covers 172.16–31)
];

function isAllowedUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    // Only allow http/https
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") return false;
    const host = parsed.hostname.toLowerCase();
    return !BLOCKED_HOSTS.some((blocked) => host.startsWith(blocked) || host === blocked);
  } catch {
    return false;
  }
}

/**
 * Rewrite an HLS playlist (.m3u8) so that all segment/sub-playlist URLs
 * are routed back through this proxy instead of being fetched directly by
 * the browser (which would hit CORS).
 *
 * Lines starting with '#' are left as-is; URI lines are replaced with
 * /api/proxy?url=<encoded-absolute-url>.
 */
function rewriteM3u8(text: string, baseUrl: string, proxyBase: string): string {
  const base = new URL(baseUrl);
  return text
    .split("\n")
    .map((line) => {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) return line;

      // Resolve relative or absolute segment URL
      let absUrl: string;
      try {
        absUrl = new URL(trimmed, base).toString();
      } catch {
        return line;
      }

      return `${proxyBase}?url=${encodeURIComponent(absUrl)}`;
    })
    .join("\n");
}

export async function GET(request: NextRequest) {
  return handleProxy(request, false);
}

// vidstack sends HEAD to sniff content-type before picking a loader
export async function HEAD(request: NextRequest) {
  return handleProxy(request, true);
}

async function handleProxy(request: NextRequest, headOnly: boolean) {
  const { searchParams, origin } = new URL(request.url);
  const url = searchParams.get("url");

  if (!url) {
    return NextResponse.json({ error: "url param required" }, { status: 400 });
  }

  if (!isAllowedUrl(url)) {
    return NextResponse.json({ error: "URL not allowed" }, { status: 403 });
  }

  let upstream: Response;
  try {
    // Determine the right Referer based on the upstream host
    const upstreamHost = new URL(url).hostname;
    const referer = upstreamHost.includes('vidhidepro') || upstreamHost.includes('vidhide')
      ? 'https://vidhidepro.com/'
      : `https://${upstreamHost}/`;

    upstream = await fetch(url, {
      headers: {
        "Referer": referer,
        "Origin": referer.replace(/\/$/, ''),
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
        "Accept": "*/*",
        "Accept-Language": "id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7",
        "Sec-Fetch-Dest": "empty",
        "Sec-Fetch-Mode": "cors",
        "Sec-Fetch-Site": "cross-site",
      },
      redirect: "follow",
    });
  } catch {
    return NextResponse.json({ error: "Failed to fetch upstream" }, { status: 502 });
  }

  if (!upstream.ok) {
    return new NextResponse(null, { status: upstream.status });
  }

  const contentType = upstream.headers.get("content-type") || "application/octet-stream";
  const isM3u8 =
    contentType.includes("mpegurl") ||
    contentType.includes("x-mpegurl") ||
    url.includes(".m3u8");

  const proxyBase = `${origin}/api/proxy`;

  const headers: Record<string, string> = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, HEAD, OPTIONS",
    "Access-Control-Allow-Headers": "*",
    "Cache-Control": "no-store",
    "Content-Type": isM3u8 ? "application/vnd.apple.mpegurl" : contentType,
  };

  if (isM3u8) {
    if (headOnly) {
      return new NextResponse(null, { status: 200, headers });
    }
    const text = await upstream.text();
    const rewritten = rewriteM3u8(text, url, proxyBase);
    return new NextResponse(rewritten, { headers });
  }

  // For .ts segments and other binary assets, stream the body straight through
  if (headOnly) {
    return new NextResponse(null, { status: 200, headers });
  }
  const body = await upstream.arrayBuffer();
  return new NextResponse(body, { headers });
}

// Handle CORS preflight
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, HEAD, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}
