'use strict';

const { scrapeAuthor } = require('../services/author.service');
const { validateSlug, validatePage } = require('../utils/validator');

/**
 * GET /api/author/:slug?page=1
 * Daftar anime berdasarkan penulis/sutradara.
 */
async function getAuthor(req, res, next) {
  try {
    const slugValidation = validateSlug(req.params.slug);
    if (!slugValidation.valid) {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_PARAMETER', message: slugValidation.message },
      });
    }

    const pageValidation = validatePage(req.query.page);
    if (!pageValidation.valid) {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_PARAMETER', message: pageValidation.message },
      });
    }

    const result = await scrapeAuthor(slugValidation.slug, pageValidation.page);

    if (!result.animeList.length) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: `Tidak ada anime ditemukan untuk penulis "${slugValidation.slug}"` },
      });
    }

    return res.status(200).json({
      success:    true,
      source:     'Animasu',
      author:     result.author,
      data:       result.animeList,
      pagination: result.pagination,
    });
  } catch (err) {
    if (err.code === 'NOT_FOUND') {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: err.message },
      });
    }
    next(err);
  }
}

module.exports = { getAuthor };
