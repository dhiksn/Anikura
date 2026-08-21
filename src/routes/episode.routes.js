'use strict';

const { Router }     = require('express');
const { getEpisode } = require('../controllers/episode.controller');

const router = Router();

/**
 * GET /api/episode?url=https://animasu.love/nonton-...
 * Informasi halaman episode beserta daftar server streaming.
 *
 * Query params:
 *   url {string} - URL halaman episode (wajib, harus dari domain animasu.work)
 */
router.get('/', getEpisode);

module.exports = router;
