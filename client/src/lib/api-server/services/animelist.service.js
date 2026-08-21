'use strict';

const { fetchHtml }                    = require('../utils/http');
const { load, cleanText, absoluteUrl } = require('../utils/parser');

const BASE_URL = process.env.BASE_URL || 'https://animasu.love';
const LIST_URL = `${BASE_URL}/pencarian/`;

/**
 * Parse satu card .bsx
 */
function parseCard($, el) {
  const $el = $(el);
  const $a  = $el.find('a').first();
  const badge = cleanText($el.find('.sb').text()) || null;

  let status = null;
  if (badge) {
    if (/selesai/i.test(badge))         status = 'Selesai';
    else if (/🔥|tayang/i.test(badge))  status = 'Sedang Tayang';
    else                                 status = badge;
  }

  return {
    title:     cleanText($el.find('.tt').text()) || $a.attr('title') || null,
    url:       absoluteUrl($a.attr('href') || '', BASE_URL) || null,
    thumbnail: $el.find('img').attr('src') || $el.find('img').attr('data-src') || null,
    episode:   cleanText($el.find('.epx').text()) || null,
    type:      cleanText($el.find('.typez').text()) || null,
    status,
    badge,
  };
}

/**
 * Parse pagination — halaman pencarian pakai ?halaman=N
 */
function parsePagination($, currentPage) {
  const $next = $('a[href*="halaman="]').filter((i, el) => {
    return $(el).text().toLowerCase().includes('selanjutnya') || $(el).attr('class') === 'r';
  }).first();

  const $prev = $('a[href*="halaman="]').filter((i, el) => {
    return $(el).text().toLowerCase().includes('kembali') ||
           $(el).text().toLowerCase().includes('sebelumnya') ||
           $(el).attr('class') === 'l';
  }).first();

  const nextMatch = ($next.attr('href') || '').match(/halaman=(\d+)/);
  const prevMatch = ($prev.attr('href') || '').match(/halaman=(\d+)/);

  return {
    currentPage,
    hasNextPage: !!nextMatch,
    hasPrevPage: !!prevMatch,
    nextPage:    nextMatch ? parseInt(nextMatch[1], 10) : null,
    prevPage:    prevMatch ? parseInt(prevMatch[1], 10) : null,
  };
}

/**
 * Scrape daftar anime dari /pencarian/ dengan filter lengkap.
 *
 * Parameter filter (semua opsional):
 *   @param {string|string[]} genre    - slug genre, bisa array ['aksi','komedi']
 *   @param {string|string[]} karakter - slug karakter
 *   @param {string|string[]} season   - slug season mis. 'spring-2026'
 *   @param {string}          status   - 'upcoming'|'ongoing'|'completed'
 *   @param {string}          tipe     - 'TV'|'Movie'|'OVA'|'ONA'|'Special'|dst
 *   @param {string}          urutan   - 'baru'|'populer'|'rating'|'abjad'|'update'|dst
 *   @param {number}          page     - halaman (default 1)
 */
async function scrapeAnimeList({
  genre    = [],
  karakter = [],
  season   = [],
  status   = '',
  tipe     = '',
  urutan   = '',
  page     = 1,
} = {}) {
  // Build query params
  const params = new URLSearchParams();

  // Array params (bisa multiple)
  const toArray = (v) => (Array.isArray(v) ? v : v ? [v] : []);
  toArray(genre).forEach(g    => params.append('genre[]', g));
  toArray(karakter).forEach(k => params.append('karakter[]', k));
  toArray(season).forEach(s   => params.append('season[]', s));

  if (status)                          params.set('status', status);
  if (tipe)                            params.set('tipe', tipe);
  if (urutan && urutan !== 'default')  params.set('urutan', urutan);
  if (page > 1) params.set('halaman', page);

  const url  = `${LIST_URL}?${params.toString()}`;
  const html = await fetchHtml(url, { useCache: true });
  const $    = load(html);

  const animeList = [];
  $('.bs .bsx').each((i, el) => {
    const card = parseCard($, el);
    if (card.title && card.url) animeList.push(card);
  });

  if (!animeList.length) {
    $('.bsx').each((i, el) => {
      const card = parseCard($, el);
      if (card.title && card.url) animeList.push(card);
    });
  }

  return {
    animeList,
    pagination: parsePagination($, page),
  };
}

module.exports = { scrapeAnimeList };
