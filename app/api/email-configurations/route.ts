import { NextRequest, NextResponse } from 'next/server';
import { getToken, unwrapApiResponse, successResponse, errorResponse, fetchFromBackend } from '@/lib/api-utils';

export async function GET(request: NextRequest) {
  try {
    const token = getToken(request);
    if (!token) return NextResponse.json(errorResponse('Unauthorized'), { status: 401 });

    const result = await fetchFromBackend(
      'https://localhost:5001/api/v1/email-configurations?PageNumber=1&PageSize=50',
      token
    );

    if (!result.ok) {
      return NextResponse.json(errorResponse(result.errorText || 'Failed to fetch email configurations'), { status: result.status });
    }

    const items = unwrapApiResponse(result.data);
    return NextResponse.json(successResponse(items));

  } catch (error) {
    return NextResponse.json(errorResponse('Failed to fetch email configurations'), { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = getToken(request);
    if (!token) return NextResponse.json(errorResponse('Unauthorized'), { status: 401 });

    const body = await request.json();

    const result = await fetchFromBackend(
      'https://localhost:5001/api/v1/email-configurations',
      token,
      {
        method: 'POST',
        body: JSON.stringify({
          name: body.name,
          smtpHost: body.smtpHost,
          port: body.port,
          userName: body.userName,
          password: body.password,
          fromEmail: body.fromEmail,
          fromName: body.fromName,
          enableSsl: body.enableSsl,
          imapHost: body.imapHost,
          imapPort: body.imapPort,
          imapEnableSsl: body.imapEnableSsl,
          inboundMailboxFolder: body.inboundMailboxFolder,
          enableIncidentIngestion: body.enableIncidentIngestion,
          isActive: body.isActive
        })
      }
    );

    if (!result.ok) {
      const errorData = result.data as Record<string, unknown>;
      return NextResponse.json(errorResponse((errorData?.message as string) || 'Failed to create email config'), { status: result.status });
    }

    return NextResponse.json(successResponse(result.data));

  } catch (error) {
    return NextResponse.json(errorResponse('Failed to create email configuration'), { status: 500 });
  }
}