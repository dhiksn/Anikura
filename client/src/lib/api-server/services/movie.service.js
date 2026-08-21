'use strict';

const { fetchHtml }                    = require('../utils/http');
const { load, cleanText, absoluteUrl } = require('../utils/parser');

const BASE_URL  = process.env.BASE_URL || 'https://animasu.love';
const MOVIE_URL = `${BASE_URL}/anime-movie/`;

/**
 * Parse satu card .bsx dari halaman movie.
 *
 * Struktur khusus halaman movie:
 *   .typez  → rating (mis. "★ 7.63"), bukan tipe
 *   .epx    → tanggal rilis (mis. "Mar 20, 2026"), bukan episode
 *   .sb     → tidak ada (tidak muncul)
 */
function parseCard($, el) {
  const $el = $(el);
  const $a  = $el.find('a').first();

  const ratingRaw = cleanText($el.find('.typez').text());
  const rating    = ratingRaw ? ratingRaw.replace('★', '').trim() : null;

  return {
    title:       cleanText($el.find('.tt').text()) || $a.attr('title') || null,
    url:         absoluteUrl($a.attr('href') || '', BASE_URL) || null,
    thumbnail:   $el.find('img').attr('src') || $el.find('img').attr('data-src') || null,
    releaseDate: cleanText($el.find('.epx').text()) || null,
    rating:      rating || null,
    type:        'Movie',
  };
}

/**
 * Parse pagination.
 * Format URL: /anime-movie/?halaman=N
 */
function parsePagination($, currentPage) {
  const $next = $('a[href*="halaman="]').filter((i, el) => {
    return $(el).text().toLowerCase().includes('lebih lama') || $(el).attr('class') === 'r';
  }).first();

  const $prev = $('a[href*="halaman="]').filter((i, el) => {
    return $(el).text().toLowerCase().includes('lebih baru') || $(el).attr('class') === 'l';
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
 * Scrape daftar anime movie.
 *
 * @param {number} [page=1]
 * @returns {Promise<object>}
 */
async function scrapeMovie(page = 1) {
  const url  = page > 1 ? `${MOVIE_URL}?halaman=${page}` : MOVIE_URL;
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
    total: animeList.length,
    animeList,
    pagination: parsePagination($, page),
  };
}

module.exports = { scrapeMovie };
