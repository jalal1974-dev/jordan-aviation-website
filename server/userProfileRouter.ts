import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { protectedProcedure, router } from "./_core/trpc";
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
 * User Profile Management Router
 * Handles extended profile information, preferences, document management, and audit trails
 */
export const userProfileRouter = router({
  // ============================================================================
  // PROFILE MANAGEMENT
  // ============================================================================

  /**
   * Get user profile
   */
  getProfile: protectedProcedure.query(async ({ ctx }) => {
    try {
      const profile = await getUserProfile(ctx.user.id);
      if (!profile) {
        // Return empty profile for new users
        return {
          userId: ctx.user.id,
          firstName: null,
          lastName: null,
          email: ctx.user.email,
          profileCompletionPercentage: 0,
          isVerified: false,
        };
      }
      return profile;
    } catch (error) {
      console.error("Error fetching user profile:", error);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to fetch profile",
      });
    }
  }),

  /**
   * Update user profile
   */
  updateProfile: protectedProcedure
    .input(
      z.object({
        firstName: z.string().max(100).optional(),
        lastName: z.string().max(100).optional(),
        dateOfBirth: z.date().optional(),
        gender: z.enum(["male", "female", "other", "prefer_not_to_say"]).optional(),
        nationality: z.string().max(100).optional(),
        phoneNumber: z.string().max(20).optional(),
        alternatePhone: z.string().max(20).optional(),
        street: z.string().max(255).optional(),
        city: z.string().max(100).optional(),
        state: z.string().max(100).optional(),
        postalCode: z.string().max(20).optional(),
        country: z.string().max(100).optional(),
        passportNumber: z.string().max(50).optional(),
        passportIssueDate: z.date().optional(),
        passportExpiryDate: z.date().optional(),
        passportCountry: z.string().max(100).optional(),
        frequentFlyerNumber: z.string().max(50).optional(),
        frequentFlyerStatus: z.string().max(50).optional(),
        emergencyContactName: z.string().max(100).optional(),
        emergencyContactPhone: z.string().max(20).optional(),
        emergencyContactRelation: z.string().max(50).optional(),
        bio: z.string().max(500).optional(),
        preferredLanguage: z.string().max(10).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const updated = await upsertUserProfile(ctx.user.id, input);

        // Log the change
        await addProfileHistoryEntry(
          ctx.user.id,
          "profile_update",
          null,
          JSON.stringify(input),
          "updated",
          undefined,
          "User updated profile information"
        );

        return {
          success: true,
          message: "Profile updated successfully",
          data: updated,
        };
      } catch (error) {
        console.error("Error updating profile:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update profile",
        });
      }
    }),

  // ============================================================================
  // PREFERENCES MANAGEMENT
  // ============================================================================

  /**
   * Get user preferences
   */
  getPreferences: protectedProcedure.query(async ({ ctx }) => {
    try {
      const preferences = await getUserPreferences(ctx.user.id);
      if (!preferences) {
        // Return default preferences for new users
        return {
          userId: ctx.user.id,
          emailNotifications: true,
          smsNotifications: false,
          pushNotifications: true,
          bookingConfirmations: true,
          flightReminders: true,
          promotionalOffers: true,
          loyaltyUpdates: true,
          newsAndUpdates: false,
          preferredSeat: "window",
          communicationLanguage: "en",
        };
      }
      return preferences;
    } catch (error) {
      console.error("Error fetching preferences:", error);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to fetch preferences",
      });
    }
  }),

  /**
   * Update user preferences
   */
  updatePreferences: protectedProcedure
    .input(
      z.object({
        emailNotifications: z.boolean().optional(),
        smsNotifications: z.boolean().optional(),
        pushNotifications: z.boolean().optional(),
        bookingConfirmations: z.boolean().optional(),
        flightReminders: z.boolean().optional(),
        promotionalOffers: z.boolean().optional(),
        loyaltyUpdates: z.boolean().optional(),
        newsAndUpdates: z.boolean().optional(),
        preferredSeat: z.string().optional(),
        mealPreference: z.string().optional(),
        wheelchairAssistance: z.boolean().optional(),
        specialAssistance: z.string().optional(),
        preferredContactMethod: z.string().optional(),
        communicationLanguage: z.string().optional(),
        shareDataWithPartners: z.boolean().optional(),
        allowThirdPartyMarketing: z.boolean().optional(),
        darkMode: z.boolean().optional(),
        largeText: z.boolean().optional(),
        highContrast: z.boolean().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const updated = await updateUserPreferences(ctx.user.id, input);

        return {
          success: true,
          message: "Preferences updated successfully",
          data: updated,
        };
      } catch (error) {
        console.error("Error updating preferences:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update preferences",
        });
      }
    }),

  // ============================================================================
  // PROFILE HISTORY & AUDIT TRAIL
  // ============================================================================

  /**
   * Get profile change history
   */
  getHistory: protectedProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(20),
        offset: z.number().min(0).default(0),
      })
    )
    .query(async ({ ctx, input }) => {
      try {
        return await getProfileHistory(ctx.user.id, input.limit, input.offset);
      } catch (error) {
        console.error("Error fetching profile history:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch profile history",
        });
      }
    }),

  // ============================================================================
  // DOCUMENT MANAGEMENT
  // ============================================================================

  /**
   * Get user documents
   */
  getDocuments: protectedProcedure
    .input(
      z.object({
        documentType: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      try {
        return await getUserDocuments(ctx.user.id, input.documentType);
      } catch (error) {
        console.error("Error fetching documents:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch documents",
        });
      }
    }),

  /**
   * Upload user document
   */
  uploadDocument: protectedProcedure
    .input(
      z.object({
        documentType: z.enum(["passport", "national_id", "driver_license", "visa", "other"]),
        documentName: z.string().max(255),
        documentNumber: z.string().max(100).optional(),
        fileUrl: z.string().url(),
        fileKey: z.string(),
        fileName: z.string().max(255),
        fileSize: z.number(),
        mimeType: z.string().max(50),
        issueDate: z.date().optional(),
        expiryDate: z.date().optional(),
        description: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const document = await createUserDocument({
          userId: ctx.user.id,
          ...input,
          verificationStatus: "pending",
          isPublic: false,
        });

        return {
          success: true,
          message: "Document uploaded successfully",
          data: document,
        };
      } catch (error) {
        console.error("Error uploading document:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to upload document",
        });
      }
    }),

  /**
   * Delete user document
   */
  deleteDocument: protectedProcedure
    .input(
      z.object({
        documentId: z.number(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        // Verify ownership
        const document = await getUserDocument(input.documentId);
        if (!document) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Document not found",
          });
        }

        if (document.userId !== ctx.user.id && ctx.user.role !== "admin") {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "You do not have permission to delete this document",
          });
        }

        await deleteUserDocument(input.documentId);

        return {
          success: true,
          message: "Document deleted successfully",
        };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        console.error("Error deleting document:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to delete document",
        });
      }
    }),
});
