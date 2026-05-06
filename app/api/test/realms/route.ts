import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  // Simulate the exact response format from your external API
  const mockResponse = {
    "copyrights": "© 2026 WeWin Limited. All rights reserved. | Winflow™",
    "executionTimeInMilliseconds": "26",
    "message": "Request completed successfully.",
    "numberOfElements": 1,
    "elements": [
      {
        "realmName": "wenodo",
        "displayName": "wenodo"
      }
    ],
    "statusCode": 200
  };

  return NextResponse.json(mockResponse);
}
