import { NextRequest, NextResponse } from 'next/server';
import { getToken, getAuthHeaders, unwrapApiResponse, successResponse, errorResponse, fetchFromBackend } from '@/lib/api-utils';

export async function GET(request: NextRequest) {
  try {
    const token = getToken(request);
    if (!token) return NextResponse.json(errorResponse('Unauthorized'), { status: 401 });

    const result = await fetchFromBackend(
      'https://localhost:5001/api/v1/sla-configurations?PageNumber=1&PageSize=50',
      token
    );

    if (!result.ok) {
      return NextResponse.json(errorResponse(result.errorText || 'Failed to fetch SLA configurations'), { status: result.status });
    }

    const items = unwrapApiResponse(result.data);
    return NextResponse.json(successResponse(items));

  } catch (error) {
    return NextResponse.json(errorResponse('Failed to fetch SLA configurations'), { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = getToken(request);
    if (!token) return NextResponse.json(errorResponse('Unauthorized'), { status: 401 });

    const body = await request.json();

    const result = await fetchFromBackend(
      'https://localhost:5001/api/v1/sla-configurations',
      token,
      {
        method: 'POST',
        body: JSON.stringify({
          name: body.name,
          responseTimeMinutes: Number(body.responseTimeMinutes),
          resolutionTimeMinutes: Number(body.resolutionTimeMinutes),
          businessHoursOnly: body.businessHoursOnly ?? false,
          isActive: body.isActive ?? true,
          isGlobal: body.isGlobal ?? false
        })
      }
    );

    if (!result.ok) {
      const errorData = result.data as Record<string, unknown>;
      return NextResponse.json(errorResponse((errorData?.message as string) || 'Failed to create SLA'), { status: result.status });
    }

    return NextResponse.json(successResponse(result.data));

  } catch (error) {
    return NextResponse.json(errorResponse('Failed to create SLA configuration'), { status: 500 });
  }
}