import { ENV } from "./_core/env";

/**
 * Email Provider Service
 * Supports multiple email providers (SendGrid, AWS SES, etc.)
 * Handles HTML email templates for scheduled report delivery
 */

export type EmailProvider = "sendgrid" | "ses" | "smtp" | "mock";

export interface EmailConfig {
  provider: EmailProvider;
  apiKey?: string;
  apiSecret?: string;
  senderEmail: string;
  senderName: string;
  region?: string; // For AWS SES
  host?: string; // For SMTP
  port?: number; // For SMTP
  username?: string; // For SMTP
  password?: string; // For SMTP
}

export interface EmailPayload {
  to: string[];
  subject: string;
  htmlContent: string;
  textContent?: string;
  replyTo?: string;
  attachments?: Array<{
    filename: string;
    content: Buffer | string;
    contentType: string;
  }>;
}

class EmailProviderService {
  private config: EmailConfig;

  constructor() {
    this.config = this.loadConfig();
  }

  private loadConfig(): EmailConfig {
    // DISABLED: Email sending temporarily disabled to stop flood
    const provider = "mock" as EmailProvider; // Force mock provider to prevent email sending

    return {
      provider,
      apiKey: process.env.EMAIL_API_KEY,
      apiSecret: process.env.EMAIL_API_SECRET,
      senderEmail: process.env.EMAIL_SENDER || "noreply@jordanaviation.com",
      senderName: process.env.EMAIL_SENDER_NAME || "Jordan Aviation",
      region: process.env.AWS_REGION || "us-east-1",
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT) : 587,
      username: process.env.SMTP_USERNAME,
      password: process.env.SMTP_PASSWORD,
    };
  }

  /**
   * Send email using configured provider
   */
  async sendEmail(payload: EmailPayload): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      switch (this.config.provider) {
        case "sendgrid":
          return await this.sendViaSendGrid(payload);
        case "ses":
          return await this.sendViaSES(payload);
        case "smtp":
          return await this.sendViaSMTP(payload);
        case "mock":
          return await this.sendViaMock(payload);
        default:
          return {
            success: false,
            error: `Unknown email provider: ${this.config.provider}`,
          };
      }
    } catch (error) {
      console.error("[Email Service] Error sending email:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Send via SendGrid
   */
  private async sendViaSendGrid(payload: EmailPayload): Promise<{ success: boolean; messageId?: string; error?: string }> {
    if (!this.config.apiKey) {
      return { success: false, error: "SendGrid API key not configured" };
    }

    try {
      const response = await fetch("https://api.sendgrid.com/v3/mail/send", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${this.config.apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          personalizations: [
            {
              to: payload.to.map((email) => ({ email })),
              subject: payload.subject,
            },
          ],
          from: {
            email: this.config.senderEmail,
            name: this.config.senderName,
          },
          content: [
            {
              type: "text/html",
              value: payload.htmlContent,
            },
          ],
          replyTo: payload.replyTo ? { email: payload.replyTo } : undefined,
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        return { success: false, error: `SendGrid error: ${error}` };
      }

      const messageId = response.headers.get("x-message-id") || "unknown";
      return { success: true, messageId };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "SendGrid request failed",
      };
    }
  }

  /**
   * Send via AWS SES
   */
  private async sendViaSES(payload: EmailPayload): Promise<{ success: boolean; messageId?: string; error?: string }> {
    // AWS SES integration would require AWS SDK
    // For now, return a placeholder implementation
    console.log("[Email Service] AWS SES integration not yet implemented");
    return {
      success: false,
      error: "AWS SES integration not yet implemented",
    };
  }

  /**
   * Send via SMTP
   */
  private async sendViaSMTP(payload: EmailPayload): Promise<{ success: boolean; messageId?: string; error?: string }> {
    // SMTP integration would require nodemailer or similar
    // For now, return a placeholder implementation
    console.log("[Email Service] SMTP integration not yet implemented");
    return {
      success: false,
      error: "SMTP integration not yet implemented",
    };
  }

  /**
   * Send via Mock (for testing)
   */
  private async sendViaMock(payload: EmailPayload): Promise<{ success: boolean; messageId?: string; error?: string }> {
    console.log("[Email Service] Mock email sent:", {
      to: payload.to,
      subject: payload.subject,
      from: this.config.senderEmail,
    });

    return {
      success: true,
      messageId: `mock-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    };
  }

  /**
   * Generate HTML email template for performance report
   */
  generatePerformanceReportTemplate(data: {
    recipientName: string;
    reportPeriod: string;
    totalVerifiers: number;
    totalDocumentsProcessed: number;
    averageAccuracy: number;
    topPerformers: Array<{
      name: string;
      accuracy: number;
      documentsProcessed: number;
    }>;
    recommendations: string[];
  }): string {
    const topPerformersHtml = data.topPerformers
      .map(
        (performer, index) =>
          `
        <tr>
          <td style="padding: 12px; border-bottom: 1px solid #eee;">${index + 1}</td>
          <td style="padding: 12px; border-bottom: 1px solid #eee;">${performer.name}</td>
          <td style="padding: 12px; border-bottom: 1px solid #eee;">${performer.accuracy.toFixed(2)}%</td>
          <td style="padding: 12px; border-bottom: 1px solid #eee;">${performer.documentsProcessed}</td>
        </tr>
      `
      )
      .join("");

    const recommendationsHtml = data.recommendations
      .map((rec) => `<li style="margin-bottom: 8px;">${rec}</li>`)
      .join("");

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Performance Report</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 8px; margin-bottom: 30px;">
            <h1 style="margin: 0; font-size: 28px;">Performance Report</h1>
            <p style="margin: 10px 0 0 0; font-size: 14px; opacity: 0.9;">Period: ${data.reportPeriod}</p>
          </div>

          <!-- Summary Section -->
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 30px;">
            <h2 style="margin-top: 0; color: #667eea;">Summary</h2>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 10px 0;"><strong>Total Verifiers:</strong></td>
                <td style="padding: 10px 0; text-align: right;">${data.totalVerifiers}</td>
              </tr>
              <tr>
                <td style="padding: 10px 0;"><strong>Documents Processed:</strong></td>
                <td style="padding: 10px 0; text-align: right;">${data.totalDocumentsProcessed}</td>
              </tr>
              <tr>
                <td style="padding: 10px 0;"><strong>Average Accuracy:</strong></td>
                <td style="padding: 10px 0; text-align: right; color: #28a745; font-weight: bold;">${data.averageAccuracy.toFixed(2)}%</td>
              </tr>
            </table>
          </div>

          <!-- Top Performers -->
          <div style="margin-bottom: 30px;">
            <h2 style="color: #667eea;">Top Performers</h2>
            <table style="width: 100%; border-collapse: collapse; background: white; border: 1px solid #ddd; border-radius: 8px; overflow: hidden;">
              <thead>
                <tr style="background: #667eea; color: white;">
                  <th style="padding: 12px; text-align: left;">Rank</th>
                  <th style="padding: 12px; text-align: left;">Name</th>
                  <th style="padding: 12px; text-align: left;">Accuracy</th>
                  <th style="padding: 12px; text-align: left;">Documents</th>
                </tr>
              </thead>
              <tbody>
                ${topPerformersHtml}
              </tbody>
            </table>
          </div>

          <!-- Recommendations -->
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 30px;">
            <h2 style="margin-top: 0; color: #667eea;">Recommendations</h2>
            <ul style="padding-left: 20px;">
              ${recommendationsHtml}
            </ul>
          </div>

          <!-- Footer -->
          <div style="border-top: 1px solid #ddd; padding-top: 20px; text-align: center; color: #666; font-size: 12px;">
            <p>This is an automated report from Jordan Aviation Performance Management System</p>
            <p>© 2026 Jordan Aviation. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }
}

export const emailService = new EmailProviderService();
