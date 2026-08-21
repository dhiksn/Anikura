'use strict';

const { Router }       = require('express');
const { getAnimeBaru } = require('../controllers/animelist.controller');

const router = Router();

/**
 * GET /api/anime-baru?page=1
 * Daftar anime terbaru diurutkan dari yang paling baru ditambahkan.
 *
 * Query params:
 *   page {number} - halaman (opsional, default: 1)
 */
router.get('/', getAnimeBaru);

module.exports = router;
