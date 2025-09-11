import { type NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  // We only want to run CORS middleware on API routes
  if (request.nextUrl.pathname.startsWith('/api/')) {
    
    // Handle the preflight (OPTIONS) request
    if (request.method === 'OPTIONS') {
        const corsResponse = new NextResponse(null, { status: 204 });
        corsResponse.headers.set('Access-Control-Allow-Origin', '*');
        corsResponse.headers.set('Access-Control-Allow-Methods', 'POST, GET, OPTIONS, PUT, DELETE');
        corsResponse.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
        return corsResponse;
    }

    // For other requests (GET, POST), create a response and add headers to it
    const response = NextResponse.next();
    response.headers.set('Access-Control-Allow-Origin', '*');
    
    return response;
  }

  // If not an API route, just continue
  return NextResponse.next();
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: '/api/:path*',
};
