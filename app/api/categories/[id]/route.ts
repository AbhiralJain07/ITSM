import { NextRequest, NextResponse } from 'next/server';
import { getToken, unwrapApiResponse, successResponse, errorResponse, fetchFromBackend } from '@/lib/api-utils';

type Params = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const token = getToken(request);
    if (!token) return NextResponse.json(errorResponse('Unauthorized'), { status: 401 });

    const result = await fetchFromBackend(
      `https://localhost:5001/api/v1/categories/${id}`,
      token
    );

    if (!result.ok) {
      return NextResponse.json(errorResponse(result.errorText || 'Failed to fetch category'), { status: result.status });
    }

    const data = unwrapApiResponse(result.data);
    return NextResponse.json(successResponse(data));

  } catch (error) {
    return NextResponse.json(errorResponse('Failed to fetch category'), { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const token = getToken(request);
    if (!token) return NextResponse.json(errorResponse('Unauthorized'), { status: 401 });

    const body = await request.json();

    const result = await fetchFromBackend(
      `https://localhost:5001/api/v1/categories/${id}`,
      token,
      {
        method: 'PUT',
        body: JSON.stringify({
          name: body.name,
          code: body.code,
          departmentId: body.departmentId,
          isActive: body.isActive
        })
      }
    );

    if (!result.ok) {
      return NextResponse.json(errorResponse(result.errorText || 'Failed to update category'), { status: result.status });
    }

    return NextResponse.json(successResponse(result.data));

  } catch (error) {
    return NextResponse.json(errorResponse('Failed to update category'), { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const token = getToken(request);
    if (!token) return NextResponse.json(errorResponse('Unauthorized'), { status: 401 });

    const result = await fetchFromBackend(
      `https://localhost:5001/api/v1/categories/${id}`,
      token,
      { method: 'DELETE' }
    );

    if (!result.ok) {
      return NextResponse.json(errorResponse(result.errorText || 'Failed to delete category'), { status: result.status });
    }

    return NextResponse.json(successResponse(result.data));

  } catch (error) {
    return NextResponse.json(errorResponse('Failed to delete category'), { status: 500 });
  }
}