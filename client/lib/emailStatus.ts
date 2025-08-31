// Utility to check email system status from server
interface EmailConfig {
  isConfigured: boolean;
  hasVerifiedDomain: boolean;
  isProductionReady: boolean;
  isDevelopment: boolean;
  status: string;
}

let emailConfig: EmailConfig | null = null;

async function loadEmailConfig(): Promise<EmailConfig> {
  if (emailConfig) return emailConfig;
  
  try {
    const response = await fetch("/api/config/email");
    if (!response.ok) {
      throw new Error(`Failed to load email configuration: ${response.status}`);
    }
    emailConfig = await response.json();
    return emailConfig;
  } catch (error) {
    console.warn("Failed to load email configuration:", error);
    emailConfig = {
      isConfigured: false,
      hasVerifiedDomain: false,
      isProductionReady: false,
      isDevelopment: true,
      status: "Email configuration unavailable"
    };
    return emailConfig;
  }
}

// Get email status from server
export async function getEmailStatus(): Promise<EmailConfig> {
  return await loadEmailConfig();
}

// Helper to check email status (for internal use only)
export async function checkEmailStatus(): Promise<EmailConfig> {
  return await getEmailStatus();
}
