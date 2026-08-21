'use strict';

const { Router } = require('express');
const { getGenreList, getGenreAnime } = require('../controllers/genre.controller');

const router = Router();

/**
 * GET /api/genre
 * Ambil daftar semua genre yang tersedia
 */
router.get('/', getGenreList);

/**
 * GET /api/genre/:slug?page=1
 * Ambil daftar anime berdasarkan genre
 *
 * Params:
 *   slug {string} - slug genre (mis. aksi, romance, comedy)
 *
 * Query params:
 *   page {number} - halaman hasil (opsional, default: 1)
 */
router.get('/:slug', getGenreAnime);

module.exports = router;
