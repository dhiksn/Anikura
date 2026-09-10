'use strict';

const crypto = require('crypto');
const { fetchHtml } = require('../utils/http');

function secretsMatch(provided, expected) {
  if (!provided || !expected) return false;
  const a = Buffer.from(String(provided));
  const b = Buffer.from(String(expected));
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

/**
 * Internal HTML relay for the Vercel app.
 * GET /api/fetch-html?url=https://...
 *
 * Requires header x-scraper-secret matching SCRAPER_SECRET.
 * Query params besides `url` are forwarded to the upstream request.
 */
async function getFetchHtml(req, res, next) {
  try {
    const expected = process.env.SCRAPER_SECRET;
    if (!expected) {
      const err = new Error('Relay HTML tidak diaktifkan');
      err.statusCode = 404;
      err.code = 'NOT_FOUND';
      throw err;
    }

    if (!secretsMatch(req.get('x-scraper-secret'), expected)) {
      const err = new Error('Secret scraper tidak valid');
      err.statusCode = 401;
      err.code = 'UNAUTHORIZED';
      throw err;
    }

    const url = req.query.url;
    if (!url || typeof url !== 'string') {
      const err = new Error('Parameter "url" wajib diisi');
      err.statusCode = 400;
      err.code = 'INVALID_PARAMETER';
      throw err;
    }

    const params = { ...req.query };
    delete params.url;

    const html = await fetchHtml(url, { params, useCache: true });
    res.set('Content-Type', 'text/html; charset=utf-8');
    res.set('Cache-Control', 'private, no-store');
    return res.status(200).send(html);
  } catch (err) {
    next(err);
  }
}

module.exports = { getFetchHtml };
