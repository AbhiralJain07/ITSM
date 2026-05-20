import { NextRequest, NextResponse } from 'next/server';
import { getToken, unwrapApiResponse, successResponse, errorResponse, fetchFromBackend } from '@/lib/api-utils';

type Params = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const token = getToken(request);
    if (!token) return NextResponse.json(errorResponse('Unauthorized'), { status: 401 });

    const result = await fetchFromBackend(
      `https://localhost:5001/api/v1/subcategories/${id}`,
      token
    );

    if (!result.ok) {
      return NextResponse.json(errorResponse(result.errorText || 'Failed to fetch subcategory'), { status: result.status });
    }

    const data = unwrapApiResponse(result.data);
    return NextResponse.json(successResponse(data));

  } catch (error) {
    return NextResponse.json(errorResponse('Failed to fetch subcategory'), { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const token = getToken(request);
    if (!token) return NextResponse.json(errorResponse('Unauthorized'), { status: 401 });

    const body = await request.json();

    const result = await fetchFromBackend(
      `https://localhost:5001/api/v1/subcategories/${id}`,
      token,
      {
        method: 'PUT',
        body: JSON.stringify({
          categoryId: body.categoryId,
          departmentId: body.departmentId,
          name: body.name,
          code: body.code,
          isActive: body.isActive
        })
      }
    );

    if (!result.ok) {
      return NextResponse.json(errorResponse(result.errorText || 'Failed to update subcategory'), { status: result.status });
    }

    return NextResponse.json(successResponse(result.data));

  } catch (error) {
    return NextResponse.json(errorResponse('Failed to update subcategory'), { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const token = getToken(request);
    if (!token) return NextResponse.json(errorResponse('Unauthorized'), { status: 401 });

    const result = await fetchFromBackend(
      `https://localhost:5001/api/v1/subcategories/${id}`,
      token,
      { method: 'DELETE' }
    );

    if (!result.ok) {
      return NextResponse.json(errorResponse(result.errorText || 'Failed to delete subcategory'), { status: result.status });
    }

    return NextResponse.json(successResponse(result.data));

  } catch (error) {
    return NextResponse.json(errorResponse('Failed to delete subcategory'), { status: 500 });
  }
}