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

    const DEFAULT_STATUS_ID = 'a0a8fc5f-cce4-4594-b6fd-bd046ee70f66';

const ticketBody: Record<string, unknown> = {
  departmentId: body.departmentId,
  categoryId: body.categoryId,
  title: body.title,
  description: body.description,
  // statusId: body.statusId || DEFAULT_STATUS_ID,
  comments: [],
  attachments: []
};
    
    if (body.subCategoryId) ticketBody.subCategoryId = body.subCategoryId;
    if (body.priorityId) ticketBody.priorityId = body.priorityId;
    if (body.sourceId) ticketBody.sourceId = body.sourceId;
    if (body.statusId) ticketBody.statusId = body.statusId;
    if (body.slaId) ticketBody.slaId = body.slaId;
    
    const result = await fetchFromBackend('https://localhost:5001/api/v1/tickets', token, {
      method: 'POST',
      body: JSON.stringify(ticketBody)
    });

    if (!result.ok) {
      console.log('Ticket creation failed:', JSON.stringify(result.data));
      const errorData = result.data as Record<string, unknown>;
      const errMsg = (errorData?.message as string) || 
                     (errorData?.elements as any)?.items?.[0]?.message ||
                     result.errorText ||
                     'Failed to create ticket';
      return NextResponse.json(errorResponse(errMsg), { status: result.status });
    }
    
    return NextResponse.json(successResponse(result.data));
  } catch {
    return NextResponse.json(errorResponse('Failed to create ticket'), { status: 500 });
  }
}