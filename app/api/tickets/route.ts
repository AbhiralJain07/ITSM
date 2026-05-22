import { NextRequest, NextResponse } from 'next/server';
import { getToken, unwrapApiResponse, successResponse, errorResponse, fetchFromBackend } from '@/lib/api-utils';

export async function GET(request: NextRequest) {
  try {
    const token = getToken(request);
    if (!token) return NextResponse.json(errorResponse('Unauthorized'), { status: 401 });

    const { searchParams } = new URL(request.url);
    const page = searchParams.get('page') || '1';
    const pageSize = searchParams.get('pageSize') || '20';
    const search = searchParams.get('search') || '';

    let url = `https://localhost:5001/api/v1/tickets?PageNumber=${page}&PageSize=${pageSize}`;
    if (search) url += `&Search=${encodeURIComponent(search)}`;

    const result = await fetchFromBackend(url, token);
    if (!result.ok) return NextResponse.json(errorResponse(result.errorText || 'Failed to fetch tickets'), { status: result.status });

    const items = unwrapApiResponse(result.data);
    return NextResponse.json(successResponse(items));
  } catch {
    return NextResponse.json(errorResponse('Failed to fetch tickets'), { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = getToken(request);
    if (!token) return NextResponse.json(errorResponse('Unauthorized'), { status: 401 });

    const body = await request.json();

    const result = await fetchFromBackend('https://localhost:5001/api/v1/tickets', token, {
      method: 'POST',
      body: JSON.stringify({
        departmentId: body.departmentId,
        categoryId: body.categoryId,
        subCategoryId: body.subCategoryId || null,
        title: body.title,
        description: body.description,
        priorityId: body.priorityId || null,
        sourceId: body.sourceId || null,
        statusId: body.statusId || null,
        slaId: body.slaId || null,
        comments: [],
        attachments: []
      })
    });

    if (!result.ok) {
      const errorData = result.data as Record<string, unknown>;
      return NextResponse.json(errorResponse((errorData?.message as string) || 'Failed to create ticket'), { status: result.status });
    }
    return NextResponse.json(successResponse(result.data));
  } catch {
    return NextResponse.json(errorResponse('Failed to create ticket'), { status: 500 });
  }
}