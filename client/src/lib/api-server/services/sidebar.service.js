'use strict';

const { fetchHtml }                    = require('../utils/http');
const { load, cleanText, absoluteUrl, extractSlug } = require('../utils/parser');

const BASE_URL = process.env.BASE_URL || 'https://animasu.love';

/**
 * Scrape data sidebar dari halaman utama animasu.love.
 *
 * Section yang tersedia:
 *   1. rekomendasi  — daftar link rekomendasi animasu
 *   2. karakter     — tag cloud tipe karakter MC beserta jumlah anime
 *
 * @returns {Promise<object>}
 */
async function scrapeSidebar() {
  const html = await fetchHtml(BASE_URL, { useCache: true });
  const $    = load(html);

  // ── Section 1: Link Rekomendasi ─────────────────────────────────────────
  const rekomendasi = [];
  $('#sidebar .widget_text a').each((i, el) => {
    const $a   = $(el);
    const name = cleanText($a.text());
    const href = absoluteUrl($a.attr('href') || '', BASE_URL);

    if (!name || !href) return;

    // Skip link download APK / eksternal non-anime
    if (/(apk|android|download)/i.test(name + href)) return;

    rekomendasi.push({
      label: name,
      url:   href,
    });
  });

  // ── Section 2: Tipe Karakter tag cloud ──────────────────────────────────
  const karakter = [];
  $('#sidebar .tagcloud a').each((i, el) => {
    const $a    = $(el);
    const name  = cleanText($a.text());
    const href  = absoluteUrl($a.attr('href') || '', BASE_URL);
    const aria  = $a.attr('aria-label') || '';

    // Ambil jumlah anime dari aria-label: "Badass (180 item)"
    const countMatch = aria.match(/\((\d+)\s*item\)/i);
    const count      = countMatch ? parseInt(countMatch[1], 10) : null;

    if (!name || !href) return;

    karakter.push({
      name,
      slug:  extractSlug(href),
      url:   href,
      count,
    });
  });

  return { rekomendasi, karakter };
}

module.exports = { scrapeSidebar };
