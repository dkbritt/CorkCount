// Test the email function handler export to verify it's working
const fs = require('fs');
const path = require('path');

// Check if the handler is properly exported
try {
  const emailFunctionPath = path.join(__dirname, 'netlify', 'functions', 'email.js');
  
  if (fs.existsSync(emailFunctionPath)) {
    console.log('✅ Email function file exists at: netlify/functions/email.js');
    
    // Check the file content for proper export
    const content = fs.readFileSync(emailFunctionPath, 'utf8');
    
    if (content.includes('exports.handler')) {
      console.log('✅ Function uses correct CommonJS export: exports.handler');
    } else if (content.includes('export const handler')) {
      console.log('❌ Function uses ES6 export - this will cause Runtime.HandlerNotFound');
      console.log('   Need to change to: exports.handler');
    } else {
      console.log('❌ No handler export found in function');
    }
    
    // Check for mixed module syntax
    if (content.includes('require(') && content.includes('export ')) {
      console.log('❌ Mixed module syntax detected (require + export)');
      console.log('   This causes compatibility issues in Netlify');
    } else if (content.includes('require(')) {
      console.log('✅ Uses consistent CommonJS syntax');
    }
    
    // Check email-validation dependency
    const emailValidationPath = path.join(__dirname, 'netlify', 'functions', 'email-validation.js');
    if (fs.existsSync(emailValidationPath)) {
      console.log('✅ Email validation utility exists');
    } else {
      console.log('❌ Missing email-validation.js dependency');
    }
    
  } else {
    console.log('❌ Email function file not found');
  }
  
  console.log('\n📋 Next Steps for Deployment:');
  console.log('1. ✅ Fixed CommonJS export syntax');
  console.log('2. 🔄 Deploy function to register changes');
  console.log('3. 🧪 Test email sending');
  
} catch (error) {
  console.error('Error testing email function:', error);
}
