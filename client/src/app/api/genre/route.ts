import { ok, handleError } from '@/lib/api-server/utils/response';
const { scrapeGenreList } = require('@/lib/api-server/services/genre.service');

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const genres = await scrapeGenreList();
    return ok(genres);
  } catch (e) { return handleError(e); }
}
