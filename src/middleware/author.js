'use strict';

const AUTHOR = process.env.AUTHOR || '';

/**
 * Middleware yang meng-intercept res.json() untuk menyisipkan field `author`
 * ke semua response JSON secara otomatis.
 */
function authorMiddleware(req, res, next) {
  if (!AUTHOR) return next();

  const originalJson = res.json.bind(res);

  res.json = function (body) {
    if (body && typeof body === 'object' && !Array.isArray(body)) {
      // Sisipkan author di posisi kedua (setelah key pertama)
      const entries = Object.entries(body);
      const result  = {};
      if (entries.length > 0) {
        const [firstKey, firstVal] = entries[0];
        result[firstKey] = firstVal;
        result.author    = AUTHOR;
        for (let i = 1; i < entries.length; i++) {
          result[entries[i][0]] = entries[i][1];
        }
      } else {
        result.author = AUTHOR;
      }
      body = result;
    }
    return originalJson(body);
  };

  next();
}

module.exports = authorMiddleware;
