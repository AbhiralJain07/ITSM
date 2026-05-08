import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    console.log('=== Categories API Called ===');
    
    // Get URL parameters to check for departmentId
    const { searchParams } = new URL(request.url);
    const departmentId = searchParams.get('departmentId');
    
    console.log('Department ID from params:', departmentId);
    
    // Build API URL with departmentId if provided
    let apiUrl = 'https://localhost:5001/api/v1/categories';
    if (departmentId) {
      apiUrl += `?departmentId=${departmentId}`;
    }
    
    console.log('Fetching from production API:', apiUrl);
    
    // Get authorization header from incoming request
    const authHeader = request.headers.get('authorization');
    console.log('Authorization header present:', !!authHeader);
    
    if (!authHeader) {
      console.warn('No authorization header provided - API requires authentication');
    }
    
    const headers: any = {
      'accept': 'application/json, text/plain'
    };
    
    // Forward authorization header to production API
    if (authHeader) {
      headers['authorization'] = authHeader;
      console.log('Forwarding authorization header to production API');
    } else {
      // If no auth header, try to use API key from environment or request
      const apiKey = process.env.CATEGORIES_API_KEY || request.headers.get('x-api-key');
      if (apiKey) {
        headers['x-api-key'] = apiKey;
        console.log('Using API key for authentication');
      } else {
        console.warn('No authentication method available - API will likely fail');
      }
    }
    
    const ignoreTls = process.env.CATEGORIES_API_IGNORE_TLS === 'true'
      || (process.env.NODE_ENV !== 'production' && apiUrl.startsWith('https://localhost'));

    if (ignoreTls) {
      process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
      console.warn('Ignoring TLS certificate verification for local production API requests');
    }
    
    console.log('Making request to:', apiUrl);
    console.log('With headers:', headers);
    
    // Call production API with authorization header if available
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers,
      // Add timeout to prevent hanging
      signal: AbortSignal.timeout(10000), // 10 second timeout
    });

    console.log('Production API Response status:', response.status);
    console.log('Production API Response headers:', Object.fromEntries(response.headers.entries()));
    
    // Read response body only ONCE - This is the fix!
    const responseText = await response.text();
    console.log('Raw response text:', responseText);
    
    if (!response.ok) {
      console.error('Production API error response:', responseText);
      
      // Provide helpful error messages
      if (response.status === 401) {
        throw new Error('Authentication required: Please ensure you are logged in to access categories');
      } else if (response.status === 403) {
        throw new Error('Access denied: You do not have permission to view categories');
      } else if (response.status === 500) {
        console.error('500 Internal Server Error - Production API issue');
        throw new Error(`Production API returned 500 Internal Server Error: ${responseText}`);
      }
      
      // Throw error instead of returning fallback to force real data usage
      throw new Error(`Production API returned ${response.status}: ${responseText}`);
    }

    const contentType = response.headers.get('content-type');
    console.log('Response content-type:', contentType);
    
    let data;
    
    // Parse from the already read responseText
    if (contentType && contentType.includes('application/json')) {
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.log('Failed to parse as JSON, treating as plain text');
        // If it's plain text, create a simple structure
        return NextResponse.json({
          success: true,
          data: [{
            id: '1',
            name: responseText.trim(),
            description: responseText.trim(),
            isActive: true
          }]
        });
      }
    } else {
      // Try to parse the raw response text as JSON
      try {
        data = JSON.parse(responseText);
        console.log('Parsed response text as JSON:', data);
      } catch (parseError) {
        console.log('Response is not JSON, treating as plain text');
        console.log('Plain text response:', responseText);
        
        // If it's plain text, create a simple structure
        return NextResponse.json({
          success: true,
          data: [{
            id: '1',
            name: responseText.trim(),
            description: responseText.trim(),
            isActive: true
          }]
        });
      }
    }

    console.log('Parsed data:', data);
    
    // Transform data to match our interface - handle the actual API response format
    let transformedData;
    if (data.elements && data.elements.items && Array.isArray(data.elements.items)) {
      // Handle the actual API response format
      transformedData = data.elements.items.map((item: any, index: number) => ({
        id: item.id?.toString() || (index + 1).toString(),
        name: item.name || item.code || `Category ${index + 1}`,
        description: item.name || item.code || 'Category description',
        isActive: item.isActive !== false, // Default to true if not specified
        categoryId: item.categoryId,
        categoryName: item.categoryName,
        code: item.code,
        departmentId: item.departmentId,
        subCategories: item.subCategories || []
      }));
    } else if (Array.isArray(data)) {
      // Fallback for array format
      transformedData = data.map((item: any, index: number) => ({
        id: item.id?.toString() || (index + 1).toString(),
        name: item.name || item.title || item.categoryName || `Category ${index + 1}`,
        description: item.description || item.desc || 'Category description',
        isActive: item.isActive !== false, // Default to true if not specified
        categoryId: item.categoryId,
        categoryName: item.categoryName,
        color: item.color,
        level: item.level,
        date: item.date
      }));
    } else if (data && typeof data === 'object') {
      // Single object case
      transformedData = [{
        id: data.id?.toString() || '1',
        name: data.name || data.title || 'Category',
        description: data.description || 'Category description',
        isActive: data.isActive !== false
      }];
    } else {
      // Throw error for unexpected data format to force real data usage
      throw new Error('Unexpected data format from production API');
    }

    console.log('Transformed data:', transformedData);

    return NextResponse.json({
      success: true,
      data: transformedData
    });

  } catch (error: unknown) {
    console.error('=== Categories API Error ===');
    console.error('Error type:', error instanceof Error ? error.constructor.name : 'Unknown');
    console.error('Error message:', error instanceof Error ? error.message : 'Unknown error');
    console.error('Full error:', error);
    
    // Return error instead of fallback
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('Creating category with body:', body);
    
    // Get authorization header from incoming request
    const authHeader = request.headers.get('authorization');
    console.log('Authorization header present:', !!authHeader);
    
    const headers: any = {
      'accept': 'text/plain',
      'Content-Type': 'application/json'
    };
    
    // Forward authorization header to production API
    if (authHeader) {
      headers['authorization'] = authHeader;
      console.log('Forwarding authorization header to production API');
    } else {
      // If no auth header, try to use API key from environment or request
      const apiKey = process.env.CATEGORIES_API_KEY || request.headers.get('x-api-key');
      if (apiKey) {
        headers['x-api-key'] = apiKey;
        console.log('Using API key for authentication');
      } else {
        console.warn('No authentication method available - API will likely fail');
      }
    }
    
    const apiUrl = 'https://localhost:5001/api/v1/categories';
    const ignoreTls = process.env.CATEGORIES_API_IGNORE_TLS === 'true'
      || (process.env.NODE_ENV !== 'production' && apiUrl.startsWith('https://localhost'));

    if (ignoreTls) {
      process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
      console.warn('Ignoring TLS certificate verification for local production API requests');
    }
    
    // Call production API with exact format
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        name: body.name,
        code: body.code || body.name?.toUpperCase().replace(/\s+/g, '_'),
        departmentId: body.departmentId,
        isActive: body.isActive !== false // Default to true
      }),
      signal: AbortSignal.timeout(10000)
    });

    console.log('Create category API Response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Create category API error:', errorText);
      return NextResponse.json(
        { error: `Failed to create category: ${errorText}` },
        { status: response.status }
      );
    }

    const responseText = await response.text();
    console.log('Create category raw response:', responseText);
    
    let data;
    try {
      data = JSON.parse(responseText);
    } catch {
      // If response is plain text, create success response
      data = { 
        success: true, 
        message: 'Category created successfully',
        data: {
          id: Date.now().toString(),
          name: body.name,
          code: body.code,
          departmentId: body.departmentId,
          isActive: body.isActive !== false
        }
      };
    }
    
    console.log('Category created successfully:', data);
    
    return NextResponse.json({
      success: true,
      data: data
    });

  } catch (error: unknown) {
    console.error('Create category API error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
