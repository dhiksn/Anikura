import { ok, handleError } from '@/lib/api-server/utils/response';
import { backendAPI } from '@/lib/backend-client';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const genres = await backendAPI.genre();
    return ok(genres);
  } catch (e) { return handleError(e); }
}
