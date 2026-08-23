'use strict';

require('dotenv').config();
const { fetchHtml }                          = require('../utils/http');
const { load, cleanText, absoluteUrl, extractSlug } = require('../utils/parser');

const BASE_URL = process.env.BASE_URL || 'https://animasu.love';

/**
 * Parse semua field dari .spe span berdasarkan label <b>.
 * Contoh: <span><b>Genre:</b> ...</span>
 *
 * Returns flat object, misal:
 *   { genre: '...', status: '...', rilis: '...', jenis: '...', ... }
 */
function parseSpe($) {
  const info = {};
  $('.spe span').each((i, el) => {
    const $span = $(el);
    const label = cleanText($span.find('b').first().text())
      .replace(/:$/, '')
      .toLowerCase()
      .trim();

    // Clone supaya bisa hapus <b> tanpa merusak DOM asli
    const $clone = $span.clone();
    $clone.find('b').remove();
    const value = cleanText($clone.text()).replace(/^:\s*/, '');

    if (label && value) info[label] = value;
  });
  return info;
}

/**
 * Ambil detail lengkap sebuah anime.
 * @param {string} url
 * @returns {Promise<object>}
 */
async function scrapeDetail(url) {
  const html = await fetchHtml(url, { useCache: true });
  const $    = load(html);

  // ── Title ──────────────────────────────────────────────────────────────────
  const title =
    cleanText($('.infox h1').first().text()) ||
    cleanText($('h1').first().text()) ||
    null;

  // ── Alternative Title ──────────────────────────────────────────────────────
  const alternativeTitles = [];
  const altRaw = cleanText($('.infox .alter, .alter').first().text());
  if (altRaw) {
    altRaw.split(/[,;]/).forEach(t => {
      const trimmed = t.trim();
      if (trimmed) alternativeTitles.push(trimmed);
    });
  }

  // ── Thumbnail ──────────────────────────────────────────────────────────────
  const $thumb = $('.bigcontent .thumb img, .thumb img').first();
  const thumbnail =
    $thumb.attr('src') ||
    $thumb.attr('data-src') ||
    $thumb.attr('data-lazy-src') ||
    null;

  // ── Description ───────────────────────────────────────────────────────────
  const description =
    cleanText($('.sinopsis p, .sinopsis').first().text()) ||
    cleanText($('.desc p, .desc').first().text()) ||
    cleanText($('.entry-content p').first().text()) ||
    null;

  // ── Rating ────────────────────────────────────────────────────────────────
  // Format: "Rating 8.06\n1\n2\n3\n..." — ambil angka pertama setelah "Rating "
  const ratingRaw = cleanText($('.bigcontent .rating').first().text());
  const ratingMatch = ratingRaw.match(/Rating\s+([\d.]+)/i) || ratingRaw.match(/([\d.]+)/);
  const rating = ratingMatch ? parseFloat(ratingMatch[1]) : null;

  // ── Parse .spe info table ──────────────────────────────────────────────────
  const spe = parseSpe($);

  // ── Genres ────────────────────────────────────────────────────────────────
  const genres = [];
  $('.spe span').each((i, el) => {
    const label = cleanText($(el).find('b').first().text()).replace(/:$/, '').toLowerCase();
    if (label === 'genre') {
      $(el).find('a').each((j, a) => {
        const name = cleanText($(a).text());
        const href = absoluteUrl($(a).attr('href') || '', BASE_URL);
        if (name) genres.push({ name, slug: extractSlug(href), url: href });
      });
    }
  });

  // ── Studios ───────────────────────────────────────────────────────────────
  const studios = [];
  $('.spe span').each((i, el) => {
    const label = cleanText($(el).find('b').first().text()).replace(/:$/, '').toLowerCase();
    if (label === 'studio') {
      $(el).find('a').each((j, a) => {
        const name = cleanText($(a).text());
        const href = absoluteUrl($(a).attr('href') || '', BASE_URL);
        if (name) studios.push({ name, slug: extractSlug(href), url: href });
      });
    }
  });

  // ── Season link ───────────────────────────────────────────────────────────
  let seasonUrl = null;
  $('.spe span').each((i, el) => {
    const label = cleanText($(el).find('b').first().text()).replace(/:$/, '').toLowerCase();
    if (label === 'musim') {
      const $a = $(el).find('a').first();
      if ($a.length) seasonUrl = absoluteUrl($a.attr('href') || '', BASE_URL);
    }
  });

  // ── Field mapping dari spe ─────────────────────────────────────────────────
  const status        = spe['status']   || null;
  const type          = spe['jenis']    || null;
  const released      = spe['rilis']    || null;
  const duration      = spe['durasi']   || null;
  const season        = spe['musim']    || null;
  const postedBy      = spe['diposting']|| null;
  const updatedAt     = spe['diupdate'] || null;

  // ── Episode List ──────────────────────────────────────────────────────────
  // Selector: .bxcl li — tiap li berisi .lchx a (url+judul) dan .dt span (tanggal)
  const episodeList = [];
  $('.bxcl ul li').each((i, el) => {
    const $li    = $(el);
    const $a     = $li.find('.lchx a').first();
    const epUrl  = absoluteUrl($a.attr('href') || '', BASE_URL);
    const epTitle = cleanText($a.text());

    // Tanggal ada di .dt — ambil text tapi skip yang isinya URL (class nama URL)
    const $dt    = $li.find('.dt').first();
    const $dtSpan = $dt.find('span').first();
    const epDate = cleanText($dtSpan.text()).replace(/^https?:\/\/.*/, '').trim() || null;

    // Nomor episode dari judul
    const epNumMatch = epTitle.match(/Episode\s+(\d+)/i);
    const epNum = epNumMatch
      ? parseInt(epNumMatch[1], 10)
      : null;

    if (epUrl || epTitle) {
      episodeList.push({
        number: epNum,
        title: epTitle || null,
        url: epUrl || null,
      });
    }
  });

  // ── Related / Serial ──────────────────────────────────────────────────────
  const serialLink = (() => {
    let link = null;
    $('.spe span a').each((i, el) => {
      const href = $(el).attr('href') || '';
      const text = cleanText($(el).text());
      if (href.includes('/serial/') || text.toLowerCase().includes('serial')) {
        link = absoluteUrl(href, BASE_URL);
      }
    });
    return link;
  })();

  // ── Download Links ────────────────────────────────────────────────────────
  // Structure: .bixbox > .mctnx > .soraddlx (tiap batch) > .soraurlx (tiap episode range)
  const downloads = [];
  $('.bixbox').each((i, bixbox) => {
    const $box = $(bixbox);
    if (!$box.find('.mctnx').length) return;

    $box.find('.soraddlx').each((j, dlx) => {
      const $dlx = $(dlx);
      const batchTitle = cleanText($dlx.find('.sorattlx h3, .sorattlx').first().text()) || null;
      const episodes = [];

      $dlx.find('.soraurlx').each((k, urlx) => {
        const $urlx = $(urlx);
        const epLabel = cleanText($urlx.find('strong').first().text()) || null;
        const links = [];
        $urlx.find('a').each((l, a) => {
          const label = cleanText($(a).text());
          const href  = $(a).attr('href') || '';
          if (label && href) links.push({ label, url: href });
        });
        if (epLabel || links.length) {
          episodes.push({ episode: epLabel, links });
        }
      });

      if (episodes.length) {
        downloads.push({ title: batchTitle, episodes });
      }
    });
  });
  const recommendations = [];
  $('.bixbox.rekomrand .bsx').each((i, el) => {
    const $el  = $(el);
    const $a   = $el.find('a').first();
    const name = cleanText($el.find('.tt').text()) || $a.attr('title') || null;
    const href = absoluteUrl($a.attr('href') || '', BASE_URL);
    const img  = $el.find('img').attr('src') || $el.find('img').attr('data-src') || null;
    const ep   = cleanText($el.find('.epx').text()) || null;
    const type = cleanText($el.find('.typez').text()) || null;
    if (name && href) recommendations.push({ title: name, url: href, thumbnail: img, episode: ep, type });
  });

  return {
    info: {
      title,
      alternativeTitles: alternativeTitles.length
        ? alternativeTitles
        : [],

      thumbnail,
      description,

      status,
      type,
      released,
      duration,

      season,
      seasonUrl,

      rating,
    },

    genres: genres.length
      ? genres
      : [],

    studios: studios.length
      ? studios
      : [],

    episodes: episodeList,

    relations: {
      serial: serialLink
        ? {
            url: serialLink,
          }
        : null,
    },

    recommendations,
    downloads: downloads.length ? downloads : [],
  };
}

module.exports = { scrapeDetail };
