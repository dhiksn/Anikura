'use strict';

const { fetchHtml } = require('../utils/http');
const { load, cleanText, absoluteUrl } = require('../utils/parser');

const BASE_URL    = process.env.BASE_URL || 'https://animasu.love';
const ONGOING_URL = `${BASE_URL}/anime-sedang-tayang-terbaru/`;

/**
 * Parse satu card .bsx dari halaman ongoing.
 * Struktur identik dengan halaman utama:
 *   .tt → title | .epx → episode | .typez → type | .sb → badge | img → thumbnail
 */
function parseCard($, el) {
  const $el = $(el);
  const $a  = $el.find('a').first();

  return {
    title:     cleanText($el.find('.tt').text()) || $a.attr('title') || null,
    url:       absoluteUrl($a.attr('href') || '', BASE_URL) || null,
    thumbnail: $el.find('img').attr('src') || $el.find('img').attr('data-src') || null,
    episode:   cleanText($el.find('.epx').text()) || null,
    type:      cleanText($el.find('.typez').text()) || null,
    badge:     cleanText($el.find('.sb').text()) || null,
  };
}

/**
 * Parse pagination khusus halaman ongoing.
 * Animasu menggunakan ?halaman=N (bukan ?page=N) untuk halaman ini.
 */
function parsePagination($) {
  // Link "Lebih Lama" = next, "Lebih Baru" = prev
  const $next = $('a.r, a[href*="?halaman="]').filter((i, el) => {
    return $(el).text().toLowerCase().includes('lebih lama') ||
           $(el).attr('class') === 'r';
  }).first();

  const $prev = $('a.l, a[href*="?halaman="]').filter((i, el) => {
    return $(el).text().toLowerCase().includes('lebih baru') ||
           $(el).attr('class') === 'l';
  }).first();

  const nextHref = absoluteUrl($next.attr('href') || '', BASE_URL);
  const prevHref = absoluteUrl($prev.attr('href') || '', BASE_URL);

  // Ekstrak nomor halaman dari href
  const nextMatch = nextHref.match(/[?&]halaman=(\d+)/);
  const prevMatch = prevHref.match(/[?&]halaman=(\d+)/);

  const nextPage = nextMatch ? parseInt(nextMatch[1], 10) : null;
  const prevPage = prevMatch ? parseInt(prevMatch[1], 10) : null;

  return {
    hasNextPage: !!nextHref && !!nextMatch,
    hasPrevPage: !!prevHref && !!prevMatch,
    nextPage,
    prevPage,
    nextUrl:  nextHref || null,
    prevUrl:  prevHref || null,
  };
}

/**
 * Scrape halaman anime sedang tayang dengan pagination.
 *
 * @param {number} [page=1]
 * @returns {Promise<object>}
 */
async function scrapeOngoing(page = 1) {
  const url    = page > 1 ? `${ONGOING_URL}?halaman=${page}` : ONGOING_URL;
  const html   = await fetchHtml(url, { useCache: true });
  const $      = load(html);

  const animeList = [];
  $('.bs .bsx').each((i, el) => {
    const card = parseCard($, el);
    if (card.title && card.url) animeList.push(card);
  });

  // Fallback jika selector .bs .bsx tidak match
  if (!animeList.length) {
    $('.bsx').each((i, el) => {
      const card = parseCard($, el);
      if (card.title && card.url) animeList.push(card);
    });
  }

  const pagination = parsePagination($);

  // Hitung currentPage dari URL atau fallback ke param
  const currentMatch = url.match(/[?&]halaman=(\d+)/);
  const currentPage  = currentMatch ? parseInt(currentMatch[1], 10) : 1;

  return {
    total: animeList.length,
    animeList,
    pagination: {
      currentPage,
      hasNextPage: pagination.hasNextPage,
      hasPrevPage: pagination.hasPrevPage,
      nextPage:    pagination.nextPage,
      prevPage:    pagination.prevPage,
    },
  };
}

module.exports = { scrapeOngoing };
