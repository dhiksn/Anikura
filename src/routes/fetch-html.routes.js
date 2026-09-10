'use strict';

const { Router } = require('express');
const { getFetchHtml } = require('../controllers/fetch-html.controller');

const router = Router();

/**
 * GET /api/fetch-html?url=
 * Internal relay — Vercel fetches HTML through this host instead of animasu.love.
 */
router.get('/', getFetchHtml);

module.exports = router;
