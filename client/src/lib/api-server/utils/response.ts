import { NextResponse } from 'next/server';

const AUTHOR = process.env.AUTHOR || 'dhiksn';
const SOURCE = process.env.NEXT_PUBLIC_SOURCE_BASE_URL ? new URL(process.env.NEXT_PUBLIC_SOURCE_BASE_URL).hostname.replace('www.', '') : 'Animasu';

/** Wrap a successful payload with standard envelope */
export function ok(data: Record<string, unknown> | unknown[], extra: Record<string, unknown> = {}): NextResponse {
  return NextResponse.json({ success: true, author: AUTHOR, source: SOURCE, ...extra, data });
}

/** Standard error response */
export function err(message: string, code: string, status: number): NextResponse {
  return NextResponse.json({ success: false, author: AUTHOR, error: { code, message } }, { status });
}

const CODE_TO_STATUS: Record<string, number> = {
  INVALID_PARAMETER: 400,
  SSRF_BLOCKED:      400,
  NOT_FOUND:         404,
  RATE_LIMITED:      429,
  TIMEOUT:           504,
  BAD_GATEWAY:       502,
  SERVER_ERROR:      500,
};

/** Convert a thrown error to a NextResponse */
export function handleError(e: unknown): NextResponse {
  const error = e as { code?: string; statusCode?: number; message?: string };
  const code   = error.code || 'SERVER_ERROR';
  const status = error.statusCode || CODE_TO_STATUS[code] || 500;
  const message = error.message || 'Terjadi kesalahan internal';
  return err(message, code, status);
}
