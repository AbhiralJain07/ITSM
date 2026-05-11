import { NextResponse } from 'next/server';

// Configure TLS based on environment
if (process.env.AUTH_API_IGNORE_TLS === 'true') {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
}

export async function GET() {
  // Immediate fix: Return Wenodo company directly since enterprise API is not available
  console.log('Realms API called - returning Wenodo company');
  
  const companies = [
    { id: 'wenodo', name: 'Wenodo' }
  ];

  console.log('Returning companies:', companies);
  return NextResponse.json({ success: true, data: companies });
}