'use strict';

const { scrapeMovie } = require('../services/movie.service');
const { validatePage } = require('../utils/validator');

/**
 * GET /api/movie?page=1
 * Daftar anime movie.
 */
async function getMovie(req, res, next) {
  try {
    const pageValidation = validatePage(req.query.page);
    if (!pageValidation.valid) {
      return res.status(400).json({
        success: false,
        error: {
          code:    'INVALID_PARAMETER',
          message: pageValidation.message,
        },
      });
    }

    const result = await scrapeMovie(pageValidation.page);

    if (!result.animeList.length) {
      return res.status(404).json({
        success: false,
        error: {
          code:    'NOT_FOUND',
          message: 'Tidak ada movie ditemukan pada halaman ini',
        },
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

module.exports = { getMovie };
