'use strict';

const { Router } = require('express');
const { search } = require('../controllers/search.controller');

const router = Router();

/**
 * GET /api/search?q=keyword&page=1
 * Cari anime berdasarkan keyword
 *
 * Query params:
 *   q    {string} - keyword pencarian (wajib, min 2 karakter)
 *   page {number} - halaman hasil (opsional, default: 1)
 */
router.get('/', search);

module.exports = router;
