'use strict';

const { Router }   = require('express');
const { getMovie } = require('../controllers/movie.controller');

const router = Router();

/**
 * GET /api/movie?page=1
 * Daftar anime movie.
 *
 * Query params:
 *   page {number} - halaman (opsional, default: 1)
 */
router.get('/', getMovie);

module.exports = router;
