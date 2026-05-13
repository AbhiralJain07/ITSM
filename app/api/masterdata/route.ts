import { NextRequest, NextResponse } from 'next/server';

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('access_token')?.value
      || request.headers.get('authorization')?.replace('Bearer ', '');

    if (!token) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const masterTypeId = searchParams.get('masterTypeId') || '';

    // Backend endpoint for Master Data Items
    let url = 'https://localhost:5001/api/v1/masterdata?PageNumber=1&PageSize=100';
    
    // If masterTypeId is provided, we filter by it
    if (masterTypeId) {
      url += `&FilterBy=masterTypeId&FilterValue=${masterTypeId}`;
    }

    const res = await fetch(url, {
      headers: { 
        'accept': 'application/json', 
        'Authorization': `Bearer ${token}` 
      }
    });

    if (!res.ok) {
      const errorText = await res.text();
      return NextResponse.json({ success: false, error: errorText || 'Failed to fetch items' }, { status: res.status });
    }

    const data = await res.json();
    const items = data?.elements?.items || [];
    
    return NextResponse.json({ success: true, data: items });

  } catch (error) {
    console.error('API Error:', error);
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

    if (!res.ok) {
      const errorText = await res.text();
      return NextResponse.json({ success: false, error: errorText || 'Failed to create item' }, { status: res.status });
    }

    const data = await res.json();
    return NextResponse.json({ success: true, data });

  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to create masterdata' }, { status: 500 });
  }
}