'use strict';

const { scrapeSerial }  = require('../services/serial.service');
const { validateSlug, validatePage } = require('../utils/validator');

async function getSerial(req, res, next) {
  const slugVal = validateSlug(req.params.slug);
  if (!slugVal.valid) {
    return res.status(400).json({ success: false, error: { code: 'INVALID_PARAMETER', message: slugVal.message } });
  }

  const pageVal = validatePage(req.query.page);
  if (!pageVal.valid) {
    return res.status(400).json({ success: false, error: { code: 'INVALID_PARAMETER', message: pageVal.message } });
  }

  try {
    const data = await scrapeSerial(slugVal.slug, pageVal.page);
    return res.status(200).json({
      success: true,
      slug:    data.slug,
      title:   data.title,
      total:   data.total,
      data:    data.animeList,
      pagination: data.pagination,
    });
  } catch (err) {
    return next(err);
  }
}

module.exports = { getSerial };
