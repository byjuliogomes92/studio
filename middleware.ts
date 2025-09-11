import { type NextRequest, NextResponse } from 'next/server';
import cors from 'cors';

// Create a new CORS middleware instance
const corsMiddleware = cors({
  origin: '*', // Allow all origins
  methods: ['POST', 'GET', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
});

// Promisify the middleware to work with Next.js
const runMiddleware = (req: NextRequest, res: NextResponse, fn: any) => {
  return new Promise((resolve, reject) => {
    fn(req, res, (result: any) => {
      if (result instanceof Error) {
        return reject(result);
      }
      return resolve(result);
    });
  });
};

export async function middleware(request: NextRequest) {
  // We only want to run CORS middleware on API routes
  if (request.nextUrl.pathname.startsWith('/api/')) {
    const response = NextResponse.next();
    
    // Handle the preflight (OPTIONS) request
    if (request.method === 'OPTIONS') {
        const corsResponse = new NextResponse(null, { status: 204 });
        corsResponse.headers.set('Access-Control-Allow-Origin', '*');
        corsResponse.headers.set('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
        corsResponse.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
        return corsResponse;
    }

    // Add CORS headers to the actual response for GET/POST etc.
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
