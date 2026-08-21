'use strict';

const { Router } = require('express');
const { getDetail } = require('../controllers/detail.controller');

const router = Router();

/**
 * GET /api/detail?url=https://animasu.love/anime/...
 * Mengambil informasi detail dari halaman anime
 *
 * Query params:
 *   url {string} - URL halaman detail anime (wajib, harus dari domain animasu.work)
 */
router.get('/', getDetail);

module.exports = router;
