'use strict';

require('dotenv').config();
const { fetchHtml } = require('../utils/http');
const { load, cleanText, absoluteUrl } = require('../utils/parser');

const BASE_URL = process.env.BASE_URL || 'https://animasu.love';

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
 * Scrape halaman utama.
 * @param {number} [page=1] - halaman untuk section "Baru Ditambah & Diperbarui"
 */
async function scrapeHome(page = 1) {
  const url  = page > 1 ? `${BASE_URL}/?page=${page}` : BASE_URL;
  const html = await fetchHtml(url, { useCache: true });
  const $    = load(html);

  // ── Section 1: Sedang Tayang (hanya ada di page 1) ───────────────────────
  const sedangTayang = [];
  if (page === 1) {
    $('.bixbox').each((i, box) => {
      const heading = $(box).find('h3').first().text();
      if (heading.toLowerCase().includes('sedang tayang')) {
        $(box).find('.bsx').each((j, el) => {
          const card = parseCard($, el);
          if (card.title && card.url) sedangTayang.push(card);
        });
      }
    });
  }

  // ── Section 2: Baru Ditambah & Diperbarui ────────────────────────────────
  const baruDiperbarui = [];
  $('#terupdate .bsx').each((i, el) => {
    const card = parseCard($, el);
    if (card.title && card.url) baruDiperbarui.push(card);
  });

  // ── Pagination #terupdate ─────────────────────────────────────────────────
  // Format: /?page=N#terupdate
  // .hpage .l = Lebih Baru, .hpage .r = Lebih Lama
  const $hpage = $('.hpage').first();
  const prevHref = $hpage.find('a.l').attr('href') || '';
  const nextHref = $hpage.find('a.r').attr('href') || '';

  const prevMatch = prevHref.match(/[?&]page=(\d+)/);
  const nextMatch = nextHref.match(/[?&]page=(\d+)/);

  const pagination = {
    currentPage: page,
    hasPrevPage: !!prevMatch,
    hasNextPage: !!nextMatch,
    prevPage:    prevMatch ? parseInt(prevMatch[1], 10) : null,
    nextPage:    nextMatch ? parseInt(nextMatch[1], 10) : null,
  };

  return { sedangTayang, baruDiperbarui, pagination };
}

module.exports = { scrapeHome };
