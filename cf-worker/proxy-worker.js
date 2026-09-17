/**
 * Anikura Proxy Worker
 *
 * Fetches HTML from animasu.love on behalf of the Vercel backend.
 * Falls back through multiple proxy services if direct fetch is blocked.
 *
 * Usage: GET https://anikura.andhikarafi321.workers.dev/?url=https://animasu.love/...
 */

const ALLOWED_DOMAINS = ['animasu.love', 'animasu.work'];

const USER_AGENTS = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:127.0) Gecko/20100101 Firefox/127.0',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
];

function randomUA() {
  return USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
}

function isAllowed(url) {
  try {
    const { hostname } = new URL(url);
    const h = hostname.replace(/^www\./, '');
    return ALLOWED_DOMAINS.some(d => h === d || h.endsWith(`.${d}`));
  } catch { return false; }
}

const BROWSER_HEADERS = (referer) => ({
  'User-Agent': randomUA(),
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
  'Accept-Language': 'id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7',
  'Referer': referer,
  'Cache-Control': 'no-cache',
  'Pragma': 'no-cache',
  'Sec-Fetch-Dest': 'document',
  'Sec-Fetch-Mode': 'navigate',
  'Sec-Fetch-Site': 'same-origin',
  'Sec-Fetch-User': '?1',
  'Upgrade-Insecure-Requests': '1',
  'Connection': 'keep-alive',
});

/**
 * Try fetching directly from CF Worker edge
 */
async function fetchDirect(targetUrl) {
  const { hostname } = new URL(targetUrl);
  const res = await fetch(targetUrl, {
    headers: BROWSER_HEADERS(`https://${hostname}/`),
    redirect: 'follow',
  });
  if (!res.ok) throw new Error(`Direct fetch failed: ${res.status}`);
  return res.text();
}

/**
 * Fallback: fetch via AllOrigins proxy (runs on shared hosting, different IP pool)
 */
async function fetchViaAllOrigins(targetUrl) {
  const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(targetUrl)}`;
  const res = await fetch(proxyUrl, {
    headers: { 'User-Agent': randomUA() },
  });
  if (!res.ok) throw new Error(`AllOrigins failed: ${res.status}`);
  const json = await res.json();
  if (!json.contents) throw new Error('AllOrigins returned empty contents');
  return json.contents;
}

/**
 * Fallback 2: fetch via CodeTabs proxy
 */
async function fetchViaCodeTabs(targetUrl) {
  const proxyUrl = `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(targetUrl)}`;
  const res = await fetch(proxyUrl, {
    headers: { 'User-Agent': randomUA() },
  });
  if (!res.ok) throw new Error(`CodeTabs failed: ${res.status}`);
  return res.text();
}

export default {
  async fetch(request) {
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, OPTIONS',
        },
      });
    }

    if (request.method !== 'GET') {
      return new Response('Method not allowed', { status: 405 });
    }

    const { searchParams } = new URL(request.url);
    const targetUrl = searchParams.get('url');

    if (!targetUrl) {
      return new Response(JSON.stringify({ error: 'url param required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (!isAllowed(targetUrl)) {
      return new Response(JSON.stringify({ error: 'Domain not allowed' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      });
    }

    const strategies = [
      { name: 'direct',     fn: () => fetchDirect(targetUrl) },
      { name: 'allorigins', fn: () => fetchViaAllOrigins(targetUrl) },
      { name: 'codetabs',   fn: () => fetchViaCodeTabs(targetUrl) },
    ];

    let lastError = null;

    for (const { name, fn } of strategies) {
      try {
        const html = await fn();
        // Sanity check: should contain actual HTML
        if (!html || html.length < 500) {
          lastError = new Error(`${name}: response too short (${html?.length ?? 0} chars)`);
          continue;
        }
        return new Response(html, {
          status: 200,
          headers: {
            'Content-Type': 'text/html; charset=utf-8',
            'Access-Control-Allow-Origin': '*',
            'X-Proxy-Strategy': name,
            'Cache-Control': 'public, max-age=300',
          },
        });
      } catch (err) {
        lastError = err;
        // Try next strategy
      }
    }

    return new Response(JSON.stringify({ error: lastError?.message || 'All strategies failed' }), {
      status: 502,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    });
  },
};
