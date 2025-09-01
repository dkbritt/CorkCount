// Test script to verify ping endpoints are working correctly
async function testApiBaseResolution() {
  console.log("Testing API base resolution with fixed ping endpoints...");
  
  // Test the candidate bases one by one
  const candidates = [
    "/api",
    "/.netlify/functions/api"
  ];
  
  for (const base of candidates) {
    try {
      const response = await fetch(`http://localhost:8080${base}/ping`);
      const result = await response.text();
      console.log(`${base}/ping - Status: ${response.status}, Response: ${result.substring(0, 100)}${result.length > 100 ? '...' : ''}`);
    } catch (error) {
      console.log(`${base}/ping - Error: ${error.message}`);
    }
  }
  
  // Test the problematic path that should NOT work as API
  try {
    const response = await fetch("http://localhost:8080/api/api/ping");
    const result = await response.text();
    const isHtml = result.includes('<!doctype html>');
    console.log(`/api/api/ping - Status: ${response.status}, Is HTML (good): ${isHtml}`);
  } catch (error) {
    console.log(`/api/api/ping - Error: ${error.message}`);
  }
}

testApiBaseResolution();
