/**
 * Server-side data fetching functions.
 * These call the backend API via the backend client.
 * Safe to import in Server Components and Next.js API Routes.
 *
 * For client-side use (Client Components / browser), use /api/* routes via fetch().
 */

import { backendAPI } from './backend-client';

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
  const data = await backendAPI.home(page);
  return { success: true, author: 'dhiksn', source: 'Animasu', ...data } as HomeData;
}

export async function getAnimeDetail(url: string) {
  const data = await backendAPI.detail(url);
  return { success: true, data, url };
}

export async function searchAnime(q: string, page = 1) {
  const result = await backendAPI.search(q, page);
  return { success: true, data: result.results, query: result.query, total: result.total, pagination: result.pagination };
}

export async function getGenres() {
  const data = await backendAPI.genre();
  return { success: true, data };
}

export async function getAnimeByGenre(slug: string, page = 1) {
  const result = await backendAPI.genreBySlug(slug, page);
  return { success: true, genre: result.genre, data: result.animeList, pagination: result.pagination };
}

export async function getOngoing(page = 1) {
  const data = await backendAPI.ongoing(page);
  return { success: true, data: data.animeList, total: data.total, pagination: data.pagination };
}

export async function getComplete(page = 1) {
  const data = await backendAPI.complete(page);
  return { success: true, data: data.animeList, total: data.total, pagination: data.pagination };
}

export async function getPopular(page = 1) {
  const data = await backendAPI.popular(page);
  return { success: true, data: data.animeList, total: data.total, pagination: data.pagination };
}

export async function getMovie(page = 1) {
  const data = await backendAPI.movie(page);
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
  const data = await backendAPI.animeList({ 
    genre: toArr(genre).length > 0 ? toArr(genre) : [], 
    karakter: toArr(karakter).length > 0 ? toArr(karakter) : [], 
    season: toArr(season).length > 0 ? toArr(season) : [], 
    status: status || '', 
    tipe: tipe || '', 
    urutan: urutan || '', 
    page 
  });
  return { success: true, data: data.animeList, pagination: data.pagination };
}

export async function getCharacters() {
  const data = await backendAPI.character();
  return { success: true, data };
}

export async function getAnimeByCharacter(slug: string, page = 1) {
  const result = await backendAPI.characterBySlug(slug, page);
  return { success: true, character: result.character, data: result.animeList, total: result.total, pagination: result.pagination };
}

export async function getAnimeByAuthor(slug: string, page = 1) {
  const result = await backendAPI.author(slug, page);
  return { success: true, author: result.author, data: result.animeList, pagination: result.pagination };
}

export async function getAnimeByStudio(slug: string, page = 1) {
  const result = await backendAPI.studio(slug, page);
  return { success: true, studio: result.studio, data: result.animeList, pagination: result.pagination };
}

export async function getSidebar() {
  const data = await backendAPI.sidebar();
  return { success: true, data };
}

export async function getDaftarAnime(params: { show?: string; page?: number } = {}) {
  const { show = '', page = 1 } = params;
  const data = await backendAPI.daftarAnime(show, page);
  return { success: true, data: data.animeList, filter: data.filter, letters: data.letters, stats: data.stats, pagination: data.pagination };
}

export async function getTimeline(page = 1) {
  const data = await backendAPI.timeline(page);
  return { success: true, data: data.animeList, pagination: data.pagination };
}

export async function getSchedule() {
  const data = await backendAPI.schedule();
  return { success: true, data: { schedule: data.schedule, total: data.total } };
}

export async function getEpisode(url: string) {
  const data = await backendAPI.episode(url);
  return { success: true, data };
}

// getStream is called client-side only (from VideoPlayer), keep it as a fetch call
export async function getStream(url: string) {
  const res = await fetch(`/api/stream?url=${encodeURIComponent(url)}`);
  return res.json();
}

export async function getSerial(slug: string, page = 1) {
  const data = await backendAPI.serial(slug, page);
  return { success: true, slug: data.slug, title: data.title, total: data.total, data: data.animeList, pagination: data.pagination };
}
