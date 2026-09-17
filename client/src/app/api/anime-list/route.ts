import { NextRequest } from 'next/server';
import { ok, handleError, err } from '@/lib/api-server/utils/response';
import { validatePage } from '@/lib/api-server/utils/validator';
import { backendAPI } from '@/lib/backend-client';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const pageVal = validatePage(searchParams.get('page'));
  if (!pageVal.valid) return err(pageVal.message!, 'INVALID_PARAMETER', 400);

  // Multi-value params — support both ?genre[]=x and ?genre=x
  const genre    = searchParams.getAll('genre[]').concat(searchParams.getAll('genre')).filter(Boolean);
  const karakter = searchParams.getAll('karakter[]').concat(searchParams.getAll('karakter')).filter(Boolean);
  const season   = searchParams.getAll('season[]').concat(searchParams.getAll('season')).filter(Boolean);
  const status   = searchParams.get('status') || '';
  const tipe     = searchParams.get('tipe') || '';
  const urutan   = searchParams.get('urutan') || '';

  try {
    const data = await backendAPI.animeList({ 
      genre: genre.length > 0 ? genre : [], 
      karakter: karakter.length > 0 ? karakter : [], 
      season: season.length > 0 ? season : [], 
      status: status || '', 
      tipe: tipe || '', 
      urutan: urutan || '', 
      page: pageVal.page ?? 1 
    });
    return ok(data.animeList, { pagination: data.pagination });
  } catch (e) { return handleError(e); }
}
