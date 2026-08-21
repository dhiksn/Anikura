'use strict';

require('dotenv').config();
const { fetchHtml } = require('../utils/http');
const {
  load,
  cleanText,
  absoluteUrl,
  extractSlug,
  parseAnimeCard,
} = require('../utils/parser');

const BASE_URL = process.env.BASE_URL || 'https://animasu.love';

// URL halaman daftar semua genre
const GENRE_LIST_URL = `${BASE_URL}/kumpulan-genre-anime-lengkap/`;

/**
 * Ambil daftar semua genre/kategori yang tersedia.
 * Data diambil dari .genrepage a — container khusus halaman kumpulan genre animasu.
 *
 * @returns {Promise<Array<{name: string, slug: string, url: string}>>}
 */
async function scrapeGenreList() {
  const html = await fetchHtml(GENRE_LIST_URL, { useCache: true });
  const $    = load(html);

  const genres = [];
  const seen   = new Set();

  $('.genrepage a').each((_, el) => {
    const $a  = $(el);
    const name = cleanText($a.text());
    const href = absoluteUrl($a.attr('href') || '', BASE_URL);

    if (!name || seen.has(name.toLowerCase())) return;
    seen.add(name.toLowerCase());

    genres.push({
      name,
      slug: extractSlug(href),
      url:  href,
    });
  });

  return genres;
}

/**
 * Ambil daftar anime berdasarkan genre dengan pagination.
 *
 * @param {string} slug   - slug genre, mis. "aksi", "romance"
 * @param {number} [page=1]
 * @returns {Promise<object>}
 */
async function scrapeGenreAnime(slug, page = 1) {
  // URL format: /genre/{slug}/ atau /genre/{slug}/page/{page}/
  let genreUrl;
  if (page > 1) {
    genreUrl = `${BASE_URL}/genre/${slug}/page/${page}/`;
  } else {
    genreUrl = `${BASE_URL}/genre/${slug}/`;
  }

  const html = await fetchHtml(genreUrl, { useCache: true });
  const $ = load(html);

  // Periksa apakah halaman valid (bukan 404)
  const pageTitle = cleanText($('title').text());
  const is404 =
    pageTitle.toLowerCase().includes('404') ||
    pageTitle.toLowerCase().includes('not found') ||
    $('body').text().toLowerCase().includes('page not found');

  if (is404) {
    const err = new Error(`Genre "${slug}" tidak ditemukan`);
    err.statusCode = 404;
    err.code = 'NOT_FOUND';
    throw err;
  }

  // ── Nama Genre dari Halaman ────────────────────────────────────────────────
  const genreName =
    cleanText($('h1.entry-title, h1.page-title, h1, .archieve-title h1').first().text()) ||
    cleanText($('h2.page-title, h2').first().text()) ||
    slug;

  // ── Daftar Anime ──────────────────────────────────────────────────────────
  const animeList = [];
  $('.bs .bsx, .bsx').each((_, el) => {
    const card = parseAnimeCard($, el, BASE_URL);
    if (card.title && card.url) animeList.push(card);
  });

  // ── Pagination — format: /genre/{slug}/page/{N}/ ──────────────────────────
  const $next     = $('a.next.page-numbers').first();
  const $prev     = $('a.prev.page-numbers').first();
  const nextHref  = $next.attr('href') || '';
  const prevHref  = $prev.attr('href') || '';
  const nextMatch = nextHref.match(/\/page\/(\d+)\/?$/);
  // prev page 1 URL tidak mengandung /page/ — cukup cek apakah ada link prev
  const prevMatch = prevHref.match(/\/page\/(\d+)\/?$/) || (prevHref && page > 1 ? ['', '1'] : null);

  let totalPages = page;
  $('a.page-numbers').each((i, el) => {
    const n = parseInt($(el).text().trim(), 10);
    if (!isNaN(n) && n > totalPages) totalPages = n;
  });

  return {
    genre: {
      name: genreName,
      slug,
      url:  `${BASE_URL}/genre/${slug}/`,
    },
    total: animeList.length,
    animeList,
    pagination: {
      currentPage: page,
      totalPages,
      hasNextPage: !!nextMatch,
      hasPrevPage: !!prevMatch,
      nextPage:    nextMatch ? parseInt(nextMatch[1], 10) : null,
      prevPage:    prevMatch ? parseInt(prevMatch[1], 10) : null,
    },
  };
}

module.exports = { scrapeGenreList, scrapeGenreAnime };
