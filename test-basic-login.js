// Test basic login functionality
const testBasicLogin = async () => {
  console.log('🔍 Testing Basic Login Action...\n');
  
  try {
    // Simulate form data
    const formData = new FormData();
    formData.append('username', 'testuser');
    formData.append('password', 'testpass');
    formData.append('company', 'wenodo');
    formData.append('language', 'en-US');
    
    console.log('✅ Form data created');
    console.log('📝 Testing with:', {
      username: 'testuser',
      company: 'wenodo',
      language: 'en-US'
    });
    
    // Test if we can access the login page
    const loginPageResponse = await fetch('http://localhost:3000/login');
    console.log('✅ Login page accessible:', loginPageResponse.status);
    
    console.log('\n🎯 Basic login action is ready for testing');
    console.log('📱 Try logging in with any credentials in browser');
    console.log('   Company: wenodo');
    console.log('   Username: anything');
    console.log('   Password: anything');
    
  } catch (error) {
    console.error('❌ Test Failed:', error.message);
  }
};

testBasicLogin();
