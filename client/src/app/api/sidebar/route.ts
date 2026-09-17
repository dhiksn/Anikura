import { ok, handleError, err } from '@/lib/api-server/utils/response';
import { backendAPI } from '@/lib/backend-client';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const data = await backendAPI.sidebar();
    if (!data.rekomendasi?.length && !data.karakter?.length) return err('Data sidebar tidak ditemukan', 'NOT_FOUND', 404);
    return ok(data);
  } catch (e) { return handleError(e); }
}
