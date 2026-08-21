import { NextRequest } from 'next/server';
import { ok, handleError, err } from '@/lib/api-server/utils/response';
import { validatePage } from '@/lib/api-server/utils/validator';
const { scrapeDaftarAnime } = require('@/lib/api-server/services/daftaranime.service');

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const show = searchParams.get('show') || '';
  if (show && !/^[A-Z#]$/i.test(show)) return err('Parameter "show" harus berupa satu huruf (A-Z) atau "#"', 'INVALID_PARAMETER', 400);
  const pageVal = validatePage(searchParams.get('page'));
  if (!pageVal.valid) return err(pageVal.message!, 'INVALID_PARAMETER', 400);
  try {
    const data = await scrapeDaftarAnime({ show: show.toUpperCase(), page: pageVal.page });
    return ok(data.animeList, { filter: data.filter, letters: data.letters, stats: data.stats, pagination: data.pagination });
  } catch (e) { return handleError(e); }
}
