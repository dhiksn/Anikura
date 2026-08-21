import { NextRequest } from 'next/server';
import { ok, handleError, err } from '@/lib/api-server/utils/response';
import { validateSlug, validatePage } from '@/lib/api-server/utils/validator';
const { scrapeAuthor } = require('@/lib/api-server/services/author.service');

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const slugVal = validateSlug(slug);
  if (!slugVal.valid) return err(slugVal.message!, 'INVALID_PARAMETER', 400);
  const pageVal = validatePage(request.nextUrl.searchParams.get('page'));
  if (!pageVal.valid) return err(pageVal.message!, 'INVALID_PARAMETER', 400);
  try {
    const data = await scrapeAuthor(slugVal.slug, pageVal.page);
    return ok(data.animeList, { author: data.author, pagination: data.pagination });
  } catch (e) { return handleError(e); }
}
