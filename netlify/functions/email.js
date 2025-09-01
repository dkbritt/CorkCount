export const handler = async (event, context) => {
  // Set CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json',
  };

  // Handle preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: '',
    };
  }

  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ 
        success: false, 
        error: 'Method not allowed' 
      }),
    };
  }

  try {
    const RESEND_API_KEY = process.env.RESEND_API_KEY;
    if (!RESEND_API_KEY) {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({
          success: false,
          error: "Email service not configured - missing RESEND_API_KEY",
        }),
      };
    }

    const fromEmail = process.env.VITE_FROM_EMAIL;
    if (!fromEmail) {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({
          success: false,
          error: "Email service not configured - missing FROM_EMAIL",
        }),
      };
    }

    const filEmail = process.env.VITE_FIL_EMAIL;
    const testEmail = process.env.VITE_TEST_EMAIL;
    const hasVerifiedDomain = !fromEmail.includes("resend.dev");
    const isProductionReady = hasVerifiedDomain && process.env.NODE_ENV === "production";
    const isDevelopment = !isProductionReady;

    const defaultFrom = `KB Winery <${fromEmail}>`;
    const body = event.body ? JSON.parse(event.body) : {};
    const { messages } = body;

    if (!Array.isArray(messages) || messages.length === 0) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ 
          success: false, 
          error: "No messages provided" 
        }),
      };
    }

    // Process messages and handle development mode
    const emailsToSend = [];

    for (const msg of messages) {
      const recipients = Array.isArray(msg.to) ? msg.to : [msg.to];

      // In development mode, redirect emails to test address
      const finalRecipients = isDevelopment && testEmail ? [testEmail] : recipients;

      // Adjust subject and content for development mode
      const finalSubject = isDevelopment
        ? `[TEST] ${msg.subject} (for ${recipients.join(", ")})`
        : msg.subject;

      const finalHtml = isDevelopment
        ? `<p><strong>TEST EMAIL - Original recipients: ${recipients.join(", ")}</strong></p>${msg.html}`
        : msg.html;

      emailsToSend.push({
        from: msg.from || defaultFrom,
        to: finalRecipients,
        subject: finalSubject,
        html: finalHtml,
      });

      // For order confirmations, also send to admin if configured
      if (msg.type === "order_confirmation" && filEmail && msg.orderData) {
        const adminRecipient = isDevelopment && testEmail ? testEmail : filEmail;
        const adminSubject = isDevelopment
          ? `[TEST] New Order - ${msg.orderData.orderNumber} (for ${filEmail})`
          : `New Order Received - ${msg.orderData.orderNumber}`;
        const adminHtml = isDevelopment
          ? `<p><strong>TEST EMAIL - Original recipient: ${filEmail}</strong></p>${msg.html}`
          : msg.html;

        emailsToSend.push({
          from: msg.from || defaultFrom,
          to: [adminRecipient],
          subject: adminSubject,
          html: adminHtml,
        });
      }
    }

    // Validate test email is configured for development mode
    if (isDevelopment && !testEmail) {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({
          success: false,
          error: "Development mode requires VITE_TEST_EMAIL to be configured",
        }),
      };
    }

    const sendOne = async (msg) => {
      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: msg.from || defaultFrom,
          to: msg.to,
          subject: msg.subject,
          html: msg.html,
        }),
      });
      if (!response.ok) {
        const text = await response.text().catch(() => "");
        throw new Error(`Email API error: ${response.status} ${text}`.trim());
      }
      return response.json();
    };

    const results = await Promise.allSettled(emailsToSend.map(sendOne));
    const failures = results
      .map((r, i) => ({ r, i }))
      .filter((x) => x.r.status === "rejected")
      .map((x) => ({
        index: x.i,
        reason:
          x.r.reason?.message ||
          String(x.r.reason) ||
          "Unknown error",
      }));

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: failures.length === 0,
        failures,
        total: results.length,
      }),
    };
  } catch (error) {
    console.error('Email error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : "Unknown server error",
      }),
    };
  }
};
