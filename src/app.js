'use strict';

require('dotenv').config();

const express = require('express');
const cors    = require('cors');

// Routes
const homeRoutes    = require('./routes/home.routes');
const searchRoutes  = require('./routes/search.routes');
const detailRoutes  = require('./routes/detail.routes');
const genreRoutes   = require('./routes/genre.routes');
const ongoingRoutes   = require('./routes/ongoing.routes');
const animeListRoutes = require('./routes/animelist.routes');
const completeRoutes  = require('./routes/complete.routes');
const movieRoutes     = require('./routes/movie.routes');
const popularRoutes    = require('./routes/popular.routes');
const characterRoutes  = require('./routes/character.routes');
const scheduleRoutes   = require('./routes/schedule.routes');
const authorRoutes     = require('./routes/author.routes');
const studioRoutes     = require('./routes/studio.routes');
const episodeRoutes    = require('./routes/episode.routes');
const streamRoutes     = require('./routes/stream.routes');
const sidebarRoutes    = require('./routes/sidebar.routes');
const daftarAnimeRoutes = require('./routes/daftaranime.routes');
const timelineRoutes    = require('./routes/timeline.routes');
const serialRoutes      = require('./routes/serial.routes');

// Middleware
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');
const authorMiddleware                  = require('./middleware/author');

const app = express();

// ─── CORS ─────────────────────────────────────────────────────────────────────
const corsOrigin  = process.env.CORS_ORIGIN || '*';
const corsOptions = {
  origin: corsOrigin === '*' ? '*' : corsOrigin.split(',').map((o) => o.trim()),
  methods: ['GET', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Accept'],
  optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));

// ─── Body Parser ──────────────────────────────────────────────────────────────
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: false, limit: '1mb' }));

// ─── Security Headers ─────────────────────────────────────────────────────────
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'no-referrer');
  res.removeHeader('X-Powered-By');
  next();
});

// ─── Request Logger (development only) ────────────────────────────────────────
if (process.env.NODE_ENV !== 'production') {
  app.use((req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
      const duration = Date.now() - start;
      console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl} → ${res.statusCode} (${duration}ms)`);
    });
    next();
  });
}

// ─── Author Injection — harus sebelum semua route ─────────────────────────────
app.use(authorMiddleware);

// ─── Health Check ─────────────────────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    service: 'anikura-api',
    timestamp: new Date().toISOString(),
    uptime: Math.floor(process.uptime()),
    environment: process.env.NODE_ENV || 'development',
  });
});

// ─── API Info ─────────────────────────────────────────────────────────────────
app.get('/api', (req, res) => {
  res.status(200).json({
    success: true,
    name:    'ANIKURA REST API',
    version: '1.0.0',
    source:  process.env.BASE_URL || 'https://animasu.love',
    endpoints: [
      { method: 'GET', path: '/api/home',          description: 'Daftar anime dari halaman utama' },
      { method: 'GET', path: '/api/ongoing?page=',    description: 'Daftar anime yang sedang tayang' },
      { method: 'GET', path: '/api/complete?page=',   description: 'Daftar anime yang sudah selesai tayang' },
      { method: 'GET', path: '/api/movie?page=',      description: 'Daftar anime movie' },
      { method: 'GET', path: '/api/popular?page=',    description: 'Daftar anime terpopuler' },
      { method: 'GET', path: '/api/character',        description: 'Daftar semua tipe karakter' },
      { method: 'GET', path: '/api/character/:slug',  description: 'Daftar anime berdasarkan tipe karakter' },
      { method: 'GET', path: '/api/schedule',          description: 'Jadwal update anime per hari' },
      { method: 'GET', path: '/api/author/:slug',       description: 'Daftar anime berdasarkan penulis/sutradara' },
      { method: 'GET', path: '/api/studio/:slug',       description: 'Daftar anime berdasarkan studio' },
      { method: 'GET', path: '/api/anime-list?page=', description: 'Daftar anime dengan filter (genre, karakter, season, status, tipe, urutan)' },
      { method: 'GET', path: '/api/filter-options',   description: 'Semua opsi filter untuk pencarian anime' },
      { method: 'GET', path: '/api/search?q=',     description: 'Cari anime berdasarkan keyword' },
      { method: 'GET', path: '/api/detail?url=',   description: 'Detail informasi anime' },
      { method: 'GET', path: '/api/episode?url=',  description: 'Informasi episode beserta server streaming' },
      { method: 'GET', path: '/api/stream?url=',   description: 'Extract URL HLS/MP4 dari server streaming (vidhidepro)' },
      { method: 'GET', path: '/api/sidebar',        description: 'Data sidebar: link rekomendasi dan tipe karakter MC' },
      { method: 'GET', path: '/api/daftar-anime',   description: 'Daftar anime A-Z (filter ?show=A, pagination)' },
      { method: 'GET', path: '/api/timeline',       description: 'Daftar anime dari rilis terbaru hingga terlama' },
      { method: 'GET', path: '/api/genre',         description: 'Daftar semua genre' },
      { method: 'GET', path: '/api/genre/:slug',   description: 'Daftar anime berdasarkan genre' },
    ],
  });
});

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use('/api/home',       homeRoutes);
app.use('/api/ongoing',    ongoingRoutes);
app.use('/api/complete',   completeRoutes);
app.use('/api/movie',      movieRoutes);
app.use('/api/popular',    popularRoutes);
app.use('/api/character',  characterRoutes);
app.use('/api/schedule',   scheduleRoutes);
app.use('/api/author',     authorRoutes);
app.use('/api/studio',     studioRoutes);
app.use('/api/episode',    episodeRoutes);
app.use('/api/stream',     streamRoutes);
app.use('/api/sidebar',     sidebarRoutes);
app.use('/api/daftar-anime', daftarAnimeRoutes);
app.use('/api/timeline',    timelineRoutes);
app.use('/api/anime-list', animeListRoutes);
app.use('/api/serial',     serialRoutes);

// ─── Filter Options (static, langsung dari data scraped) ─────────────────────
app.get('/api/filter-options', (req, res) => {
  res.status(200).json({
    success: true,
    source: 'Animasu',
    data: {
      genre: [
        { value: 'aksi', label: 'Aksi' }, { value: 'anak-anak', label: 'Anak-Anak' },
        { value: 'luar-angkasa', label: 'Antariksa' }, { value: 'avant-garde', label: 'Avant Garde' },
        { value: 'dementia', label: 'Dimensia' }, { value: 'donghua', label: 'Donghua' },
        { value: 'drama', label: 'Drama' }, { value: 'ecchi', label: 'Ecchi' },
        { value: 'fantasi', label: 'Fantasi' }, { value: 'fantasi-urban', label: 'Fantasi Urban' },
        { value: 'game', label: 'Game' }, { value: 'gourmet', label: 'Gourmet' },
        { value: 'harem', label: 'Harem' }, { value: 'horror', label: 'Horror' },
        { value: 'iblis', label: 'Iblis' }, { value: 'isekai', label: 'Isekai' },
        { value: 'josei', label: 'Josei' }, { value: 'suspense', label: 'Ketegangan' },
        { value: 'komedi', label: 'Komedi' }, { value: 'live-action', label: 'Live Action' },
        { value: 'makanan', label: 'Makanan' }, { value: 'martial-arts', label: 'Martial Arts' },
        { value: 'medical', label: 'Medis' }, { value: 'militer', label: 'Militer' },
        { value: 'misteri', label: 'Misteri' }, { value: 'mitologi', label: 'Mitologi' },
        { value: 'mobil', label: 'Mobil' }, { value: 'musik', label: 'Musik' },
        { value: 'olahraga', label: 'Olahraga' }, { value: 'parodi', label: 'Parodi' },
        { value: 'perang', label: 'Perang' }, { value: 'petualangan', label: 'Petualangan' },
        { value: 'polisi', label: 'Polisi' }, { value: 'politik', label: 'Politik' },
        { value: 'psikologis', label: 'Psikologis' }, { value: 'reincarnation', label: 'Reinkarnasi' },
        { value: 'mecha', label: 'Robot' }, { value: 'romansa', label: 'Romansa' },
        { value: 'samurai', label: 'Samurai' }, { value: 'sci-fi', label: 'Sci-Fi' },
        { value: 'seinen', label: 'Seinen' }, { value: 'sejarah', label: 'Sejarah' },
        { value: 'sekolahan', label: 'Sekolahan' }, { value: 'shoujo', label: 'Shoujo' },
        { value: 'shoujo-ai', label: 'Shoujo Ai' }, { value: 'shounen', label: 'Shounen' },
        { value: 'shounen-ai', label: 'Shounen Ai' }, { value: 'sihir', label: 'Sihir' },
        { value: 'slice-of-life', label: 'Slice of Life' }, { value: 'super-power', label: 'Super Power' },
        { value: 'supranatural', label: 'Supranatural' }, { value: 'thriller', label: 'Thriller' },
        { value: 'time-travel', label: 'Time Travel' }, { value: 'vampir', label: 'Vampir' },
        { value: 'wuxia', label: 'Wuxia' }, { value: 'yaoi', label: 'Yaoi' },
      ],
      karakter: [
        { value: 'ambisius', label: 'Ambisi' }, { value: 'anak-anak', label: 'Anak-Anak' },
        { value: 'anti-sosial', label: 'Anti-Sosial' }, { value: 'badass', label: 'Badass' },
        { value: 'berbisnis', label: 'Berbisnis' }, { value: 'berisik', label: 'Berisik' },
        { value: 'berjuang', label: 'Berjuang' }, { value: 'beruntung', label: 'Beruntung' },
        { value: 'blakblakan', label: 'Blakblakan' }, { value: 'bounty-hunter', label: 'Bounty Hunter' },
        { value: 'cerewet', label: 'Cerewet' }, { value: 'ceria', label: 'Ceria' },
        { value: 'ceroboh', label: 'Ceroboh' }, { value: 'perempuan', label: 'Cewek' },
        { value: 'couple', label: 'Couple' }, { value: 'laki-laki', label: 'Cowok' },
        { value: 'dewa', label: 'Dewa' }, { value: 'dikagumi', label: 'Dikagumi' },
        { value: 'disepelekan', label: 'Disepelekan' }, { value: 'ditakuti', label: 'Ditakuti' },
        { value: 'iblis', label: 'Iblis' }, { value: 'jenius', label: 'Jenius' },
        { value: 'kejam', label: 'Kejam' }, { value: 'legenda', label: 'Legenda' },
        { value: 'licik', label: 'Licik' }, { value: 'loli', label: 'Loli' },
        { value: 'mencolok', label: 'Mencolok' }, { value: 'menyebalkan', label: 'Menyebalkan' },
        { value: 'mesum', label: 'Mesum' }, { value: 'monster', label: 'Monster' },
        { value: 'narsis', label: 'Narsis' }, { value: 'optimis', label: 'Optimis' },
        { value: 'overpower', label: 'Overpower' }, { value: 'pemalas', label: 'Pemalas' },
        { value: 'pemalu', label: 'Pemalu' }, { value: 'pemarah', label: 'Pemarah' },
        { value: 'pemimpin', label: 'Pemimpin' }, { value: 'penakut', label: 'Penakut' },
        { value: 'pendendam', label: 'Pendendam' }, { value: 'pendiam', label: 'Pendiam' },
        { value: 'pesimis', label: 'Pesimis' }, { value: 'polos', label: 'Polos' },
        { value: 'semangat', label: 'Semangat' }, { value: 'setia', label: 'Setia' },
        { value: 'slengekan', label: 'Slengekan' }, { value: 'sopan', label: 'Sopan' },
        { value: 'suram', label: 'Suram' }, { value: 'terkutuk', label: 'Terkutuk' },
        { value: 'totalitas', label: 'Totalitas' }, { value: 'tsundere', label: 'Tsundere' },
        { value: 'vampir', label: 'Vampir' }, { value: 'yandere', label: 'Yandere' },
        { value: 'zero-to-hero', label: 'Zero To Hero' },
      ],
      status: [
        { value: '', label: 'Semua' },
        { value: 'upcoming', label: 'Segera Tayang' },
        { value: 'ongoing', label: 'Sedang Tayang' },
        { value: 'completed', label: 'Selesai Tayang' },
      ],
      tipe: [
        { value: '', label: 'Semua' },
        { value: 'TV', label: 'Serial TV' },
        { value: 'Live Action', label: 'Live Action' },
        { value: 'Movie', label: 'Movie' },
        { value: 'OVA', label: 'OVA' },
        { value: 'ONA', label: 'ONA' },
        { value: 'Special', label: 'Spesial' },
        { value: 'Music', label: 'Musik' },
        { value: 'Drama Jepang', label: 'Drama Jepang' },
        { value: 'Drama China', label: 'Drama China' },
      ],
      urutan: [
        { value: 'baru', label: 'Rilis Terbaru' },
        { value: 'lama', label: 'Rilis Terlawas' },
        { value: 'update', label: 'Baru Diupdate' },
        { value: 'publikasi', label: 'Baru Ditambah' },
        { value: 'populer', label: 'Terpopuler' },
        { value: 'rating', label: 'Rating' },
        { value: 'abjad', label: 'Judul A→Z' },
        { value: 'dari-z', label: 'Judul Z→A' },
        { value: 'default', label: 'Standar' },
      ],
    },
  });
});
app.use('/api/search',     searchRoutes);
app.use('/api/detail',     detailRoutes);
app.use('/api/genre',      genreRoutes);

// ─── 404 Handler ──────────────────────────────────────────────────────────────
app.use(notFoundHandler);

// ─── Global Error Handler ─────────────────────────────────────────────────────
app.use(errorHandler);

module.exports = app;
