'use strict';

require('dotenv').config();
const { fetchHtml } = require('../utils/http');
const { load }      = require('../utils/parser');

const BASE_URL = process.env.BASE_URL || 'https://animasu.love';

/**
 * Unpack Dean Edwards P,A,C,K obfuscation menggunakan regex.
 * Format eval(function(p,a,c,k,e,d){...}('encoded', radix, count, 'k1|k2|...'.split('|')...))
 *
 * @param {string} packed
 * @returns {string} kode yang sudah di-decode, atau string kosong jika gagal
 */
function unpackPACK(packed) {
  // Ekstrak argumen: p (encoded string), a (radix), c (count), k (keys)
  const match = packed.match(/\('([\s\S]+?)',\s*(\d+),\s*(\d+),\s*'([\s\S]+?)'\.split/);
  if (!match) return '';

  const [, p, a, c, kStr] = match;
  const radix  = parseInt(a, 10);
  const count  = parseInt(c, 10);
  const keys   = kStr.split('|');

  // Fungsi decode nomor ke string (base conversion)
  function decode(n) {
    return (n < radix ? '' : decode(Math.floor(n / radix))) +
           ((n = n % radix) > 35 ? String.fromCharCode(n + 29) : n.toString(36));
  }

  let result = p;
  let i      = count;
  while (i--) {
    if (keys[i]) {
      result = result.replace(new RegExp('\\b' + decode(i) + '\\b', 'g'), keys[i]);
    }
  }
  return result;
}

/**
 * Parse object `links` dari hasil unpack.
 * Contoh: {"hls2":"https://...","hls3":"https://...","hls4":"/stream/..."}
 *
 * @param {string} unpacked
 * @param {string} pageUrl  - untuk resolve relative URL
 * @returns {{ hls: Array, mp4: Array }}
 */
function parseLinks(unpacked, pageUrl) {
  const result = { hls: [], mp4: [] };

  // Ambil object links dengan regex
  const linksMatch = unpacked.match(/var\s+links\s*=\s*(\{[^;]+\})/);

  if (linksMatch) {
    try {
      // Normalize JSON: key tanpa quote → pakai quote
      const raw = linksMatch[1]
        .replace(/([{,]\s*)([a-zA-Z0-9_]+)\s*:/g, '$1"$2":')
        .replace(/'/g, '"');

      const links = JSON.parse(raw);
      const parsed = new URL(pageUrl);
      const host   = `${parsed.protocol}//${parsed.host}`;

      // HLS — prioritas .m3u8 dulu (hls2 > hls1 > hls), baru .txt (hls4 > hls3)
      // Urutan ini memastikan format yang kompatibel hls.js muncul lebih awal
      ['hls2', 'hls1', 'hls', 'hls4', 'hls3'].forEach((key) => {
        if (!links[key]) return;
        let url = links[key];
        if (url.startsWith('/')) url = `${host}${url}`;
        result.hls.push({ source: key, url });
      });

      // Urutkan: master.m3u8 paling depan, lalu .m3u8 lainnya, .txt paling belakang
      result.hls.sort((a, b) => {
        const score = (url) => {
          if (url.includes('master.m3u8')) return 0;
          if (url.includes('.m3u8'))       return 1;
          return 2; // .txt atau lainnya
        };
        return score(a.url) - score(b.url);
      });

      // MP4
      ['mp4', 'mp4_1080', 'mp4_720', 'mp4_480'].forEach((key) => {
        if (!links[key]) return;
        let url = links[key];
        if (url.startsWith('/')) url = `${host}${url}`;
        result.mp4.push({ source: key, url });
      });
    } catch {
      // JSON parse gagal, fallback ke regex
    }
  }

  // Fallback: regex langsung dari unpacked
  if (result.hls.length === 0) {
    const m3u8 = [...unpacked.matchAll(/["'](https?:\/\/[^"']+\.m3u8[^"']*)/gi)];
    const txt  = [...unpacked.matchAll(/["'](https?:\/\/[^"']+\.txt[^"']*)/gi)];
    m3u8.forEach((m, i) => result.hls.push({ source: `hls_${i + 1}`, url: m[1] }));
    txt.forEach((m, i)  => result.hls.push({ source: `txt_${i + 1}`, url: m[1] }));
  }

  if (result.mp4.length === 0) {
    const mp4 = [...unpacked.matchAll(/["'](https?:\/\/[^"']+\.mp4[^"']*)/gi)];
    mp4.forEach((m, i) => result.mp4.push({ source: `mp4_${i + 1}`, url: m[1] }));
  }

  return result;
}

/**
 * Extract URL HLS/MP4 dari halaman vidhidepro.
 *
 * @param {string} pageUrl
 * @returns {Promise<{ hls: Array, mp4: Array }>}
 */
async function extractVidhidepro(pageUrl) {
  const html = await fetchHtml(pageUrl, {
    useCache: true,
    headers: { 'Referer': `${BASE_URL}/` },
  });

  const $ = load(html);

  let streams = { hls: [], mp4: [] };

  $('script:not([src])').each((i, el) => {
    const text = $(el).html() || '';
    if (!text.includes('eval(function(p,a,c,k')) return;

    const unpacked = unpackPACK(text);
    if (!unpacked) return;

    streams = parseLinks(unpacked, pageUrl);
    return false; // stop iterasi setelah dapat
  });

  return streams;
}

/**
 * Deteksi provider dari URL dan extract stream URL-nya.
 * Saat ini support: vidhidepro
 *
 * @param {string} serverUrl
 * @returns {Promise<object>}
 */
async function extractStreamUrl(serverUrl) {
  const parsed = new URL(serverUrl);
  const host   = parsed.hostname.toLowerCase();

  if (host.includes('vidhidepro') || host.includes('vidhide')) {
    const streams = await extractVidhidepro(serverUrl);
    return {
      provider:  'vidhidepro',
      sourceUrl: serverUrl,
      streams,
    };
  }

  return {
    provider:  'unknown',
    sourceUrl: serverUrl,
    streams:   { hls: [], mp4: [] },
    message:   `Provider tidak didukung: ${host}`,
  };
}

module.exports = { extractStreamUrl, extractVidhidepro };
