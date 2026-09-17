/**
 * Client for calling the external backend API (server-side only).
 *
 * Uses API_URL (non-public, server-only) for Server Components and API Routes.
 * Falls back to NEXT_PUBLIC_API_URL for local dev compatibility.
 * Never exposes the backend URL to the browser bundle.
 */

// API_URL is read only on the server — not prefixed with NEXT_PUBLIC_ so it
// is never bundled into the client. NEXT_PUBLIC_API_URL is the dev fallback.
const API_URL =
  process.env.API_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  'http://localhost:3000';

async function fetchAPI(endpoint: string, options: RequestInit = {}) {
  const url = `${API_URL}${endpoint}`;
  const response = await fetch(url, {
    ...options,
    // Never cache backend responses at the fetch layer
    cache: 'no-store',
    // Give enough time for ScraperAPI to respond (can take 30-60s)
    signal: AbortSignal.timeout(65000),
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    let message = `${response.status} ${response.statusText}`;
    try {
      const body = await response.json();
      message = body?.error?.message || body?.message || message;
    } catch {
      // ignore parse error
    }
    const err = new Error(message) as Error & { statusCode: number; code: string };
    err.statusCode = response.status;
    err.code = response.status === 404 ? 'NOT_FOUND' : 'BAD_GATEWAY';
    throw err;
  }

  return response.json();
}

export const backendAPI = {
  home:            (page = 1)                      => fetchAPI(`/api/home?page=${page}`),
  search:          (q: string, page = 1)           => fetchAPI(`/api/search?q=${encodeURIComponent(q)}&page=${page}`),
  detail:          (url: string)                   => fetchAPI(`/api/detail?url=${encodeURIComponent(url)}`),
  episode:         (url: string)                   => fetchAPI(`/api/episode?url=${encodeURIComponent(url)}`),
  stream:          (url: string)                   => fetchAPI(`/api/stream?url=${encodeURIComponent(url)}`),
  genre:           ()                              => fetchAPI('/api/genre'),
  genreBySlug:     (slug: string, page = 1)        => fetchAPI(`/api/genre/${slug}?page=${page}`),
  ongoing:         (page = 1)                      => fetchAPI(`/api/ongoing?page=${page}`),
  complete:        (page = 1)                      => fetchAPI(`/api/complete?page=${page}`),
  movie:           (page = 1)                      => fetchAPI(`/api/movie?page=${page}`),
  popular:         (page = 1)                      => fetchAPI(`/api/popular?page=${page}`),
  character:       ()                              => fetchAPI('/api/character'),
  characterBySlug: (slug: string, page = 1)        => fetchAPI(`/api/character/${slug}?page=${page}`),
  schedule:        ()                              => fetchAPI('/api/schedule'),
  author:          (slug: string, page = 1)        => fetchAPI(`/api/author/${slug}?page=${page}`),
  studio:          (slug: string, page = 1)        => fetchAPI(`/api/studio/${slug}?page=${page}`),
  sidebar:         ()                              => fetchAPI('/api/sidebar'),
  daftarAnime:     (show = '', page = 1)           => fetchAPI(`/api/daftar-anime?show=${show}&page=${page}`),
  timeline:        (page = 1)                      => fetchAPI(`/api/timeline?page=${page}`),
  serial:          (slug: string, page = 1)        => fetchAPI(`/api/serial/${slug}?page=${page}`),
  filterOptions:   ()                              => fetchAPI('/api/filter-options'),
  health:          ()                              => fetchAPI('/health'),
  animeList: (params: Record<string, string | number | string[]>) => {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        value.forEach(v => searchParams.append(key, v));
      } else if (value !== undefined && value !== null && value !== '') {
        searchParams.append(key, String(value));
      }
    });
    return fetchAPI(`/api/anime-list?${searchParams.toString()}`);
  },
};
