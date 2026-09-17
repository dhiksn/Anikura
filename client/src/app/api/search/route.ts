import { NextRequest } from 'next/server';
import { ok, handleError, err } from '@/lib/api-server/utils/response';
import { validateSearchQuery, validatePage } from '@/lib/api-server/utils/validator';
import { backendAPI } from '@/lib/backend-client';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const qVal = validateSearchQuery(searchParams.get('q'));
  if (!qVal.valid) return err(qVal.message!, 'INVALID_PARAMETER', 400);
  const pageVal = validatePage(searchParams.get('page'));
  if (!pageVal.valid) return err(pageVal.message!, 'INVALID_PARAMETER', 400);
  try {
    const result = await backendAPI.search(qVal.sanitized || '', pageVal.page);
    return ok(result, { query: result.query, total: result.total, pagination: result.pagination });
  } catch (e) { return handleError(e); }
}
