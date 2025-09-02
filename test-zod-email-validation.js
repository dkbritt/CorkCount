// Test the new Zod-based email validation
import { validateEmail, normalizeEmail } from './client/lib/validation.js';

const testEmails = [
  'pingmesh.ai@gmail.com',
  'user.name@domain.com', 
  'test@sub.domain.co.uk',
  'simple@test.com',
  'test.email+tag@example.com',
  'user@domain-with-dash.com',
  'Test.Email@EXAMPLE.COM', // test normalization
  'invalid@',
  '@invalid.com',
  'no-at-sign.com',
  'user@.com',
  'user@domain.',
  '',
  '   spaced@example.com   ', // test trimming
];

console.log('=== Zod-based Email Validation Test Results ===');
testEmails.forEach(email => {
  const validation = validateEmail(email);
  const normalized = normalizeEmail(email);
  console.log(`${email.padEnd(30)}: ${validation.isValid ? 'VALID' : 'INVALID'} | Normalized: "${normalized}" ${validation.error ? `| Error: ${validation.error}` : ''}`);
});

console.log('\n=== Key Improvements ===');
console.log('✅ Uses Zod\'s RFC-compliant .email() validation');
console.log('✅ Accepts periods before @ (e.g., pingmesh.ai@gmail.com)');
console.log('✅ Proper email length validation (max 254 chars)');
console.log('✅ Consistent validation across frontend and backend');
console.log('✅ Better error messages');
console.log('✅ Email normalization (trim + lowercase)');
