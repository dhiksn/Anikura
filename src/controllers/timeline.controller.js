'use strict';

const { scrapeTimeline } = require('../services/timeline.service');
const { validatePage }   = require('../utils/validator');

/**
 * GET /api/timeline?page=1
 * Daftar anime dari rilis terbaru hingga terlama.
 */
async function getTimeline(req, res, next) {
  try {
    const pageValidation = validatePage(req.query.page);
    if (!pageValidation.valid) {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_PARAMETER', message: pageValidation.message },
      });
    }

    const result = await scrapeTimeline(pageValidation.page);

    if (!result.animeList.length) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Tidak ada anime ditemukan pada halaman ini' },
      });
    }

    return res.status(200).json({
      success:    true,
      source:     'Animasu',
      data:       result.animeList,
      pagination: result.pagination,
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { getTimeline };
