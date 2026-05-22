import { NextRequest, NextResponse } from 'next/server';
import { getToken, successResponse, errorResponse, fetchFromBackend } from '@/lib/api-utils';

type Params = { params: Promise<{ id: string }> };

export async function POST(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const token = getToken(request);
    if (!token) return NextResponse.json(errorResponse('Unauthorized'), { status: 401 });

    const body = await request.json();

    const result = await fetchFromBackend(`https://localhost:5001/api/v1/tickets/${id}/status`, token, {
      method: 'POST',
      body: JSON.stringify({
        statusId: body.statusId,
        reason: body.reason || ''
      })
    });

    if (!result.ok) {
      const errorData = result.data as Record<string, unknown>;
      return NextResponse.json(errorResponse((errorData?.message as string) || 'Failed to update status'), { status: result.status });
    }
    return NextResponse.json(successResponse(result.data));
  } catch {
    return NextResponse.json(errorResponse('Failed to update status'), { status: 500 });
  }
}