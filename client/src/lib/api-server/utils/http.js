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

/**
 * Fetch HTML from a URL with retry logic.
 * Uses Next.js built-in fetch caching (revalidate) instead of node-cache.
 *
 * @param {string} url
 * @param {object} [options]
 * @param {boolean} [options.useCache=true]
 * @param {object}  [options.params]
 * @param {object}  [options.headers]
 * @param {number}  [options.revalidate=300] - seconds for Next.js ISR cache
 */
async function fetchHtml(url, options = {}) {
  const { useCache = true, params = {}, headers = {}, revalidate = 300 } = options;

  assertSafeUrl(url);

  // Append query params to URL
  let fetchUrl = url;
  const paramKeys = Object.keys(params);
  if (paramKeys.length > 0) {
    const qs = new URLSearchParams(params).toString();
    fetchUrl = url.includes('?') ? `${url}&${qs}` : `${url}?${qs}`;
  }

  const requestHeaders = {
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    'Accept-Language': 'id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7',
    'User-Agent': randomUserAgent(),
    'Referer': `https://${BASE_URL_HOST}/`,
    'Sec-Fetch-Dest': 'document',
    'Sec-Fetch-Mode': 'navigate',
    'Sec-Fetch-Site': 'same-origin',
    ...headers,
  };

  const fetchOptions = {
    headers: requestHeaders,
    // Next.js fetch cache: 'force-cache' uses ISR revalidate, 'no-store' disables
    next: useCache ? { revalidate } : { revalidate: 0 },
  };

  let lastError;
  const maxRetries = 3;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
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
        const err = new Error(`Upstream status ${res.status}`);
        err.statusCode = 502;
        err.code = 'BAD_GATEWAY';
        // Retry on 5xx
        if (res.status >= 500 && attempt < maxRetries) {
          lastError = err;
          await new Promise(r => setTimeout(r, Math.pow(2, attempt) * 1000));
          continue;
        }
        throw err;
      }

      return await res.text();
    } catch (err) {
      // Don't retry 404/429 or SSRF errors
      if (err.code === 'NOT_FOUND' || err.code === 'RATE_LIMITED' || err.message?.includes('SSRF')) throw err;
      lastError = err;
      if (attempt < maxRetries) {
        await new Promise(r => setTimeout(r, Math.pow(2, attempt) * 1000));
      }
    }
  }

  const finalErr = new Error(`Gagal menghubungi target: ${lastError?.message}`);
  finalErr.statusCode = 502;
  finalErr.code = 'BAD_GATEWAY';
  throw finalErr;
}

module.exports = { fetchHtml, assertSafeUrl };
