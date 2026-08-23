'use strict';
const express = require('express');
const router  = express.Router();
const { getSerial } = require('../controllers/serial.controller');

router.get('/:slug', getSerial);

module.exports = router;
