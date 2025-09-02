// Test API connectivity to debug the fetch issue
async function testApiConnectivity() {
  console.log('🔍 Testing API Connectivity...\n');
  
  try {
    // Test direct fetch to inventory endpoint
    console.log('Testing: http://localhost:8888/api/inventory');
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    
    const response = await fetch('http://localhost:8888/api/inventory', {
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);
    
    console.log(`✅ Response Status: ${response.status}`);
    console.log(`✅ Response OK: ${response.ok}`);
    
    if (response.ok) {
      const data = await response.json();
      console.log(`✅ Data received:`, {
        success: data.success,
        wineCount: data.wines?.length || 0,
        hasError: !!data.error
      });
    } else {
      const errorText = await response.text();
      console.log(`❌ Error response:`, errorText);
    }
    
  } catch (error) {
    console.log(`❌ Fetch Error:`, error.message);
    console.log(`❌ Error Type:`, error.name);
    
    if (error.name === 'AbortError') {
      console.log('⚠️  Request timed out - server may be slow');
    } else if (error.message.includes('fetch')) {
      console.log('⚠️  Network connectivity issue detected');
    }
  }
  
  console.log('\n🔧 Potential Solutions:');
  console.log('1. Check if dev server is running (netlify dev)');
  console.log('2. Verify no firewall blocking localhost:8888');
  console.log('3. Clear browser cache and hard reload');
  console.log('4. Check browser console for additional errors');
}

testApiConnectivity();
