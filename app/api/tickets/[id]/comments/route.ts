import { NextRequest, NextResponse } from 'next/server';

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const BACKEND = 'https://localhost:5001';

function getToken(request: NextRequest) {
  return request.cookies.get('access_token')?.value
    || request.headers.get('authorization')?.replace('Bearer ', '')
    || request.headers.get('Authorization')?.replace('Bearer ', '');
}

type Params = { params: Promise<{ id: string }> };

export async function POST(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const token = getToken(request);
    if (!token) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();

    const res = await fetch(`${BACKEND}/api/v1/tickets/${id}/comments`, {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(body)
    });

    const text = await res.text();
    let data: any = {};
    try { data = text ? JSON.parse(text) : {}; } catch {}

    return NextResponse.json({ success: res.ok, data: data?.elements || data });

  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to add comment' }, { status: 500 });
  }
}