'use strict';

const { Router }    = require('express');
const { getStudio } = require('../controllers/studio.controller');

const router = Router();

/**
 * GET /api/studio/:slug?page=1
 * Daftar anime berdasarkan studio.
 *
 * Params:
 *   slug {string} - slug studio (mis. netflix, mappa, bones)
 *
 * Query params:
 *   page {number} - halaman (opsional, default: 1)
 */
router.get('/:slug', getStudio);

module.exports = router;
