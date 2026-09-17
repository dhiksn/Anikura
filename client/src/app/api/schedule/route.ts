import { ok, handleError, err } from '@/lib/api-server/utils/response';
import { backendAPI } from '@/lib/backend-client';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const data = await backendAPI.schedule();
    if (!data.total) return err('Data jadwal tidak ditemukan', 'NOT_FOUND', 404);
    return ok(data.schedule, { total: data.total });
  } catch (e) { return handleError(e); }
}
