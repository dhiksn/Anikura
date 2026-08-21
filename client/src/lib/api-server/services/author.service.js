'use strict';

const { fetchHtml }                    = require('../utils/http');
const { load, cleanText, absoluteUrl, extractSlug } = require('../utils/parser');

const BASE_URL = process.env.BASE_URL || 'https://animasu.love';

/**
 * Parse satu card .bsx — struktur identik dengan halaman lainnya.
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
 * Parse pagination — format /penulis/{slug}/page/{N}/
 */
function parsePagination($, page, baseUrl) {
  const $next    = $('a.next.page-numbers').first();
  const $prev    = $('a.prev.page-numbers').first();
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
 * Scrape daftar anime berdasarkan penulis/sutradara.
 * URL format: /penulis/{slug}/ atau /penulis/{slug}/page/{N}/
 *
 * @param {string} slug  - slug penulis, mis. "makoto-shinkai"
 * @param {number} [page=1]
 * @returns {Promise<object>}
 */
async function scrapeAuthor(slug, page = 1) {
  const authorUrl = `${BASE_URL}/penulis/${slug}/`;
  const url       = page > 1 ? `${authorUrl}page/${page}/` : authorUrl;
  const html      = await fetchHtml(url, { useCache: true });
  const $         = load(html);

  const pageTitle = cleanText($('title').text()).toLowerCase();
  if (pageTitle.includes('404') || pageTitle.includes('not found')) {
    const err = new Error(`Penulis "${slug}" tidak ditemukan`);
    err.statusCode = 404;
    err.code = 'NOT_FOUND';
    throw err;
  }

  const authorName =
    cleanText($('h1').first().text())
      .replace(/^Kumpulan Anime Karya\s*/i, '')
      .trim() || slug;

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
    author: { name: authorName, slug, url: authorUrl },
    animeList,
    pagination: parsePagination($, page, authorUrl),
  };
}

module.exports = { scrapeAuthor };
