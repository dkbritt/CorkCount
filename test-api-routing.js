// Test the automatic API routing and fallback system
async function testApiRouting() {
  console.log("Testing API routing and fallback system...\n");
  
  const testEndpoints = [
    '/ping',
    '/config/supabase',
    '/config/email',
    '/inventory',
    '/orders',
    '/batches',
    '/metrics',
    '/auth/login',
    '/email'
  ];
  
  for (const endpoint of testEndpoints) {
    console.log(`Testing ${endpoint}:`);
    
    try {
      // Test local API first
      const localResponse = await fetch(`http://localhost:8080/api${endpoint}`);
      const localStatus = localResponse.status;
      const localOk = localResponse.ok;
      
      console.log(`  Local /api${endpoint}: ${localStatus} ${localOk ? '✅' : '❌'}`);
      
      // Test Netlify function path (expected to return HTML in dev)
      const netlifyResponse = await fetch(`http://localhost:8080/.netlify/functions${endpoint.replace(/^\//, '/')}`);
      const netlifyStatus = netlifyResponse.status;
      const netlifyText = await netlifyResponse.text();
      const isHtml = netlifyText.includes('<!doctype html>');
      
      console.log(`  Netlify /.netlify/functions: ${netlifyStatus} ${isHtml ? '(HTML - expected in dev)' : '(JSON)'}`);
      
    } catch (error) {
      console.log(`  Error: ${error.message}`);
    }
    
    console.log('');
  }
}

testApiRouting();
