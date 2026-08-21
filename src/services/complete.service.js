'use strict';

require('dotenv').config();
const { fetchHtml }                    = require('../utils/http');
const { load, cleanText, absoluteUrl } = require('../utils/parser');

const BASE_URL     = process.env.BASE_URL || 'https://animasu.love';
const COMPLETE_URL = `${BASE_URL}/selesai-tayang/`;

/**
 * Parse satu card .bsx.
 * Struktur identik dengan halaman ongoing/home.
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
 * Parse pagination.
 * Format URL: /selesai-tayang/?halaman=N
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
 * Scrape daftar anime yang sudah selesai tayang.
 *
 * @param {number} [page=1]
 * @returns {Promise<object>}
 */
async function scrapeComplete(page = 1) {
  const url  = page > 1 ? `${COMPLETE_URL}?halaman=${page}` : COMPLETE_URL;
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

module.exports = { scrapeComplete };
