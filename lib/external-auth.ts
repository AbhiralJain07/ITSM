export interface ExternalLoginRequest {
  realmName: string;
  userName: string;
  password: string;
}

export interface ExternalLoginResponse {
  success: boolean;
  token?: string;
  user?: {
    id: string;
    name: string;
    username: string;
    role: string;
    email?: string;
  };
  error?: string;
}

export async function authenticateWithExternalAPI(request: ExternalLoginRequest): Promise<ExternalLoginResponse> {
  try {
    // Revert to test endpoint for debugging
    const response = await fetch('http://localhost:3000/api/test/login', {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
      signal: AbortSignal.timeout(10000), // 10 second timeout
    });

    console.log('External auth response status:', response.status);
    
    if (response.ok) {
      const data = await response.json();
      console.log('External auth response:', data);
      
      // Handle the specific response format with elements object
      if (data.elements && data.elements.accessToken) {
        const elements = data.elements;
        
        // Extract user information from the response
        const user = {
          id: elements.tenantInternalId || `${request.realmName}-${request.userName}`,
          name: elements.displayName || elements.userName || request.userName,
          username: elements.userName || request.userName,
          role: mapRoleToSystemRole(elements.roles),
          email: elements.email || `${request.userName}@${request.realmName}.com`
        };
        
        return {
          success: true,
          token: elements.accessToken,
          user: user
        };
      }
      
      // Fallback for other response formats
      if (data.token || data.user) {
        return {
          success: true,
          token: data.token,
          user: data.user
        };
      } else if (data.success !== false) {
        // If no explicit user data, create a basic user from request
        return {
          success: true,
          user: {
            id: `${request.realmName}-${request.userName}`,
            name: request.userName,
            username: request.userName,
            role: 'user',
            email: `${request.userName}@${request.realmName}.com`
          }
        };
      }
    } else {
      // Handle error response
      const errorText = await response.text();
      console.warn('External auth error:', {
        status: response.status,
        statusText: response.statusText,
        body: errorText
      });
      
      return {
        success: false,
        error: `Authentication failed: ${response.status} ${response.statusText}`
      };
    }
    
    return {
      success: false,
      error: 'Unknown authentication error'
    };
  } catch (error) {
    console.error('External authentication error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Authentication service unavailable'
    };
  }
}

// Helper function to map external roles to system roles
function mapRoleToSystemRole(externalRoles: string[]): 'user' | 'agent' | 'admin' {
  if (!externalRoles || externalRoles.length === 0) {
    return 'user';
  }
  
  // Map external roles to system roles
  const roleMapping: Record<string, 'user' | 'agent' | 'admin'> = {
    'TenantAdmin': 'admin',
    'admin': 'admin',
    'administrator': 'admin',
    'Agent': 'agent',
    'agent': 'agent',
    'SupportAgent': 'agent',
    'User': 'user',
    'user': 'user'
  };
  
  // Find the highest priority role
  for (const externalRole of externalRoles) {
    if (roleMapping[externalRole]) {
      return roleMapping[externalRole];
    }
  }
  
  // Default to user if no mapping found
  return 'user';
}
