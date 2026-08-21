'use strict';

const { Router }        = require('express');
const { getAnimeList }  = require('../controllers/animelist.controller');

const router = Router();

/**
 * GET /api/anime-list?page=1
 * Daftar anime diurutkan dari yang terbaru.
 *
 * Query params:
 *   page {number} - halaman (opsional, default: 1)
 */
router.get('/', getAnimeList);

module.exports = router;
