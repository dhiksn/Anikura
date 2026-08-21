'use strict';

const { fetchHtml }                    = require('../utils/http');
const { load, cleanText, absoluteUrl } = require('../utils/parser');

const BASE_URL = process.env.BASE_URL || 'https://animasu.love';

/**
 * Decode base64 value dari .mirror option dan ekstrak src iframe.
 *
 * Setiap option value adalah base64 dari HTML iframe:
 *   <iframe src="https://..." ...></iframe>
 *
 * @param {string} b64  - base64 string
 * @returns {string|null} - URL streaming atau null jika gagal decode
 */
function decodeServerUrl(b64) {
  if (!b64) return null;
  try {
    const html    = Buffer.from(b64, 'base64').toString('utf-8');
    const $iframe = load(html);
    return $iframe('iframe').attr('src') || null;
  } catch {
    return null;
  }
}

/**
 * Scrape halaman episode animasu.
 *
 * Data yang diambil:
 *   - title episode
 *   - default player (iframe src dari .player-embed)
 *   - servers: semua server dari .mirror select (label + url + kualitas)
 *   - navigasi prev/next episode
 *   - link halaman anime (detail)
 *   - daftar episode (dari .bxcl)
 *
 * @param {string} url  - URL halaman episode
 * @returns {Promise<object>}
 */
async function scrapeEpisode(url) {
  const html = await fetchHtml(url, { useCache: true });
  const $    = load(html);

  // ── Title ──────────────────────────────────────────────────────────────────
  const title = cleanText($('h1').first().text()) || null;

  // ── Default Player (iframe langsung di .player-embed) ─────────────────────
  const defaultPlayer = $('#pembed iframe, .player-embed iframe').first().attr('src') || null;

  // ── Servers dari .mirror select ───────────────────────────────────────────
  // Tiap option: value = base64(iframe html), text = label kualitas
  const servers = [];
  $('.mirror option').each((i, el) => {
    const label = cleanText($(el).text());
    const b64   = $(el).attr('value') || '';
    if (!b64) return; // skip placeholder option

    const streamUrl = decodeServerUrl(b64);
    if (streamUrl) {
      // Parse kualitas dari label, mis. "720p [1]" → quality: "720p", server: 1
      const qualMatch = label.match(/^([\d]+p(?:&[\d]+p)?)/i);
      const numMatch  = label.match(/\[(\d+)\]/);
      servers.push({
        label,
        quality:   qualMatch ? qualMatch[1] : label,
        server:    numMatch  ? parseInt(numMatch[1], 10) : i,
        url:       streamUrl,
      });
    }
  });

  // ── Navigasi Prev / Next / Anime Detail ───────────────────────────────────
  let prevEpisode  = null;
  let nextEpisode  = null;
  let animeUrl     = null;

  $('.naveps .nvs a').each((i, el) => {
    const $a  = $(el);
    const txt = cleanText($a.text()).toLowerCase();
    const href = absoluteUrl($a.attr('href') || '', BASE_URL);
    const rel  = $a.attr('rel') || '';

    if (rel === 'prev' || txt.includes('sebelum') || txt.includes('« ')) {
      prevEpisode = href;
    } else if (rel === 'next' || txt.includes('selanjut') || txt.includes('»')) {
      nextEpisode = href;
    } else if (txt.includes('informasi') || href.includes('/anime/')) {
      animeUrl = href;
    }
  });

  // ── Daftar Episode (.bxcl) ────────────────────────────────────────────────
  const episodeList = [];
  $('.bxcl ul li').each((i, el) => {
    const $li    = $(el);
    const $a     = $li.find('.lchx a').first();
    const epUrl  = absoluteUrl($a.attr('href') || '', BASE_URL);
    const epTitle = cleanText($a.text());
    const epNumMatch = epTitle.match(/Episode\s+(\d+)/i);
    const epNum  = epNumMatch ? parseInt(epNumMatch[1], 10) : null;

    if (epUrl || epTitle) {
      episodeList.push({
        episode: epNum,
        title:   epTitle || null,
        url:     epUrl   || null,
      });
    }
  });

  return {
    title,
    animeUrl,
    navigation: {
      prevEpisode,
      nextEpisode,
    },
    defaultPlayer,
    servers,
    episodeList,
  };
}

module.exports = { scrapeEpisode };
