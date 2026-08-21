const ALLOWED_DOMAINS = ['animasu.love', 'animasu.work'];
const STREAM_DOMAINS  = ['vidhidepro.com', 'vidhide.com'];

export function validateTargetUrl(url: unknown): { valid: boolean; message?: string } {
  if (!url || typeof url !== 'string') return { valid: false, message: 'Parameter URL wajib diisi' };
  let parsed: URL;
  try { parsed = new URL(url); } catch { return { valid: false, message: 'Format URL tidak valid' }; }
  if (!['http:', 'https:'].includes(parsed.protocol)) return { valid: false, message: 'Protokol URL harus http atau https' };
  const hostname = parsed.hostname.toLowerCase().replace(/^www\./, '');
  const isAllowed = ALLOWED_DOMAINS.some(d => hostname === d || hostname.endsWith(`.${d}`));
  if (!isAllowed) return { valid: false, message: `URL harus berasal dari domain: ${ALLOWED_DOMAINS.join(', ')}` };
  return { valid: true };
}

export function validateStreamUrl(url: unknown): { valid: boolean; message?: string } {
  if (!url || typeof url !== 'string') return { valid: false, message: 'Parameter URL wajib diisi' };
  let parsed: URL;
  try { parsed = new URL(url); } catch { return { valid: false, message: 'Format URL tidak valid' }; }
  const hostname = parsed.hostname.toLowerCase();
  const isAllowed = STREAM_DOMAINS.some(d => hostname === d || hostname.endsWith(`.${d}`));
  if (!isAllowed) return { valid: false, message: `URL harus berasal dari domain: ${STREAM_DOMAINS.join(', ')}` };
  return { valid: true };
}

export function validateSearchQuery(q: unknown): { valid: boolean; sanitized?: string; message?: string } {
  if (!q || typeof q !== 'string') return { valid: false, message: 'Parameter "q" wajib diisi' };
  const trimmed = q.trim();
  if (trimmed.length < 2) return { valid: false, message: 'Keyword pencarian minimal 2 karakter' };
  if (trimmed.length > 100) return { valid: false, message: 'Keyword pencarian maksimal 100 karakter' };
  if (/[<>{}\\|^`]/.test(trimmed)) return { valid: false, message: 'Keyword mengandung karakter yang tidak diizinkan' };
  return { valid: true, sanitized: trimmed };
}

export function validatePage(page: unknown): { valid: boolean; page?: number; message?: string } {
  if (page === undefined || page === null || page === '') return { valid: true, page: 1 };
  const num = parseInt(String(page), 10);
  if (isNaN(num)) return { valid: false, message: 'Parameter "page" harus berupa angka' };
  if (num < 1) return { valid: false, message: 'Parameter "page" minimal bernilai 1' };
  if (num > 9999) return { valid: false, message: 'Parameter "page" terlalu besar' };
  return { valid: true, page: num };
}

export function validateSlug(slug: unknown): { valid: boolean; slug?: string; message?: string } {
  if (!slug || typeof slug !== 'string') return { valid: false, message: 'Slug tidak valid' };
  const trimmed = slug.trim().toLowerCase();
  if (!trimmed.length) return { valid: false, message: 'Slug tidak boleh kosong' };
  if (!/^[a-z0-9-]+$/.test(trimmed)) return { valid: false, message: 'Slug hanya boleh mengandung huruf kecil, angka, dan tanda hubung' };
  return { valid: true, slug: trimmed };
}
