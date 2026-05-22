import { NextRequest, NextResponse } from 'next/server';
import { getToken, successResponse, errorResponse, fetchFromBackend } from '@/lib/api-utils';

type Params = { params: Promise<{ id: string }> };

export async function POST(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const token = getToken(request);
    if (!token) return NextResponse.json(errorResponse('Unauthorized'), { status: 401 });

    const body = await request.json();

    const result = await fetchFromBackend(`https://localhost:5001/api/v1/tickets/${id}/comments`, token, {
      method: 'POST',
      body: JSON.stringify({
        body: body.body,
        isInternal: body.isInternal ?? false
      })
    });

    if (!result.ok) {
      const errorData = result.data as Record<string, unknown>;
      return NextResponse.json(errorResponse((errorData?.message as string) || 'Failed to add comment'), { status: result.status });
    }
    return NextResponse.json(successResponse(result.data));
  } catch {
    return NextResponse.json(errorResponse('Failed to add comment'), { status: 500 });
  }
}