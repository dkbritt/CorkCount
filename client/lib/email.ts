// Email service for order confirmations and status updates
import { CartItem } from "@/components/CartModal";

interface OrderEmailData {
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  phone?: string;
  pickupDate: string;
  pickupTime: string;
  paymentMethod: string;
  items: CartItem[];
  totalPrice: number;
  orderNotes?: string;
}

interface StatusUpdateEmailData {
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  oldStatus: string;
  newStatus: string;
  note?: string;
}

const FIL_EMAIL = import.meta.env.VITE_FIL_EMAIL || "kelvinb1@gmail.com"; // FIL's email - fallback for development

const getEmailApiEndpoint = () => {
  const base = import.meta.env.DEV ? "" : "/.netlify/functions/api";
  return `${base}/api/email`;
};

// Helper function to format currency
const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
};

// Helper function to format payment method
const formatPaymentMethod = (method: string): string => {
  const methods: Record<string, string> = {
    zelle: "Zelle",
    cashapp: "CashApp",
    cash: "Cash",
  };
  return methods[method] || method;
};

// Helper function to get status display name
const getStatusDisplayName = (status: string): string => {
  const statusNames: Record<string, string> = {
    pending: "Pending",
    "ready-for-pickup": "Ready for Pickup",
    "picked-up": "Picked Up",
    cancelled: "Cancelled",
  };
  return statusNames[status] || status;
};

// Generate appropriate subject line for status updates
const generateStatusSubject = (newStatus: string): string => {
  switch (newStatus) {
    case "ready-for-pickup":
      return "Your KB Winery Order is Ready for Pickup";
    case "picked-up":
      return "Your KB Winery Order has been Picked Up";
    case "cancelled":
      return "Your KB Winery Order has been Cancelled";
    default:
      return "Your KB Winery Order Status Update";
  }
};

// Generate order confirmation email content
const generateOrderConfirmationHTML = (data: OrderEmailData): string => {
  const itemsHTML = data.items
    .map(
      (item) => `
    <tr style="border-bottom: 1px solid #eee;">
      <td style="padding: 12px; border-right: 1px solid #eee;">
        ${item.wine.name} ${item.wine.vintage}
      </td>
      <td style="padding: 12px; text-align: center; border-right: 1px solid #eee;">
        ${item.quantity}
      </td>
      <td style="padding: 12px; text-align: right; border-right: 1px solid #eee;">
        ${formatCurrency(item.wine.price)}
      </td>
      <td style="padding: 12px; text-align: right;">
        ${formatCurrency(item.wine.price * item.quantity)}
      </td>
    </tr>
  `,
    )
    .join("");

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Order Confirmation - ${data.orderNumber}</title>
    </head>
    <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #722F37 0%, #8B1538 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
        <h1 style="margin: 0; font-size: 28px; font-weight: 300;">KB Winery</h1>
        <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">Order Confirmation</p>
      </div>
      
      <div style="background: white; padding: 30px; border: 1px solid #ddd; border-top: none; border-radius: 0 0 8px 8px;">
        <h2 style="color: #722F37; margin-top: 0;">Thank you for your order!</h2>
        
        <p>Dear ${data.customerName},</p>
        <p>We've received your wine order and it's being prepared for pickup. Here are the details:</p>
        
        <div style="background: #f8f9fa; padding: 20px; border-radius: 6px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #722F37;">Order Details</h3>
          <p><strong>Order Number:</strong> ${data.orderNumber}</p>
          <p><strong>Pickup Date:</strong> ${new Date(data.pickupDate).toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</p>
          <p><strong>Pickup Time:</strong> ${data.pickupTime}</p>
          <p><strong>Payment Method:</strong> ${formatPaymentMethod(data.paymentMethod)}</p>
          ${data.phone ? `<p><strong>Phone:</strong> ${data.phone}</p>` : ""}
          ${data.orderNotes ? `<p><strong>Notes:</strong> ${data.orderNotes}</p>` : ""}
        </div>
        
        <h3 style="color: #722F37;">Your Wine Selection</h3>
        <table style="width: 100%; border-collapse: collapse; margin: 20px 0; border: 1px solid #ddd;">
          <thead>
            <tr style="background: #f8f9fa;">
              <th style="padding: 12px; text-align: left; border-right: 1px solid #ddd;">Wine</th>
              <th style="padding: 12px; text-align: center; border-right: 1px solid #ddd;">Qty</th>
              <th style="padding: 12px; text-align: right; border-right: 1px solid #ddd;">Price</th>
              <th style="padding: 12px; text-align: right;">Total</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHTML}
          </tbody>
          <tfoot>
            <tr style="background: #f8f9fa; font-weight: bold;">
              <td colspan="3" style="padding: 12px; text-align: right; border-right: 1px solid #ddd;">
                Order Total:
              </td>
              <td style="padding: 12px; text-align: right;">
                ${formatCurrency(data.totalPrice)}
              </td>
            </tr>
          </tfoot>
        </table>
        
        ${
          data.paymentMethod === "zelle"
            ? `
          <div style="background: #fff3cd; border: 1px solid #ffecb5; padding: 15px; border-radius: 6px; margin: 20px 0;">
            <h4 style="margin-top: 0; color: #856404;">Payment Instructions</h4>
            <p style="margin-bottom: 0;">Please send payment via Zelle to: <strong>kbwinery@zelle.com</strong></p>
          </div>
        `
            : ""
        }
        
        ${
          data.paymentMethod === "cashapp"
            ? `
          <div style="background: #fff3cd; border: 1px solid #ffecb5; padding: 15px; border-radius: 6px; margin: 20px 0;">
            <h4 style="margin-top: 0; color: #856404;">Payment Instructions</h4>
            <p style="margin-bottom: 0;">Please send payment via CashApp to: <strong>$KBWinery</strong></p>
          </div>
        `
            : ""
        }
        
        ${
          data.paymentMethod === "cash"
            ? `
          <div style="background: #fff3cd; border: 1px solid #ffecb5; padding: 15px; border-radius: 6px; margin: 20px 0;">
            <h4 style="margin-top: 0; color: #856404;">Payment Instructions</h4>
            <p style="margin-bottom: 0;">Please bring exact change (${formatCurrency(data.totalPrice)}) for pickup.</p>
          </div>
        `
            : ""
        }
        
        <p>We'll send you another email when your order is ready for pickup. If you have any questions, please don't hesitate to contact us.</p>
        
        <p>Cheers!<br>The KB Winery Team</p>
      </div>
      
      <div style="text-align: center; padding: 20px; font-size: 12px; color: #666;">
        <p>KB Winery | Fine Wines & Exceptional Service</p>
      </div>
    </body>
    </html>
  `;
};

// Generate status update email content
const generateStatusUpdateHTML = (data: StatusUpdateEmailData): string => {
  const statusColor =
    data.newStatus === "ready-for-pickup"
      ? "#28a745"
      : data.newStatus === "picked-up"
        ? "#17a2b8"
        : data.newStatus === "cancelled"
          ? "#dc3545"
          : "#ffc107";

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Order Update - ${data.orderNumber}</title>
    </head>
    <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #722F37 0%, #8B1538 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
        <h1 style="margin: 0; font-size: 28px; font-weight: 300;">KB Winery</h1>
        <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">Order Update</p>
      </div>
      
      <div style="background: white; padding: 30px; border: 1px solid #ddd; border-top: none; border-radius: 0 0 8px 8px;">
        <h2 style="color: #722F37; margin-top: 0;">Order Status Update</h2>
        
        <p>Dear ${data.customerName},</p>
        <p>Your order status has been updated:</p>
        
        <div style="background: #f8f9fa; padding: 20px; border-radius: 6px; margin: 20px 0;">
          <p><strong>Order Number:</strong> ${data.orderNumber}</p>
          <p><strong>Previous Status:</strong> ${getStatusDisplayName(data.oldStatus)}</p>
          <div style="background: ${statusColor}; color: white; padding: 10px; border-radius: 4px; text-align: center; margin: 10px 0;">
            <strong>New Status: ${getStatusDisplayName(data.newStatus)}</strong>
          </div>
          ${data.note ? `<p><strong>Note:</strong> ${data.note}</p>` : ""}
        </div>
        
        ${
          data.newStatus === "ready-for-pickup"
            ? `
          <div style="background: #d4edda; border: 1px solid #c3e6cb; padding: 15px; border-radius: 6px; margin: 20px 0;">
            <h4 style="margin-top: 0; color: #155724;">🍷 Your order is ready!</h4>
            <p style="margin-bottom: 0;">Please come by to pick up your wine order at your scheduled time. Don't forget to bring your payment if you haven't sent it already!</p>
          </div>
        `
            : ""
        }
        
        ${
          data.newStatus === "picked-up"
            ? `
          <div style="background: #d1ecf1; border: 1px solid #bee5eb; padding: 15px; border-radius: 6px; margin: 20px 0;">
            <h4 style="margin-top: 0; color: #0c5460;">Thank you!</h4>
            <p style="margin-bottom: 0;">Thank you for choosing KB Winery! We hope you enjoy your wine selection.</p>
          </div>
        `
            : ""
        }
        
        ${
          data.newStatus === "cancelled"
            ? `
          <div style="background: #f8d7da; border: 1px solid #f5c6cb; padding: 15px; border-radius: 6px; margin: 20px 0;">
            <h4 style="margin-top: 0; color: #721c24;">Order Cancelled</h4>
            <p style="margin-bottom: 0;">Your order has been cancelled. If you have any questions, please contact us.</p>
          </div>
        `
            : ""
        }
        
        <p>If you have any questions about your order, please don't hesitate to contact us.</p>
        
        <p>Cheers!<br>The KB Winery Team</p>
      </div>
      
      <div style="text-align: center; padding: 20px; font-size: 12px; color: #666;">
        <p>KB Winery | Fine Wines & Exceptional Service</p>
      </div>
    </body>
    </html>
  `;
};

// Send order confirmation email
export async function sendOrderConfirmationEmail(
  orderData: OrderEmailData,
): Promise<{ success: boolean; error?: string }> {
  try {
    const emailHTML = generateOrderConfirmationHTML(orderData);

    // Check if we're in production mode with a verified domain
    const fromEmail = import.meta.env.VITE_FROM_EMAIL;
    const hasVerifiedDomain = fromEmail && !fromEmail.includes("resend.dev");
    const isProductionReady = hasVerifiedDomain && import.meta.env.PROD;
    const isDevelopment = !isProductionReady;
    const testEmailOverride = "daishakb@gmail.com"; // Verified Resend email for testing

    console.log(
      `Email mode: ${isDevelopment ? "DEVELOPMENT" : "PRODUCTION"}, fromEmail: ${fromEmail}, hasVerifiedDomain: ${hasVerifiedDomain}`,
    );

    const emailRequests = [
      // Email to customer (or test override)
      {
        from: `KB Winery <${fromEmail || "orders@resend.dev"}>`,
        to: [isDevelopment ? testEmailOverride : orderData.customerEmail],
        subject: isDevelopment
          ? `[TEST] Order Confirmation for ${orderData.customerEmail} - ${orderData.orderNumber}`
          : "Your KB Winery Order Confirmation",
        html: isDevelopment
          ? `<p><strong>TEST EMAIL - Original recipient: ${orderData.customerEmail}</strong></p>${emailHTML}`
          : emailHTML,
      },
      // Email to FIL (or test override)
      {
        from: `KB Winery <${fromEmail || "orders@resend.dev"}>`,
        to: [isDevelopment ? testEmailOverride : FIL_EMAIL],
        subject: isDevelopment
          ? `[TEST] New Order for ${orderData.customerEmail} - ${orderData.orderNumber}`
          : `New Order Received - ${orderData.orderNumber}`,
        html: isDevelopment
          ? `<p><strong>TEST EMAIL - Original recipient: ${FIL_EMAIL}</strong></p>${emailHTML}`
          : emailHTML,
      },
    ];

    const response = await fetch(getEmailApiEndpoint(), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: emailRequests }),
    });

    if (!response.ok) {
      const text = await response.text().catch(() => "");
      throw new Error(text || `Email service error: ${response.status}`);
    }

    const result = await response.json();
    if (!result.success) {
      const detail = Array.isArray(result.failures)
        ? result.failures
            .map((f: any) => `#${f.index + 1}: ${f.reason}`)
            .join("; ")
        : result.error || "Unknown error";
      return { success: false, error: detail };
    }
    return { success: true };
  } catch (error) {
    console.error("Error sending order confirmation email:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown email error",
    };
  }
}

// Send status update email
export async function sendStatusUpdateEmail(
  data: StatusUpdateEmailData,
): Promise<{ success: boolean; error?: string }> {
  try {
    const emailHTML = generateStatusUpdateHTML(data);

    // Check if we're in production mode with a verified domain
    const fromEmail = import.meta.env.VITE_FROM_EMAIL;
    const hasVerifiedDomain = fromEmail && !fromEmail.includes("resend.dev");
    const isProductionReady = hasVerifiedDomain && import.meta.env.PROD;
    const isDevelopment = !isProductionReady;
    const testEmailOverride = "daishakb@gmail.com"; // Verified Resend email for testing

    console.log(
      `Status email mode: ${isDevelopment ? "DEVELOPMENT" : "PRODUCTION"}, fromEmail: ${fromEmail}`,
    );

    const response = await fetch(getEmailApiEndpoint(), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messages: [
          {
            from: `KB Winery <${fromEmail || "orders@resend.dev"}>`,
            to: [isDevelopment ? testEmailOverride : data.customerEmail],
            subject: isDevelopment
              ? `[TEST] Status Update for ${data.customerEmail} - ${data.orderNumber}`
              : generateStatusSubject(data.newStatus),
            html: isDevelopment
              ? `<p><strong>TEST EMAIL - Original recipient: ${data.customerEmail}</strong></p>${emailHTML}`
              : emailHTML,
          },
        ],
      }),
    });

    if (!response.ok) {
      const text = await response.text().catch(() => "");
      throw new Error(text || `Email service error: ${response.status}`);
    }

    const result = await response.json();
    if (!result.success) {
      const detail = Array.isArray(result.failures)
        ? result.failures.map((f: any) => f.reason).join("; ")
        : result.error || "Unknown error";
      return { success: false, error: detail };
    }

    return { success: true };
  } catch (error) {
    console.error("Error sending status update email:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown email error",
    };
  }
}
