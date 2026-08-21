'use strict';

const { Router }    = require('express');
const { getAuthor } = require('../controllers/author.controller');

const router = Router();

/**
 * GET /api/author/:slug?page=1
 * Daftar anime berdasarkan penulis/sutradara.
 *
 * Params:
 *   slug {string} - slug penulis (mis. makoto-shinkai, hayao-miyazaki)
 *
 * Query params:
 *   page {number} - halaman (opsional, default: 1)
 */
router.get('/:slug', getAuthor);

module.exports = router;
