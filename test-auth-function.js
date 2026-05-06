// Test the external authentication function directly
const testAuthFunction = async () => {
  console.log('🔍 Testing External Auth Function...\n');
  
  try {
    // Import the function (simulate server-side call)
    const response = await fetch('http://localhost:3000/api/test/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        realmName: 'wenodo',
        userName: 'wenodoAdmin',
        password: 'wenodo@123'
      })
    });
    
    const data = await response.json();
    console.log('✅ API Response Status:', response.status);
    console.log('✅ Has accessToken:', !!data.elements.accessToken);
    console.log('✅ User Data:', {
      displayName: data.elements.displayName,
      userName: data.elements.userName,
      email: data.elements.email,
      roles: data.elements.roles
    });
    
    // Simulate the parsing logic from external-auth.ts
    if (data.elements && data.elements.accessToken) {
      const elements = data.elements;
      const user = {
        id: elements.tenantInternalId || `wenodo-wenodoAdmin`,
        name: elements.displayName || elements.userName || 'wenodoAdmin',
        username: elements.userName || 'wenodoAdmin',
        role: elements.roles.includes('TenantAdmin') ? 'admin' : 'user',
        email: elements.email || `wenodoAdmin@wenodo.com`
      };
      
      console.log('✅ Parsed User Data:', user);
      console.log('🎉 Authentication would be successful!');
    } else {
      console.log('❌ Authentication would fail - missing data');
    }
    
  } catch (error) {
    console.error('❌ Test Failed:', error.message);
  }
};

testAuthFunction();
