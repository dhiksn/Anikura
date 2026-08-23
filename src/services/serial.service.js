'use strict';

const { fetchHtml }                              = require('../utils/http');
const { load, cleanText, absoluteUrl, parseAnimeCard } = require('../utils/parser');

const BASE_URL = process.env.BASE_URL || 'https://animasu.love';

/**
 * Scrape halaman serial (koleksi anime dalam satu franchise).
 * URL: /serial/{slug}/ atau /serial/{slug}/page/{n}/
 *
 * @param {string} slug  - mis. "gintama"
 * @param {number} page
 * @returns {Promise<object>}
 */
async function scrapeSerial(slug, page = 1) {
  const url = page > 1
    ? `${BASE_URL}/serial/${slug}/page/${page}/`
    : `${BASE_URL}/serial/${slug}/`;

  const html = await fetchHtml(url, { useCache: true });
  const $    = load(html);

  // ── Title ─────────────────────────────────────────────────────────────────
  const title = cleanText($('.bixbox .releases h1 span').first().text()) ||
                cleanText($('.bixbox .releases h1').first().text()) ||
                cleanText($('h1').first().text()) ||
                null;

  // ── Anime list — same .bs .bsx structure as other listing pages ───────────
  const animeList = [];
  $('.bixbox .listupd .bs').each((i, el) => {
    const card = parseAnimeCard($, el, BASE_URL);
    if (card.title || card.url) animeList.push(card);
  });

  if (!animeList.length) {
    const err = new Error('Serial tidak ditemukan');
    err.statusCode = 404;
    err.code = 'NOT_FOUND';
    throw err;
  }

  // ── Pagination — uses /page/{n}/ style ────────────────────────────────────
  const currentPage = page;
  const nextHref    = $('a.next.page-numbers').first().attr('href');
  const prevHref    = $('a.prev.page-numbers').first().attr('href');
  const hasNextPage = !!nextHref;
  const hasPrevPage = !!prevHref;

  let totalPages = currentPage;
  $('a.page-numbers:not(.next):not(.prev)').each((_, el) => {
    const n = parseInt($(el).text().trim(), 10);
    if (!isNaN(n) && n > totalPages) totalPages = n;
  });

  return {
    slug,
    title,
    total: animeList.length,
    animeList,
    pagination: {
      currentPage,
      hasNextPage,
      hasPrevPage,
      nextPage: hasNextPage ? absoluteUrl(nextHref, BASE_URL) : null,
      prevPage: hasPrevPage ? absoluteUrl(prevHref, BASE_URL) : null,
      totalPages,
    },
  };
}

module.exports = { scrapeSerial };
