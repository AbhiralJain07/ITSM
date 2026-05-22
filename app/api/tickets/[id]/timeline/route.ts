import { NextRequest, NextResponse } from 'next/server';
import { getToken, unwrapApiResponse, successResponse, errorResponse, fetchFromBackend } from '@/lib/api-utils';

type Params = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const token = getToken(request);
    if (!token) return NextResponse.json(errorResponse('Unauthorized'), { status: 401 });

    const result = await fetchFromBackend(`https://localhost:5001/api/v1/tickets/${id}/timeline`, token);
    if (!result.ok) return NextResponse.json(errorResponse(result.errorText || 'Failed to fetch timeline'), { status: result.status });

    const items = unwrapApiResponse(result.data);
    return NextResponse.json(successResponse(items));
  } catch {
    return NextResponse.json(errorResponse('Failed to fetch timeline'), { status: 500 });
  }
}