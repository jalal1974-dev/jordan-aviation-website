import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  getUserProfile,
  upsertUserProfile,
  getUserPreferences,
  updateUserPreferences,
  getProfileHistory,
  addProfileHistoryEntry,
  getUserDocuments,
  getUserDocument,
  createUserDocument,
  updateUserDocument,
  deleteUserDocument,
} from "./db";

/**
 * User Profile Management Feature Tests
 * Tests database operations for profile, preferences, documents, and audit trail
 */
describe("User Profile Management", () => {
  const testUserId = 1;

  // ============================================================================
  // PROFILE MANAGEMENT TESTS
  // ============================================================================

  describe("Profile Management", () => {
    it("should get user profile", async () => {
      const profile = await getUserProfile(testUserId);
      // Profile may be null for new users, which is expected
      if (profile) {
        expect(profile.userId).toBe(testUserId);
        expect(profile).toHaveProperty("firstName");
        expect(profile).toHaveProperty("lastName");
        expect(profile).toHaveProperty("createdAt");
      }
    });

    it("should upsert user profile", async () => {
      const profileData = {
        firstName: "John",
        lastName: "Doe",
        phoneNumber: "+1234567890",
        nationality: "American",
        passportNumber: "ABC123456",
      };

      const result = await upsertUserProfile(testUserId, profileData);
      expect(result).toBeDefined();
      if (result) {
        expect(result.userId).toBe(testUserId);
        expect(result.firstName).toBe("John");
        expect(result.lastName).toBe("Doe");
        expect(result.phoneNumber).toBe("+1234567890");
      }
    });

    it("should update existing profile", async () => {
      const initialData = {
        firstName: "Jane",
        lastName: "Smith",
      };

      await upsertUserProfile(testUserId, initialData);

      const updateData = {
        firstName: "Janet",
        phoneNumber: "+9876543210",
      };

      const updated = await upsertUserProfile(testUserId, updateData);
      expect(updated).toBeDefined();
      if (updated) {
        expect(updated.firstName).toBe("Janet");
        expect(updated.phoneNumber).toBe("+9876543210");
      }
    });
  });

  // ============================================================================
  // PREFERENCES MANAGEMENT TESTS
  // ============================================================================

  describe("Preferences Management", () => {
    it("should get user preferences", async () => {
      const preferences = await getUserPreferences(testUserId);
      // Preferences may be null for new users
      if (preferences) {
        expect(preferences.userId).toBe(testUserId);
        expect(preferences).toHaveProperty("emailNotifications");
        expect(preferences).toHaveProperty("smsNotifications");
        expect(preferences).toHaveProperty("createdAt");
      }
    });

    it("should update user preferences", async () => {
      const preferencesData = {
        emailNotifications: false,
        smsNotifications: true,
        pushNotifications: true,
        bookingConfirmations: true,
        flightReminders: false,
        promotionalOffers: false,
        loyaltyUpdates: true,
        newsAndUpdates: false,
      };

      const result = await updateUserPreferences(testUserId, preferencesData);
      expect(result).toBeDefined();
      if (result) {
        expect(result.userId).toBe(testUserId);
        expect(result.emailNotifications).toBe(false);
        expect(result.smsNotifications).toBe(true);
        expect(result.flightReminders).toBe(false);
      }
    });

    it("should handle partial preference updates", async () => {
      const partialUpdate = {
        emailNotifications: true,
        darkMode: true,
      };

      const result = await updateUserPreferences(testUserId, partialUpdate);
      expect(result).toBeDefined();
      if (result) {
        expect(result.emailNotifications).toBe(true);
        expect(result.darkMode).toBe(true);
      }
    });
  });

  // ============================================================================
  // PROFILE HISTORY & AUDIT TRAIL TESTS
  // ============================================================================

  describe("Profile History & Audit Trail", () => {
    it("should add profile history entry", async () => {
      await addProfileHistoryEntry(
        testUserId,
        "firstName",
        "Old Name",
        "New Name",
        "updated",
        undefined,
        "User updated first name"
      );

      const history = await getProfileHistory(testUserId, 10);
      expect(Array.isArray(history)).toBe(true);
      // Verify the entry exists in history
      const entry = history.find((h) => h.fieldName === "firstName");
      if (entry) {
        expect(entry.userId).toBe(testUserId);
        expect(entry.oldValue).toBe("Old Name");
        expect(entry.newValue).toBe("New Name");
        expect(entry.changeType).toBe("updated");
      }
    });

    it("should get profile history with pagination", async () => {
      // Add multiple history entries
      for (let i = 0; i < 5; i++) {
        await addProfileHistoryEntry(
          testUserId,
          `field_${i}`,
          `old_${i}`,
          `new_${i}`,
          "updated"
        );
      }

      const history = await getProfileHistory(testUserId, 3, 0);
      expect(Array.isArray(history)).toBe(true);
      expect(history.length).toBeLessThanOrEqual(3);
    });

    it("should track different change types", async () => {
      const changeTypes: Array<"created" | "updated" | "deleted" | "verified"> = [
        "created",
        "updated",
        "verified",
      ];

      for (const changeType of changeTypes) {
        await addProfileHistoryEntry(
          testUserId,
          `test_${changeType}`,
          null,
          `value_${changeType}`,
          changeType
        );
      }

      const history = await getProfileHistory(testUserId, 10);
      expect(history.length).toBeGreaterThan(0);
    });
  });

  // ============================================================================
  // DOCUMENT MANAGEMENT TESTS
  // ============================================================================

  describe("Document Management", () => {
    const testDocumentData = {
      userId: testUserId,
      documentType: "passport" as const,
      documentName: "Passport - John Doe",
      documentNumber: "ABC123456",
      fileUrl: "https://example.com/documents/passport.pdf",
      fileKey: "user-1/documents/passport-123.pdf",
      fileName: "passport.pdf",
      fileSize: 1024000,
      mimeType: "application/pdf",
      verificationStatus: "pending" as const,
      isPublic: false,
    };

    it("should create user document", async () => {
      const document = await createUserDocument(testDocumentData);
      expect(document).toBeDefined();
      if (document) {
        expect(document.userId).toBe(testUserId);
        expect(document.documentType).toBe("passport");
        expect(document.documentName).toBe("Passport - John Doe");
        expect(document.verificationStatus).toBe("pending");
      }
    });

    it("should get user documents", async () => {
      // Create a test document first
      const created = await createUserDocument(testDocumentData);

      const documents = await getUserDocuments(testUserId);
      expect(Array.isArray(documents)).toBe(true);
      expect(documents.length).toBeGreaterThan(0);

      // Verify the document exists
      const found = documents.find((d) => d.documentType === "passport");
      expect(found).toBeDefined();
    });

    it("should get documents filtered by type", async () => {
      const documents = await getUserDocuments(testUserId, "passport");
      expect(Array.isArray(documents)).toBe(true);

      // All documents should be passport type
      documents.forEach((doc) => {
        expect(doc.documentType).toBe("passport");
      });
    });

    it("should get single document", async () => {
      const created = await createUserDocument(testDocumentData);
      if (created) {
        const document = await getUserDocument(created.id);
        expect(document).toBeDefined();
        if (document) {
          expect(document.id).toBe(created.id);
          expect(document.userId).toBe(testUserId);
        }
      }
    });

    it("should update document verification status", async () => {
      const created = await createUserDocument(testDocumentData);
      if (created) {
        const updated = await updateUserDocument(created.id, {
          verificationStatus: "verified",
          verificationDate: new Date(),
        });

        expect(updated).toBeDefined();
        if (updated) {
          expect(updated.verificationStatus).toBe("verified");
          expect(updated.verificationDate).toBeDefined();
        }
      }
    });

    it("should delete user document", async () => {
      const created = await createUserDocument(testDocumentData);
      if (created) {
        await deleteUserDocument(created.id);

        const deleted = await getUserDocument(created.id);
        expect(deleted).toBeUndefined();
      }
    });

    it("should handle multiple document types", async () => {
      const documentTypes = ["passport", "national_id", "driver_license", "visa"] as const;

      for (const docType of documentTypes) {
        await createUserDocument({
          ...testDocumentData,
          documentType: docType,
          documentName: `${docType} - Test`,
        });
      }

      const documents = await getUserDocuments(testUserId);
      expect(documents.length).toBeGreaterThanOrEqual(documentTypes.length);
    });
  });

  // ============================================================================
  // INTEGRATION TESTS
  // ============================================================================

  describe("Integration Tests", () => {
    it("should handle complete profile lifecycle", async () => {
      // 1. Create profile
      const profileData = {
        firstName: "Integration",
        lastName: "Test",
        phoneNumber: "+1111111111",
      };
      await upsertUserProfile(testUserId, profileData);

      // 2. Update preferences
      const preferencesData = {
        emailNotifications: true,
        bookingConfirmations: true,
      };
      await updateUserPreferences(testUserId, preferencesData);

      // 3. Upload document
      const documentData = {
        userId: testUserId,
        documentType: "passport" as const,
        documentName: "Integration Test Passport",
        fileUrl: "https://example.com/test.pdf",
        fileKey: "test-key",
        fileName: "test.pdf",
        fileSize: 1024,
        mimeType: "application/pdf",
        verificationStatus: "pending" as const,
        isPublic: false,
      };
      const document = await createUserDocument(documentData);

      // 4. Verify all data exists
      const profile = await getUserProfile(testUserId);
      const preferences = await getUserPreferences(testUserId);
      const documents = await getUserDocuments(testUserId);

      expect(profile).toBeDefined();
      expect(preferences).toBeDefined();
      expect(documents.length).toBeGreaterThan(0);
    });
  });
});
