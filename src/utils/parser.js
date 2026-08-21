'use strict';

const cheerio = require('cheerio');

// ─── Cheerio Load Helper ────────────────────────────────────────────────────────

/**
 * Load HTML ke dalam Cheerio instance.
 * @param {string} html
 * @returns {cheerio.CheerioAPI}
 */
function load(html) {
  return cheerio.load(html, {
    decodeEntities: true,
    xmlMode: false,
  });
}

// ─── Text Helpers ───────────────────────────────────────────────────────────────

/**
 * Bersihkan whitespace berlebih dari teks.
 * @param {string} text
 * @returns {string}
 */
function cleanText(text) {
  if (!text) return '';
  return text.replace(/\s+/g, ' ').trim();
}

/**
 * Ekstrak angka dari string.
 * @param {string} text
 * @returns {string|null}
 */
function extractNumber(text) {
  if (!text) return null;
  const match = text.match(/\d+/);
  return match ? match[0] : null;
}

/**
 * Konversi teks rating ke angka float.
 * @param {string} text  - mis. "Rating 7.03" atau "7.03/10"
 * @returns {number|null}
 */
function parseRating(text) {
  if (!text) return null;
  const match = text.match(/(\d+(?:\.\d+)?)/);
  return match ? parseFloat(match[1]) : null;
}

// ─── URL Helpers ────────────────────────────────────────────────────────────────

/**
 * Pastikan URL absolut. Jika relatif, tambahkan baseUrl.
 * @param {string} url
 * @param {string} baseUrl
 * @returns {string}
 */
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

/**
 * Ekstrak slug dari URL.
 * @param {string} url  - mis. "https://example.com/anime/yani-neko/"
 * @returns {string}    - "yani-neko"
 */
function extractSlug(url) {
  if (!url) return '';
  const parts = url.replace(/\/$/, '').split('/');
  return parts[parts.length - 1] || '';
}

// ─── Anime Card Parser ──────────────────────────────────────────────────────────

/**
 * Parse satu elemen anime card (.bsx) dari halaman listing.
 * Mendukung berbagai struktur tema WordPress anime (Themesia/Ninetheme).
 *
 * @param {cheerio.CheerioAPI} $
 * @param {cheerio.Element}    el  - elemen card
 * @param {string}             baseUrl
 * @returns {object}
 */
function parseAnimeCard($, el, baseUrl) {
  const $el = $(el);

  // ── Title ──
  const title =
    cleanText($el.find('.tt, .tit, h2, h3, .animposx .tt').first().text()) ||
    cleanText($el.find('a').first().attr('title')) ||
    cleanText($el.find('a').first().text());

  // ── URL ──
  const rawUrl =
    $el.find('a').first().attr('href') ||
    $el.find('.bsxlink, .animposx a').first().attr('href') || '';
  const url = absoluteUrl(rawUrl, baseUrl);

  // ── Thumbnail ──
  const $img = $el.find('img').first();
  const thumbnail =
    $img.attr('src') ||
    $img.attr('data-src') ||
    $img.attr('data-lazy-src') ||
    $img.attr('data-wpfc-original-src') || '';

  // ── Episode ──
  const episode = cleanText(
    $el.find('.epx').first().text()
  ) || null;

  // ── Type ──
  const type = cleanText(
    $el.find('.typez').first().text()
  ) || null;

  // ── Badge (.sb) — berisi "Selesai ✓", "🔥🔥🔥", "RAW", "Sub", dll ──
  const badge = cleanText(
    $el.find('.sb').first().text()
  ) || null;

  // ── Status — turunkan dari badge ──
  let status = null;
  if (badge) {
    if (/selesai/i.test(badge))        status = 'Selesai';
    else if (/ongoing|tayang|🔥/i.test(badge)) status = 'Sedang Tayang';
    else                                status = badge;
  }

  // ── Score / Rating ──
  const ratingText = cleanText($el.find('.numscore, .score, .rating').first().text());
  const rating = parseRating(ratingText);

  return {
    title: title || null,
    thumbnail: thumbnail || null,
    url: url || null,
    episode: episode || null,
    status: status || null,
    type: type || null,
    badge: badge || null,
    rating: rating || null,
  };
}

// ─── Pagination Parser ──────────────────────────────────────────────────────────

/**
 * Parse informasi pagination dari halaman.
 * @param {cheerio.CheerioAPI} $
 * @param {string} baseUrl
 * @returns {object}
 */
function parsePagination($, baseUrl) {
  const $pagination = $('.pagination, .hpage, nav.pagination, .page-numbers').first();

  if (!$pagination.length) {
    return { currentPage: 1, hasNextPage: false, hasPrevPage: false, totalPages: null };
  }

  // Current page
  const currentPageText = cleanText(
    $pagination.find('.current, .page-numbers.current, span.current').first().text()
  );
  const currentPage = parseInt(currentPageText, 10) || 1;

  // Next page
  const nextHref = $pagination.find('a.next, a[rel="next"], .next a').first().attr('href');
  const hasNextPage = !!nextHref;
  const nextPage = hasNextPage ? absoluteUrl(nextHref, baseUrl) : null;

  // Prev page
  const prevHref = $pagination.find('a.prev, a[rel="prev"], .prev a').first().attr('href');
  const hasPrevPage = !!prevHref;
  const prevPage = hasPrevPage ? absoluteUrl(prevHref, baseUrl) : null;

  // Total pages — ambil angka terbesar dari link page
  let totalPages = null;
  $pagination.find('a.page-numbers, a[class*="page"]').each((_, el) => {
    const num = parseInt($(el).text(), 10);
    if (!isNaN(num) && (totalPages === null || num > totalPages)) {
      totalPages = num;
    }
  });
  if (totalPages === null) totalPages = currentPage;

  return { currentPage, hasNextPage, nextPage, hasPrevPage, prevPage, totalPages };
}

// ─── Detail Info Parser ─────────────────────────────────────────────────────────

/**
 * Parse tabel info dari halaman detail anime.
 * Mendukung format .spe span, .infox .spe, .info-content, dll.
 *
 * @param {cheerio.CheerioAPI} $
 * @returns {object} flat key-value dari semua info
 */
function parseDetailInfo($) {
  const info = {};

  // Coba selector berbeda yang dipakai tema anime
  const selectors = ['.spe', '.infox .spe', '.info-content', '.animeinfo'];

  let $infoEl = null;
  for (const sel of selectors) {
    const found = $(sel).first();
    if (found.length) {
      $infoEl = found;
      break;
    }
  }

  if (!$infoEl) return info;

  $infoEl.find('span, div.info-item').each((_, el) => {
    const $span = $(el);
    const labelEl = $span.find('b, strong, .label').first();
    const label = cleanText(labelEl.text()).replace(/:$/, '').toLowerCase();
    labelEl.remove();
    const value = cleanText($span.text()).replace(/^:\s*/, '');

    if (label && value) {
      // Normalisasi key
      const key = label
        .replace(/\s+/g, '_')
        .replace(/[^a-z0-9_]/g, '');
      info[key] = value;
    }
  });

  return info;
}

// ─── Genre List Parser ──────────────────────────────────────────────────────────

/**
 * Parse daftar genre dari halaman genre.
 * @param {cheerio.CheerioAPI} $
 * @param {string} baseUrl
 * @returns {Array<{name: string, slug: string, url: string}>}
 */
function parseGenreList($, baseUrl) {
  const genres = [];
  const seen = new Set();

  // Selector umum untuk daftar genre di tema anime WordPress
  const selectors = [
    '.genr a', '.genres a', '.genre-list a',
    '.kolom a', '.tagcloud a', '.genre a',
    '.listgen a', '.genre-box a',
    'ul.genre li a', 'div.genre-list a',
  ];

  for (const sel of selectors) {
    $(sel).each((_, el) => {
      const $a = $(el);
      const name = cleanText($a.text());
      const href = absoluteUrl($a.attr('href') || '', baseUrl);
      if (!name || seen.has(name.toLowerCase())) return;
      seen.add(name.toLowerCase());
      genres.push({
        name,
        slug: extractSlug(href),
        url: href,
      });
    });
    if (genres.length > 0) break;
  }

  return genres;
}

module.exports = {
  load,
  cleanText,
  extractNumber,
  parseRating,
  absoluteUrl,
  extractSlug,
  parseAnimeCard,
  parsePagination,
  parseDetailInfo,
  parseGenreList,
};
