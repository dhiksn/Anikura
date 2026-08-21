import { ok, handleError } from '@/lib/api-server/utils/response';
const { scrapeCharacterList } = require('@/lib/api-server/services/character.service');

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const characters = await scrapeCharacterList();
    return ok(characters);
  } catch (e) { return handleError(e); }
}
