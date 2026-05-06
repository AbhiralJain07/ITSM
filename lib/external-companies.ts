export interface ExternalCompany {
  id: string;
  name: string;
  realm?: string;
}

export async function fetchExternalCompanies(): Promise<ExternalCompany[]> {
  try {
    // Revert to test endpoint for debugging
    const response = await fetch('http://localhost:3000/api/test/realms', {
      method: 'GET',
      headers: {
        'accept': 'application/json',
      },
      signal: AbortSignal.timeout(5000), // 5 second timeout
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('External companies response:', data);
    
    // Handle the specific response format with elements array
    if (data.elements && Array.isArray(data.elements)) {
      return data.elements.map((item: any) => ({
        id: item.realmName || item.displayName,
        name: item.displayName || item.realmName,
        realm: item.realmName
      }));
    }
    
    // Fallback for other formats
    if (Array.isArray(data)) {
      return data.map(item => ({
        id: item.realmName || item.displayName || item.id || item.name,
        name: item.displayName || item.realmName || item.name,
        realm: item.realmName
      }));
    }
    
    return [];
  } catch (error) {
    console.warn('Failed to fetch external companies:', error);
    // Return empty array to fallback to default companies
    return [];
  }
}
