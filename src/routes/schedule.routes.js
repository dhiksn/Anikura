'use strict';

const { Router }      = require('express');
const { getSchedule } = require('../controllers/schedule.controller');

const router = Router();

/**
 * GET /api/schedule
 * Jadwal update anime dikelompokkan per hari.
 */
router.get('/', getSchedule);

module.exports = router;
