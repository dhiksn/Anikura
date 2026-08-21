import { ok, handleError, err } from '@/lib/api-server/utils/response';
const { scrapeSchedule } = require('@/lib/api-server/services/schedule.service');

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const data = await scrapeSchedule();
    if (!data.total) return err('Data jadwal tidak ditemukan', 'NOT_FOUND', 404);
    return ok(data.schedule, { total: data.total });
  } catch (e) { return handleError(e); }
}
