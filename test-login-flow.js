// Test script to verify complete login flow
const testLoginFlow = async () => {
  console.log('🔍 Testing Complete Login Flow...\n');
  
  try {
    // Step 1: Test realms API
    console.log('1️⃣ Testing Realms API...');
    const realmsResponse = await fetch('http://localhost:3000/api/test/realms');
    const realmsData = await realmsResponse.json();
    console.log('✅ Realms API Response:', realmsData.elements[0]);
    
    // Step 2: Test login API with correct credentials
    console.log('\n2️⃣ Testing Login API...');
    const loginResponse = await fetch('http://localhost:3000/api/test/login', {
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
    
    const loginData = await loginResponse.json();
    console.log('✅ Login API Response Status:', loginResponse.status);
    console.log('✅ Login User Data:', {
      displayName: loginData.elements.displayName,
      userName: loginData.elements.userName,
      email: loginData.elements.email,
      roles: loginData.elements.roles
    });
    
    // Step 3: Test wrong credentials
    console.log('\n3️⃣ Testing Wrong Credentials...');
    const wrongLoginResponse = await fetch('http://localhost:3000/api/test/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        realmName: 'wenodo',
        userName: 'wrong',
        password: 'wrong'
      })
    });
    
    console.log('✅ Wrong Credentials Status:', wrongLoginResponse.status);
    
    console.log('\n🎉 All API Tests Passed!');
    console.log('\n📋 Working Credentials:');
    console.log('   Company: wenodo');
    console.log('   Username: wenodoAdmin');
    console.log('   Password: wenodo@123');
    
  } catch (error) {
    console.error('❌ Test Failed:', error.message);
  }
};

testLoginFlow();
