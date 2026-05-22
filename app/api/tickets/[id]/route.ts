import { NextRequest, NextResponse } from 'next/server';
import { getToken, successResponse, errorResponse, fetchFromBackend } from '@/lib/api-utils';

type Params = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const token = getToken(request);
    if (!token) return NextResponse.json(errorResponse('Unauthorized'), { status: 401 });

    const result = await fetchFromBackend(`https://localhost:5001/api/v1/tickets/${id}`, token);
    if (!result.ok) return NextResponse.json(errorResponse(result.errorText || 'Failed to fetch ticket'), { status: result.status });

    return NextResponse.json(successResponse(result.data));
  } catch {
    return NextResponse.json(errorResponse('Failed to fetch ticket'), { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const token = getToken(request);
    if (!token) return NextResponse.json(errorResponse('Unauthorized'), { status: 401 });

    const body = await request.json();

    const result = await fetchFromBackend(`https://localhost:5001/api/v1/tickets/${id}`, token, {
      method: 'PUT',
      body: JSON.stringify({
        categoryId: body.categoryId,
        subCategoryId: body.subCategoryId || null,
        title: body.title,
        description: body.description,
        priorityId: body.priorityId || null,
        sourceId: body.sourceId || null,
        slaId: body.slaId || null
      })
    });

    if (!result.ok) {
      const errorData = result.data as Record<string, unknown>;
      return NextResponse.json(errorResponse((errorData?.message as string) || 'Failed to update ticket'), { status: result.status });
    }
    return NextResponse.json(successResponse(result.data));
  } catch {
    return NextResponse.json(errorResponse('Failed to update ticket'), { status: 500 });
  }
}