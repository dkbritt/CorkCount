// Final test of email function with fixed configuration
const testEmailPayload = {
  messages: [
    {
      type: "order_confirmation",
      to: "pingmesh.ai@gmail.com", // Test the specific email format from user requirements
      subject: "Test Order Confirmation - pingmesh.ai@gmail.com",
      html: "<h1>Email Validation Test</h1><p>Testing email with periods before @ symbol: pingmesh.ai@gmail.com</p>",
      orderData: {
        orderNumber: "TEST-002",
        customerEmail: "pingmesh.ai@gmail.com"
      }
    }
  ]
};

async function testEmailFunction() {
  try {
    console.log('🧪 Final Email Function Test...');
    console.log('📧 Testing email: pingmesh.ai@gmail.com (user requirement)');
    
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
      console.log('✅ Email function response received');
      
      if (result.success) {
        console.log('🎉 EMAIL FUNCTION FULLY WORKING!');
        console.log(`📤 Emails sent: ${result.sent}/${result.total}`);
        console.log(`👤 Customer success: ${result.customerSuccess}`);
        console.log(`👨‍💼 Admin success: ${result.adminSuccess}`);
      } else {
        console.log('⚠️  Email function working but emails not sent:');
        if (result.failures && result.failures.length > 0) {
          result.failures.forEach((failure, i) => {
            console.log(`   ${i+1}. ${failure.type}: ${failure.reason}`);
          });
        }
      }
      
      console.log(`🏠 Domain: ${result.domain}`);
      console.log(`📫 From: ${result.fromAddress}`);
      
    } else {
      const errorText = await response.text();
      console.log('❌ Email function error:');
      console.log('Error details:', errorText);
    }
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testEmailFunction();
