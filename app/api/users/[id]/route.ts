import { NextRequest, NextResponse } from 'next/server';
import { getToken, successResponse, errorResponse, fetchFromBackend } from '@/lib/api-utils';

type Params = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const token = getToken(request);
    if (!token) return NextResponse.json(errorResponse('Unauthorized'), { status: 401 });

    const result = await fetchFromBackend(
      `https://localhost:5001/api/v1/users/${id}`,
      token
    );

    if (!result.ok) {
      return NextResponse.json(errorResponse(result.errorText || 'Failed to fetch user'), { status: result.status });
    }

    return NextResponse.json(successResponse(result.data));

  } catch (error) {
    return NextResponse.json(errorResponse('Failed to fetch user'), { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const token = getToken(request);
    if (!token) return NextResponse.json(errorResponse('Unauthorized'), { status: 401 });

    const body = await request.json();

    const result = await fetchFromBackend(
      `https://localhost:5001/api/v1/users/${id}`,
      token,
      {
        method: 'PUT',
        body: JSON.stringify({
            userName: body.userName,
  email: body.email,
  firstName: body.firstName,
  lastName: body.lastName,
  isActive: body.isActive,
  departmentIds: body.departmentIds || [],
  roleIds: body.roleIds || []
})
      }
    );

    if (!result.ok) {
      const errorData = result.data as Record<string, unknown>;
      return NextResponse.json(errorResponse((errorData?.message as string) || 'Failed to update user'), { status: result.status });
    }

    return NextResponse.json(successResponse(result.data));

  } catch (error) {
    return NextResponse.json(errorResponse('Failed to update user'), { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const token = getToken(request);
    if (!token) return NextResponse.json(errorResponse('Unauthorized'), { status: 401 });

    const result = await fetchFromBackend(
      `https://localhost:5001/api/v1/users/${id}`,
      token,
      { method: 'DELETE' }
    );

    if (!result.ok) {
      return NextResponse.json(errorResponse(result.errorText || 'Failed to delete user'), { status: result.status });
    }

    return NextResponse.json(successResponse(result.data));

  } catch (error) {
    return NextResponse.json(errorResponse('Failed to delete user'), { status: 500 });
  }
}