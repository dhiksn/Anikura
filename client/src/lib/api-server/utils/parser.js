'use strict';

const cheerio = require('cheerio');

function load(html) {
  return cheerio.load(html, { decodeEntities: true, xmlMode: false });
}

function cleanText(text) {
  if (!text) return '';
  return text.replace(/\s+/g, ' ').trim();
}

function extractNumber(text) {
  if (!text) return null;
  const match = text.match(/\d+/);
  return match ? match[0] : null;
}

function parseRating(text) {
  if (!text) return null;
  const match = text.match(/(\d+(?:\.\d+)?)/);
  return match ? parseFloat(match[1]) : null;
}

function absoluteUrl(url, baseUrl) {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  if (url.startsWith('//')) return `https:${url}`;
  if (url.startsWith('/')) {
    const base = baseUrl.replace(/\/$/, '');
    return `${base}${url}`;
  }
  return url;
}

function extractSlug(url) {
  if (!url) return '';
  const parts = url.replace(/\/$/, '').split('/');
  return parts[parts.length - 1] || '';
}

function parseAnimeCard($, el, baseUrl) {
  const $el = $(el);
  const title =
    cleanText($el.find('.tt, .tit, h2, h3, .animposx .tt').first().text()) ||
    cleanText($el.find('a').first().attr('title')) ||
    cleanText($el.find('a').first().text());
  const rawUrl =
    $el.find('a').first().attr('href') ||
    $el.find('.bsxlink, .animposx a').first().attr('href') || '';
  const url = absoluteUrl(rawUrl, baseUrl);
  const $img = $el.find('img').first();
  const thumbnail =
    $img.attr('src') ||
    $img.attr('data-src') ||
    $img.attr('data-lazy-src') ||
    $img.attr('data-wpfc-original-src') || '';
  const episode = cleanText($el.find('.epx').first().text()) || null;
  const type = cleanText($el.find('.typez').first().text()) || null;
  const badge = cleanText($el.find('.sb').first().text()) || null;
  let status = null;
  if (badge) {
    if (/selesai/i.test(badge)) status = 'Selesai';
    else if (/ongoing|tayang|🔥/i.test(badge)) status = 'Sedang Tayang';
    else status = badge;
  }
  const ratingText = cleanText($el.find('.numscore, .score, .rating').first().text());
  const rating = parseRating(ratingText);
  return { title: title || null, thumbnail: thumbnail || null, url: url || null, episode: episode || null, status: status || null, type: type || null, badge: badge || null, rating: rating || null };
}

function parsePagination($, baseUrl) {
  const $pagination = $('.pagination, .hpage, nav.pagination, .page-numbers').first();
  if (!$pagination.length) {
    return { currentPage: 1, hasNextPage: false, hasPrevPage: false, totalPages: null };
  }
  const currentPageText = cleanText($pagination.find('.current, .page-numbers.current, span.current').first().text());
  const currentPage = parseInt(currentPageText, 10) || 1;
  const nextHref = $pagination.find('a.next, a[rel="next"], .next a').first().attr('href');
  const hasNextPage = !!nextHref;
  const nextPage = hasNextPage ? absoluteUrl(nextHref, baseUrl) : null;
  const prevHref = $pagination.find('a.prev, a[rel="prev"], .prev a').first().attr('href');
  const hasPrevPage = !!prevHref;
  const prevPage = hasPrevPage ? absoluteUrl(prevHref, baseUrl) : null;
  let totalPages = null;
  $pagination.find('a.page-numbers, a[class*="page"]').each((_, el) => {
    const num = parseInt($(el).text(), 10);
    if (!isNaN(num) && (totalPages === null || num > totalPages)) totalPages = num;
  });
  if (totalPages === null) totalPages = currentPage;
  return { currentPage, hasNextPage, nextPage, hasPrevPage, prevPage, totalPages };
}

module.exports = { load, cleanText, extractNumber, parseRating, absoluteUrl, extractSlug, parseAnimeCard, parsePagination };
