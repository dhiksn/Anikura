import { NextRequest } from 'next/server';
import { ok, handleError, err } from '@/lib/api-server/utils/response';
import { validatePage } from '@/lib/api-server/utils/validator';
const { scrapeHome } = require('@/lib/api-server/services/scraper.service');

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const pageVal = validatePage(searchParams.get('page'));
  if (!pageVal.valid) return err(pageVal.message!, 'INVALID_PARAMETER', 400);
  try {
    const data = await scrapeHome(pageVal.page);
    return ok(data, { sedangTayang: data.sedangTayang, baruDiperbarui: data.baruDiperbarui, pagination: data.pagination });
  } catch (e) { return handleError(e); }
}
