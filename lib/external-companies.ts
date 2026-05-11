export interface ExternalCompany {
  id: string;
  name: string;
}

export async function fetchExternalCompanies(): Promise<ExternalCompany[]> {
  try {
    const response = await fetch('/api/auth/realms', {
      signal: AbortSignal.timeout(10000) // Increased timeout to 10 seconds
    });

    if (!response.ok) {
      console.warn('Realms API returned status:', response.status);
      return [];
    }

    const data = await response.json();
    return data?.data || [];

  } catch (error) {
    console.error('fetchExternalCompanies error:', error);
    // Return fallback data if API fails
    return [
      { id: 'wenodo', name: 'Wenodo' },
      { id: 'test-company', name: 'Test Company' }
    ];
  }
}