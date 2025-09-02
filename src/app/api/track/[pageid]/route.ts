
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// This endpoint is kept for legacy compatibility but the main logging
// is now done in the /api/pages/[pageid] route.
export async function GET(
  request: NextRequest,
  { params }: { params: { pageid: string } }
) {
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
