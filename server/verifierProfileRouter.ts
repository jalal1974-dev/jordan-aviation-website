import { z } from 'zod'
import { adminProcedure, router } from './_core/trpc'
import {
  getVerifierPerformanceHistory,
  getVerifierDocumentBreakdown,
  getVerifierRecentDocuments,
  getVerifierAccuracyTrend,
  getVerifierRejectionReasons,
} from './db'
import { getPerformanceLeaderboard } from './performanceMetricsService'

export const verifierProfileRouter = router({
  // Get verifier profile with basic info
  getProfile: adminProcedure
    .input(z.object({ verifierId: z.string() }))
    .query(async ({ input }) => {
      const leaderboard = await getPerformanceLeaderboard(100)
      const verifier = leaderboard.find((v: any) => v.id === input.verifierId)
      
      if (!verifier) {
        return { success: false, data: null, message: 'Verifier not found' }
      }

      return {
        success: true,
        data: verifier,
      }
    }),

  // Get performance history over time
  getPerformanceHistory: adminProcedure
    .input(z.object({ verifierId: z.string(), days: z.number().default(30) }))
    .query(async ({ input }) => {
      const history = await getVerifierPerformanceHistory(input.verifierId, input.days)
      
      return {
        success: true,
        data: history,
        period: `${input.days} days`,
      }
    }),

  // Get document breakdown by type
  getDocumentBreakdown: adminProcedure
    .input(z.object({ verifierId: z.string() }))
    .query(async ({ input }) => {
      const breakdown = await getVerifierDocumentBreakdown(input.verifierId)
      
      return {
        success: true,
        data: breakdown,
      }
    }),

  // Get recent documents verified
  getRecentDocuments: adminProcedure
    .input(z.object({ verifierId: z.string(), limit: z.number().default(10) }))
    .query(async ({ input }) => {
      const documents = await getVerifierRecentDocuments(input.verifierId, input.limit)
      
      return {
        success: true,
        data: documents,
        count: documents.length,
      }
    }),

  // Get accuracy trend
  getAccuracyTrend: adminProcedure
    .input(z.object({ verifierId: z.string(), days: z.number().default(30) }))
    .query(async ({ input }) => {
      const trend = await getVerifierAccuracyTrend(input.verifierId, input.days)
      
      return {
        success: true,
        data: trend,
        period: `${input.days} days`,
      }
    }),

  // Get top rejection reasons
  getRejectionReasons: adminProcedure
    .input(z.object({ verifierId: z.string() }))
    .query(async ({ input }) => {
      const reasons = await getVerifierRejectionReasons(input.verifierId)
      
      return {
        success: true,
        data: reasons,
        count: reasons.length,
      }
    }),

  // Get complete profile data (all sections)
  getCompleteProfile: adminProcedure
    .input(z.object({ verifierId: z.string(), days: z.number().default(30) }))
    .query(async ({ input }) => {
      const [profile, history, breakdown, recentDocs, trend, reasons] = await Promise.all([
        getPerformanceLeaderboard(100).then((data: any) => data.find((v: any) => v.id === input.verifierId)),
        getVerifierPerformanceHistory(input.verifierId, input.days),
        getVerifierDocumentBreakdown(input.verifierId),
        getVerifierRecentDocuments(input.verifierId, 10),
        getVerifierAccuracyTrend(input.verifierId, input.days),
        getVerifierRejectionReasons(input.verifierId),
      ])

      if (!profile) {
        return { success: false, data: null, message: 'Verifier not found' }
      }

      return {
        success: true,
        data: {
          profile,
          history,
          breakdown,
          recentDocuments: recentDocs,
          accuracyTrend: trend,
          rejectionReasons: reasons,
        },
      }
    }),
})
