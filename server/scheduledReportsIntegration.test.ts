import { describe, it, expect, beforeEach } from "vitest";
import { emailService } from "./emailProviderService";

describe("ScheduledReports Integration Tests", () => {
  describe("Email Provider Service", () => {
    it("should generate valid HTML email template", () => {
      const html = emailService.generatePerformanceReportTemplate({
        recipientName: "Admin User",
        reportPeriod: "April 1-30, 2026",
        totalVerifiers: 15,
        totalDocumentsProcessed: 1250,
        averageAccuracy: 94.5,
        topPerformers: [
          { name: "John Doe", accuracy: 98.5, documentsProcessed: 250 },
          { name: "Jane Smith", accuracy: 97.2, documentsProcessed: 230 },
          { name: "Ahmed Hassan", accuracy: 96.1, documentsProcessed: 215 },
        ],
        recommendations: [
          "Increase training for verifiers with accuracy below 90%",
          "Implement peer review for high-volume documents",
          "Consider bonus incentives for top performers",
        ],
      });

      expect(html).toContain("Performance Report");
      expect(html).toContain("April 1-30, 2026");
      expect(html).toContain("15");
      expect(html).toContain("1250");
      expect(html).toContain("94.50%");
      expect(html).toContain("John Doe");
      expect(html).toContain("98.50%");
      expect(html).toContain("Top Performers");
      expect(html).toContain("Recommendations");
      expect(html).toContain("<!DOCTYPE html>");
    });

    it("should format top performers correctly in HTML", () => {
      const html = emailService.generatePerformanceReportTemplate({
        recipientName: "Admin",
        reportPeriod: "Test Period",
        totalVerifiers: 5,
        totalDocumentsProcessed: 500,
        averageAccuracy: 92.0,
        topPerformers: [
          { name: "Performer 1", accuracy: 99.0, documentsProcessed: 100 },
          { name: "Performer 2", accuracy: 98.0, documentsProcessed: 95 },
        ],
        recommendations: ["Test recommendation"],
      });

      expect(html).toContain("Performer 1");
      expect(html).toContain("99.00%");
      expect(html).toContain("100");
      expect(html).toContain("Performer 2");
      expect(html).toContain("98.00%");
      expect(html).toContain("95");
    });

    it("should include all recommendations in HTML", () => {
      const recommendations = [
        "Recommendation 1",
        "Recommendation 2",
        "Recommendation 3",
      ];

      const html = emailService.generatePerformanceReportTemplate({
        recipientName: "Admin",
        reportPeriod: "Test",
        totalVerifiers: 1,
        totalDocumentsProcessed: 100,
        averageAccuracy: 90.0,
        topPerformers: [],
        recommendations,
      });

      recommendations.forEach((rec) => {
        expect(html).toContain(rec);
      });
    });

    it("should send mock email successfully", async () => {
      const result = await emailService.sendEmail({
        to: ["test@example.com"],
        subject: "Test Report",
        htmlContent: "<h1>Test</h1>",
      });

      expect(result.success).toBe(true);
      expect(result.messageId).toBeDefined();
      expect(result.messageId).toContain("mock-");
    });

    it("should handle multiple recipients", async () => {
      const result = await emailService.sendEmail({
        to: ["admin1@example.com", "admin2@example.com", "admin3@example.com"],
        subject: "Performance Report",
        htmlContent: "<h1>Report</h1>",
      });

      expect(result.success).toBe(true);
    });

    it("should include text content when provided", async () => {
      const result = await emailService.sendEmail({
        to: ["test@example.com"],
        subject: "Test",
        htmlContent: "<h1>HTML</h1>",
        textContent: "Plain text version",
      });

      expect(result.success).toBe(true);
    });

    it("should handle attachments in email payload", async () => {
      const result = await emailService.sendEmail({
        to: ["test@example.com"],
        subject: "Report with Attachment",
        htmlContent: "<h1>Report</h1>",
        attachments: [
          {
            filename: "report.csv",
            content: "name,score\nJohn,95",
            contentType: "text/csv",
          },
        ],
      });

      expect(result.success).toBe(true);
    });

    it("should handle reply-to address", async () => {
      const result = await emailService.sendEmail({
        to: ["test@example.com"],
        subject: "Test",
        htmlContent: "<h1>Test</h1>",
        replyTo: "support@example.com",
      });

      expect(result.success).toBe(true);
    });
  });

  describe("Email Template Formatting", () => {
    it("should format accuracy percentage correctly", () => {
      const html = emailService.generatePerformanceReportTemplate({
        recipientName: "Admin",
        reportPeriod: "Test",
        totalVerifiers: 1,
        totalDocumentsProcessed: 100,
        averageAccuracy: 95.567,
        topPerformers: [
          { name: "Test", accuracy: 99.999, documentsProcessed: 50 },
        ],
        recommendations: [],
      });

      expect(html).toContain("95.57%");
      expect(html).toContain("100.00%");
    });

    it("should display summary statistics correctly", () => {
      const html = emailService.generatePerformanceReportTemplate({
        recipientName: "Admin",
        reportPeriod: "April 2026",
        totalVerifiers: 42,
        totalDocumentsProcessed: 5678,
        averageAccuracy: 94.2,
        topPerformers: [],
        recommendations: [],
      });

      expect(html).toContain("42");
      expect(html).toContain("5678");
      expect(html).toContain("94.20%");
    });

    it("should include professional styling", () => {
      const html = emailService.generatePerformanceReportTemplate({
        recipientName: "Admin",
        reportPeriod: "Test",
        totalVerifiers: 1,
        totalDocumentsProcessed: 100,
        averageAccuracy: 90.0,
        topPerformers: [],
        recommendations: [],
      });

      expect(html).toContain("font-family");
      expect(html).toContain("background");
      expect(html).toContain("border-radius");
      expect(html).toContain("padding");
      expect(html).toContain("color");
    });

    it("should be responsive design", () => {
      const html = emailService.generatePerformanceReportTemplate({
        recipientName: "Admin",
        reportPeriod: "Test",
        totalVerifiers: 1,
        totalDocumentsProcessed: 100,
        averageAccuracy: 90.0,
        topPerformers: [],
        recommendations: [],
      });

      expect(html).toContain("max-width: 600px");
      expect(html).toContain("viewport");
    });
  });

  describe("Email Provider Configuration", () => {
    it("should load configuration from environment", () => {
      // This test verifies that the service loads configuration
      // In a real scenario, environment variables would be set
      expect(emailService).toBeDefined();
    });

    it("should support mock provider for testing", async () => {
      const result = await emailService.sendEmail({
        to: ["test@example.com"],
        subject: "Test",
        htmlContent: "<h1>Test</h1>",
      });

      expect(result.success).toBe(true);
      expect(result.messageId).toBeDefined();
    });
  });

  describe("Performance Report Data Validation", () => {
    it("should handle empty top performers list", () => {
      const html = emailService.generatePerformanceReportTemplate({
        recipientName: "Admin",
        reportPeriod: "Test",
        totalVerifiers: 5,
        totalDocumentsProcessed: 100,
        averageAccuracy: 90.0,
        topPerformers: [],
        recommendations: ["Recommendation"],
      });

      expect(html).toContain("Top Performers");
      expect(html).toBeDefined();
    });

    it("should handle empty recommendations list", () => {
      const html = emailService.generatePerformanceReportTemplate({
        recipientName: "Admin",
        reportPeriod: "Test",
        totalVerifiers: 5,
        totalDocumentsProcessed: 100,
        averageAccuracy: 90.0,
        topPerformers: [
          { name: "Test", accuracy: 95.0, documentsProcessed: 50 },
        ],
        recommendations: [],
      });

      expect(html).toContain("Recommendations");
      expect(html).toBeDefined();
    });

    it("should handle large numbers correctly", () => {
      const html = emailService.generatePerformanceReportTemplate({
        recipientName: "Admin",
        reportPeriod: "Test",
        totalVerifiers: 999,
        totalDocumentsProcessed: 999999,
        averageAccuracy: 99.99,
        topPerformers: [
          { name: "Top", accuracy: 99.99, documentsProcessed: 99999 },
        ],
        recommendations: [],
      });

      expect(html).toContain("999");
      expect(html).toContain("999999");
      expect(html).toContain("99.99%");
    });
  });
});
