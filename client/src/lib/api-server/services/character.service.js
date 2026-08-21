'use strict';

const { fetchHtml }                    = require('../utils/http');
const { load, cleanText, absoluteUrl, extractSlug, parseAnimeCard, parsePagination } = require('../utils/parser');

const BASE_URL       = process.env.BASE_URL || 'https://animasu.love';
const CHARACTER_LIST_URL = `${BASE_URL}/kumpulan-tipe-karakter-lengkap/`;

/**
 * Ambil daftar semua tipe karakter.
 * Data ada di .genrepage a dengan URL /karakter/{slug}/
 *
 * @returns {Promise<Array<{name: string, slug: string, url: string}>>}
 */
async function scrapeCharacterList() {
  const html = await fetchHtml(CHARACTER_LIST_URL, { useCache: true });
  const $    = load(html);

  const characters = [];
  const seen       = new Set();

  $('.genrepage a').each((_, el) => {
    const $a  = $(el);
    const name = cleanText($a.text());
    const href = absoluteUrl($a.attr('href') || '', BASE_URL);

    if (!name || seen.has(name.toLowerCase())) return;
    if (!href.includes('/karakter/')) return;

    seen.add(name.toLowerCase());
    characters.push({
      name,
      slug: extractSlug(href),
      url:  href,
    });
  });

  return characters;
}

/**
 * Ambil daftar anime berdasarkan tipe karakter dengan pagination.
 * URL format: /karakter/{slug}/ atau /karakter/{slug}/?halaman=N
 *
 * @param {string} slug
 * @param {number} [page=1]
 * @returns {Promise<object>}
 */
async function scrapeCharacterAnime(slug, page = 1) {
  const characterUrl = `${BASE_URL}/karakter/${slug}/`;
  const url  = page > 1 ? `${characterUrl}page/${page}/` : characterUrl;
  const html = await fetchHtml(url, { useCache: true });
  const $    = load(html);

  // Cek 404
  const pageTitle = cleanText($('title').text()).toLowerCase();
  if (pageTitle.includes('404') || pageTitle.includes('not found')) {
    const err = new Error(`Tipe karakter "${slug}" tidak ditemukan`);
    err.statusCode = 404;
    err.code = 'NOT_FOUND';
    throw err;
  }

  // Nama karakter dari heading halaman
  const characterName =
    cleanText($('h1').first().text()) ||
    cleanText($('.releases h1').first().text()) ||
    slug;

  // Daftar anime
  const animeList = [];
  $('.bs .bsx').each((i, el) => {
    const card = parseAnimeCard($, el, BASE_URL);
    if (card.title && card.url) animeList.push(card);
  });

  if (!animeList.length) {
    $('.bsx').each((i, el) => {
      const card = parseAnimeCard($, el, BASE_URL);
      if (card.title && card.url) animeList.push(card);
    });
  }

  // Pagination — format: /karakter/{slug}/page/{N}/
  const $next = $('a.next.page-numbers').first();
  const $prev = $('a.prev.page-numbers').first();

  const nextHref  = $next.attr('href') || '';
  const prevHref  = $prev.attr('href') || '';
  const nextMatch = nextHref.match(/\/page\/(\d+)\/?$/);
  const prevMatch = prevHref.match(/\/page\/(\d+)\/?$/) || (prevHref && page > 1 ? ['', '1'] : null);

  // Total pages dari angka terbesar di .page-numbers
  let totalPages = page;
  $('a.page-numbers').each((i, el) => {
    const n = parseInt($(el).text().trim(), 10);
    if (!isNaN(n) && n > totalPages) totalPages = n;
  });

  return {
    character: {
      name: characterName,
      slug,
      url:  characterUrl,
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

module.exports = { scrapeCharacterList, scrapeCharacterAnime };
