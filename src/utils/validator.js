'use strict';

require('dotenv').config();

// Domain yang diizinkan untuk endpoint ?url= (detail)
const ALLOWED_DOMAINS = [
  'animasu.love',
  'animasu.love',
  'animasu.work',
];

/**
 * Validasi URL agar hanya menerima domain yang diizinkan.
 * Melindungi dari SSRF dengan memastikan URL mengarah ke domain target.
 *
 * @param {string} url  - URL yang akan divalidasi
 * @returns {{ valid: boolean, message?: string }}
 */
function validateTargetUrl(url) {
  if (!url || typeof url !== 'string') {
    return { valid: false, message: 'Parameter URL wajib diisi' };
  }

  let parsed;
  try {
    parsed = new URL(url);
  } catch {
    return { valid: false, message: 'Format URL tidak valid' };
  }

  if (!['http:', 'https:'].includes(parsed.protocol)) {
    return { valid: false, message: 'Protokol URL harus http atau https' };
  }

  const hostname = parsed.hostname.toLowerCase().replace(/^www\./, '');
  const isAllowed = ALLOWED_DOMAINS.some(
    (domain) => hostname === domain || hostname.endsWith(`.${domain}`)
  );

  if (!isAllowed) {
    return {
      valid: false,
      message: `URL harus berasal dari domain: ${ALLOWED_DOMAINS.join(', ')}`,
    };
  }

  return { valid: true };
}

/**
 * Validasi query parameter pencarian.
 * @param {string} q  - keyword pencarian
 * @returns {{ valid: boolean, message?: string }}
 */
function validateSearchQuery(q) {
  if (!q || typeof q !== 'string') {
    return { valid: false, message: 'Parameter "q" wajib diisi' };
  }

  const trimmed = q.trim();

  if (trimmed.length === 0) {
    return { valid: false, message: 'Parameter "q" tidak boleh kosong' };
  }

  if (trimmed.length < 2) {
    return { valid: false, message: 'Keyword pencarian minimal 2 karakter' };
  }

  if (trimmed.length > 100) {
    return { valid: false, message: 'Keyword pencarian maksimal 100 karakter' };
  }

  // Cegah karakter berbahaya
  if (/[<>{}\\|^`]/.test(trimmed)) {
    return { valid: false, message: 'Keyword mengandung karakter yang tidak diizinkan' };
  }

  return { valid: true, sanitized: trimmed };
}

/**
 * Validasi nomor halaman untuk pagination.
 * @param {string|number} page
 * @returns {{ valid: boolean, page?: number, message?: string }}
 */
function validatePage(page) {
  if (page === undefined || page === null || page === '') {
    return { valid: true, page: 1 };
  }

  const num = parseInt(page, 10);

  if (isNaN(num)) {
    return { valid: false, message: 'Parameter "page" harus berupa angka' };
  }

  if (num < 1) {
    return { valid: false, message: 'Parameter "page" minimal bernilai 1' };
  }

  if (num > 9999) {
    return { valid: false, message: 'Parameter "page" terlalu besar' };
  }

  return { valid: true, page: num };
}

/**
 * Validasi slug genre (hanya huruf kecil, angka, dan tanda hubung).
 * @param {string} slug
 * @returns {{ valid: boolean, message?: string }}
 */
function validateSlug(slug) {
  if (!slug || typeof slug !== 'string') {
    return { valid: false, message: 'Slug genre tidak valid' };
  }

  const trimmed = slug.trim().toLowerCase();

  if (trimmed.length === 0) {
    return { valid: false, message: 'Slug genre tidak boleh kosong' };
  }

  if (!/^[a-z0-9-]+$/.test(trimmed)) {
    return {
      valid: false,
      message: 'Slug genre hanya boleh mengandung huruf kecil, angka, dan tanda hubung',
    };
  }

  return { valid: true, slug: trimmed };
}

module.exports = {
  validateTargetUrl,
  validateSearchQuery,
  validatePage,
  validateSlug,
  ALLOWED_DOMAINS,
};
