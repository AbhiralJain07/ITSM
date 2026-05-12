import { NextRequest, NextResponse } from 'next/server';

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('access_token')?.value
      || request.headers.get('authorization')?.replace('Bearer ', '');

    if (!token) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

    const res = await fetch('https://localhost:5001/api/v1/mastertypes?PageNumber=1&PageSize=50', {
      headers: { 'accept': 'application/json', 'Authorization': `Bearer ${token}` }
    });

    const data = await res.json();
    const items = data?.elements?.items || [];
    return NextResponse.json({ success: true, data: items });

  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to fetch mastertypes' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('access_token')?.value
      || request.headers.get('authorization')?.replace('Bearer ', '');

    if (!token) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();

    const res = await fetch('https://localhost:5001/api/v1/mastertypes', {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        name: body.name,
        code: body.code,
        isActive: body.isActive
      })
    });

    const text = await res.text();
    let data = { success: true };
    try { data = text ? JSON.parse(text) : { success: true }; } catch {}
    return NextResponse.json({ success: true, data });

  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to create mastertype' }, { status: 500 });
  }
}