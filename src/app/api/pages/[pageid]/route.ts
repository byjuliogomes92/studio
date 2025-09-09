
import { NextRequest, NextResponse } from 'next/server';
import { getPage, getPageBySlug, logPageView } from '@/lib/firestore';
import { generateHtml } from '@/lib/html-generator';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(
  request: NextRequest,
  { params }: { params: { pageid: string } }
) {
  const { pageid } = params;

  if (!pageid) {
    return new NextResponse('Page ID or Slug is required', { 
        status: 400,
        headers: { 'Content-Type': 'text/html; charset=utf-8' }
     });
  }

  try {
    // Attempt to get the page data. We try by ID first, then by slug as a fallback.
    // We only fetch the 'published' version.
    let pageData = await getPage(pageid, 'published');
    if (!pageData) {
        pageData = await getPageBySlug(pageid, 'published');
    }

    // A single, robust check to see if the page is valid for viewing.
    if (!pageData || pageData.status !== 'published') {
      const notFoundHtml = `<!DOCTYPE html><html><head><title>Página não encontrada</title></head><body style="font-family: sans-serif; text-align: center; padding: 40px;"><h1>Página não encontrada</h1><p>A página que você está tentando acessar não existe ou não está mais disponível.</p></body></html>`;
      return new NextResponse(notFoundHtml, { 
        status: 200, 
        headers: { 'Content-Type': 'text/html; charset=utf-8' } 
      });
    }

    const now = new Date();
    // Helper to safely convert Firestore Timestamps or date strings to Date objects
    const toDate = (date: any): Date | null => {
        if (!date) return null;
        if (date.toDate) return date.toDate();
        const d = new Date(date);
        return isNaN(d.getTime()) ? null : d;
    };
    const publishDate = toDate(pageData.publishDate);
    const expiryDate = toDate(pageData.expiryDate);

    // Check scheduling dates
    if (publishDate && now < publishDate) {
      const unavailableHtml = `<!DOCTYPE html><html><head><title>Página indisponível</title></head><body style="font-family: sans-serif; text-align: center; padding: 40px;"><h1>Página indisponível</h1><p>Esta página ainda não está disponível. Tente novamente mais tarde.</p></body></html>`;
      return new NextResponse(unavailableHtml, { 
          status: 200, 
          headers: { 'Content-Type': 'text/html; charset=utf-8' } 
      });
    }
    if (expiryDate && now > expiryDate) {
      const expiredHtml = `<!DOCTYPE html><html><head><title>Página expirada</title></head><body style="font-family: sans-serif; text-align: center; padding: 40px;"><h1>Página Expirada</h1><p>O conteúdo que você está tentando acessar não está mais disponível.</p></body></html>`;
      return new NextResponse(expiredHtml, { 
          status: 200, 
          headers: { 'Content-Type': 'text/html; charset=utf-8' } 
      });
    }
    
    // Asynchronously log the page view. We don't wait for it to complete.
    logPageView(pageData, {
      userAgent: request.headers.get('user-agent') || '',
      referrer: request.headers.get('referer'),
      country: request.geo?.country,
      city: request.geo?.city,
    }).catch(console.error);

    // Hardcode the base URL to ensure it's always correct.
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://cloudpagestudio.vercel.app';
    const htmlContent = generateHtml(pageData, false, baseUrl);

    // Return the final HTML with cache-control headers.
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
    // Return a generic error page with a 200 status so SFMC can render it.
    const errorHtml = `<!DOCTYPE html><html><head><title>Erro no Servidor</title></head><body style="font-family: sans-serif; text-align: center; padding: 40px;"><h1>Erro Interno</h1><p>Ocorreu um erro ao processar sua solicitação. Por favor, tente novamente mais tarde.</p><!-- ${error.message} --></body></html>`;
    return new NextResponse(errorHtml, { 
        status: 200, 
        headers: { 'Content-Type': 'text/html; charset=utf-8' } 
    });
  }
}
