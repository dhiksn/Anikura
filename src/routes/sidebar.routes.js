'use strict';

const { Router }     = require('express');
const { getSidebar } = require('../controllers/sidebar.controller');

const router = Router();

/**
 * GET /api/sidebar
 * Data sidebar halaman utama: link rekomendasi dan tipe karakter MC.
 */
router.get('/', getSidebar);

module.exports = router;
