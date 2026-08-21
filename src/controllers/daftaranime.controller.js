'use strict';

const { scrapeDaftarAnime } = require('../services/daftaranime.service');
const { validatePage }      = require('../utils/validator');

/**
 * GET /api/daftar-anime
 *
 * Query params (semua opsional):
 *   show  {string} - filter huruf awal: A-Z atau # untuk non-alfa
 *   page  {number} - halaman (default 1)
 *
 * Contoh:
 *   GET /api/daftar-anime           → semua anime halaman 1
 *   GET /api/daftar-anime?show=A    → anime berawalan A
 *   GET /api/daftar-anime?show=A&page=2
 */
async function getDaftarAnime(req, res, next) {
  try {
    // Validasi page
    const pageValidation = validatePage(req.query.page);
    if (!pageValidation.valid) {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_PARAMETER', message: pageValidation.message },
      });
    }

    // Validasi show — satu huruf A-Z atau #
    const show = (req.query.show || '').trim().toUpperCase();
    if (show && !/^[A-Z#]$/.test(show)) {
      return res.status(400).json({
        success: false,
        error: {
          code:    'INVALID_PARAMETER',
          message: 'Parameter "show" harus satu huruf A-Z atau "#"',
        },
      });
    }

    const result = await scrapeDaftarAnime({
      show,
      page: pageValidation.page,
    });

    if (!result.animeList.length) {
      return res.status(200).json({
        success:    true,
        source:     'Animasu',
        filter:     result.filter,
        letters:    result.letters,
        stats:      result.stats,
        data:       [],
        pagination: result.pagination,
        message:    `Tidak ada anime ditemukan untuk filter "${result.filter}"`,
      });
    }

    return res.status(200).json({
      success:    true,
      source:     'Animasu',
      filter:     result.filter,
      letters:    result.letters,
      stats:      result.stats,
      data:       result.animeList,
      pagination: result.pagination,
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { getDaftarAnime };
