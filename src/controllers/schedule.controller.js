'use strict';

const { scrapeSchedule } = require('../services/schedule.service');

/**
 * GET /api/schedule
 * Jadwal update anime dikelompokkan per hari.
 */
async function getSchedule(req, res, next) {
  try {
    const result = await scrapeSchedule();

    if (!result.total) {
      return res.status(404).json({
        success: false,
        error: {
          code:    'NOT_FOUND',
          message: 'Data jadwal tidak dapat ditemukan',
        },
      });
    }

    return res.status(200).json({
      success:  true,
      source:   'Animasu',
      schedule: result.schedule,
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { getSchedule };
