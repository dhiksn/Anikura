'use strict';

const { Router }    = require('express');
const { getStream } = require('../controllers/stream.controller');

const router = Router();

/**
 * GET /api/stream?url=https://vidhidepro.com/v/xxxxx
 * Extract URL HLS/MP4 dari server streaming.
 *
 * Query params:
 *   url {string} - URL halaman server streaming (wajib)
 */
router.get('/', getStream);

module.exports = router;
