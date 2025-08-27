

import { NextRequest, NextResponse } from 'next/server';
import { logFormSubmission } from '@/lib/firestore';

export async function POST(
  request: NextRequest,
  { params }: { params: { pageid: string } }
) {
  const { pageid } = params;

  if (!pageid) {
    return new NextResponse('Page ID is required', { status: 400 });
  }

  try {
    const body = await request.json();

    if (!body || typeof body !== 'object') {
        return new NextResponse('Invalid request body', { status: 400 });
    }
    
    // Asynchronously log the submission without waiting for it to complete.
    // This makes the API response super fast for the client.
    logFormSubmission(pageid, body).catch(console.error);

    return new NextResponse('Submission received', { status: 202 });
  } catch (error) {
    console.error(`[API Route /api/submit/${pageid}] Error:`, error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
