// Utility to check email system status
export function getEmailStatus() {
  const fromEmail = import.meta.env.VITE_FROM_EMAIL;
  const hasVerifiedDomain = fromEmail && !fromEmail.includes('resend.dev');
  const isProductionReady = hasVerifiedDomain && import.meta.env.PROD;
  const isDevelopment = !isProductionReady;

  return {
    mode: isDevelopment ? 'DEVELOPMENT' : 'PRODUCTION',
    fromEmail: fromEmail || 'orders@resend.dev',
    hasVerifiedDomain,
    isProductionReady,
    isDevelopment,
    status: isDevelopment 
      ? 'Emails will be sent to test address (daishakb@gmail.com)' 
      : 'Emails will be sent to actual customers',
    requiresVerifiedDomain: !hasVerifiedDomain
  };
}

// Console helper to check email status
export function logEmailStatus() {
  const status = getEmailStatus();
  console.log('🔧 Email System Status:', status);
  return status;
}
