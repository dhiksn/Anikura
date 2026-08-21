# ANIKURA REST API

<p align="center">
  <img src="client/public/web-app-manifest-192x192.png" alt="ANIKURA Logo" width="96" height="96" />
</p>

<p align="center">
  REST API untuk mengambil dan menyajikan data anime dari <a href="https://animasu.love">animasu.love</a> menggunakan Node.js, Express, Axios, dan Cheerio.
</p>

## Teknologi

- **Node.js** >= 18
- **Express.js** — framework HTTP
- **Axios** — HTTP client dengan retry otomatis
- **Cheerio** — HTML parser (jQuery-style)
- **node-cache** — in-memory caching
- **axios-retry** — retry otomatis untuk request gagal
- **dotenv** — konfigurasi environment
- **cors** — Cross-Origin Resource Sharing

## Instalasi

```bash
# Clone atau masuk ke direktori project
cd anikura-api

# Install dependencies
npm install

# Salin file environment
copy .env.example .env

# Jalankan server (development)
npm run dev

# Jalankan server (production)
npm start
```

## Konfigurasi `.env`

```env
PORT=3000
NODE_ENV=development
BASE_URL=https://animasu.love
CORS_ORIGIN=*
REQUEST_TIMEOUT=15000
CACHE_TTL=300
CACHE_MAX_KEYS=500
MAX_RETRIES=3
RETRY_DELAY=1000
```

| Variable         | Default                    | Keterangan                              |
|------------------|----------------------------|-----------------------------------------|
| `PORT`           | `3000`                     | Port server                             |
| `NODE_ENV`       | `development`              | Environment (`development`/`production`)|
| `BASE_URL`       | `https://animasu.love`  | URL target website                      |
| `CORS_ORIGIN`    | `*`                        | Allowed origin, pisahkan dengan koma    |
| `REQUEST_TIMEOUT`| `15000`                    | Timeout request (ms)                    |
| `CACHE_TTL`      | `300`                      | Durasi cache (detik)                    |
| `CACHE_MAX_KEYS` | `500`                      | Maksimal item dalam cache               |
| `MAX_RETRIES`    | `3`                        | Maksimal retry jika request gagal       |
| `RETRY_DELAY`    | `1000`                     | Delay antar retry (ms)                  |

## Struktur Project

```
anikura-api/
├── src/
│   ├── controllers/
│   │   ├── home.controller.js
│   │   ├── search.controller.js
│   │   ├── detail.controller.js
│   │   └── genre.controller.js
│   ├── routes/
│   │   ├── home.routes.js
│   │   ├── search.routes.js
│   │   ├── detail.routes.js
│   │   └── genre.routes.js
│   ├── services/
│   │   ├── scraper.service.js
│   │   ├── search.service.js
│   │   ├── detail.service.js
│   │   └── genre.service.js
│   ├── utils/
│   │   ├── http.js
│   │   ├── parser.js
│   │   └── validator.js
│   ├── middleware/
│   │   └── errorHandler.js
│   └── app.js
├── server.js
├── .env
├── .env.example
├── package.json
└── README.md
```

## Endpoints

### `GET /health`

Health check server.

```json
{
  "status": "ok",
  "author": "dhiksn",
  "service": "anikura-api",
  "timestamp": "2025-01-01T00:00:00.000Z",
  "uptime": 120,
  "environment": "development"
}
```

---

### `GET /api`

Informasi endpoint yang tersedia.

---

### `GET /api/home`

Mengambil data dari halaman utama animasu.work.

**Response:**
```json
{
  "success": true,
  "author": "dhiksn",
  "source": "ANIKURA",
  "data": [
    {
      "title": "Yani Neko",
      "thumbnail": "https://...",
      "url": "https://animasu.love/anime/yani-neko/",
      "episode": "Ep 3",
      "status": "Ongoing",
      "type": "TV",
      "rating": 7.03
    }
  ],
  "sections": {
    "latestUpdates": { "total": 12, "data": [...] },
    "ongoing":       { "total": 6,  "data": [...] },
    "completed":     { "total": 4,  "data": [...] }
  }
}
```

---

### `GET /api/search?q=keyword&page=1`

Cari anime berdasarkan keyword.

**Query Parameters:**

| Parameter | Tipe   | Wajib | Keterangan                       |
|-----------|--------|-------|----------------------------------|
| `q`       | string | Ya    | Keyword pencarian (min 2 karakter)|
| `page`    | number | Tidak | Halaman hasil (default: 1)       |

**Contoh:**
```
GET /api/search?q=naruto
GET /api/search?q=one+piece&page=2
```

**Response:**
```json
{
  "success": true,
  "author": "dhiksn",
  "source": "ANIKURA",
  "query": "naruto",
  "total": 10,
  "data": [
    {
      "title": "Naruto",
      "thumbnail": "https://...",
      "url": "https://animasu.love/anime/naruto/",
      "episode": "220",
      "status": "Completed",
      "type": "TV",
      "rating": 8.5
    }
  ],
  "pagination": {
    "currentPage": 1,
    "hasNextPage": true,
    "hasPrevPage": false,
    "nextPage": "https://...",
    "prevPage": null,
    "totalPages": 3
  }
}
```

**Error (query kosong):**
```json
{
  "success": false,
  "author": "dhiksn",
  "error": {
    "code": "INVALID_PARAMETER",
    "message": "Parameter \"q\" wajib diisi"
  }
}
```

---

### `GET /api/detail?url=`

Mengambil informasi detail dari halaman anime.

**Query Parameters:**

| Parameter | Tipe   | Wajib | Keterangan                                     |
|-----------|--------|-------|------------------------------------------------|
| `url`     | string | Ya    | URL halaman anime (harus dari domain animasu.work) |

**Contoh:**
```
GET /api/detail?url=https://animasu.love/anime/yani-neko/
```

**Response:**
```json
{
  "success": true,
  "author": "dhiksn",
  "source": "ANIKURA",
  "url": "https://animasu.love/anime/yani-neko/",
  "data": {
    "title": "Yani Neko",
    "thumbnail": "https://...",
    "description": "Yani adalah seorang gadis kucing...",
    "alternativeTitles": ["Chainsmoker Cat"],
    "genres": [
      { "name": "Comedy", "slug": "comedy", "url": "https://..." }
    ],
    "status": "Ongoing",
    "type": "TV",
    "studios": ["Studio Name"],
    "released": "2024",
    "duration": "5 min",
    "season": "Spring 2024",
    "network": null,
    "episodes_count": "12",
    "rating": 7.03,
    "episodeList": [
      {
        "episode": "3",
        "title": "Episode 3",
        "url": "https://...",
        "date": "2024-01-15"
      }
    ],
    "related": [
      {
        "title": "Anime Terkait",
        "url": "https://...",
        "thumbnail": "https://..."
      }
    ]
  }
}
```

**Error (URL tidak valid):**
```json
{
  "success": false,
  "author": "dhiksn",
  "error": {
    "code": "INVALID_PARAMETER",
    "message": "URL harus berasal dari domain: animasu.love, animasu.work"
  }
}
```

---

### `GET /api/genre`

Mengambil daftar semua genre yang tersedia.

**Response:**
```json
{
  "success": true,
  "author": "dhiksn",
  "source": "ANIKURA",
  "data": [
    { "name": "Aksi", "slug": "aksi", "url": "https://animasu.love/genre/aksi/" },
    { "name": "Romance", "slug": "romance", "url": "https://animasu.love/genre/romance/" }
  ]
}
```

---

### `GET /api/genre/:slug?page=1`

Mengambil daftar anime berdasarkan genre dengan pagination.

**Path Parameters:**

| Parameter | Tipe   | Keterangan                           |
|-----------|--------|--------------------------------------|
| `slug`    | string | Slug genre (mis. `aksi`, `romance`)  |

**Query Parameters:**

| Parameter | Tipe   | Wajib | Keterangan                 |
|-----------|--------|-------|----------------------------|
| `page`    | number | Tidak | Halaman hasil (default: 1) |

**Contoh:**
```
GET /api/genre/aksi
GET /api/genre/romance?page=2
```

**Response:**
```json
{
  "success": true,
  "author": "dhiksn",
  "source": "ANIKURA",
  "genre": {
    "name": "Aksi",
    "slug": "aksi",
    "url": "https://animasu.love/genre/aksi/"
  },
  "data": [
    {
      "title": "Attack on Titan",
      "thumbnail": "https://...",
      "url": "https://animasu.love/anime/attack-on-titan/",
      "episode": "87",
      "status": "Completed",
      "type": "TV",
      "rating": 9.0
    }
  ],
  "pagination": {
    "currentPage": 1,
    "hasNextPage": true,
    "hasPrevPage": false,
    "nextPage": "https://...",
    "prevPage": null,
    "totalPages": 5
  }
}
```

---

## Format Error Response

Semua error menggunakan format konsisten:

```json
{
  "success": false,
  "author": "dhiksn",
  "error": {
    "code": "ERROR_CODE",
    "message": "Pesan error yang deskriptif"
  }
}
```

| HTTP Status | Error Code          | Keterangan                         |
|-------------|---------------------|------------------------------------|
| `400`       | `INVALID_PARAMETER` | Parameter tidak valid atau kosong  |
| `400`       | `SSRF_BLOCKED`      | URL mencoba akses resource internal|
| `404`       | `NOT_FOUND`         | Data atau route tidak ditemukan    |
| `404`       | `ROUTE_NOT_FOUND`   | Endpoint tidak tersedia            |
| `429`       | `RATE_LIMITED`      | Target website membatasi request   |
| `500`       | `SERVER_ERROR`      | Kesalahan internal server          |
| `502`       | `BAD_GATEWAY`       | Gagal menghubungi target website   |
| `504`       | `TIMEOUT`           | Request timeout                    |

## Fitur Keamanan

- **CORS** — konfigurasi origin via `.env`
- **SSRF Protection** — memblokir akses ke IP internal/localhost
- **URL Validation** — hanya menerima URL dari domain animasu.work
- **Security Headers** — `X-Content-Type-Options`, `X-Frame-Options`, dll.
- **Request Timeout** — mencegah hanging request
- **No Stack Trace** — stack trace disembunyikan di production
- **Input Sanitization** — validasi dan sanitasi semua input user

## Caching

Data di-cache secara in-memory menggunakan `node-cache`:
- Default TTL: **5 menit** (300 detik)
- Maksimal keys: **500**
- Cache key berdasarkan URL + query parameters
- Cache otomatis ter-expire sesuai TTL

## Development

```bash
# Jalankan dengan auto-reload
npm run dev

# Jalankan production
npm start
```

**Test endpoint manual:**
```bash
# Health check
curl http://localhost:3000/health

# Home
curl http://localhost:3000/api/home

# Search
curl "http://localhost:3000/api/search?q=naruto"

# Detail
curl "http://localhost:3000/api/detail?url=https://animasu.love/anime/yani-neko/"

# Genre list
curl http://localhost:3000/api/genre

# Genre anime
curl "http://localhost:3000/api/genre/aksi?page=1"
```

## Catatan

- Scraper menggunakan HTTP request biasa + Cheerio (tanpa headless browser).
- Karena website menggunakan JavaScript rendering, sebagian data mungkin terbatas tergantung konten yang tersedia di HTML awal.
- Gunakan caching untuk mengurangi beban request ke target website.
- Patuhi terms of service website target dan jangan lakukan request berlebihan.
