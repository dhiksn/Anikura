'use strict';

const { scrapeAnimeList } = require('../services/animelist.service');
const { validatePage }    = require('../utils/validator');

// Nilai valid untuk filter single-value
const VALID_STATUS = ['', 'upcoming', 'ongoing', 'completed'];
const VALID_TIPE   = ['', 'TV', 'Live Action', 'Movie', 'OVA', 'ONA', 'Special', 'Music', 'Drama Jepang', 'Drama China'];
const VALID_URUTAN = ['default', 'abjad', 'dari-z', 'update', 'publikasi', 'populer', 'baru', 'lama', 'rating', ''];

/**
 * GET /api/anime-list
 *
 * Query params (semua opsional):
 *   genre[]   - slug genre, bisa multiple
 *   karakter[] - slug karakter, bisa multiple
 *   season[]  - slug season, bisa multiple
 *   status    - upcoming | ongoing | completed
 *   tipe      - TV | Movie | OVA | ONA | Special | Music | Live Action | Drama Jepang | Drama China
 *   urutan    - baru | populer | rating | abjad | dari-z | update | publikasi | lama | default
 *   page      - halaman (default: 1)
 */
async function getAnimeList(req, res, next) {
  try {
    // ── Validasi page ────────────────────────────────────────────────────────
    const pageValidation = validatePage(req.query.page);
    if (!pageValidation.valid) {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_PARAMETER', message: pageValidation.message },
      });
    }

    // ── Ambil & validasi filter params ───────────────────────────────────────
    const genre    = req.query['genre[]']    || req.query.genre    || [];
    const karakter = req.query['karakter[]'] || req.query.karakter || [];
    const season   = req.query['season[]']   || req.query.season   || [];
    const status   = req.query.status   || '';
    const tipe     = req.query.tipe     || '';
    const urutan   = req.query.urutan   || '';

    if (status && !VALID_STATUS.includes(status)) {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_PARAMETER', message: `Status tidak valid. Pilihan: ${VALID_STATUS.filter(Boolean).join(', ')}` },
      });
    }

    if (tipe && !VALID_TIPE.includes(tipe)) {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_PARAMETER', message: `Tipe tidak valid. Pilihan: ${VALID_TIPE.filter(Boolean).join(', ')}` },
      });
    }

    if (!VALID_URUTAN.includes(urutan)) {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_PARAMETER', message: `Urutan tidak valid. Pilihan: ${VALID_URUTAN.filter(Boolean).join(', ')}` },
      });
    }

    const result = await scrapeAnimeList({
      genre,
      karakter,
      season,
      status,
      tipe,
      urutan,
      page: pageValidation.page,
    });

    if (!result.animeList.length) {
      return res.status(200).json({
        success:    true,
        source:     'Animasu',
        data:       [],
        pagination: result.pagination,
        message:    'Tidak ada anime yang sesuai dengan kriteria pencarian',
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

module.exports = { getAnimeList };
