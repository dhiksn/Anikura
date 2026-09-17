import { NextResponse } from 'next/server';
import { backendAPI } from '@/lib/backend-client';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const data = await backendAPI.health();
    return NextResponse.json(data);
  } catch (e) {
    // Fallback if backend is unavailable
    return NextResponse.json({
      status: 'ok',
      service: 'anikura-frontend',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'production',
      backend: 'unavailable',
    });
  }
}
