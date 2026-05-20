import { NextRequest, NextResponse } from 'next/server';
import { getToken, unwrapApiResponse, successResponse, errorResponse, fetchFromBackend } from '@/lib/api-utils';

export async function GET(request: NextRequest) {
  try {
    const token = getToken(request);
    if (!token) return NextResponse.json(errorResponse('Unauthorized'), { status: 401 });

    const result = await fetchFromBackend(
      'https://localhost:5001/api/v1/mastertypes?PageNumber=1&PageSize=50',
      token
    );

    if (!result.ok) {
      return NextResponse.json(errorResponse(result.errorText || 'Failed to fetch mastertypes'), { status: result.status });
    }

    const items = unwrapApiResponse(result.data);
    return NextResponse.json(successResponse(items));

  } catch (error) {
    return NextResponse.json(errorResponse('Failed to fetch mastertypes'), { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = getToken(request);
    if (!token) return NextResponse.json(errorResponse('Unauthorized'), { status: 401 });

    const body = await request.json();

    const result = await fetchFromBackend(
      'https://localhost:5001/api/v1/mastertypes',
      token,
      {
        method: 'POST',
        body: JSON.stringify({
          name: body.name,
          code: body.code,
          isActive: body.isActive
        })
      }
    );

    if (!result.ok) {
      return NextResponse.json(errorResponse(result.errorText || 'Failed to create mastertype'), { status: result.status });
    }

    return NextResponse.json(successResponse(result.data));

  } catch (error) {
    return NextResponse.json(errorResponse('Failed to create mastertype'), { status: 500 });
  }
}