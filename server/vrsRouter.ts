/**
 * VRS API Router
 * Handles tRPC procedures for VRS integration and webhook processing
 */

import { z } from 'zod'
import { TRPCError } from '@trpc/server'
import { protectedProcedure, publicProcedure, router } from './_core/trpc'
import { VRSIntegrationService, initializeVRSService, VRSWebhookPayload } from './vrsIntegration'

let vrsService: VRSIntegrationService | null = null

/**
 * Initialize VRS service singleton
 */
function getVRSService(): VRSIntegrationService {
  if (!vrsService) {
    vrsService = initializeVRSService()
  }
  return vrsService
}

/**
 * VRS Router
 * Provides tRPC procedures for VRS operations
 */
export const vrsRouter = router({
  /**
   * Submit a document for VRS verification
   */
  submitDocumentForVerification: protectedProcedure
    .input(
      z.object({
        documentId: z.string(),
        documentUrl: z.string().url(),
        documentType: z.enum(['passport', 'national_id', 'driver_license', 'visa', 'other']),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const vrs = getVRSService()

        const result = await vrs.submitDocumentForVerification(
          String(ctx.user.id),
          input.documentId,
          input.documentUrl,
          input.documentType
        )

        if (!result.success) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: result.error || 'Failed to submit document for verification',
          })
        }

        return {
          success: true,
          externalId: result.externalId,
          message: 'Document submitted for verification',
        }
      } catch (error) {
        console.error('[VRS] Error submitting document:', error)
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error instanceof Error ? error.message : 'Failed to submit document',
        })
      }
    }),

  /**
   * Get verification status for a document
   */
  getVerificationStatus: protectedProcedure
    .input(
      z.object({
        externalId: z.string(),
      })
    )
    .query(async ({ input }) => {
      try {
        const vrs = getVRSService()
        const status = await vrs.getVerificationStatus(input.externalId)

        if (!status) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Verification status not found',
          })
        }

        return status
      } catch (error) {
        console.error('[VRS] Error fetching verification status:', error)
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch verification status',
        })
      }
    }),

  /**
   * Webhook endpoint for VRS events
   * This is a public endpoint that receives webhook events from VRS
   */
  webhook: publicProcedure
    .input(
      z.object({
        eventType: z.enum(['document.verified', 'document.rejected', 'document.expired', 'verification.started']),
        documentId: z.string(),
        externalId: z.string(),
        status: z.string(),
        verificationScore: z.number().optional(),
        riskLevel: z.enum(['low', 'medium', 'high']).optional(),
        reason: z.string().optional(),
        timestamp: z.number(),
        signature: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const vrs = getVRSService()

        const payload: VRSWebhookPayload = {
          eventType: input.eventType,
          documentId: input.documentId,
          externalId: input.externalId,
          status: input.status,
          verificationScore: input.verificationScore,
          riskLevel: input.riskLevel,
          reason: input.reason,
          timestamp: input.timestamp,
          signature: input.signature,
        }

        const success = await vrs.processWebhookEvent(payload)

        if (!success) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Failed to process webhook event',
          })
        }

        return {
          success: true,
          message: 'Webhook event processed successfully',
        }
      } catch (error) {
        console.error('[VRS] Error processing webhook:', error)
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to process webhook event',
        })
      }
    }),

  /**
   * Admin: Sync pending documents with VRS
   */
  syncPendingDocuments: protectedProcedure
    .mutation(async ({ ctx }) => {
      try {
        // Verify admin role
        if (ctx.user.role !== 'admin') {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'Only admins can sync documents',
          })
        }

        const vrs = getVRSService()
        await vrs.syncPendingDocuments()

        return {
          success: true,
          message: 'Document sync completed',
        }
      } catch (error) {
        console.error('[VRS] Error syncing documents:', error)
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to sync documents',
        })
      }
    }),

  /**
   * Admin: Retry failed submissions
   */
  retryFailedSubmissions: protectedProcedure
    .mutation(async ({ ctx }) => {
      try {
        // Verify admin role
        if (ctx.user.role !== 'admin') {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'Only admins can retry submissions',
          })
        }

        const vrs = getVRSService()
        await vrs.retryFailedSubmissions()

        return {
          success: true,
          message: 'Failed submissions retry completed',
        }
      } catch (error) {
        console.error('[VRS] Error retrying submissions:', error)
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to retry submissions',
        })
      }
    }),

  /**
   * Get VRS configuration status (admin only)
   */
  getConfigStatus: protectedProcedure
    .query(async ({ ctx }) => {
      try {
        // Verify admin role
        if (ctx.user.role !== 'admin') {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'Only admins can view VRS configuration',
          })
        }

        const apiUrl = process.env.VRS_API_URL || 'not configured'
        const hasApiKey = !!process.env.VRS_API_KEY
        const hasWebhookSecret = !!process.env.VRS_WEBHOOK_SECRET

        return {
          apiUrl: apiUrl.replace(/\/api$/, ''),
          configured: hasApiKey && hasWebhookSecret,
          hasApiKey,
          hasWebhookSecret,
          message: hasApiKey && hasWebhookSecret ? 'VRS is properly configured' : 'VRS configuration incomplete',
        }
      } catch (error) {
        console.error('[VRS] Error getting config status:', error)
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to get VRS configuration status',
        })
      }
    }),
})
