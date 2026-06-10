/**
 * Client-side API utilities for frontend
 * Provides reusable functions for API calls with proper error handling
 */

const getToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return sessionStorage.getItem('accessToken');
};

const getRefreshToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return sessionStorage.getItem('refreshToken');
};

const getAuthHeaders = (): Record<string, string> => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  const token = getToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

let refreshPromise: Promise<string | null> | null = null;

async function clearSessionAndRedirect() {
  if (typeof window !== 'undefined') {
    sessionStorage.removeItem('accessToken');
    sessionStorage.removeItem('refreshToken');
    try {
      await fetch('/api/auth/session', { method: 'DELETE' });
    } catch (e) {
      console.warn('Failed to call delete session API:', e);
    }
    window.location.href = '/login';
  }
}

async function handleTokenRefresh(): Promise<string | null> {
  if (refreshPromise) {
    return refreshPromise;
  }

  const refreshToken = getRefreshToken();
  if (!refreshToken) {
    clearSessionAndRedirect();
    return null;
  }

  refreshPromise = (async () => {
    try {
      console.log('Attempting silent token refresh...');
      const response = await fetch('https://localhost:5001/api/v1/auth/refresh', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          refreshToken: refreshToken
        })
      });

      if (!response.ok) {
        throw new Error('Refresh request failed on server');
      }

      const result = await response.json();
      const data = result.elements || result;

      if (data && data.accessToken) {
        sessionStorage.setItem('accessToken', data.accessToken);
        if (data.refreshToken) {
          sessionStorage.setItem('refreshToken', data.refreshToken);
        }
        console.log('Token successfully refreshed');
        return data.accessToken;
      }
      throw new Error('Invalid token structure in refresh response');
    } catch (error) {
      console.error('Failed to refresh authentication token:', error);
      await clearSessionAndRedirect();
      return null;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

/**
 * Generic fetch function for API calls
 */
export async function apiFetch<T = unknown>(
  url: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  try {
    let response = await fetch(url, {
      ...options,
      headers: { ...getAuthHeaders(), ...options.headers },
    });

    // Handle token expiration/401 Unauthorized
    if (response.status === 401) {
      const refreshedToken = await handleTokenRefresh();
      if (refreshedToken) {
        // Retry with new headers
        const retryHeaders = {
          ...options.headers,
          'Authorization': `Bearer ${refreshedToken}`,
        } as Record<string, string>;
        
        response = await fetch(url, {
          ...options,
          headers: { ...getAuthHeaders(), ...retryHeaders },
        });
      }
    }

    const text = await response.text();
    let result: any = null;
    try {
      result = text ? JSON.parse(text) : null;
    } catch {
      result = { error: text || 'Request failed' };
    }

    if (!response.ok) {
      return {
        success: false,
        error: result?.error || result?.message || 'Request failed',
      };
    }

    return {
      success: true,
      data: result?.data,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Network error',
    };
  }
}

/**
 * GET request
 */
export async function apiGet<T = unknown>(url: string): Promise<ApiResponse<T>> {
  return apiFetch<T>(url, { method: 'GET' });
}

/**
 * POST request
 */
export async function apiPost<T = unknown>(
  url: string,
  body: unknown
): Promise<ApiResponse<T>> {
  return apiFetch<T>(url, {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

/**
 * PUT request
 */
export async function apiPut<T = unknown>(
  url: string,
  body: unknown
): Promise<ApiResponse<T>> {
  return apiFetch<T>(url, {
    method: 'PUT',
    body: JSON.stringify(body),
  });
}

/**
 * DELETE request
 */
export async function apiDelete<T = unknown>(url: string): Promise<ApiResponse<T>> {
  return apiFetch<T>(url, { method: 'DELETE' });
}
