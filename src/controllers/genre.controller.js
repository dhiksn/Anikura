'use strict';

const { scrapeGenreList, scrapeGenreAnime } = require('../services/genre.service');
const { validateSlug, validatePage } = require('../utils/validator');

/**
 * GET /api/genre
 * Ambil daftar semua genre yang tersedia.
 */
async function getGenreList(req, res, next) {
  try {
    const genres = await scrapeGenreList();

    if (!genres || genres.length === 0) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Daftar genre tidak dapat ditemukan',
        },
      });
    }

    return res.status(200).json({
      success: true,
      source: 'Animasu',
      data: genres,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/genre/:slug?page=1
 * Ambil daftar anime berdasarkan genre.
 *
 * Contoh: GET /api/genre/aksi?page=2
 */
async function getGenreAnime(req, res, next) {
  try {
    // ── Validasi slug ────────────────────────────────────────────────────────
    const slugValidation = validateSlug(req.params.slug);
    if (!slugValidation.valid) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_PARAMETER',
          message: slugValidation.message,
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

    const slug = slugValidation.slug;
    const page = pageValidation.page;

    const result = await scrapeGenreAnime(slug, page);

    if (!result.animeList || result.animeList.length === 0) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: `Tidak ada anime ditemukan untuk genre "${slug}" pada halaman ${page}`,
        },
      });
    }

    return res.status(200).json({
      success: true,
      source: 'Animasu',
      genre:  result.genre,
      data:   result.animeList,
      pagination: result.pagination,
    });
  } catch (err) {
    // Tangani error NOT_FOUND dari service
    if (err.code === 'NOT_FOUND') {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: err.message,
        },
      });
    }
    next(err);
  }
}

module.exports = { getGenreList, getGenreAnime };
