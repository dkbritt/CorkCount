// Debug email configuration to identify domain issues
async function debugEmailConfig() {
  try {
    console.log('🔍 Debugging Email Configuration...\n');
    
    // Test the email function's config endpoint to see environment
    const configResponse = await fetch('http://localhost:8888/api/config');
    if (configResponse.ok) {
      const config = await configResponse.json();
      console.log('📧 Email Environment Variables:');
      console.log(`   VITE_FROM_EMAIL: ${config.VITE_FROM_EMAIL || 'not set'}`);
      console.log(`   VITE_FIL_EMAIL: ${config.VITE_FIL_EMAIL || 'not set'}`);
      console.log(`   VITE_TEST_EMAIL: ${config.VITE_TEST_EMAIL || 'not set'}`);
      console.log(`   NODE_ENV: ${config.NODE_ENV || 'not set'}`);
      console.log(`   RESEND_API_KEY: ${config.RESEND_API_KEY ? 'configured ✅' : 'missing ❌'}`);
      
      console.log('\n🏠 Domain Configuration:');
      console.log(`   Expected: orders@corkcount.app`);
      console.log(`   Actual: ${config.VITE_FROM_EMAIL || 'orders@resend.dev (default)'}`);
      
      if (config.VITE_FROM_EMAIL && config.VITE_FROM_EMAIL.includes('corkcount.app')) {
        console.log('   ✅ Using verified corkcount.app domain');
      } else {
        console.log('   ⚠️  Using resend.dev sandbox domain (testing only)');
      }
    } else {
      console.log('❌ Could not fetch config');
    }
    
    console.log('\n🎯 Issue Analysis:');
    console.log('   Admin email sent: ✅ (to verified address)');  
    console.log('   Customer email failed: ❌ (domain verification needed)');
    console.log('\n💡 Solutions:');
    console.log('   1. Set VITE_FROM_EMAIL=orders@corkcount.app');
    console.log('   2. Verify corkcount.app domain in Resend dashboard');
    console.log('   3. For testing: use VITE_TEST_EMAIL to redirect all emails');
    
  } catch (error) {
    console.error('❌ Debug failed:', error.message);
  }
}

debugEmailConfig();
