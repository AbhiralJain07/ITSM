import { NextRequest } from 'next/server';

// Disable TLS verification for local development
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

/**
 * Extracts authentication token from request
 * Priority: Cookie > Authorization header (Bearer) > Authorization header (lowercase)
 */
export function getToken(request: NextRequest): string | null {
  return (
    request.cookies.get('access_token')?.value ||
    request.headers.get('authorization')?.replace('Bearer ', '') ||
    request.headers.get('Authorization')?.replace('Bearer ', '') ||
    null
  );
}

/**
 * Creates authorization headers for API requests
 */
export function getAuthHeaders(token: string | null): Record<string, string> {
  const headers: Record<string, string> = {
    'accept': 'application/json',
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

/**
 * Unwraps backend API response that may be wrapped in 'elements' property
 * Handles different response formats from the backend
 */
export function unwrapApiResponse(data: unknown): unknown {
  if (!data || typeof data !== 'object') return [];
  
  const obj = data as Record<string, unknown>;
  
  // Handle { elements: { items: [...] } } format
  if (obj.elements && typeof obj.elements === 'object') {
    const elements = obj.elements as Record<string, unknown>;
    if (elements.items && Array.isArray(elements.items)) {
      return elements.items;
    }
    return elements;
  }
  
  // Handle { items: [...] } format
  if (obj.items && Array.isArray(obj.items)) {
    return obj.items;
  }
  
  // Handle direct array
  if (Array.isArray(obj)) {
    return obj;
  }
  
  // Return as-is for single objects
  return obj;
}

/**
 * Standard success response wrapper
 */
export function successResponse(data: unknown) {
  return {
    success: true,
    data,
  };
}

/**
 * Standard error response wrapper
 */
export function errorResponse(message: string, status: number = 500) {
  return {
    success: false,
    error: message,
  };
}

/**
 * Fetches data from backend API with standard error handling
 */
export async function fetchFromBackend(
  url: string,
  token: string | null,
  options: RequestInit = {}
): Promise<{ data: unknown; ok: boolean; status: number; errorText?: string }> {
  try {
    const headers = getAuthHeaders(token);
    const response = await fetch(url, {
      ...options,
      headers: { ...headers, ...options.headers },
    });

    const text = await response.text();
    let data: unknown = null;
    try {
      data = text ? JSON.parse(text) : null;
    } catch {
      data = text;
    }

    return {
      data,
      ok: response.ok,
      status: response.status,
      errorText: !response.ok ? text : undefined,
    };
  } catch (error) {
    return {
      data: null,
      ok: false,
      status: 500,
      errorText: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
