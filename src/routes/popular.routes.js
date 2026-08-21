'use strict';

const { Router }    = require('express');
const { getPopular } = require('../controllers/popular.controller');

const router = Router();

/**
 * GET /api/popular?page=1
 * Daftar anime terpopuler.
 *
 * Query params:
 *   page {number} - halaman (opsional, default: 1)
 */
router.get('/', getPopular);

module.exports = router;
