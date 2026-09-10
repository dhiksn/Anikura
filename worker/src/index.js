'use strict';

const ALLOWED_HOSTS = [
  'animasu.love',
  'animasu.work',
  'vidhidepro.com',
  'vidhide.com',
];

const PRIVATE_HOST = [
  /^localhost$/i,
  /^127\.\d+\.\d+\.\d+$/,
  /^0\.0\.0\.0$/,
  /^::1$/,
  /^10\.\d+\.\d+\.\d+$/,
  /^172\.(1[6-9]|2\d|3[01])\.\d+\.\d+$/,
  /^192\.168\.\d+\.\d+$/,
  /^169\.254\.\d+\.\d+$/,
];

const USER_AGENTS = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:127.0) Gecko/20100101 Firefox/127.0',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
];

function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8' },
  });
}

function error(message, code, status) {
  return json({ success: false, error: { code, message } }, status);
}

function isAllowedHost(hostname) {
  const host = hostname.toLowerCase().replace(/^www\./, '');
  if (PRIVATE_HOST.some((re) => re.test(host))) return false;
  return ALLOWED_HOSTS.some((d) => host === d || host.endsWith(`.${d}`));
}

function randomUserAgent() {
  return USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
}

export default {
  async fetch(request, env) {
    const reqUrl = new URL(request.url);

    if (reqUrl.pathname === '/' || reqUrl.pathname === '/health') {
      return json({
        status: 'ok',
        service: 'anikura-fetch-worker',
      });
    }

    if (reqUrl.pathname !== '/api/fetch-html') {
      return error(`Endpoint "${request.method} ${reqUrl.pathname}" tidak ditemukan`, 'ROUTE_NOT_FOUND', 404);
    }

    if (request.method !== 'GET' && request.method !== 'HEAD') {
      return error('Method tidak diizinkan', 'INVALID_PARAMETER', 405);
    }

    const expected = env.SCRAPER_SECRET;
    if (!expected) {
      return error('SCRAPER_SECRET belum di-set di Worker', 'SERVER_ERROR', 500);
    }

    if (request.headers.get('x-scraper-secret') !== expected) {
      return error('Secret scraper tidak valid', 'UNAUTHORIZED', 401);
    }

    const target = reqUrl.searchParams.get('url');
    if (!target) {
      return error('Parameter "url" wajib diisi', 'INVALID_PARAMETER', 400);
    }

    let parsed;
    try {
      parsed = new URL(target);
    } catch {
      return error('Format URL tidak valid', 'INVALID_PARAMETER', 400);
    }

    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return error('Protokol URL harus http atau https', 'INVALID_PARAMETER', 400);
    }

    if (!isAllowedHost(parsed.hostname)) {
      return error('Host tidak diizinkan', 'SSRF_BLOCKED', 400);
    }

    for (const [key, value] of reqUrl.searchParams.entries()) {
      if (key === 'url') continue;
      parsed.searchParams.set(key, value);
    }

    const refererHost = parsed.hostname.toLowerCase().replace(/^www\./, '');
    const referer = ALLOWED_HOSTS.slice(0, 2).some((d) => refererHost === d || refererHost.endsWith(`.${d}`))
      ? `${parsed.protocol}//${parsed.host}/`
      : 'https://animasu.love/';

    let upstream;
    try {
      upstream = await fetch(parsed.toString(), {
        method: 'GET',
        redirect: 'follow',
        headers: {
          Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
          'Accept-Language': 'id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7',
          'User-Agent': randomUserAgent(),
          Referer: referer,
          'Cache-Control': 'no-cache',
        },
      });
    } catch (err) {
      return error(`Gagal menghubungi target: ${err.message}`, 'BAD_GATEWAY', 502);
    }

    if (!upstream.ok) {
      return error(`Upstream status ${upstream.status}`, 'BAD_GATEWAY', 502);
    }

    const html = await upstream.text();
    if (
      html.includes('cf-browser-verification') ||
      html.includes('_cf_chl_') ||
      html.includes('Just a moment')
    ) {
      return error('Cloudflare challenge detected', 'BAD_GATEWAY', 502);
    }

    return new Response(html, {
      status: 200,
      headers: {
        'content-type': 'text/html; charset=utf-8',
        'cache-control': 'private, no-store',
      },
    });
  },
};
