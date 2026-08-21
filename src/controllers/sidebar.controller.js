'use strict';

const { scrapeSidebar } = require('../services/sidebar.service');

/**
 * GET /api/sidebar
 * Ambil data sidebar dari halaman utama animasu.love.
 *
 * Response berisi:
 *   - rekomendasi : daftar link rekomendasi
 *   - karakter    : tag cloud tipe karakter MC beserta jumlah anime
 */
async function getSidebar(req, res, next) {
  try {
    const data = await scrapeSidebar();

    if (!data.rekomendasi.length && !data.karakter.length) {
      return res.status(404).json({
        success: false,
        error: {
          code:    'NOT_FOUND',
          message: 'Data sidebar tidak dapat ditemukan',
        },
      });
    }

    return res.status(200).json({
      success: true,
      source:  'Animasu',
      data,
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { getSidebar };
