'use strict';

/**
 * Map dari error code ke HTTP status code.
 */
const ERROR_STATUS_MAP = {
  INVALID_PARAMETER: 400,
  SSRF_BLOCKED: 400,
  NOT_FOUND: 404,
  RATE_LIMITED: 429,
  TIMEOUT: 504,
  BAD_GATEWAY: 502,
  SERVER_ERROR: 500,
};

/**
 * Global error handler middleware untuk Express.
 * Harus didaftarkan setelah semua routes dengan 4 parameter (err, req, res, next).
 */
function errorHandler(err, req, res, next) { // eslint-disable-line no-unused-vars
  const isDev = process.env.NODE_ENV !== 'production';

  // Log error ke console (hanya di development atau untuk 5xx)
  const statusCode = err.statusCode || ERROR_STATUS_MAP[err.code] || 500;

  if (statusCode >= 500 || isDev) {
    console.error(`[ERROR] ${req.method} ${req.originalUrl} — ${err.message}`);
    if (isDev && err.stack) {
      console.error(err.stack);
    }
  }

  // Tentukan kode error
  const errorCode = err.code || (statusCode >= 500 ? 'SERVER_ERROR' : 'ERROR');

  // Tentukan pesan error (sembunyikan detail internal di production untuk 5xx)
  let message = err.message || 'Terjadi kesalahan pada server';
  if (!isDev && statusCode >= 500) {
    message = 'Terjadi kesalahan internal pada server';
  }

  return res.status(statusCode).json({
    success: false,
    error: {
      code: errorCode,
      message,
      // Hanya tampilkan stack trace di development
      ...(isDev && err.stack && { stack: err.stack.split('\n').slice(0, 5) }),
    },
  });
}

/**
 * Handler untuk route yang tidak ditemukan (404).
 */
function notFoundHandler(req, res) {
  return res.status(404).json({
    success: false,
    error: {
      code: 'ROUTE_NOT_FOUND',
      message: `Endpoint "${req.method} ${req.originalUrl}" tidak ditemukan`,
    },
  });
}

module.exports = { errorHandler, notFoundHandler };
