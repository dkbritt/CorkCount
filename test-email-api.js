// Test email function to verify it's working
const testEmailPayload = {
  messages: [
    {
      type: "order_confirmation",
      to: "test@example.com",
      subject: "Test Order Confirmation",
      html: "<h1>Test Email</h1><p>This is a test to verify the email function works after the fix.</p>",
      orderData: {
        orderNumber: "TEST-001",
        customerEmail: "test@example.com"
      }
    }
  ]
};

async function testEmailFunction() {
  try {
    console.log('🧪 Testing email function...');
    
    const response = await fetch('http://localhost:8888/api/email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testEmailPayload)
    });

    console.log(`📡 Response Status: ${response.status}`);
    
    if (response.ok) {
      const result = await response.json();
      console.log('✅ Email function is working!');
      console.log('📧 Response:', JSON.stringify(result, null, 2));
    } else {
      const errorText = await response.text();
      console.log('❌ Email function returned error:');
      console.log('Error details:', errorText);
    }
  } catch (error) {
    console.error('❌ Failed to test email function:', error.message);
  }
}

testEmailFunction();
