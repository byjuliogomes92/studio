// src/app/api/pages/[pageid]/route.ts

import { type NextRequest, NextResponse } from 'next/server';
import { getPage } from '@/lib/firestore';
import { generateHtml } from '@/lib/html-generator';

export const dynamic = 'force-dynamic';

export async function GET(
  req: NextRequest,
  { params }: { params: { pageid: string } }
) {
  const { pageid } = params;

  if (!pageid) {
    return new NextResponse('Page ID is required', { status: 400 });
  }

  try {
    const pageData = await getPage(pageid);

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
    console.error(`[API /pages/${pageid}] Error:`, error.message, error.stack);
    return new NextResponse(`Internal Server Error: ${error.message}`, { status: 500 });
  }
}
