'use strict';

require('dotenv').config();
const axios = require('axios');
const axiosRetry = require('axios-retry').default;
const NodeCache = require('node-cache');

// ─── Cache Instance ────────────────────────────────────────────────────────────
const cache = new NodeCache({
  stdTTL: parseInt(process.env.CACHE_TTL, 10) || 300,
  maxKeys: parseInt(process.env.CACHE_MAX_KEYS, 10) || 500,
  checkperiod: 60,
  useClones: false,
});

// ─── User-Agent Pool ────────────────────────────────────────────────────────────
const USER_AGENTS = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36 Edg/125.0.0.0',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:127.0) Gecko/20100101 Firefox/127.0',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_5) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4.1 Safari/605.1.15',
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
];

const BASE_URL_HOST = 'animasu.love';

/**
 * Pilih User-Agent secara acak dari pool.
 * @returns {string}
 */
function randomUserAgent() {
  return USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
}

// ─── Axios Instance ─────────────────────────────────────────────────────────────
const httpClient = axios.create({
  timeout: parseInt(process.env.REQUEST_TIMEOUT, 10) || 15000,
  headers: {
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
    'Accept-Language': 'id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7',
    'Accept-Encoding': 'gzip, deflate, br',
    'Connection': 'keep-alive',
    'Upgrade-Insecure-Requests': '1',
    'Sec-Fetch-Dest': 'document',
    'Sec-Fetch-Mode': 'navigate',
    'Sec-Fetch-Site': 'same-origin',
    'Sec-Fetch-User': '?1',
    'Sec-CH-UA': '"Chromium";v="126", "Google Chrome";v="126", "Not-A.Brand";v="8"',
    'Sec-CH-UA-Mobile': '?0',
    'Sec-CH-UA-Platform': '"Windows"',
    'Cache-Control': 'max-age=0',
    'Referer': `https://${BASE_URL_HOST}/`,
  },
  maxRedirects: 5,
  decompress: true,
});

// ─── Retry Configuration ────────────────────────────────────────────────────────
axiosRetry(httpClient, {
  retries: parseInt(process.env.MAX_RETRIES, 10) || 3,
  retryDelay: (retryCount) => {
    const base = parseInt(process.env.RETRY_DELAY, 10) || 1500;
    // Exponential backoff dengan jitter
    return (Math.pow(2, retryCount) * base) + Math.floor(Math.random() * 500);
  },
  retryCondition: (error) => {
    return (
      axiosRetry.isNetworkOrIdempotentRequestError(error) ||
      (error.response && [403, 429, 500, 502, 503, 504].includes(error.response.status))
    );
  },
  onRetry: (retryCount, error) => {
    console.warn(`[HTTP] Retry ${retryCount} untuk "${error.config?.url}" — ${error.message}`);
  },
});

// ─── Request Interceptor: rotasi User-Agent + delay random ──────────────────────
httpClient.interceptors.request.use(async (config) => {
  config.headers['User-Agent'] = randomUserAgent();

  // Set Referer ke halaman yang wajar (home site jika tidak ada)
  if (!config.headers['Referer']) {
    config.headers['Referer'] = `https://${BASE_URL_HOST}/`;
  }

  // Delay random 200-800ms untuk meniru perilaku browser manusia
  const delay = 200 + Math.floor(Math.random() * 600);
  await new Promise((resolve) => setTimeout(resolve, delay));

  return config;
});

// ─── SSRF Protection ────────────────────────────────────────────────────────────
const SSRF_BLOCKLIST = [
  /^localhost$/i,
  /^127\.\d+\.\d+\.\d+$/,
  /^0\.0\.0\.0$/,
  /^::1$/,
  /^10\.\d+\.\d+\.\d+$/,
  /^172\.(1[6-9]|2\d|3[01])\.\d+\.\d+$/,
  /^192\.168\.\d+\.\d+$/,
  /^169\.254\.\d+\.\d+$/,   // link-local
  /^fc00:/i,                  // IPv6 ULA
  /^fe80:/i,                  // IPv6 link-local
];

/**
 * Periksa apakah URL aman dari SSRF.
 * @param {string} url
 * @throws {Error} jika URL mengacu ke resource internal
 */
function assertSafeUrl(url) {
  let parsed;
  try {
    parsed = new URL(url);
  } catch {
    throw new Error(`URL tidak valid: ${url}`);
  }

  const hostname = parsed.hostname;

  for (const pattern of SSRF_BLOCKLIST) {
    if (pattern.test(hostname)) {
      throw new Error(`SSRF Protection: akses ke "${hostname}" tidak diizinkan`);
    }
  }

  if (!['http:', 'https:'].includes(parsed.protocol)) {
    throw new Error(`Protokol tidak didukung: ${parsed.protocol}`);
  }
}

// ─── Main Fetch Function ────────────────────────────────────────────────────────

/**
 * Ambil HTML dari URL dengan caching.
 * @param {string} url  - URL target
 * @param {object} [options]
 * @param {boolean} [options.useCache=true]  - gunakan cache
 * @param {object}  [options.params]         - query params tambahan
 * @param {object}  [options.headers]        - override headers
 * @returns {Promise<string>} HTML string
 */
async function fetchHtml(url, options = {}) {
  const { useCache = true, params = {}, headers = {} } = options;

  // SSRF check
  assertSafeUrl(url);

  // Build cache key
  const cacheKey = `html:${url}:${JSON.stringify(params)}`;

  if (useCache) {
    const cached = cache.get(cacheKey);
    if (cached !== undefined) {
      return cached;
    }
  }

  try {
    const response = await httpClient.get(url, {
      params,
      headers,
      responseType: 'text',
    });

    const html = response.data;

    if (useCache && html) {
      cache.set(cacheKey, html);
    }

    return html;
  } catch (error) {
    // Tangani berbagai jenis error
    if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
      const err = new Error('Request timeout saat menghubungi target website');
      err.statusCode = 504;
      err.code = 'TIMEOUT';
      throw err;
    }

    if (error.response) {
      const status = error.response.status;
      if (status === 404) {
        const err = new Error('Halaman tidak ditemukan di target website');
        err.statusCode = 404;
        err.code = 'NOT_FOUND';
        throw err;
      }
      if (status === 429) {
        const err = new Error('Target website membatasi request (rate limited)');
        err.statusCode = 429;
        err.code = 'RATE_LIMITED';
        throw err;
      }
      const err = new Error(`Target website mengembalikan status ${status}`);
      err.statusCode = 502;
      err.code = 'BAD_GATEWAY';
      throw err;
    }

    if (error.message?.includes('SSRF')) {
      const err = new Error(error.message);
      err.statusCode = 400;
      err.code = 'SSRF_BLOCKED';
      throw err;
    }

    const err = new Error(`Gagal menghubungi target website: ${error.message}`);
    err.statusCode = 502;
    err.code = 'BAD_GATEWAY';
    throw err;
  }
}

/**
 * Hapus cache berdasarkan prefix key (opsional).
 * @param {string} [prefix]
 */
function clearCache(prefix) {
  if (prefix) {
    const keys = cache.keys().filter((k) => k.startsWith(prefix));
    keys.forEach((k) => cache.del(k));
  } else {
    cache.flushAll();
  }
}

/**
 * Statistik cache saat ini.
 * @returns {object}
 */
function getCacheStats() {
  return cache.getStats();
}

module.exports = { fetchHtml, clearCache, getCacheStats, assertSafeUrl };
