import { NextRequest, NextResponse } from 'next/server';
import { getToken, unwrapApiResponse, successResponse, errorResponse, fetchFromBackend } from '@/lib/api-utils';

export async function GET(request: NextRequest) {
  try {
    const token = getToken(request);
    if (!token) return NextResponse.json(errorResponse('Unauthorized'), { status: 401 });

    const { searchParams } = new URL(request.url);
    const masterTypeId = searchParams.get('masterTypeId') || '';

    let url = 'https://localhost:5001/api/v1/masterdata?PageNumber=1&PageSize=100';
    if (masterTypeId) {
      url += `&FilterBy=masterTypeId&FilterValue=${masterTypeId}`;
    }

    const result = await fetchFromBackend(url, token);

    if (!result.ok) {
      return NextResponse.json(errorResponse(result.errorText || 'Failed to fetch items'), { status: result.status });
    }

    const items = unwrapApiResponse(result.data);
    return NextResponse.json(successResponse(items));

  } catch (error) {
    return NextResponse.json(errorResponse('Failed to fetch masterdata'), { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = getToken(request);
    if (!token) return NextResponse.json(errorResponse('Unauthorized'), { status: 401 });

    const body = await request.json();

    const result = await fetchFromBackend(
      'https://localhost:5001/api/v1/masterdata',
      token,
      {
        method: 'POST',
        body: JSON.stringify({
          masterTypeId: body.masterTypeId,
          departmentId: body.departmentId,
          name: body.name,
          code: body.code,
          sortOrder: body.sortOrder || 0,
          isActive: body.isActive
        })
      }
    );

    if (!result.ok) {
      return NextResponse.json(errorResponse(result.errorText || 'Failed to create item'), { status: result.status });
    }

    return NextResponse.json(successResponse(result.data));

  } catch (error) {
    return NextResponse.json(errorResponse('Failed to create masterdata'), { status: 500 });
  }
}