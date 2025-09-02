

import { NextRequest, NextResponse } from 'next/server';
import { getPage, logPageView, getPageBySlug } from '@/lib/firestore';
import { generateHtml } from '@/lib/html-generator';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(
  request: NextRequest,
  { params }: { params: { pageid: string } }
) {
  const { pageid } = params;

  if (!pageid) {
    return new NextResponse('Page ID or Slug is required', { status: 400 });
  }

  try {
    // Try fetching by ID first, then by slug
    let pageData = await getPage(pageid, 'published');
    if (!pageData) {
        pageData = await getPageBySlug(pageid, 'published');
    }

    if (!pageData || !pageData.projectId || !pageData.workspaceId) {
      // If the page doesn't exist or is missing crucial data, it's a 404
      return new NextResponse('Page not found', { status: 404 });
    }

    const now = new Date();
    // The publishDate/expiryDate can be a Firebase Timestamp, so we need to convert it.
    const publishDate = pageData.publishDate?.toDate ? pageData.publishDate.toDate() : (pageData.publishDate ? new Date(pageData.publishDate) : null);
    const expiryDate = pageData.expiryDate?.toDate ? pageData.expiryDate.toDate() : (pageData.expiryDate ? new Date(pageData.expiryDate) : null);

    // Check if the current time is before the publish date
    if (publishDate && now < publishDate) {
      return new NextResponse('Esta página ainda não está disponível.', { status: 404, headers: { 'Content-Type': 'text/html; charset=utf-8' } });
    }

    // Check if the current time is after the expiry date
    if (expiryDate && now > expiryDate) {
        return new NextResponse('Esta página expirou.', { status: 404, headers: { 'Content-Type': 'text/html; charset=utf-8' } });
    }
    
    // Asynchronously log the page view with extracted headers.
    logPageView(pageData, {
      userAgent: request.headers.get('user-agent') || '',
      referrer: request.headers.get('referer'),
      country: request.geo?.country,
      city: request.geo?.city,
    }).catch(console.error);

    // Hardcode the base URL to ensure it's always correct, even when called via HTTPGet from SFMC.
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://cloudpagestudio.vercel.app';

    const htmlContent = generateHtml(pageData, false, baseUrl);

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
