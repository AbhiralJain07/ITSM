import { NextRequest, NextResponse } from 'next/server';

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('access_token')?.value 
  || request.headers.get('authorization')?.replace('Bearer ', '');
  console.log('Token received in route:', token ? 'Present' : 'MISSING'); // ← YE WALI LINE ADD KARO

    if (!token) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const res = await fetch('https://localhost:5001/api/v1/departments?PageNumbe=0r&PageSize=50', {
      method: 'GET',
      headers: {
        'accept': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    const data = await res.json();
    console.log('Departments raw response:', JSON.stringify(data, null, 2));

    const items = data?.elements?.items || data?.items || data || [];

    return NextResponse.json({ success: true, data: items });

  } catch (error) {
    console.error('Departments fetch error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch departments' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('access_token')?.value 
  || request.headers.get('authorization')?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();

    const res = await fetch('https://localhost:5001/api/v1/departments', {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ name: body.name })
    });

    const data = await res.json();
    return NextResponse.json({ success: true, data });

  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to create department' }, { status: 500 });
  }
}