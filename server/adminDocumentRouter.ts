import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { protectedProcedure, router } from "./_core/trpc";
import {
  getPendingDocuments,
  getDocumentCountByStatus,
  getDocumentsWithFilters,
  bulkVerifyDocuments,
  bulkRejectDocuments,
  verifySingleDocument,
  rejectSingleDocument,
  getDocumentVerificationStats,
  getUserDocument,
} from "./db";

/**
 * Admin Document Verification Router
 * Handles document verification, bulk operations, and admin oversight
 */
export const adminDocumentRouter = router({
  // ============================================================================
  // DOCUMENT RETRIEVAL
  // ============================================================================

  /**
   * Get pending documents for verification
   */
  getPendingDocuments: protectedProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(50),
        offset: z.number().min(0).default(0),
      })
    )
    .query(async ({ ctx, input }) => {
      // Verify admin role
      if (ctx.user.role !== "admin") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only admins can access document verification",
        });
      }

      try {
        return await getPendingDocuments(input.limit, input.offset);
      } catch (error) {
        console.error("Error fetching pending documents:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch pending documents",
        });
      }
    }),

  /**
   * Get document count by verification status
   */
  getDocumentCounts: protectedProcedure.query(async ({ ctx }) => {
    if (ctx.user.role !== "admin") {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "Only admins can access document verification",
      });
    }

    try {
      return await getDocumentCountByStatus();
    } catch (error) {
      console.error("Error fetching document counts:", error);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to fetch document counts",
      });
    }
  }),

  /**
   * Get documents with advanced filtering
   */
  getFilteredDocuments: protectedProcedure
    .input(
      z.object({
        status: z.enum(["pending", "verified", "rejected"]).optional(),
        documentType: z
          .enum(["passport", "national_id", "driver_license", "visa", "other"])
          .optional(),
        userId: z.number().optional(),
        dateFrom: z.date().optional(),
        dateTo: z.date().optional(),
        limit: z.number().min(1).max(100).default(50),
        offset: z.number().min(0).default(0),
      })
    )
    .query(async ({ ctx, input }) => {
      if (ctx.user.role !== "admin") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only admins can access document verification",
        });
      }

      try {
        return await getDocumentsWithFilters(input);
      } catch (error) {
        console.error("Error fetching filtered documents:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch documents",
        });
      }
    }),

  /**
   * Get verification statistics
   */
  getVerificationStats: protectedProcedure.query(async ({ ctx }) => {
    if (ctx.user.role !== "admin") {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "Only admins can access document verification",
      });
    }

    try {
      return await getDocumentVerificationStats();
    } catch (error) {
      console.error("Error fetching verification stats:", error);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to fetch verification statistics",
      });
    }
  }),

  // ============================================================================
  // SINGLE DOCUMENT OPERATIONS
  // ============================================================================

  /**
   * Verify a single document
   */
  verifySingleDocument: protectedProcedure
    .input(
      z.object({
        documentId: z.number(),
        reason: z.string().max(500).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (ctx.user.role !== "admin") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only admins can verify documents",
        });
      }

      try {
        const document = await getUserDocument(input.documentId);
        if (!document) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Document not found",
          });
        }

        const verified = await verifySingleDocument(
          input.documentId,
          ctx.user.id,
          input.reason
        );

        return {
          success: true,
          message: "Document verified successfully",
          data: verified,
        };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        console.error("Error verifying document:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to verify document",
        });
      }
    }),

  /**
   * Reject a single document
   */
  rejectSingleDocument: protectedProcedure
    .input(
      z.object({
        documentId: z.number(),
        reason: z.string().min(10).max(500),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (ctx.user.role !== "admin") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only admins can reject documents",
        });
      }

      try {
        const document = await getUserDocument(input.documentId);
        if (!document) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Document not found",
          });
        }

        const rejected = await rejectSingleDocument(
          input.documentId,
          ctx.user.id,
          input.reason
        );

        return {
          success: true,
          message: "Document rejected successfully",
          data: rejected,
        };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        console.error("Error rejecting document:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to reject document",
        });
      }
    }),

  // ============================================================================
  // BULK OPERATIONS
  // ============================================================================

  /**
   * Bulk verify documents
   */
  bulkVerifyDocuments: protectedProcedure
    .input(
      z.object({
        documentIds: z.array(z.number()).min(1).max(100),
        reason: z.string().max(500).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (ctx.user.role !== "admin") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only admins can verify documents",
        });
      }

      try {
        // Verify all documents exist
        for (const docId of input.documentIds) {
          const doc = await getUserDocument(docId);
          if (!doc) {
            throw new TRPCError({
              code: "NOT_FOUND",
              message: `Document ${docId} not found`,
            });
          }
        }

        const count = await bulkVerifyDocuments(
          input.documentIds,
          ctx.user.id,
          input.reason
        );

        return {
          success: true,
          message: `Successfully verified ${count} documents`,
          count,
        };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        console.error("Error bulk verifying documents:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to bulk verify documents",
        });
      }
    }),

  /**
   * Bulk reject documents
   */
  bulkRejectDocuments: protectedProcedure
    .input(
      z.object({
        documentIds: z.array(z.number()).min(1).max(100),
        reason: z.string().min(10).max(500),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (ctx.user.role !== "admin") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only admins can reject documents",
        });
      }

      try {
        // Verify all documents exist
        for (const docId of input.documentIds) {
          const doc = await getUserDocument(docId);
          if (!doc) {
            throw new TRPCError({
              code: "NOT_FOUND",
              message: `Document ${docId} not found`,
            });
          }
        }

        const count = await bulkRejectDocuments(
          input.documentIds,
          ctx.user.id,
          input.reason
        );

        return {
          success: true,
          message: `Successfully rejected ${count} documents`,
          count,
        };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        console.error("Error bulk rejecting documents:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to bulk reject documents",
        });
      }
    }),
});
