'use strict';

const { Router } = require('express');
const { getHome } = require('../controllers/home.controller');

const router = Router();

/**
 * GET /api/home
 * Mengambil data dari halaman utama animasu.work
 */
router.get('/', getHome);

module.exports = router;
