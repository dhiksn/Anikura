'use strict';

require('dotenv').config();

const app = require('./src/app');

const PORT = parseInt(process.env.PORT, 10) || 3000;

// ─── Unhandled Rejection & Exception Guards ───────────────────────────────────
process.on('unhandledRejection', (reason, promise) => {
  console.error('[FATAL] Unhandled Promise Rejection:', reason);
  console.error('Promise:', promise);
  // Jangan crash server untuk unhandled rejection di production
  if (process.env.NODE_ENV !== 'production') {
    process.exit(1);
  }
});

process.on('uncaughtException', (err) => {
  console.error('[FATAL] Uncaught Exception:', err.message);
  console.error(err.stack);
  process.exit(1);
});

// ─── Start Server ─────────────────────────────────────────────────────────────
const server = app.listen(PORT, () => {
  console.log('');
  console.log('══════════════════════════════════════════');
  console.log('          ANIKURA REST API                ');
  console.log('══════════════════════════════════════════');
  console.log(`  Status  : Running                       `);
  console.log(`  URL     : http://localhost:${PORT}`.padEnd(44));
  console.log(`  Env     : ${(process.env.NODE_ENV || 'development').padEnd(31)}`);
  console.log(`  Source  : ${(process.env.BASE_URL || 'https://animasu.love').padEnd(31)}`);
  console.log('══════════════════════════════════════════');
  console.log('  Endpoints:                              ');
  console.log('  GET /api/home                           ');
  console.log('  GET /api/search?q=keyword               ');
  console.log('  GET /api/detail?url=...                 ');
  console.log('  GET /api/genre                          ');
  console.log('  GET /api/genre/:slug                    ');
  console.log('  GET /health                             ');
  console.log('══════════════════════════════════════════');
  console.log('');
});

// ─── Graceful Shutdown ────────────────────────────────────────────────────────
function gracefulShutdown(signal) {
  console.log(`\n[SERVER] Menerima sinyal ${signal}. Menutup server...`);
  server.close((err) => {
    if (err) {
      console.error('[SERVER] Error saat menutup server:', err.message);
      process.exit(1);
    }
    console.log('[SERVER] Server ditutup dengan bersih.');
    process.exit(0);
  });

  // Paksa shutdown setelah 10 detik jika tidak merespons
  setTimeout(() => {
    console.error('[SERVER] Forced shutdown setelah timeout.');
    process.exit(1);
  }, 10_000);
}

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT',  () => gracefulShutdown('SIGINT'));

module.exports = server;
