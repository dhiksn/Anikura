import { NextRequest } from 'next/server';
import { ok, handleError, err } from '@/lib/api-server/utils/response';
import { validatePage } from '@/lib/api-server/utils/validator';
const { scrapeComplete } = require('@/lib/api-server/services/complete.service');

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const pageVal = validatePage(searchParams.get('page'));
  if (!pageVal.valid) return err(pageVal.message!, 'INVALID_PARAMETER', 400);
  try {
    const data = await scrapeComplete(pageVal.page);
    if (!data.animeList?.length) return err('Tidak ada data', 'NOT_FOUND', 404);
    return ok(data.animeList, { total: data.total, pagination: data.pagination });
  } catch (e) { return handleError(e); }
}
