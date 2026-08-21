'use strict';

const { scrapeCharacterList, scrapeCharacterAnime } = require('../services/character.service');
const { validateSlug, validatePage }                = require('../utils/validator');

/**
 * GET /api/character
 * Daftar semua tipe karakter yang tersedia.
 */
async function getCharacterList(req, res, next) {
  try {
    const characters = await scrapeCharacterList();

    if (!characters.length) {
      return res.status(404).json({
        success: false,
        error: {
          code:    'NOT_FOUND',
          message: 'Daftar tipe karakter tidak dapat ditemukan',
        },
      });
    }

    return res.status(200).json({
      success: true,
      source:  'Animasu',
      data:    characters,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/character/:slug?page=1
 * Daftar anime berdasarkan tipe karakter.
 */
async function getCharacterAnime(req, res, next) {
  try {
    const slugValidation = validateSlug(req.params.slug);
    if (!slugValidation.valid) {
      return res.status(400).json({
        success: false,
        error: {
          code:    'INVALID_PARAMETER',
          message: slugValidation.message,
        },
      });
    }

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

    const result = await scrapeCharacterAnime(slugValidation.slug, pageValidation.page);

    if (!result.animeList.length) {
      return res.status(404).json({
        success: false,
        error: {
          code:    'NOT_FOUND',
          message: `Tidak ada anime ditemukan untuk tipe karakter "${slugValidation.slug}"`,
        },
      });
    }

    return res.status(200).json({
      success:    true,
      source:     'Animasu',
      character:  result.character,
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

module.exports = { getCharacterList, getCharacterAnime };
