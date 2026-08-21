import axios from "axios";

// Use relative /api path so the same URL works in both dev and Vercel deployment.
// NEXT_PUBLIC_API_URL can override for an external backend if needed.
export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "/api",
});

// Types based on the README
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

export async function getHomeData(page = 1): Promise<HomeData> {
  const res = await api.get<HomeData>("/home", { params: page > 1 ? { page } : undefined });
  return res.data;
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

export async function getAnimeDetail(url: string) {
  const res = await api.get<{ success: boolean; data: DetailData; url: string }>(`/detail`, {
    params: { url }
  });
  return res.data;
}

export async function searchAnime(q: string, page = 1) {
  const res = await api.get(`/search`, { params: { q, page } });
  return res.data;
}

export async function getGenres() {
  const res = await api.get(`/genre`);
  return res.data;
}

export async function getAnimeByGenre(slug: string, page = 1) {
  const res = await api.get(`/genre/${slug}`, { params: { page } });
  return res.data;
}

export async function getOngoing(page = 1) {
  const res = await api.get(`/ongoing`, { params: { page } });
  return res.data;
}

export async function getComplete(page = 1) {
  const res = await api.get(`/complete`, { params: { page } });
  return res.data;
}

export async function getPopular(page = 1) {
  const res = await api.get(`/popular`, { params: { page } });
  return res.data;
}

export async function getMovie(page = 1) {
  const res = await api.get(`/movie`, { params: { page } });
  return res.data;
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
  const { page = 1, genre, karakter, season, status, tipe, urutan = "baru" } = params;

  const query = new URLSearchParams();
  if (page > 1) query.set("page", String(page));
  if (status)  query.set("status", status);
  if (tipe)    query.set("tipe", tipe);
  if (urutan)  query.set("urutan", urutan);

  const toArr = (v: string | string[] | undefined) => Array.isArray(v) ? v : v ? [v] : [];
  toArr(genre).forEach((g)    => query.append("genre[]", g));
  toArr(karakter).forEach((k) => query.append("karakter[]", k));
  toArr(season).forEach((s)   => query.append("season[]", s));

  const res = await api.get(`/anime-list?${query.toString()}`);
  return res.data;
}

export async function getCharacters() {
  const res = await api.get(`/character`);
  return res.data;
}

export async function getAnimeByCharacter(slug: string, page = 1) {
  const res = await api.get(`/character/${slug}`, { params: { page } });
  return res.data;
}

export async function getAnimeByAuthor(slug: string, page = 1) {
  const res = await api.get(`/author/${slug}`, { params: { page } });
  return res.data;
}

export async function getAnimeByStudio(slug: string, page = 1) {
  const res = await api.get(`/studio/${slug}`, { params: { page } });
  return res.data;
}

export async function getSidebar() {
  const res = await api.get(`/sidebar`);
  return res.data;
}

export async function getDaftarAnime(params: {
  show?: string;
  page?: number;
} = {}) {
  const { show, page = 1 } = params;
  const query = new URLSearchParams();
  if (show) query.set("show", show);
  if (page > 1) query.set("page", String(page));
  const res = await api.get(`/daftar-anime?${query.toString()}`);
  return res.data;
}

export async function getTimeline(page = 1) {
  const res = await api.get(`/timeline`, { params: { page } });
  return res.data;
}

export async function getSchedule() {
  const res = await api.get(`/schedule`);
  return res.data;
}

export async function getEpisode(url: string) {
  const res = await api.get(`/episode`, { params: { url } });
  return res.data;
}

export async function getStream(url: string) {
  const res = await api.get(`/stream`, { params: { url } });
  return res.data;
}
