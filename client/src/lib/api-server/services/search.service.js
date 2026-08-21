'use strict';

const { fetchHtml } = require('../utils/http');
const { load, parseAnimeCard, cleanText, absoluteUrl } = require('../utils/parser');

const BASE_URL = process.env.BASE_URL || 'https://animasu.love';

/**
 * Cari anime berdasarkan keyword.
 * Animasu pakai format WordPress:
 *   page 1 : /?s=keyword
 *   page 2+: /page/{N}/?s=keyword
 *
 * @param {string} query
 * @param {number} [page=1]
 */
async function searchAnime(query, page = 1) {
  // Build URL sesuai format WordPress
  const searchUrl = page > 1
    ? `${BASE_URL}/page/${page}/`
    : `${BASE_URL}/`;

  const html = await fetchHtml(searchUrl, {
    params: { s: query },
    useCache: true,
  });

  const $ = load(html);
  const results = [];

  // Selector hasil pencarian
  for (const sel of ['.listupd .bsx', '.bsx', '.animepost']) {
    const items = $(sel);
    if (items.length > 0) {
      items.each((_, el) => {
        const card = parseAnimeCard($, el, BASE_URL);
        if (card.title && card.url) results.push(card);
      });
      break;
    }
  }

  // Cek not found
  const pageText = $('body').text().toLowerCase();
  const notFound = results.length === 0 && (
    ['nothing found', 'tidak ditemukan', 'no results'].some(s => pageText.includes(s))
  );

  // ── Pagination — WordPress pakai .page-numbers ──────────────────────────
  // Format next: /page/N/?s=keyword  atau  /?s=keyword
  const $next = $('a.next.page-numbers').first();
  const $prev = $('a.prev.page-numbers').first();

  // Ekstrak nomor halaman dari href
  const getPageNum = (href) => {
    if (!href) return null;
    const m = href.match(/\/page\/(\d+)\//);
    return m ? parseInt(m[1], 10) : 1;
  };

  const nextHref  = $next.attr('href') || '';
  const prevHref  = $prev.attr('href') || '';
  const nextPage  = nextHref ? getPageNum(nextHref) : null;
  const prevPage  = prevHref ? (getPageNum(prevHref) || 1) : null;

  // Total pages dari angka terbesar di .page-numbers
  let totalPages = page;
  $('a.page-numbers, span.page-numbers').each((i, el) => {
    const n = parseInt($(el).text().trim(), 10);
    if (!isNaN(n) && n > totalPages) totalPages = n;
  });

  return {
    query,
    notFound,
    results,
    pagination: {
      currentPage: page,
      totalPages,
      hasNextPage: !!nextHref,
      hasPrevPage: !!prevHref,
      nextPage,
      prevPage,
    },
  };
}

module.exports = { searchAnime };
