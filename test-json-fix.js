// Test that the frontend API routing now works correctly
async function testJsonParsing() {
  console.log("Testing JSON parsing fix...\n");
  
  const testEndpoints = [
    '/ping',
    '/inventory',
    '/metrics',
    '/config/supabase'
  ];
  
  for (const endpoint of testEndpoints) {
    try {
      // Simulate what the frontend does
      const response = await fetch(`http://localhost:8080/api${endpoint}`);
      console.log(`${endpoint}: Status ${response.status}`);
      
      if (response.ok) {
        const text = await response.text();
        try {
          JSON.parse(text);
          console.log(`  ✅ Valid JSON (${text.length} chars)`);
        } catch (e) {
          console.log(`  ❌ Invalid JSON: ${text.substring(0, 100)}...`);
        }
      } else {
        console.log(`  ❌ HTTP Error: ${response.status}`);
      }
    } catch (error) {
      console.log(`  ❌ Network Error: ${error.message}`);
    }
    console.log('');
  }
}

testJsonParsing();
