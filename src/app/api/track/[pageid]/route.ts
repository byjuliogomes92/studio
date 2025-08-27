
import { NextRequest, NextResponse } from 'next/server';
import { getPage, logPageView } from '@/lib/firestore';

export const dynamic = 'force-dynamic';

// This endpoint will be hit by the tracking pixel.
export async function GET(
  request: NextRequest,
  { params }: { params: { pageid: string } }
) {
  const { pageid } = params;

  if (!pageid) {
    return new NextResponse('Page ID is required', { status: 400 });
  }

  try {
    // We fetch the page data to ensure the page exists and to pass it to the logging function.
    const pageData = await getPage(pageid);
    if (pageData) {
      // Asynchronously log the page view without waiting for it to complete.
      // This makes the pixel request super fast.
      logPageView(pageData, request.headers).catch(console.error);
    }
  } catch (error) {
    // We log the error but don't block the response.
    console.error(`[API Route /api/track/${pageid}] Error:`, error);
  }

  // Return a 1x1 transparent GIF. This is a standard practice for tracking pixels.
  const pixel = Buffer.from(
    'R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7',
    'base64'
  );
  
  return new NextResponse(pixel, {
    status: 200,
    headers: {
      'Content-Type': 'image/gif',
      'Cache-Control': 'no-store, no-cache, must-revalidate, private',
    },
  });
}
