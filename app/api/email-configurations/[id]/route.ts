import { NextRequest, NextResponse } from 'next/server';
import { getToken, successResponse, errorResponse, fetchFromBackend } from '@/lib/api-utils';

type Params = { params: Promise<{ id: string }> };

export async function PUT(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const token = getToken(request);
    if (!token) return NextResponse.json(errorResponse('Unauthorized'), { status: 401 });

    const body = await request.json();

    const result = await fetchFromBackend(
      `https://localhost:5001/api/v1/email-configurations/${id}`,
      token,
      {
        method: 'PUT',
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
      return NextResponse.json(errorResponse((errorData?.message as string) || 'Failed to update email config'), { status: result.status });
    }

    return NextResponse.json(successResponse(result.data));

  } catch (error) {
    return NextResponse.json(errorResponse('Failed to update email configuration'), { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const token = getToken(request);
    if (!token) return NextResponse.json(errorResponse('Unauthorized'), { status: 401 });

    const result = await fetchFromBackend(
      `https://localhost:5001/api/v1/email-configurations/${id}`,
      token,
      { method: 'DELETE' }
    );

    if (!result.ok) {
      return NextResponse.json(errorResponse(result.errorText || 'Failed to delete email config'), { status: result.status });
    }

    return NextResponse.json(successResponse(result.data));

  } catch (error) {
    return NextResponse.json(errorResponse('Failed to delete email configuration'), { status: 500 });
  }
}