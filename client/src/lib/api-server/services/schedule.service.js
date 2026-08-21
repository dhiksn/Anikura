'use strict';

const { fetchHtml }                    = require('../utils/http');
const { load, cleanText, absoluteUrl } = require('../utils/parser');

const BASE_URL    = process.env.BASE_URL || 'https://animasu.love';
const SCHEDULE_URL = `${BASE_URL}/jadwal/`;

// Urutan hari yang dipakai animasu (Sabtu s/d Jum'at + Update Acak)
const DAY_ORDER = ['Sabtu', 'Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', "Jum'at", 'Update Acak'];

/**
 * Parse satu card .bsx dari halaman jadwal.
 *
 * Struktur sedikit berbeda:
 *   .epx  → status rilis (mis. "Sudah Rilis!", "Episode 7")
 *   .sb   → nomor episode atau badge (mis. "6", "??", "Sub")
 *   .tt   → title
 *   tidak ada .typez
 */
function parseCard($, el) {
  const $el = $(el);
  const $a  = $el.find('a').first();

  return {
    title:     cleanText($el.find('.tt').text()) || $a.attr('title') || null,
    url:       absoluteUrl($a.attr('href') || '', BASE_URL) || null,
    thumbnail: $el.find('img').attr('src') || $el.find('img').attr('data-src') || null,
    status:    cleanText($el.find('.epx').text()) || null,
    episode:   cleanText($el.find('.sb').text()) || null,
  };
}

/**
 * Scrape halaman jadwal animasu.
 *
 * Struktur DOM:
 *   .bixbox
 *     .releases > h3  (nama hari)
 *     .listupd
 *       .bs > .bsx    (card anime)
 *
 * @returns {Promise<object>}
 */
async function scrapeSchedule() {
  const html = await fetchHtml(SCHEDULE_URL, { useCache: true });
  const $    = load(html);

  const schedule = {};

  // Inisialisasi semua hari dengan array kosong
  DAY_ORDER.forEach(day => { schedule[day] = []; });

  // Iterasi tiap .bixbox — tiap hari punya satu .bixbox
  $('.bixbox').each((i, box) => {
    const day = cleanText($(box).find('.releases h3').first().text());
    if (!day || !DAY_ORDER.includes(day)) return;

    $(box).find('.bsx').each((j, el) => {
      const card = parseCard($, el);
      if (card.title && card.url) schedule[day].push(card);
    });
  });

  // Hitung total keseluruhan
  const total = Object.values(schedule).reduce((sum, arr) => sum + arr.length, 0);

  return { total, schedule };
}

module.exports = { scrapeSchedule };
