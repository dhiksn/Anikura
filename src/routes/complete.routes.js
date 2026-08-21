'use strict';

const { Router }      = require('express');
const { getComplete } = require('../controllers/complete.controller');

const router = Router();

/**
 * GET /api/complete?page=1
 * Daftar anime yang sudah selesai tayang.
 *
 * Query params:
 *   page {number} - halaman (opsional, default: 1)
 */
router.get('/', getComplete);

module.exports = router;
