'use strict';

require('dotenv').config();
const { fetchHtml }                          = require('../utils/http');
const { load, cleanText, absoluteUrl, extractSlug } = require('../utils/parser');

const BASE_URL    = process.env.BASE_URL || 'https://animasu.love';
const DAFTAR_URL  = `${BASE_URL}/daftar-anime/`;

/**
 * Parse satu entry .inx dari halaman daftar anime.
 * Struktur:
 *   .inx
 *     h2 > a      → title + url
 *     span        → genre links
 *     span.split  → rilis, tipe, status, dll
 */
function parseEntry($, el) {
  const $el   = $(el);

  // Title + URL
  const $a    = $el.find('h2 a').first();
  const title = cleanText($a.text()) || null;
  const url   = absoluteUrl($a.attr('href') || '', BASE_URL) || null;

  // Genre — dari span pertama yang mengandung link /genre/
  const genres = [];
  $el.find('span a[href*="/genre/"]').each((i, a) => {
    const name = cleanText($(a).text());
    const href = absoluteUrl($(a).attr('href') || '', BASE_URL);
    if (name) genres.push({ name, slug: extractSlug(href), url: href });
  });

  // Span metadata — Rilis, Tipe, Status, dll
  const meta = {};
  $el.find('span').each((i, span) => {
    const text  = cleanText($(span).text());
    const bText = cleanText($(span).find('b').first().text()).replace(/:$/, '').toLowerCase();
    if (bText && text) {
      const $clone = $(span).clone();
      $clone.find('b').remove();
      const val = cleanText($clone.text()).replace(/^:\s*/, '');
      if (val) meta[bText] = val;
    }
  });

  // Studios — dari span dengan b=Studio
  const studios = [];
  $el.find('span a[href*="/studio/"]').each((i, a) => {
    const name = cleanText($(a).text());
    const href = absoluteUrl($(a).attr('href') || '', BASE_URL);
    if (name) studios.push({ name, slug: extractSlug(href), url: href });
  });

  // Episode count — dari span tanpa b, berisi "X Episode"
  let episodes = null;
  $el.find('span').each((i, span) => {
    const text = cleanText($(span).text());
    const epMatch = text.match(/^,?\s*(\d+)\s+Episode$/i);
    if (epMatch) episodes = epMatch[1];
  });

  // Status — dari span yang berisi teks dalam bracket [Selesai] / [Sedang Tayang] dll
  let status = null;
  $el.find('span').each((i, span) => {
    const text = cleanText($(span).text());
    const match = text.match(/^\[(.+)\]$/);
    if (match) status = match[1];
  });
  // Fallback ke meta jika ada
  if (!status) status = meta['status'] || null;

  const result = {
    title,
    url,
    genres:   genres.length ? genres : null,
    studios:  studios.length ? studios : null,
    released: meta['rilis'] || null,
    type:     meta['jenis'] || meta['tipe'] || null,
    episodes: episodes || meta['episode'] || null,
  };

  // Hanya tambahkan status kalau tidak null
  if (status) result.status = status;

  return result;
}

/**
 * Parse pagination — format /daftar-anime/page/{N}/
 */
function parsePagination($, page) {
  const $next = $('a.next.page-numbers').first();
  const $prev = $('a.prev.page-numbers').first();
  const nextHref = $next.attr('href') || '';
  const prevHref = $prev.attr('href') || '';

  const nextMatch = nextHref.match(/\/page\/(\d+)\/?$/);
  const prevMatch = prevHref.match(/\/page\/(\d+)\/?$/) || (prevHref && page > 1 ? ['', String(page - 1)] : null);

  let totalPages = page;
  $('a.page-numbers').each((i, el) => {
    const n = parseInt($(el).text().trim(), 10);
    if (!isNaN(n) && n > totalPages) totalPages = n;
  });

  return {
    currentPage: page,
    totalPages,
    hasNextPage: !!nextMatch,
    hasPrevPage: !!prevMatch,
    nextPage:    nextMatch ? parseInt(nextMatch[1], 10) : null,
    prevPage:    prevMatch ? parseInt(prevMatch[1], 10) : null,
  };
}

/**
 * Scrape daftar anime A-Z dari /daftar-anime/
 *
 * @param {object} options
 * @param {string}  options.show  - filter huruf, mis. 'A', 'B', ... '#' (non-alfa)
 * @param {number}  options.page  - halaman (default 1)
 * @returns {Promise<object>}
 */
async function scrapeDaftarAnime({ show = '', page = 1 } = {}) {
  // Build URL
  let url = page > 1 ? `${DAFTAR_URL}page/${page}/` : DAFTAR_URL;
  if (show) url += (url.includes('?') ? '&' : '?') + `show=${encodeURIComponent(show.toUpperCase())}`;

  const html = await fetchHtml(url, { useCache: true });
  const $    = load(html);

  // Daftar huruf yang tersedia (dari .lista)
  const letters = [];
  $('.lista a').each((i, el) => {
    const letter = cleanText($(el).text());
    if (letter) letters.push(letter);
  });

  // Statistik dari .footer-az
  const statsText = cleanText($('.footer-az .size-s').text());

  // Daftar anime dari .bx (berisi .imgx + .inx)
  const animeList = [];
  $('.listo .bx').each((i, el) => {
    const $bx = $(el);

    // Thumbnail dari .imgx img
    const $img = $bx.find('.imgx img').first();
    const thumbnail =
      $img.attr('src') ||
      $img.attr('data-src') ||
      $img.attr('data-lazy-src') ||
      null;

    // Info dari .inx
    const $inx = $bx.find('.inx').first();
    const entry = parseEntry($, $inx[0]);
    if (entry.title && entry.url) {
      animeList.push({ ...entry, thumbnail });
    }
  });

  return {
    letters,
    stats:    statsText || null,
    filter:   show ? show.toUpperCase() : 'Semua',
    animeList,
    pagination: parsePagination($, page),
  };
}

module.exports = { scrapeDaftarAnime };
