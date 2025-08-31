// Utility to check email system status from server
interface EmailConfig {
  isConfigured: boolean;
  hasVerifiedDomain: boolean;
  isProductionReady: boolean;
  isDevelopment: boolean;
  status: string;
}

let emailConfig: EmailConfig | null = null;
let configLoadAttempted = false;

async function loadEmailConfig(): Promise<EmailConfig> {
  if (emailConfig) return emailConfig;
  if (configLoadAttempted) return emailConfig || getDefaultEmailConfig();

  configLoadAttempted = true;

  try {
    const response = await fetch("/api/config/email");
    if (!response.ok) {
      throw new Error(`Server returned ${response.status}`);
    }
    emailConfig = await response.json();
    console.log("✅ Loaded email configuration from server");
    return emailConfig;
  } catch (error) {
    console.warn("⚠️ Failed to load email configuration from server:", error);

    // Fallback to environment variables if server is not available (development mode)
    const fallbackFromEmail = (import.meta.env as any).VITE_FROM_EMAIL;

    if (fallbackFromEmail) {
      console.log("🔧 Using fallback email configuration");
      const hasVerifiedDomain = !fallbackFromEmail.includes("resend.dev");
      const isProductionReady =
        hasVerifiedDomain && (import.meta.env as any).PROD;

      emailConfig = {
        isConfigured: true,
        hasVerifiedDomain,
        isProductionReady,
        isDevelopment: !isProductionReady,
        status: !isProductionReady
          ? "Development mode - emails redirected to test address"
          : "Production mode - emails sent to actual recipients",
      };
    } else {
      console.log("❌ No email configuration available");
      emailConfig = getDefaultEmailConfig();
    }
    return emailConfig;
  }
}

function getDefaultEmailConfig(): EmailConfig {
  return {
    isConfigured: false,
    hasVerifiedDomain: false,
    isProductionReady: false,
    isDevelopment: true,
    status: "Email service not configured - server unavailable",
  };
}

// Get email status from server
export async function getEmailStatus(): Promise<EmailConfig> {
  return await loadEmailConfig();
}

// Helper to check email status (for internal use only)
export async function checkEmailStatus(): Promise<EmailConfig> {
  return await getEmailStatus();
}
