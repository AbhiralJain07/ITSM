import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { realmName, userName, password } = body;
    
    console.log('Test login request:', { realmName, userName, password: '***' });
    
    // Simulate your API response format
    if (realmName === 'wenodo' && userName === 'wenodoAdmin' && password === 'wenodo@123') {
      const mockResponse = {
        "copyrights": "© 2026 WeWin Limited. All rights reserved. | Winflow™",
        "executionTimeInMilliseconds": "2145",
        "message": "Login completed successfully.",
        "numberOfElements": 1,
        "elements": {
          "accessToken": "test-access-token-12345",
          "expiresIn": 300,
          "refreshExpiresIn": 1800,
          "refreshToken": "test-refresh-token-12345",
          "idToken": "test-id-token-12345",
          "tokenType": "Bearer",   
          "scope": "openid email profile",
          "userName": "wenodoAdmin",
          "displayName": "wenodoAdmin",
          "email": "admin@test.com",
          "tenantInternalId": "e7b24098-9c56-4036-913a-354130389a3f",
          "tenantIdentifier": "43869105-5d39-4bc4-8cf8-6645ddbfe151",
          "roles": [
            "TenantAdmin"
          ],
          "department": null,
          "roleDetails": [
            {
              "id": "66e1e453-e0ff-40c9-9afb-9874ace78b0c",
              "name": "TenantAdmin"
            }
          ]
        },
        "statusCode": 200
      };
      
      console.log('Test login successful');
      return NextResponse.json(mockResponse);
    } else {
      console.log('Test login failed - invalid credentials');
      return NextResponse.json({
        error: "Invalid credentials",
        message: "Authentication failed"
      }, { status: 401 });
    }
  } catch (error) {
    console.error('Test login error:', error);
    return NextResponse.json({
      error: "Internal server error",
      message: "Login service unavailable"
    }, { status: 500 });
  }
}
