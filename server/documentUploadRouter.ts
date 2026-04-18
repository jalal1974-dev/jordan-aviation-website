/**
 * Document Upload Router
 * Provides real-time validation feedback for document uploads
 * Integrates with validation service and VRS system
 */

import { z } from 'zod'
import { TRPCError } from '@trpc/server'
import { protectedProcedure, router } from './_core/trpc'
import { validateDocument, quickValidateFile } from './documentValidationService'

/**
 * Document Upload Router
 * Provides tRPC procedures for document upload validation
 */
export const documentUploadRouter = router({
  /**
   * Validate document before upload
   * Returns validation result with risk score and recommendations
   */
  validateBeforeUpload: protectedProcedure
    .input(
      z.object({
        fileName: z.string(),
        fileSize: z.number().positive(),
        mimeType: z.string(),
        documentType: z.enum(['passport', 'national_id', 'driver_license', 'visa', 'other']),
      })
    )
    .query(async ({ input }) => {
      try {
        const validationResult = await validateDocument(
          input.fileSize,
          input.mimeType,
          input.fileName
        )

        // Calculate processing time estimate
        let estimatedProcessingTime = '1-2 hours'
        if (validationResult.riskScore >= 70) {
          estimatedProcessingTime = '24-48 hours (manual review required)'
        } else if (validationResult.riskScore >= 40) {
          estimatedProcessingTime = '4-12 hours'
        }

        return {
          isValid: validationResult.isValid,
          riskScore: validationResult.riskScore,
          riskLevel:
            validationResult.riskScore < 30
              ? 'low'
              : validationResult.riskScore < 70
                ? 'medium'
                : 'high',
          issues: validationResult.flags.filter(f => f.type === 'error'),
          warnings: validationResult.flags.filter(f => f.type === 'warning'),
          recommendations: validationResult.recommendations,
          estimatedProcessingTime,
          canProceed: validationResult.isValid,
        }
      } catch (error) {
        console.error('[Document Upload] Validation error:', error)
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to validate document',
        })
      }
    }),

  /**
   * Quick validation for file upload (lightweight check)
   * Used for immediate feedback during file selection
   */
  quickValidate: protectedProcedure
    .input(
      z.object({
        fileSize: z.number().positive(),
        mimeType: z.string(),
      })
    )
    .query(async ({ input }) => {
      try {
        const result = quickValidateFile(input.fileSize, input.mimeType)

        return {
          valid: result.valid,
          error: result.error,
        }
      } catch (error) {
        console.error('[Document Upload] Quick validation error:', error)
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to validate file',
        })
      }
    }),

  /**
   * Get validation requirements for document type
   */
  getRequirements: protectedProcedure
    .input(
      z.object({
        documentType: z.enum(['passport', 'national_id', 'driver_license', 'visa', 'other']),
      })
    )
    .query(async ({ input }) => {
      const requirements: Record<string, any> = {
        passport: {
          name: 'Passport',
          description: 'Valid passport document',
          acceptedFormats: ['PDF', 'JPEG', 'PNG'],
          maxFileSize: '10 MB',
          requirements: [
            'Document must be clear and legible',
            'All text must be readable',
            'Document must not be expired',
            'Recommended resolution: at least 1200x1600 pixels',
          ],
          tips: [
            'Ensure adequate lighting when photographing',
            'Avoid shadows or glare',
            'Include entire document in frame',
            'Use a neutral background',
          ],
        },
        national_id: {
          name: 'National ID',
          description: 'Valid national identification document',
          acceptedFormats: ['PDF', 'JPEG', 'PNG'],
          maxFileSize: '10 MB',
          requirements: [
            'Document must be clear and legible',
            'All text must be readable',
            'Document must not be expired',
            'Both sides may be required',
          ],
          tips: [
            'Photograph in good lighting',
            'Ensure all corners are visible',
            'Avoid reflections',
            'Keep document flat',
          ],
        },
        driver_license: {
          name: 'Driver License',
          description: 'Valid driver license',
          acceptedFormats: ['PDF', 'JPEG', 'PNG'],
          maxFileSize: '10 MB',
          requirements: [
            'Document must be clear and legible',
            'All text must be readable',
            'Document must not be expired',
            'Front and back sides recommended',
          ],
          tips: [
            'Use high-quality camera',
            'Ensure document is in focus',
            'Capture entire document',
            'Avoid glare from security features',
          ],
        },
        visa: {
          name: 'Visa',
          description: 'Valid visa document',
          acceptedFormats: ['PDF', 'JPEG', 'PNG'],
          maxFileSize: '10 MB',
          requirements: [
            'Document must be clear and legible',
            'Visa page must be fully visible',
            'Document must not be expired',
          ],
          tips: [
            'Photograph the entire visa page',
            'Ensure all stamps are visible',
            'Use good lighting',
            'Keep document flat',
          ],
        },
        other: {
          name: 'Other Document',
          description: 'Other travel-related document',
          acceptedFormats: ['PDF', 'JPEG', 'PNG', 'DOC', 'DOCX'],
          maxFileSize: '10 MB',
          requirements: [
            'Document must be relevant to travel',
            'Document must be clear and legible',
          ],
          tips: [
            'Ensure document is properly formatted',
            'Include any relevant supporting documents',
            'Provide clear description',
          ],
        },
      }

      return requirements[input.documentType] || requirements.other
    }),

  /**
   * Get validation status for multiple documents
   */
  validateBatch: protectedProcedure
    .input(
      z.object({
        documents: z.array(
          z.object({
            fileName: z.string(),
            fileSize: z.number().positive(),
            mimeType: z.string(),
            documentType: z.enum(['passport', 'national_id', 'driver_license', 'visa', 'other']),
          })
        ),
      })
    )
    .query(async ({ input }) => {
      try {
        const results = await Promise.all(
          input.documents.map(doc =>
            validateDocument(doc.fileSize, doc.mimeType, doc.fileName, undefined)
          )
        )

        const summary = {
          total: results.length,
          valid: results.filter(r => r.isValid).length,
          invalid: results.filter(r => !r.isValid).length,
          averageRiskScore: Math.round(results.reduce((sum, r) => sum + r.riskScore, 0) / results.length),
          highRiskCount: results.filter(r => r.riskScore >= 70).length,
          documents: results.map((result, index) => ({
            fileName: input.documents[index].fileName,
            isValid: result.isValid,
            riskScore: result.riskScore,
            issueCount: result.flags.filter(f => f.type === 'error').length,
            warningCount: result.flags.filter(f => f.type === 'warning').length,
          })),
        }

        return summary
      } catch (error) {
        console.error('[Document Upload] Batch validation error:', error)
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to validate documents',
        })
      }
    }),

  /**
   * Get upload guidelines
   */
  getUploadGuidelines: protectedProcedure.query(async () => {
    return {
      fileSize: {
        minimum: '100 KB',
        maximum: '10 MB',
        recommended: '2-5 MB',
      },
      formats: {
        images: ['JPEG', 'PNG', 'WebP', 'TIFF'],
        documents: ['PDF', 'DOC', 'DOCX'],
        recommended: 'PDF or high-quality JPEG',
      },
      quality: {
        resolution: 'Minimum 1200x1600 pixels for images',
        lighting: 'Well-lit, no shadows or glare',
        focus: 'Document must be in focus',
        completeness: 'Entire document must be visible',
      },
      security: {
        encryption: 'Files are encrypted during transmission',
        storage: 'Files are stored securely on our servers',
        retention: 'Files are retained according to our privacy policy',
        deletion: 'You can request document deletion anytime',
      },
      timeline: {
        lowRisk: '1-2 hours',
        mediumRisk: '4-12 hours',
        highRisk: '24-48 hours',
        manual: 'Manual review may add additional time',
      },
    }
  }),
})
