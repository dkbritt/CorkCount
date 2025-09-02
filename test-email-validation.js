// Test current regex vs Zod email validation
const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const testEmails = [
  'pingmesh.ai@gmail.com',
  'user.name@domain.com', 
  'test@sub.domain.co.uk',
  'simple@test.com',
  'test.email+tag@example.com',
  'user@domain-with-dash.com',
  'invalid@',
  '@invalid.com',
  'no-at-sign.com',
  'user@.com',
  'user@domain.',
  ''
];

console.log('=== Current Regex Test Results ===');
testEmails.forEach(email => {
  console.log(`${email.padEnd(30)}: ${regex.test(email)}`);
});

// Test Zod validation (will import in actual implementation)
console.log('\n=== Zod would provide built-in email validation ===');
console.log('Zod.string().email() provides RFC-compliant validation');
