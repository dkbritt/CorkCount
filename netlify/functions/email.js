export const handler = async (event, context) => {
  // Set CORS headers
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Content-Type": "application/json",
  };

  // Handle preflight requests
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 200,
      headers,
      body: "",
    };
  }

  // Only allow POST requests
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({
        success: false,
        error: "Method not allowed",
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

    // Improved production detection - prioritize explicit production setting
    // 1. If NODE_ENV is explicitly set to production (highest priority)
    // 2. If we have a verified domain (not resend.dev)
    // 3. If explicitly not development (fallback)
    const isExplicitProduction = process.env.NODE_ENV === "production";
    const isProductionReady = isExplicitProduction || hasVerifiedDomain || (!testEmail && process.env.NODE_ENV !== "development");
    const isDevelopment = !isProductionReady && !isExplicitProduction;

    console.log(
      `Email mode detection: NODE_ENV=${process.env.NODE_ENV}, hasVerifiedDomain=${hasVerifiedDomain}, hasTestEmail=${!!testEmail}, isProductionReady=${isProductionReady}, isDevelopment=${isDevelopment}`,
    );

    const defaultFrom = `KB Winery <${fromEmail}>`;
    const body = event.body ? JSON.parse(event.body) : {};
    const { messages } = body;

    if (!Array.isArray(messages) || messages.length === 0) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          success: false,
          error: "No messages provided",
        }),
      };
    }

    // Process messages and handle development mode
    const emailsToSend = [];

    for (const msg of messages) {
      const recipients = Array.isArray(msg.to) ? msg.to : [msg.to];

      // In development mode, redirect emails to test address
      const finalRecipients =
        isDevelopment && testEmail ? [testEmail] : recipients;

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

      // ALWAYS send to admin for order confirmations if admin email is configured
      if (msg.type === "order_confirmation" && filEmail && msg.orderData) {
        const adminRecipient = isDevelopment && testEmail ? testEmail : filEmail;
        const adminSubject = isDevelopment
          ? `[TEST] New Order - ${msg.orderData.orderNumber} (for ${filEmail})`
          : `New Order Received - ${msg.orderData.orderNumber}`;

        // Create admin-specific email content
        const adminHtml = isDevelopment
          ? `<p><strong>TEST EMAIL - Original recipient: ${filEmail}</strong></p>
             <div style="background: #f0f8ff; padding: 15px; margin: 10px 0; border-left: 4px solid #0066cc;">
               <h4 style="margin: 0; color: #0066cc;">Admin Notification</h4>
               <p style="margin: 5px 0 0 0;">This is a copy of the customer order confirmation.</p>
             </div>
             ${msg.html}`
          : `<div style="background: #f0f8ff; padding: 15px; margin: 10px 0; border-left: 4px solid #0066cc;">
               <h4 style="margin: 0; color: #0066cc;">Admin Notification</h4>
               <p style="margin: 5px 0 0 0;">This is a copy of the customer order confirmation for order ${msg.orderData.orderNumber}.</p>
             </div>
             ${msg.html}`;

        console.log(
          `Adding admin email: ${adminRecipient} (dev mode: ${isDevelopment}, production: ${isProductionReady})`,
        );

        emailsToSend.push({
          from: msg.from || defaultFrom,
          to: [adminRecipient],
          subject: adminSubject,
          html: adminHtml,
          type: 'admin_notification'
        });
      }
    }

    // Only require test email in strict development mode (when explicitly using development features)
    if (isDevelopment && !testEmail && process.env.NODE_ENV !== "production") {
      console.warn(
        "Development mode detected but no VITE_TEST_EMAIL configured. Proceeding with caution.",
      );
      // Instead of failing, we'll just log a warning and proceed
      // This allows the system to work even without VITE_TEST_EMAIL in development
    }

    // In production mode, we should not require VITE_TEST_EMAIL
    if (isProductionReady) {
      console.log(
        "Running in production mode - bypassing VITE_TEST_EMAIL requirement",
      );
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
          // Add headers to improve deliverability
          headers: {
            'X-Entity-Ref-ID': `kb-winery-${Date.now()}`,
            'List-Unsubscribe': '<mailto:unsubscribe@kbwinery.com>',
            'X-Priority': '3',
            'X-Mailer': 'KB Winery Order System',
          },
          // Add tags for tracking
          tags: [
            {
              name: 'category',
              value: msg.type || 'order_confirmation'
            },
            {
              name: 'source',
              value: 'kb-winery-app'
            }
          ]
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
      .map((r, i) => ({ r, i, email: emailsToSend[i] }))
      .filter((x) => x.r.status === "rejected")
      .map((x) => ({
        index: x.i,
        recipient: Array.isArray(x.email.to) ? x.email.to[0] : x.email.to,
        type: x.email.type || 'customer',
        reason: x.r.reason?.message || String(x.r.reason) || "Unknown error",
      }));

    const successes = results.filter(r => r.status === "fulfilled").length;
    const customerEmails = emailsToSend.filter(e => !e.type || e.type === 'order_confirmation').length;
    const adminEmails = emailsToSend.filter(e => e.type === 'admin_notification').length;
    const customerSuccess = results.slice(0, customerEmails).every(r => r.status === "fulfilled");
    const adminSuccess = adminEmails === 0 || results.slice(customerEmails).every(r => r.status === "fulfilled");

    console.log(`Email results: ${successes}/${results.length} sent successfully. Customer: ${customerSuccess}, Admin: ${adminSuccess}`);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: failures.length === 0,
        failures,
        total: results.length,
        sent: successes,
        customerSuccess,
        adminSuccess,
        customerEmailCount: customerEmails,
        adminEmailCount: adminEmails
      }),
    };
  } catch (error) {
    console.error("Email error:", error);
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
