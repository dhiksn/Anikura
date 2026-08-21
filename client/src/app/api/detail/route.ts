import { NextRequest } from 'next/server';
import { ok, handleError, err } from '@/lib/api-server/utils/response';
import { validateTargetUrl } from '@/lib/api-server/utils/validator';
const { scrapeDetail } = require('@/lib/api-server/services/detail.service');

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const urlVal = validateTargetUrl(searchParams.get('url'));
  if (!urlVal.valid) return err(urlVal.message!, 'INVALID_PARAMETER', 400);
  const url = searchParams.get('url')!;
  try {
    const data = await scrapeDetail(url);
    if (!data?.info?.title) return err('Data anime tidak ditemukan', 'NOT_FOUND', 404);
    return ok(data, { url });
  } catch (e) { return handleError(e); }
}
