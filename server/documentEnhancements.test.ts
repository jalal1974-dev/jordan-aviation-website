import { describe, it, expect } from "vitest";
import {
  validateDocument,
  quickValidateFile,
  getValidationStatusBadge,
  VALIDATION_CODES,
} from "./documentValidationService";

/**
 * Document Verification Enhancements Tests
 * Tests for email notifications, analytics, and automated validation
 */

describe("Document Validation Service", () => {
  // ============================================================================
  // FILE VALIDATION TESTS
  // ============================================================================

  describe("File Size Validation", () => {
    it("should reject files that are too small", async () => {
      const result = await validateDocument(
        10 * 1024, // 10 KB
        "application/pdf",
        "test.pdf"
      );

      expect(result.isValid).toBe(false);
      expect(
        result.flags.some((f) => f.code === VALIDATION_CODES.FILE_TOO_SMALL)
      ).toBe(true);
    });

    it("should reject files that are too large", async () => {
      const result = await validateDocument(
        15 * 1024 * 1024, // 15 MB
        "application/pdf",
        "test.pdf"
      );

      expect(result.isValid).toBe(false);
      expect(
        result.flags.some((f) => f.code === VALIDATION_CODES.FILE_TOO_LARGE)
      ).toBe(true);
    });

    it("should accept files within size limits", async () => {
      const result = await validateDocument(
        2 * 1024 * 1024, // 2 MB
        "application/pdf",
        "test.pdf"
      );

      expect(
        result.flags.some((f) => f.code === VALIDATION_CODES.FILE_TOO_SMALL)
      ).toBe(false);
      expect(
        result.flags.some((f) => f.code === VALIDATION_CODES.FILE_TOO_LARGE)
      ).toBe(false);
    });
  });

  describe("File Type Validation", () => {
    it("should accept valid file types", async () => {
      const validTypes = [
        "application/pdf",
        "image/jpeg",
        "image/png",
        "image/webp",
      ];

      for (const mimeType of validTypes) {
        const result = await validateDocument(
          1 * 1024 * 1024,
          mimeType,
          "test.file"
        );

        expect(
          result.flags.some((f) => f.code === VALIDATION_CODES.INVALID_FILE_TYPE)
        ).toBe(false);
      }
    });

    it("should reject invalid file types", async () => {
      const result = await validateDocument(
        1 * 1024 * 1024,
        "application/exe",
        "test.exe"
      );

      expect(result.isValid).toBe(false);
      expect(
        result.flags.some((f) => f.code === VALIDATION_CODES.INVALID_FILE_TYPE)
      ).toBe(true);
    });
  });

  // ============================================================================
  // IMAGE QUALITY VALIDATION TESTS
  // ============================================================================

  describe("Image Quality Validation", () => {
    it("should flag low resolution images", async () => {
      const result = await validateDocument(
        1 * 1024 * 1024,
        "image/jpeg",
        "test.jpg",
        {
          width: 640,
          height: 480, // 0.3 megapixels
        }
      );

      expect(
        result.flags.some((f) => f.code === VALIDATION_CODES.IMAGE_LOW_RESOLUTION)
      ).toBe(true);
    });

    it("should flag dark images", async () => {
      const result = await validateDocument(
        1 * 1024 * 1024,
        "image/jpeg",
        "test.jpg",
        {
          brightness: 20, // Too dark
        }
      );

      expect(
        result.flags.some((f) => f.code === VALIDATION_CODES.IMAGE_TOO_DARK)
      ).toBe(true);
    });

    it("should flag bright images", async () => {
      const result = await validateDocument(
        1 * 1024 * 1024,
        "image/jpeg",
        "test.jpg",
        {
          brightness: 255, // Too bright
        }
      );

      expect(
        result.flags.some((f) => f.code === VALIDATION_CODES.IMAGE_TOO_BRIGHT)
      ).toBe(true);
    });

    it("should flag blurry images", async () => {
      const result = await validateDocument(
        1 * 1024 * 1024,
        "image/jpeg",
        "test.jpg",
        {
          blurScore: 0.8, // High blur
        }
      );

      expect(
        result.flags.some((f) => f.code === VALIDATION_CODES.IMAGE_BLURRY)
      ).toBe(true);
    });
  });

  // ============================================================================
  // DOCUMENT EXPIRATION VALIDATION TESTS
  // ============================================================================

  describe("Document Expiration Validation", () => {
    it("should flag expired documents", async () => {
      const expiredDate = new Date();
      expiredDate.setDate(expiredDate.getDate() - 1); // Yesterday

      const result = await validateDocument(
        1 * 1024 * 1024,
        "image/jpeg",
        "test.jpg",
        {
          expirationDate: expiredDate,
        }
      );

      expect(result.isValid).toBe(false);
      expect(
        result.flags.some((f) => f.code === VALIDATION_CODES.DOCUMENT_EXPIRED)
      ).toBe(true);
    });

    it("should warn about documents expiring soon", async () => {
      const expiringDate = new Date();
      expiringDate.setDate(expiringDate.getDate() + 30); // 30 days

      const result = await validateDocument(
        1 * 1024 * 1024,
        "image/jpeg",
        "test.jpg",
        {
          expirationDate: expiringDate,
        }
      );

      expect(
        result.flags.some((f) => f.code === VALIDATION_CODES.DOCUMENT_EXPIRED)
      ).toBe(true);
    });

    it("should accept documents with valid expiration", async () => {
      const validDate = new Date();
      validDate.setDate(validDate.getDate() + 365); // 1 year

      const result = await validateDocument(
        1 * 1024 * 1024,
        "image/jpeg",
        "test.jpg",
        {
          expirationDate: validDate,
        }
      );

      expect(
        result.flags.some((f) => f.code === VALIDATION_CODES.DOCUMENT_EXPIRED)
      ).toBe(false);
    });
  });

  // ============================================================================
  // METADATA VALIDATION TESTS
  // ============================================================================

  describe("Metadata Validation", () => {
    it("should flag documents with many modifications", async () => {
      const result = await validateDocument(
        1 * 1024 * 1024,
        "application/pdf",
        "test.pdf",
        {
          modificationCount: 10,
        }
      );

      expect(
        result.flags.some((f) => f.code === VALIDATION_CODES.UNUSUAL_METADATA)
      ).toBe(true);
    });

    it("should flag very old documents", async () => {
      const oldDate = new Date();
      oldDate.setFullYear(oldDate.getFullYear() - 10); // 10 years ago

      const result = await validateDocument(
        1 * 1024 * 1024,
        "application/pdf",
        "test.pdf",
        {
          createdDate: oldDate,
        }
      );

      expect(
        result.flags.some((f) => f.code === VALIDATION_CODES.UNUSUAL_METADATA)
      ).toBe(true);
    });
  });

  // ============================================================================
  // RISK SCORING TESTS
  // ============================================================================

  describe("Risk Scoring", () => {
    it("should calculate low risk for valid documents", async () => {
      const result = await validateDocument(
        2 * 1024 * 1024,
        "application/pdf",
        "test.pdf"
      );

      expect(result.riskScore).toBeLessThan(20);
    });

    it("should calculate high risk for multiple issues", async () => {
      const result = await validateDocument(
        1 * 1024 * 1024,
        "image/jpeg",
        "test.jpg",
        {
          width: 640,
          height: 480,
          brightness: 20,
          blurScore: 0.8,
        }
      );

      expect(result.riskScore).toBeGreaterThan(30);
    });

    it("should cap risk score at 100", async () => {
      const result = await validateDocument(
        15 * 1024 * 1024, // Too large
        "application/exe", // Invalid type
        "test.exe",
        {
          width: 640,
          height: 480, // Low resolution
          brightness: 20, // Too dark
          blurScore: 0.8, // Blurry
        }
      );

      expect(result.riskScore).toBeLessThanOrEqual(100);
    });
  });

  // ============================================================================
  // RECOMMENDATIONS TESTS
  // ============================================================================

  describe("Recommendations Generation", () => {
    it("should recommend compression for large files", async () => {
      const result = await validateDocument(
        15 * 1024 * 1024,
        "application/pdf",
        "test.pdf"
      );

      expect(result.recommendations.length).toBeGreaterThan(0);
      expect(result.recommendations.some((r) => r.includes("Compress"))).toBe(
        true
      );
    });

    it("should recommend better lighting for dark images", async () => {
      const result = await validateDocument(
        1 * 1024 * 1024,
        "image/jpeg",
        "test.jpg",
        {
          brightness: 20,
        }
      );

      expect(result.recommendations.length).toBeGreaterThan(0);
      expect(
        result.recommendations.some((r) => r.includes("lighting"))
      ).toBe(true);
    });

    it("should recommend document renewal for expired documents", async () => {
      const expiredDate = new Date();
      expiredDate.setDate(expiredDate.getDate() - 1);

      const result = await validateDocument(
        1 * 1024 * 1024,
        "image/jpeg",
        "test.jpg",
        {
          expirationDate: expiredDate,
        }
      );

      expect(result.recommendations.length).toBeGreaterThan(0);
      expect(result.recommendations.some((r) => r.includes("Renew"))).toBe(
        true
      );
    });
  });

  // ============================================================================
  // QUICK VALIDATION TESTS
  // ============================================================================

  describe("Quick File Validation", () => {
    it("should quickly validate acceptable files", () => {
      const result = quickValidateFile(2 * 1024 * 1024, "application/pdf");
      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it("should quickly reject oversized files", () => {
      const result = quickValidateFile(15 * 1024 * 1024, "application/pdf");
      expect(result.valid).toBe(false);
      expect(result.error).toBeDefined();
    });

    it("should quickly reject unsupported types", () => {
      const result = quickValidateFile(1 * 1024 * 1024, "application/exe");
      expect(result.valid).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  // ============================================================================
  // STATUS BADGE TESTS
  // ============================================================================

  describe("Validation Status Badge", () => {
    it("should show safe status for low risk", () => {
      const badge = getValidationStatusBadge(10);
      expect(badge.status).toBe("safe");
    });

    it("should show warning status for medium risk", () => {
      const badge = getValidationStatusBadge(35);
      expect(badge.status).toBe("warning");
    });

    it("should show danger status for high risk", () => {
      const badge = getValidationStatusBadge(75);
      expect(badge.status).toBe("danger");
    });
  });

  // ============================================================================
  // INTEGRATION TESTS
  // ============================================================================

  describe("Integration Tests", () => {
    it("should handle complete validation workflow", async () => {
      // Quick check
      const quickResult = quickValidateFile(2 * 1024 * 1024, "image/jpeg");
      expect(quickResult.valid).toBe(true);

      // Comprehensive validation
      const fullResult = await validateDocument(
        2 * 1024 * 1024,
        "image/jpeg",
        "passport.jpg",
        {
          width: 1920,
          height: 1440,
          brightness: 128,
          blurScore: 0.2,
        }
      );

      expect(fullResult).toHaveProperty("isValid");
      expect(fullResult).toHaveProperty("flags");
      expect(fullResult).toHaveProperty("riskScore");
      expect(fullResult).toHaveProperty("recommendations");
    });

    it("should validate multiple document types", async () => {
      const documentTypes = [
        { type: "application/pdf", name: "passport.pdf" },
        { type: "image/jpeg", name: "id.jpg" },
        { type: "image/png", name: "visa.png" },
      ];

      for (const doc of documentTypes) {
        const result = await validateDocument(
          2 * 1024 * 1024,
          doc.type,
          doc.name
        );

        expect(result).toHaveProperty("isValid");
        expect(result).toHaveProperty("riskScore");
      }
    });
  });

  // ============================================================================
  // ERROR HANDLING TESTS
  // ============================================================================

  describe("Error Handling", () => {
    it("should handle zero file size", async () => {
      const result = await validateDocument(0, "application/pdf", "test.pdf");
      expect(result.isValid).toBe(false);
      expect(result.flags.length).toBeGreaterThan(0);
    });

    it("should handle empty mime type", async () => {
      const result = await validateDocument(1 * 1024 * 1024, "", "test.file");
      expect(result.isValid).toBe(false);
    });

    it("should handle missing metadata", async () => {
      const result = await validateDocument(
        2 * 1024 * 1024,
        "application/pdf",
        "test.pdf"
      );
      expect(result).toHaveProperty("isValid");
      expect(result).toHaveProperty("riskScore");
    });
  });
});
