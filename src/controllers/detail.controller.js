'use strict';

const { scrapeDetail } = require('../services/detail.service');
const { validateTargetUrl } = require('../utils/validator');

/**
 * GET /api/detail?url=https://animasu.love/anime/...
 * Mengambil informasi detail dari halaman anime.
 */
async function getDetail(req, res, next) {
  try {
    // ── Validasi URL parameter ───────────────────────────────────────────────
    const urlValidation = validateTargetUrl(req.query.url);
    if (!urlValidation.valid) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_PARAMETER',
          message: urlValidation.message,
        },
      });
    }

    const targetUrl = req.query.url.trim();

    const data = await scrapeDetail(targetUrl);

    // Periksa apakah data yang ditemukan cukup (minimal harus ada title)
    if (!data.info?.title) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Data anime tidak ditemukan pada URL tersebut',
        },
      });
    }

    return res.status(200).json({
      success: true,
      source: 'Animasu',
      url: targetUrl,
      data,
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { getDetail };
