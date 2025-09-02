// Test XHR fallback to verify it works independently of analytics
function xhrFetch(url, options = {}) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    const method = (options.method || 'GET').toUpperCase();
    
    xhr.open(method, url, true);
    
    // Set headers
    if (options.headers) {
      Object.entries(options.headers).forEach(([key, value]) => {
        xhr.setRequestHeader(key, value);
      });
    }
    
    xhr.timeout = 10000; // 10 seconds
    
    xhr.onload = () => {
      const response = {
        ok: xhr.status >= 200 && xhr.status < 300,
        status: xhr.status,
        statusText: xhr.statusText,
        text: () => Promise.resolve(xhr.responseText),
        json: () => Promise.resolve(JSON.parse(xhr.responseText)),
      };
      resolve(response);
    };
    
    xhr.onerror = () => {
      reject(new Error(`XHR Network Error: ${xhr.status} ${xhr.statusText}`));
    };
    
    xhr.ontimeout = () => {
      reject(new Error('Request timed out'));
    };
    
    xhr.send(options.body || null);
  });
}

async function testXhrFallback() {
  console.log('🔍 Testing XHR Fallback Implementation...\n');
  
  try {
    console.log('📡 Making XHR request to /api/inventory...');
    
    const response = await xhrFetch('http://localhost:8888/api/inventory', {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });
    
    console.log(`✅ XHR Response Status: ${response.status}`);
    console.log(`✅ XHR Response OK: ${response.ok}`);
    
    if (response.ok) {
      const data = await response.json();
      console.log(`✅ XHR Data: ${data.wines?.length || 0} wines received`);
      console.log(`✅ XHR Success: ${data.success}`);
    }
    
  } catch (error) {
    console.log(`❌ XHR Error: ${error.message}`);
  }
  
  console.log('\n🎯 XHR Implementation Benefits:');
  console.log('• Completely bypasses FullStory fetch wrapping');
  console.log('• Direct XMLHttpRequest - no analytics interference');
  console.log('• Automatic fallback when fetch fails');
  console.log('• Same timeout and error handling');
}

testXhrFallback();
