import { NextRequest, NextResponse } from 'next/server';

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

type Params = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const token = request.cookies.get('access_token')?.value
      || request.headers.get('authorization')?.replace('Bearer ', '');

    if (!token) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

    const res = await fetch(`https://localhost:5001/api/v1/holidays/${id}`, {
      headers: { 'accept': 'application/json', 'Authorization': `Bearer ${token}` }
    });

    const text = await res.text();
    const data = text ? JSON.parse(text) : {};

    if (!res.ok) {
      return NextResponse.json(
        { success: false, error: data?.message || 'Failed to fetch holiday' },
        { status: res.status }
      );
    }

    return NextResponse.json({ success: true, data: data?.elements ?? data });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to fetch holiday' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const token = request.cookies.get('access_token')?.value
      || request.headers.get('authorization')?.replace('Bearer ', '');

    if (!token) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();

    const res = await fetch(`https://localhost:5001/api/v1/holidays/${id}`, {
      method: 'PUT',
      headers: {
        'accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        name: body.name,
        date: body.date,
        description: body.description || '',
        isActive: body.isActive
      })
    });

    const text = await res.text();
    let data = { success: true };
    try { data = text ? JSON.parse(text) : { success: true }; } catch {}
    return NextResponse.json({ success: true, data });

  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to update holiday' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const token = request.cookies.get('access_token')?.value
      || request.headers.get('authorization')?.replace('Bearer ', '');

    if (!token) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

    const res = await fetch(`https://localhost:5001/api/v1/holidays/${id}`, {
      method: 'DELETE',
      headers: {
        'accept': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    const text = await res.text();
    let data = { success: true };
    try { data = text ? JSON.parse(text) : { success: true }; } catch {}
    return NextResponse.json({ success: true, data });

  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to delete holiday' }, { status: 500 });
  }
}