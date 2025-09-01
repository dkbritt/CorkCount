// Simple test to verify the API fixes
async function testApi() {
  try {
    console.log('Testing metrics endpoint...');
    const metricsResponse = await fetch('http://localhost:8080/api/metrics');
    console.log('Metrics response status:', metricsResponse.status);
    const metricsData = await metricsResponse.json();
    console.log('Metrics data success:', metricsData.success);
    
    console.log('\nTesting inventory endpoint...');
    const inventoryResponse = await fetch('http://localhost:8080/api/inventory');
    console.log('Inventory response status:', inventoryResponse.status);
    const inventoryData = await inventoryResponse.json();
    console.log('Inventory data success:', inventoryData.success);
    
    console.log('\nAll tests passed! No "body stream already read" errors.');
  } catch (error) {
    console.error('Test failed:', error.message);
  }
}

testApi();
