'use strict';

const { Router }     = require('express');
const { getOngoing } = require('../controllers/ongoing.controller');

const router = Router();

/**
 * GET /api/ongoing?page=1
 * Daftar anime yang sedang tayang (ongoing) dengan pagination.
 *
 * Query params:
 *   page {number} - halaman (opsional, default: 1)
 */
router.get('/', getOngoing);

module.exports = router;
