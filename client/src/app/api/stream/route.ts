import { NextRequest } from 'next/server';
import { ok, handleError, err } from '@/lib/api-server/utils/response';
import { validateStreamUrl } from '@/lib/api-server/utils/validator';
import { backendAPI } from '@/lib/backend-client';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const urlVal = validateStreamUrl(searchParams.get('url'));
  if (!urlVal.valid) return err(urlVal.message!, 'INVALID_PARAMETER', 400);
  const url = searchParams.get('url')!;
  try {
    const result = await backendAPI.stream(url);
    const hasStreams = result.streams?.hls?.length > 0 || result.streams?.mp4?.length > 0;
    if (!hasStreams) return err('Stream tidak ditemukan untuk URL ini', 'NOT_FOUND', 404);
    return ok(result, { provider: result.provider, url: result.sourceUrl, streams: result.streams });
  } catch (e) { return handleError(e); }
}
