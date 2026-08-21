'use strict';

const { searchAnime } = require('../services/search.service');
const { validateSearchQuery, validatePage } = require('../utils/validator');

/**
 * GET /api/search?q=keyword&page=1
 * Cari anime berdasarkan keyword.
 */
async function search(req, res, next) {
  try {
    // ── Validasi query parameter ─────────────────────────────────────────────
    const queryValidation = validateSearchQuery(req.query.q);
    if (!queryValidation.valid) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_PARAMETER',
          message: queryValidation.message,
        },
      });
    }

    // ── Validasi page ────────────────────────────────────────────────────────
    const pageValidation = validatePage(req.query.page);
    if (!pageValidation.valid) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_PARAMETER',
          message: pageValidation.message,
        },
      });
    }

    const keyword = queryValidation.sanitized;
    const page = pageValidation.page;

    const result = await searchAnime(keyword, page);

    // Jika tidak ada hasil
    if (result.notFound || result.results.length === 0) {
      return res.status(200).json({
        success: true,
        source: 'Animasu',
        query: keyword,
        data: [],
        pagination: result.pagination,
        message: `Tidak ditemukan hasil untuk "${keyword}"`,
      });
    }

    return res.status(200).json({
      success: true,
      source: 'Animasu',
      query: keyword,
      data: result.results,
      pagination: result.pagination,
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { search };
