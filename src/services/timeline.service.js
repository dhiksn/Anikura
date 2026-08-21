'use strict';

require('dotenv').config();
const { fetchHtml }                    = require('../utils/http');
const { load, cleanText, absoluteUrl } = require('../utils/parser');

const BASE_URL     = process.env.BASE_URL || 'https://animasu.love';
const TIMELINE_URL = `${BASE_URL}/timeline/`;

function parseCard($, el) {
  const $el = $(el);
  const $a  = $el.find('a').first();
  return {
    title:       cleanText($el.find('.tt').text()) || $a.attr('title') || null,
    url:         absoluteUrl($a.attr('href') || '', BASE_URL) || null,
    thumbnail:   $el.find('img').attr('src') || $el.find('img').attr('data-src') || null,
    releaseDate: cleanText($el.find('.epx').text()) || null,
    type:        cleanText($el.find('.typez').text()) || null,
    badge:       cleanText($el.find('.sb').text()) || null,
  };
}

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
 * Scrape halaman timeline — daftar anime diurutkan dari rilis terbaru ke terlama.
 * Setiap card menampilkan tanggal rilis di field .epx bukan episode.
 *
 * @param {number} [page=1]
 */
async function scrapeTimeline(page = 1) {
  const url  = page > 1 ? `${TIMELINE_URL}?halaman=${page}` : TIMELINE_URL;
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

  return { animeList, pagination: parsePagination($, page) };
}

module.exports = { scrapeTimeline };
