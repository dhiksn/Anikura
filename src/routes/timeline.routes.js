'use strict';

const { Router }      = require('express');
const { getTimeline } = require('../controllers/timeline.controller');

const router = Router();

/**
 * GET /api/timeline?page=1
 * Daftar anime diurutkan dari rilis terbaru hingga terlama.
 */
router.get('/', getTimeline);

module.exports = router;
