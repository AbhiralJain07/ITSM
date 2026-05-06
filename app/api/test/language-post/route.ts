import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const headers = Object.fromEntries(request.headers.entries());
    
    console.log('=== External API Test Request ===');
    console.log('Headers:', headers);
    console.log('Body:', body);
    console.log('Content-Type:', headers['content-type']);
    
    // Try to parse as JSON
    try {
      const jsonBody = JSON.parse(body);
      console.log('Parsed JSON:', jsonBody);
      
      // Validate the expected format
      if (jsonBody.culture) {
        console.log('✅ Culture field found:', jsonBody.culture);
        return NextResponse.json({ 
          success: true, 
          message: `Language set to ${jsonBody.culture}`,
          received: jsonBody 
        });
      } else {
        console.log('❌ Culture field missing');
        return NextResponse.json({ 
          error: 'Culture field is required',
          received: jsonBody 
        }, { status: 400 });
      }
    } catch (parseError) {
      console.log('❌ JSON parse error:', parseError);
      return NextResponse.json({ 
        error: 'Invalid JSON format',
        body: body 
      }, { status: 400 });
    }
    
  } catch (error) {
    console.error('Test endpoint error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
