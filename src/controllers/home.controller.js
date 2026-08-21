'use strict';

const { scrapeHome } = require('../services/scraper.service');
const { validatePage } = require('../utils/validator');

/**
 * GET /api/home?page=1
 *
 * page=1 → sedangTayang + baruDiperbarui halaman 1
 * page=2 → hanya baruDiperbarui halaman 2 (dengan pagination)
 */
async function getHome(req, res, next) {
  try {
    const pageValidation = validatePage(req.query.page);
    if (!pageValidation.valid) {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_PARAMETER', message: pageValidation.message },
      });
    }

    const data = await scrapeHome(pageValidation.page);

    return res.status(200).json({
      success:        true,
      source:         'Animasu',
      sedangTayang:   data.sedangTayang,
      baruDiperbarui: data.baruDiperbarui,
      pagination:     data.pagination,
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { getHome };
