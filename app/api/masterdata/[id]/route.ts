import { NextRequest, NextResponse } from 'next/server';

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

type Params = { params: Promise<{ id: string }> };

export async function PUT(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const token = request.cookies.get('access_token')?.value
      || request.headers.get('authorization')?.replace('Bearer ', '');

    if (!token) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();

    const res = await fetch(`https://localhost:5001/api/v1/masterdata/${id}`, {
      method: 'PUT',
      headers: {
        'accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      // ✅ Tip: Backend body mein bhi 'id' expect kar sakta hai
      body: JSON.stringify({
        id: id, 
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
      return NextResponse.json({ success: false, error: errorText || 'Update failed' }, { status: res.status });
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to update masterdata' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const token = request.cookies.get('access_token')?.value
      || request.headers.get('authorization')?.replace('Bearer ', '');

    if (!token) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

    const res = await fetch(`https://localhost:5001/api/v1/masterdata/${id}`, {
      method: 'DELETE',
      headers: {
        'accept': '*/*', // ✅ Accept anything
        'Authorization': `Bearer ${token}`
      }
    });

    if (!res.ok) {
      return NextResponse.json({ success: false, error: 'Delete operation failed' }, { status: res.status });
    }

    // ✅ Delete cases mein backend aksar body nahi bhejta, isliye sirf success return karein
    return NextResponse.json({ success: true });

  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to delete masterdata' }, { status: 500 });
  }
}