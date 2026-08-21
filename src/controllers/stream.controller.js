'use strict';

const { extractStreamUrl } = require('../services/stream.service');

const SUPPORTED_HOSTS = ['vidhidepro.com', 'vidhide.com'];

/**
 * GET /api/stream?url=https://vidhidepro.com/v/xxxxx
 * Extract URL HLS/MP4 dari server streaming.
 * Saat ini support: vidhidepro
 */
async function getStream(req, res, next) {
  try {
    const { url } = req.query;

    if (!url || typeof url !== 'string') {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_PARAMETER', message: 'Parameter "url" wajib diisi' },
      });
    }

    let parsed;
    try {
      parsed = new URL(url);
    } catch {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_PARAMETER', message: 'Format URL tidak valid' },
      });
    }

    const host = parsed.hostname.toLowerCase();
    const isSupported = SUPPORTED_HOSTS.some(h => host.includes(h));
    if (!isSupported) {
      return res.status(400).json({
        success: false,
        error: {
          code:    'UNSUPPORTED_PROVIDER',
          message: `Provider "${host}" belum didukung. Provider yang didukung: ${SUPPORTED_HOSTS.join(', ')}`,
        },
      });
    }

    const result = await extractStreamUrl(url);

    const hasStreams = result.streams.hls.length > 0 || result.streams.mp4.length > 0;
    if (!hasStreams) {
      return res.status(404).json({
        success: false,
        error: {
          code:    'NOT_FOUND',
          message: 'URL stream tidak ditemukan pada halaman tersebut',
        },
      });
    }

    return res.status(200).json({
      success:  true,
      source:   'Animasu',
      provider: result.provider,
      url:      result.sourceUrl,
      streams:  result.streams,
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { getStream };
