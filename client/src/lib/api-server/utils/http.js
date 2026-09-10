'use strict';

const BASE_URL_HOST = process.env.NEXT_PUBLIC_SOURCE_BASE_URL
  ? new URL(process.env.NEXT_PUBLIC_SOURCE_BASE_URL).hostname
  : 'animasu.love';

const USER_AGENTS = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36 Edg/125.0.0.0',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:127.0) Gecko/20100101 Firefox/127.0',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
];

const SSRF_BLOCKLIST = [
  /^localhost$/i,
  /^127\.\d+\.\d+\.\d+$/,
  /^0\.0\.0\.0$/,
  /^::1$/,
  /^10\.\d+\.\d+\.\d+$/,
  /^172\.(1[6-9]|2\d|3[01])\.\d+\.\d+$/,
  /^192\.168\.\d+\.\d+$/,
  /^169\.254\.\d+\.\d+$/,
  /^fc00:/i,
  /^fe80:/i,
];

function randomUserAgent() {
  return USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
}

function assertSafeUrl(url) {
  let parsed;
  try { parsed = new URL(url); } catch { throw new Error(`URL tidak valid: ${url}`); }
  const hostname = parsed.hostname;
  for (const pattern of SSRF_BLOCKLIST) {
    if (pattern.test(hostname)) throw new Error(`SSRF Protection: akses ke "${hostname}" tidak diizinkan`);
  }
  if (!['http:', 'https:'].includes(parsed.protocol)) throw new Error(`Protokol tidak didukung: ${parsed.protocol}`);
}

function scraperBaseUrl() {
  const raw = process.env.SCRAPER_API_URL;
  if (!raw) return null;
  return raw.replace(/\/$/, '');
}

/**
 * Fetch HTML via Cloudflare Worker (or Express) so Vercel never talks to the source directly.
 */
async function fetchHtmlViaScraper(url, options = {}) {
  const { params = {} } = options;
  const base = scraperBaseUrl();
  const secret = process.env.SCRAPER_SECRET;

  if (!secret) {
    const err = new Error('SCRAPER_SECRET wajib diisi jika SCRAPER_API_URL dipakai');
    err.statusCode = 500;
    err.code = 'SERVER_ERROR';
    throw err;
  }

  const qs = new URLSearchParams({ url });
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null) continue;
    qs.set(key, String(value));
  }

  const res = await fetch(`${base}/api/fetch-html?${qs.toString()}`, {
    headers: {
      Accept: 'text/html',
      'x-scraper-secret': secret,
    },
    cache: 'no-store',
  });

  if (!res.ok) {
    let message = `Upstream status ${res.status}`;
    const contentType = res.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      try {
        const body = await res.json();
        if (body?.error?.message) message = body.error.message;
      } catch { /* ignore */ }
    }
    const err = new Error(`Gagal menghubungi scraper: ${message}`);
    err.statusCode = res.status === 401 ? 502 : (res.status >= 500 ? 502 : res.status);
    err.code = res.status === 404 ? 'NOT_FOUND' : 'BAD_GATEWAY';
    throw err;
  }

  return res.text();
}

/**
 * Fetch HTML from a URL with retry logic.
 * Never caches failed/error responses.
 */
async function fetchHtml(url, options = {}) {
  const { useCache = true, params = {}, headers = {}, revalidate = 300 } = options;

  assertSafeUrl(url);

  if (scraperBaseUrl()) {
    return fetchHtmlViaScraper(url, options);
  }

  let fetchUrl = url;
  const paramKeys = Object.keys(params);
  if (paramKeys.length > 0) {
    const qs = new URLSearchParams(params).toString();
    fetchUrl = url.includes('?') ? `${url}&${qs}` : `${url}?${qs}`;
  }

  const maxRetries = 3;
  let lastError;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    const requestHeaders = {
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
      'Accept-Language': 'id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7',
      'Accept-Encoding': 'gzip, deflate, br',
      'User-Agent': randomUserAgent(),
      'Referer': `https://${BASE_URL_HOST}/`,
      'Cache-Control': 'no-cache',
      'Pragma': 'no-cache',
      'Sec-Fetch-Dest': 'document',
      'Sec-Fetch-Mode': 'navigate',
      'Sec-Fetch-Site': 'same-origin',
      'Sec-Fetch-User': '?1',
      'Upgrade-Insecure-Requests': '1',
      'Connection': 'keep-alive',
      ...headers,
    };

    // Never use Next.js cache for upstream HTML — we don't want to cache
    // Cloudflare challenge pages or 403s. Handle caching at a higher level if needed.
    const fetchOptions = {
      headers: requestHeaders,
      cache: 'no-store',
    };

    try {
      // Random delay 100-400ms to avoid rate limiting
      if (attempt > 0) {
        await new Promise(r => setTimeout(r, Math.pow(2, attempt) * 500 + Math.random() * 300));
      }

      const res = await fetch(fetchUrl, fetchOptions);   

      if (!res.ok) {
        if (res.status === 404) {
          const err = new Error('Halaman tidak ditemukan');
          err.statusCode = 404;
          err.code = 'NOT_FOUND';
          throw err;
        }
        if (res.status === 429) {
          const err = new Error('Target website membatasi request');
          err.statusCode = 429;
          err.code = 'RATE_LIMITED';
          throw err;
        }
        // 403, 503, 5xx — retry
        const err = new Error(`Upstream status ${res.status}`);
        err.statusCode = res.status >= 500 ? 502 : res.status;
        err.code = 'BAD_GATEWAY';
        if (attempt < maxRetries) {
          lastError = err;
          continue;
        }
        throw err;
      }

      const text = await res.text();

      // Detect Cloudflare challenge page — treat as retryable
      if (text.includes('cf-browser-verification') || text.includes('_cf_chl_') || text.includes('cf_clearance')) {
        const err = new Error('Cloudflare challenge detected');
        err.statusCode = 503;
        err.code = 'BAD_GATEWAY';
        if (attempt < maxRetries) {
          lastError = err;
          continue;
        }
        throw err;
      }

      return text;
    } catch (err) {
      if (err.code === 'NOT_FOUND' || err.code === 'RATE_LIMITED') throw err;
      lastError = err;
      if (attempt < maxRetries) continue;
    }
  }

  const finalErr = new Error(`Gagal menghubungi target: ${lastError?.message}`);
  finalErr.statusCode = 502;
  finalErr.code = 'BAD_GATEWAY';
  throw finalErr;
}

module.exports = { fetchHtml, assertSafeUrl };
