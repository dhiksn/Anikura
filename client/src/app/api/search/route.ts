import { NextRequest } from 'next/server';
import { ok, handleError, err } from '@/lib/api-server/utils/response';
import { validateSearchQuery, validatePage } from '@/lib/api-server/utils/validator';
const { searchAnime } = require('@/lib/api-server/services/search.service');

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const qVal = validateSearchQuery(searchParams.get('q'));
  if (!qVal.valid) return err(qVal.message!, 'INVALID_PARAMETER', 400);
  const pageVal = validatePage(searchParams.get('page'));
  if (!pageVal.valid) return err(pageVal.message!, 'INVALID_PARAMETER', 400);
  try {
    const result = await searchAnime(qVal.sanitized, pageVal.page);
    return ok(result.results, { query: result.query, total: result.results.length, pagination: result.pagination });
  } catch (e) { return handleError(e); }
}
