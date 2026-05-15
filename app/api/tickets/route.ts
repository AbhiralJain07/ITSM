import { NextRequest, NextResponse } from 'next/server';

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const BACKEND = 'https://localhost:5001';

function getToken(request: NextRequest) {
  return request.cookies.get('access_token')?.value
    || request.headers.get('authorization')?.replace('Bearer ', '')
    || request.headers.get('Authorization')?.replace('Bearer ', '');
}

export async function GET(request: NextRequest) {
  try {
    const token = getToken(request);
    if (!token) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const page = searchParams.get('page') || '1';
    const pageSize = searchParams.get('pageSize') || '20';

    const res = await fetch(`${BACKEND}/api/v1/tickets?PageNumber=${page}&PageSize=${pageSize}`, {
      headers: { 'accept': 'application/json', 'Authorization': `Bearer ${token}` }
    });

    const data = await res.json();
    const items = data?.elements?.items || [];
    const total = data?.elements?.totalCount || 0;

    return NextResponse.json({ success: true, data: items, total });

  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to fetch tickets' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = getToken(request);
    if (!token) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();

    const res = await fetch(`${BACKEND}/api/v1/tickets`, {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
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

    const text = await res.text();
    let data: any = {};
    try { data = text ? JSON.parse(text) : {}; } catch {}

    if (!res.ok) {
      return NextResponse.json({ success: false, error: data?.message || 'Failed to create ticket' }, { status: res.status });
    }

    return NextResponse.json({ success: true, data: data?.elements || data });

  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to create ticket' }, { status: 500 });
  }
}