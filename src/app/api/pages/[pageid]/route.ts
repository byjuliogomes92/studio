

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

    if (!pageData || !pageData.projectId || !pageData.workspaceId || pageData.status !== 'published') {
      // If the page doesn't exist, is missing crucial data, or is not published, it's a 404
      // BUT we return a 200 with a user-friendly message for SFMC.
      return new NextResponse('<!DOCTYPE html><html><head><title>Página não encontrada</title></head><body style="font-family: sans-serif; text-align: center; padding: 40px;"><h1>Página não encontrada</h1><p>A página que você está tentando acessar não existe ou não está mais disponível.</p></body></html>', { status: 200, headers: { 'Content-Type': 'text/html; charset=utf-8' } });
    }

    const now = new Date();
    // The publishDate/expiryDate can be a Firebase Timestamp, so we need to convert it.
    const publishDate = pageData.publishDate?.toDate ? pageData.publishDate.toDate() : (pageData.publishDate ? new Date(pageData.publishDate) : null);
    const expiryDate = pageData.expiryDate?.toDate ? pageData.expiryDate.toDate() : (pageData.expiryDate ? new Date(pageData.expiryDate) : null);

    // Check if the current time is before the publish date
    if (publishDate && now < publishDate) {
      return new NextResponse('<!DOCTYPE html><html><head><title>Página indisponível</title></head><body style="font-family: sans-serif; text-align: center; padding: 40px;"><h1>Página indisponível</h1><p>Esta página ainda não está disponível. Tente novamente mais tarde.</p></body></html>', { status: 200, headers: { 'Content-Type': 'text/html; charset=utf-8' } });
    }

    // Check if the current time is after the expiry date
    if (expiryDate && now > expiryDate) {
        return new NextResponse('<!DOCTYPE html><html><head><title>Página expirada</title></head><body style="font-family: sans-serif; text-align: center; padding: 40px;"><h1>Página Expirada</h1><p>O conteúdo que você está tentando acessar não está mais disponível.</p></body></html>', { status: 200, headers: { 'Content-Type': 'text/html; charset=utf-8' } });
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
    const errorHtml = `<!DOCTYPE html><html><head><title>Erro no Servidor</title></head><body style="font-family: sans-serif; text-align: center; padding: 40px;"><h1>Erro Interno</h1><p>Ocorreu um erro ao processar sua solicitação. Por favor, tente novamente mais tarde.</p><!-- ${error.message} --></body></html>`;
    return new NextResponse(errorHtml, { status: 200, headers: { 'Content-Type': 'text/html; charset=utf-8' } });
  }
}
