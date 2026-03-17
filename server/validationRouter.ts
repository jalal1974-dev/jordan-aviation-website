import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { protectedProcedure, router } from "./_core/trpc";
import {
  validateDocument,
  quickValidateFile,
  getValidationStatusBadge,
} from "./documentValidationService";

/**
 * Validation Router
 * Handles document validation and pre-checks before upload
 */
export const validationRouter = router({
  /**
   * Quick file validation before upload
   * Used for client-side validation
   */
  quickValidateFile: protectedProcedure
    .input(
      z.object({
        fileSize: z.number().positive(),
        mimeType: z.string(),
      })
    )
    .query(({ input }) => {
      const result = quickValidateFile(input.fileSize, input.mimeType);
      return {
        valid: result.valid,
        error: result.error,
      };
    }),

  /**
   * Comprehensive document validation
   * Performs detailed checks on document metadata
   */
  validateDocument: protectedProcedure
    .input(
      z.object({
        fileSize: z.number().positive(),
        mimeType: z.string(),
        fileName: z.string(),
        metadata: z
          .object({
            width: z.number().optional(),
            height: z.number().optional(),
            brightness: z.number().optional(),
            blurScore: z.number().optional(),
            expirationDate: z.date().optional(),
            modificationCount: z.number().optional(),
            createdDate: z.date().optional(),
          })
          .optional(),
      })
    )
    .query(async ({ input }) => {
      try {
        const result = await validateDocument(
          input.fileSize,
          input.mimeType,
          input.fileName,
          input.metadata
        );

        const statusBadge = getValidationStatusBadge(result.riskScore);

        return {
          success: true,
          data: {
            ...result,
            status: statusBadge,
          },
        };
      } catch (error) {
        console.error("Error validating document:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to validate document",
        });
      }
    }),

  /**
   * Get validation status for multiple documents
   */
  validateMultipleDocuments: protectedProcedure
    .input(
      z.object({
        documents: z.array(
          z.object({
            fileSize: z.number().positive(),
            mimeType: z.string(),
            fileName: z.string(),
            metadata: z.object({}).optional(),
          })
        ),
      })
    )
    .query(async ({ input }) => {
      try {
        const results = await Promise.all(
          input.documents.map((doc) =>
            validateDocument(
              doc.fileSize,
              doc.mimeType,
              doc.fileName,
              doc.metadata
            )
          )
        );

        return {
          success: true,
          data: results.map((result) => ({
            ...result,
            status: getValidationStatusBadge(result.riskScore),
          })),
        };
      } catch (error) {
        console.error("Error validating multiple documents:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to validate documents",
        });
      }
    }),
});
