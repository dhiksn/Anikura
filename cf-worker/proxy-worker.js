/**
 * Anikura Proxy Worker
 *
 * Routes animasu.love requests through ScraperAPI (residential proxy)
 * to bypass Cloudflare IP blocks on datacenter IPs.
 *
 * Setup:
 *   1. Daftar di https://scraperapi.com (free: 1000 req/bulan)
 *   2. Set SCRAPER_API_KEY di Worker Environment Variables
 *
 * Usage: GET https://anikura.andhikarafi321.workers.dev/?url=https://animasu.love/...
 */

const ALLOWED_DOMAINS = ['animasu.love', 'animasu.work'];

function isAllowed(url) {
  try {
    const { hostname } = new URL(url);
    const h = hostname.replace(/^www\./, '');
    return ALLOWED_DOMAINS.some(d => h === d || h.endsWith(`.${d}`));
  } catch { return false; }
}

/**
 * Fetch via ScraperAPI — uses rotating residential proxies
 */
async function fetchViaScraperAPI(targetUrl, apiKey) {
  const scraperUrl = `http://api.scraperapi.com?api_key=${apiKey}&url=${encodeURIComponent(targetUrl)}&render=false&country_code=id`;
  const res = await fetch(scraperUrl, { redirect: 'follow' });
  if (!res.ok) throw new Error(`ScraperAPI ${res.status}`);
  return res.text();
}

/**
 * Direct fetch fallback (works in some regions/times)
 */
async function fetchDirect(targetUrl) {
  const { hostname } = new URL(targetUrl);
  const res = await fetch(targetUrl, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      'Accept-Language': 'id-ID,id;q=0.9,en-US;q=0.8',
      'Referer': `https://${hostname}/`,
      'Cache-Control': 'no-cache',
      'Sec-Fetch-Dest': 'document',
      'Sec-Fetch-Mode': 'navigate',
      'Sec-Fetch-Site': 'same-origin',
      'Upgrade-Insecure-Requests': '1',
    },
    redirect: 'follow',
  });
  if (!res.ok) throw new Error(`Direct ${res.status}`);
  const html = await res.text();
  if (html.length < 500) throw new Error('Response too short');
  return html;
}

export default {
  async fetch(request, env) {
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

    const SCRAPER_API_KEY = env.SCRAPER_API_KEY || '';

    // Strategy 1: Direct (fastest, works from some CF edge locations)
    try {
      const html = await fetchDirect(targetUrl);
      return new Response(html, {
        headers: {
          'Content-Type': 'text/html; charset=utf-8',
          'Access-Control-Allow-Origin': '*',
          'X-Proxy-Strategy': 'direct',
          'Cache-Control': 'public, max-age=300',
        },
      });
    } catch (e1) {
      // Direct blocked — try ScraperAPI if key is set
      if (!SCRAPER_API_KEY) {
        return new Response(JSON.stringify({
          error: `Direct fetch blocked (${e1.message}). Set SCRAPER_API_KEY environment variable in Worker settings.`,
          hint: 'Get a free API key at https://scraperapi.com',
        }), {
          status: 502,
          headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        });
      }

      try {
        const html = await fetchViaScraperAPI(targetUrl, SCRAPER_API_KEY);
        return new Response(html, {
          headers: {
            'Content-Type': 'text/html; charset=utf-8',
            'Access-Control-Allow-Origin': '*',
            'X-Proxy-Strategy': 'scraperapi',
            'Cache-Control': 'public, max-age=300',
          },
        });
      } catch (e2) {
        return new Response(JSON.stringify({ error: `All strategies failed. Direct: ${e1.message}. ScraperAPI: ${e2.message}` }), {
          status: 502,
          headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        });
      }
    }
  },
};
