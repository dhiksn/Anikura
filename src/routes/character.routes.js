'use strict';

const { Router }                               = require('express');
const { getCharacterList, getCharacterAnime }  = require('../controllers/character.controller');

const router = Router();

/**
 * GET /api/character
 * Daftar semua tipe karakter.
 */
router.get('/', getCharacterList);

/**
 * GET /api/character/:slug?page=1
 * Daftar anime berdasarkan tipe karakter.
 *
 * Params:
 *   slug {string} - slug karakter (mis. overpower, tsundere, loli)
 *
 * Query params:
 *   page {number} - halaman (opsional, default: 1)
 */
router.get('/:slug', getCharacterAnime);

module.exports = router;
