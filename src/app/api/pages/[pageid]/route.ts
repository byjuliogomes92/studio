
import { NextRequest, NextResponse } from 'next/server';
import { getPage, logPageView } from '@/lib/firestore';
import { generateHtml } from '@/lib/html-generator';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: { pageid: string } }
) {
  const { pageid } = params;
  const searchParams = request.nextUrl.searchParams;
  const isPreview = searchParams.get('preview') === 'true';

  if (!pageid) {
    return new NextResponse('Page ID is required', { status: 400 });
  }

  try {
    const pageData = await getPage(pageid);

    if (!pageData) {
      return new NextResponse('Page not found', { status: 404 });
    }
    
    // Only log page view if it's not a preview
    if (!isPreview) {
        logPageView(pageData, request.headers).catch(console.error);
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
    console.error(`[API Route /api/pages/${pageid}] Internal Server Error:`, error.message, error.stack);
    return new NextResponse(`Internal Server Error: ${error.message}`, { status: 500 });
  }
}
