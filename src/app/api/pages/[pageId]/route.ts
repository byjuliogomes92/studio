
// src/app/api/pages/[pageId]/route.ts

import { type NextRequest, NextResponse } from 'next/server';
import { getPage } from '@/lib/firestore';
import { generateHtml } from '@/lib/html-generator';

// This route is a critical part of the proxy solution.
// It fetches the latest page data from Firestore, generates the full HTML,
// and serves it as a raw text/html file.
// The CloudPage in Marketing Cloud will use HTTPGet() to fetch the content from this URL in real-time.

// Opt out of caching for this route
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
    // We need a way to initialize Firebase Admin on the server side for this to work in a deployed environment.
    // For now, this relies on client-side getDb which might not be ideal for a server route.
    // This is a known limitation to be addressed with a proper server-side Firebase setup.
    const pageData = await getPage(pageId);

    if (!pageData) {
      return new NextResponse('Page not found', { status: 404 });
    }

    // Generate the final HTML, ensuring it's not in preview mode.
    const htmlContent = generateHtml(pageData, false);

    // Return the generated HTML with the correct content type.
    return new NextResponse(htmlContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'no-store, max-age=0', // Ensure SFMC doesn't cache the proxy response
      },
    });
  } catch (error: any) {
    console.error(`[API /pages/${pageId}] Error:`, error);
    return new NextResponse(`Internal Server Error: ${error.message}`, { status: 500 });
  }
}
