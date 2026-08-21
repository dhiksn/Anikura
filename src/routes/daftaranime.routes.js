'use strict';

const { Router }         = require('express');
const { getDaftarAnime } = require('../controllers/daftaranime.controller');

const router = Router();

/**
 * GET /api/daftar-anime?show=A&page=1
 * Daftar anime A-Z dari halaman /daftar-anime/
 *
 * Query params:
 *   show {string} - filter huruf awal A-Z atau # (opsional)
 *   page {number} - halaman (opsional, default: 1)
 */
router.get('/', getDaftarAnime);

module.exports = router;
