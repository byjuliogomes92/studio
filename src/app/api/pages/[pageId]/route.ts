
// src/app/api/pages/[pageId]/route.ts

import { type NextRequest, NextResponse } from 'next/server';
import { getPage } from '@/lib/firestore';
import { generateHtml } from '@/lib/html-generator';

// This route is a critical part of the proxy solution.
// It fetches the latest page data from Firestore, generates the full HTML,
// and serves it as a raw text/html file.
// The CloudPage in Marketing Cloud will use HTTPGet() to fetch the content from this URL in real-time.

// By setting this to force-dynamic, we ensure the route is always treated as dynamic
// and that no upstream cache (like a CDN or browser) will store the response.
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

    // Generate the final HTML, ensuring it's not in preview mode.
    const htmlContent = generateHtml(pageData, false);

    // Return the generated HTML with the correct content type and cache headers.
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
    console.error(`[API /pages/${pageId}] Error:`, error);
    return new NextResponse(`Internal Server Error: ${error.message}`, { status: 500 });
  }
}
