import { NextRequest, NextResponse } from 'next/server';
import { getSession, createSession } from '@/lib/session';

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    
    if (!session) {
      // Return 401 but don't log it as an error - this is expected when user is not logged in
      return NextResponse.json(null, { status: 401 });
    }

    return NextResponse.json({
      id: session.id,
      name: session.name,
      email: session.email,
      role: session.role,
      company: session.company,
      language: session.language,
      expiresAt: session.expiresAt.toISOString()
    });
  } catch (error) {
    console.error('Session API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, name, email, role, company, language } = body;
    
    console.log('Creating session:', { id, name, role });
    
    await createSession({
      id,
      name,
      email,
      role,
      company,
      language
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Session creation error:', error);
    return NextResponse.json({ error: 'Session creation failed' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await getSession();
    
    if (!session) {
      return NextResponse.json(null, { status: 401 });
    }

    const body = await request.json();
    const { language } = body;

    if (!language) {
      return NextResponse.json({ error: 'Language is required' }, { status: 400 });
    }

    // Update session with new language
    // Note: This is a simplified approach. In production, you might want to
    // update the session in your database or session store
    console.log('Updating session language to:', language);

    return NextResponse.json({ success: true, language });
  } catch (error) {
    console.error('Error updating session:', error);
    return NextResponse.json({ error: 'Failed to update session' }, { status: 500 });
  }
}
