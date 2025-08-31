// Utility to check email system status
export function getEmailStatus() {
  const fromEmail = import.meta.env.VITE_FROM_EMAIL;
  const hasVerifiedDomain = fromEmail && !fromEmail.includes("resend.dev");
  const isProductionReady = hasVerifiedDomain && import.meta.env.PROD;
  const isDevelopment = !isProductionReady;

  return {
    mode: isDevelopment ? "DEVELOPMENT" : "PRODUCTION",
    fromEmail: fromEmail || "NOT_CONFIGURED",
    hasVerifiedDomain,
    isProductionReady,
    isDevelopment,
    status: !fromEmail
      ? "Email not configured - missing VITE_FROM_EMAIL"
      : isDevelopment
        ? "Emails will be sent to test address (set VITE_TEST_EMAIL)"
        : "Emails will be sent to actual customers",
    requiresVerifiedDomain: !hasVerifiedDomain,
  };
}

// Console helper to check email status
export function logEmailStatus() {
  const status = getEmailStatus();
  console.log("🔧 Email System Status:", status);
  return status;
}
