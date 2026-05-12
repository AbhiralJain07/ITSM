import { NextRequest, NextResponse } from 'next/server';

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('access_token')?.value
      || request.headers.get('authorization')?.replace('Bearer ', '');

    if (!token) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const masterTypeId = searchParams.get('masterTypeId') || '';

    let url = 'https://localhost:5001/api/v1/masterdata?PageNumber=1&PageSize=50';
    if (masterTypeId) url += `&FilterBy=masterTypeId&FilterValue=${masterTypeId}`;

    const res = await fetch(url, {
      headers: { 'accept': 'application/json', 'Authorization': `Bearer ${token}` }
    });

    const data = await res.json();
    const items = data?.elements?.items || [];
    return NextResponse.json({ success: true, data: items });

  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to fetch masterdata' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('access_token')?.value
      || request.headers.get('authorization')?.replace('Bearer ', '');

    if (!token) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();

    const res = await fetch('https://localhost:5001/api/v1/masterdata', {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        masterTypeId: body.masterTypeId,
        departmentId: body.departmentId,
        name: body.name,
        code: body.code,
        sortOrder: body.sortOrder || 0,
        isActive: body.isActive
      })
    });

    const text = await res.text();
    let data = { success: true };
    try { data = text ? JSON.parse(text) : { success: true }; } catch {}
    return NextResponse.json({ success: true, data });

  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to create masterdata' }, { status: 500 });
  }
}