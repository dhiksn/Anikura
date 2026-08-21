/**
 * Server-side data fetching functions.
 * These call the scraper services directly — no HTTP round-trip.
 * Safe to import in Server Components and Next.js API Routes.
 *
 * For client-side use (Client Components / browser), use /api/* routes via fetch().
 */

// ─── Direct service imports ───────────────────────────────────────────────────
const { scrapeHome }         = require('@/lib/api-server/services/scraper.service');
const { scrapeDetail }       = require('@/lib/api-server/services/detail.service');
const { scrapeEpisode }      = require('@/lib/api-server/services/episode.service');
const { searchAnime: _search } = require('@/lib/api-server/services/search.service');
const { scrapeGenreList, scrapeGenreAnime } = require('@/lib/api-server/services/genre.service');
const { scrapeOngoing }      = require('@/lib/api-server/services/ongoing.service');
const { scrapeComplete }     = require('@/lib/api-server/services/complete.service');
const { scrapeMovie }        = require('@/lib/api-server/services/movie.service');
const { scrapePopular }      = require('@/lib/api-server/services/popular.service');
const { scrapeAnimeList }    = require('@/lib/api-server/services/animelist.service');
const { scrapeCharacterList, scrapeCharacterAnime } = require('@/lib/api-server/services/character.service');
const { scrapeAuthor }       = require('@/lib/api-server/services/author.service');
const { scrapeStudio }       = require('@/lib/api-server/services/studio.service');
const { scrapeSidebar }      = require('@/lib/api-server/services/sidebar.service');
const { scrapeDaftarAnime }  = require('@/lib/api-server/services/daftaranime.service');
const { scrapeTimeline }     = require('@/lib/api-server/services/timeline.service');
const { scrapeSchedule }     = require('@/lib/api-server/services/schedule.service');

// ─── Types ────────────────────────────────────────────────────────────────────

export interface AnimeBase {
  title: string;
  thumbnail: string;
  url: string;
  episode: string;
  status: string;
  type: string;
  rating: number;
}

export interface HomeData {
  success: boolean;
  author: string;
  source: string;
  sedangTayang: AnimeBase[];
  baruDiperbarui: AnimeBase[];
  pagination: {
    currentPage: number;
    hasPrevPage: boolean;
    hasNextPage: boolean;
    prevPage: number | null;
    nextPage: number | null;
  };
}

export interface DetailData {
  title: string;
  thumbnail: string;
  description: string;
  alternativeTitles: string[];
  genres: { name: string; slug: string; url: string }[];
  status: string;
  type: string;
  studios: string[];
  released: string;
  duration: string;
  season: string;
  network: string | null;
  episodes_count: string;
  rating: number;
  episodeList: { episode: string; title: string; url: string; date: string }[];
  related: { title: string; url: string; thumbnail: string }[];
}

// ─── Functions ────────────────────────────────────────────────────────────────

export async function getHomeData(page = 1): Promise<HomeData> {
  const data = await scrapeHome(page);
  return { success: true, author: 'dhiksn', source: 'Animasu', ...data } as HomeData;
}

export async function getAnimeDetail(url: string) {
  const data = await scrapeDetail(url);
  return { success: true, data, url };
}

export async function searchAnime(q: string, page = 1) {
  const result = await _search(q, page);
  return { success: true, data: result.results, query: result.query, total: result.results.length, pagination: result.pagination };
}

export async function getGenres() {
  const data = await scrapeGenreList();
  return { success: true, data };
}

export async function getAnimeByGenre(slug: string, page = 1) {
  const result = await scrapeGenreAnime(slug, page);
  return { success: true, genre: result.genre, data: result.animeList, pagination: result.pagination };
}

export async function getOngoing(page = 1) {
  const data = await scrapeOngoing(page);
  return { success: true, data: data.animeList, total: data.total, pagination: data.pagination };
}

export async function getComplete(page = 1) {
  const data = await scrapeComplete(page);
  return { success: true, data: data.animeList, total: data.total, pagination: data.pagination };
}

export async function getPopular(page = 1) {
  const data = await scrapePopular(page);
  return { success: true, data: data.animeList, total: data.total, pagination: data.pagination };
}

export async function getMovie(page = 1) {
  const data = await scrapeMovie(page);
  return { success: true, data: data.animeList, total: data.total, pagination: data.pagination };
}

export async function getAnimeList(params: {
  page?: number;
  genre?: string | string[];
  karakter?: string | string[];
  season?: string | string[];
  status?: string;
  tipe?: string;
  urutan?: string;
} = {}) {
  const { page = 1, genre, karakter, season, status, tipe, urutan = 'baru' } = params;
  const toArr = (v: string | string[] | undefined) => Array.isArray(v) ? v : v ? [v] : [];
  const data = await scrapeAnimeList({ genre: toArr(genre), karakter: toArr(karakter), season: toArr(season), status, tipe, urutan, page });
  return { success: true, data: data.animeList, pagination: data.pagination };
}

export async function getCharacters() {
  const data = await scrapeCharacterList();
  return { success: true, data };
}

export async function getAnimeByCharacter(slug: string, page = 1) {
  const result = await scrapeCharacterAnime(slug, page);
  return { success: true, character: result.character, data: result.animeList, total: result.total, pagination: result.pagination };
}

export async function getAnimeByAuthor(slug: string, page = 1) {
  const result = await scrapeAuthor(slug, page);
  return { success: true, author: result.author, data: result.animeList, pagination: result.pagination };
}

export async function getAnimeByStudio(slug: string, page = 1) {
  const result = await scrapeStudio(slug, page);
  return { success: true, studio: result.studio, data: result.animeList, pagination: result.pagination };
}

export async function getSidebar() {
  const data = await scrapeSidebar();
  return { success: true, data };
}

export async function getDaftarAnime(params: { show?: string; page?: number } = {}) {
  const { show = '', page = 1 } = params;
  const data = await scrapeDaftarAnime({ show, page });
  return { success: true, data: data.animeList, filter: data.filter, letters: data.letters, stats: data.stats, pagination: data.pagination };
}

export async function getTimeline(page = 1) {
  const data = await scrapeTimeline(page);
  return { success: true, data: data.animeList, pagination: data.pagination };
}

export async function getSchedule() {
  const data = await scrapeSchedule();
  return { success: true, data: { schedule: data.schedule, total: data.total } };
}

export async function getEpisode(url: string) {
  const data = await scrapeEpisode(url);
  return { success: true, data };
}

// getStream is called client-side only (from VideoPlayer), keep it as a fetch call
export async function getStream(url: string) {
  const res = await fetch(`/api/stream?url=${encodeURIComponent(url)}`);
  return res.json();
}
