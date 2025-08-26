
// src/app/api/pages/[pageId]/route.ts

import { type NextRequest, NextResponse } from 'next/server';
import { getPage } from '@/lib/firestore';
import { generateHtml } from '@/lib/html-generator';

export const dynamic = 'force-dynamic';

export async function GET(
  req: NextRequest,
  { params }: { params: { pageId: string } }
) {
  const { pageId } = params;

  if (!pageId) {
    return new NextResponse('Page ID is required', { status: 400 });
  }

  try {
    const pageData = await getPage(pageId);

    if (!pageData) {
      return new NextResponse('Page not found', { status: 404 });
    }

    const htmlContent = generateHtml(pageData, false);

    return new NextResponse(htmlContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    });
  } catch (error: any) {
    console.error(`[API /pages/${pageId}] Error:`, error.message, error.stack);
    return new NextResponse(`Internal Server Error: ${error.message}`, { status: 500 });
  }
}
