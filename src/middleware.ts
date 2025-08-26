
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getPage } from '@/lib/firestore';
import { generateHtml } from '@/lib/html-generator';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if the request is for our specific API route pattern
  const apiMatch = pathname.match(/^\/api\/pages\/(.+)$/);

  if (apiMatch) {
    const pageid = apiMatch[1]; // The captured part of the URL

    if (!pageid) {
      return new NextResponse('Page ID is required', { status: 400 });
    }

    try {
      // We must await the result here as middleware needs to be async
      const pageData = await getPage(pageid);

      if (!pageData) {
        return new NextResponse('Page not found', { status: 404 });
      }

      const htmlContent = generateHtml(pageData, false);

      // Return a new response with the HTML content
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
      console.error(`[Middleware /api/pages/${pageid}] Error:`, error.message, error.stack);
      // Ensure we return a proper Response object on error
      return new NextResponse(`Internal Server Error: ${error.message}`, { status: 500 });
    }
  }

  // For all other requests, continue as normal
  return NextResponse.next();
}

// Configure the middleware to run only on the specific API path
export const config = {
  matcher: '/api/pages/:path*',
};
