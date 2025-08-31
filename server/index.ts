import "dotenv/config";
import express from "express";
import cors from "cors";
import { handleDemo } from "./routes/demo";

export function createServer() {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Configuration endpoints
  app.get("/api/config/supabase", (_req, res) => {
    const url = process.env.VITE_SUPABASE_URL;
    const key = process.env.VITE_SUPABASE_ANON_KEY;

    res.json({
      isConfigured: Boolean(url && key),
      isInsecureUrl: Boolean(url && String(url).startsWith("http://")),
      url: url ? url : undefined, // Only send URL if configured
      anonKey: key ? key : undefined // Only send key if configured
    });
  });

  app.get("/api/config/email", (_req, res) => {
    const fromEmail = process.env.VITE_FROM_EMAIL;
    const hasVerifiedDomain = fromEmail && !fromEmail.includes("resend.dev");
    const isProductionReady = hasVerifiedDomain && process.env.NODE_ENV === "production";

    res.json({
      isConfigured: Boolean(fromEmail),
      hasVerifiedDomain,
      isProductionReady,
      isDevelopment: !isProductionReady,
      status: !fromEmail
        ? "Email not configured"
        : !isProductionReady
          ? "Development mode - emails redirected to test address"
          : "Production mode - emails sent to actual recipients"
    });
  });

  // Example API routes
  app.get("/api/ping", (_req, res) => {
    const ping = process.env.PING_MESSAGE ?? "ping";
    res.json({ message: ping });
  });

  app.get("/api/demo", handleDemo);

  // Email sending endpoint (server-side Resend proxy)
  app.post("/api/email", async (req, res) => {
    try {
      const RESEND_API_KEY = process.env.RESEND_API_KEY;
      if (!RESEND_API_KEY) {
        return res
          .status(500)
          .json({ success: false, error: "Email service not configured" });
      }

      const fromEmail = process.env.VITE_FROM_EMAIL;
      if (!fromEmail) {
        return res.status(500).json({
          success: false,
          error: "Email service not configured - missing FROM_EMAIL",
        });
      }
      const defaultFrom = `KB Winery <${fromEmail}>`;
      const { messages } = req.body as {
        messages: Array<{
          to: string[];
          subject: string;
          html: string;
          from?: string;
        }>;
      };
      if (!Array.isArray(messages) || messages.length === 0) {
        return res
          .status(400)
          .json({ success: false, error: "No messages provided" });
      }

      const sendOne = async (msg: {
        to: string[];
        subject: string;
        html: string;
        from?: string;
      }) => {
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

      const results = await Promise.allSettled(messages.map(sendOne));
      const failures = results
        .map((r, i) => ({ r, i }))
        .filter((x) => x.r.status === "rejected")
        .map((x) => ({
          index: x.i,
          reason:
            (x.r as PromiseRejectedResult).reason?.message ||
            String((x.r as any).reason) ||
            "Unknown error",
        }));

      return res.status(200).json({
        success: failures.length === 0,
        failures,
        total: results.length,
      });
    } catch (err) {
      return res.status(500).json({
        success: false,
        error: err instanceof Error ? err.message : "Unknown server error",
      });
    }
  });

  return app;
}
