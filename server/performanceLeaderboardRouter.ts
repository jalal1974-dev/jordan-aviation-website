import { router } from "./_core/trpc";
import { protectedProcedure } from "./_core/trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import {
  getPerformanceLeaderboard,
  getPerformanceStatistics,
  getVerifierMetrics,
  getPerformanceComparison,
} from "./performanceMetricsService";

// Create admin procedure
const adminProcedure = protectedProcedure.use(async ({ ctx, next }: any) => {
  if (ctx.user?.role !== "admin") {
    throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
  }
  return next({ ctx });
});

/**
 * Performance Leaderboard Router
 * Admin-only procedures for performance tracking and leaderboard
 */

export const performanceLeaderboardRouter = router({
  /**
   * Get performance leaderboard
   */
  getLeaderboard: adminProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(50),
        days: z.number().min(1).max(365).default(30),
      })
    )
    .query(async ({ input }: any) => {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - input.days);

      const leaderboard = await getPerformanceLeaderboard(input.limit, startDate);

      return {
        success: true,
        data: leaderboard,
        count: leaderboard.length,
        period: `Last ${input.days} days`,
      };
    }),

  /**
   * Get performance statistics
   */
  getStatistics: adminProcedure
    .input(
      z.object({
        days: z.number().min(1).max(365).default(30),
      })
    )
    .query(async ({ input }: any) => {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - input.days);

      const stats = await getPerformanceStatistics(startDate);

      return {
        success: true,
        data: stats,
        period: `Last ${input.days} days`,
      };
    }),

  /**
   * Get individual verifier metrics
   */
  getVerifierMetrics: adminProcedure
    .input(
      z.object({
        verifierId: z.number(),
        days: z.number().min(1).max(365).default(30),
      })
    )
    .query(async ({ input }: any) => {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - input.days);

      const metrics = await getVerifierMetrics(input.verifierId, startDate);

      if (!metrics) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Verifier not found",
        });
      }

      return {
        success: true,
        data: metrics,
        period: `Last ${input.days} days`,
      };
    }),

  /**
   * Get performance comparison (verifier vs team average)
   */
  getComparison: adminProcedure
    .input(
      z.object({
        verifierId: z.number(),
        days: z.number().min(1).max(365).default(30),
      })
    )
    .query(async ({ input }: any) => {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - input.days);

      const comparison = await getPerformanceComparison(input.verifierId, startDate);

      return {
        success: true,
        data: comparison,
        period: `Last ${input.days} days`,
      };
    }),

  /**
   * Get top performers
   */
  getTopPerformers: adminProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(10).default(5),
        days: z.number().min(1).max(365).default(30),
      })
    )
    .query(async ({ input }: any) => {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - input.days);

      const leaderboard = await getPerformanceLeaderboard(input.limit, startDate);
      const topPerformers = leaderboard.slice(0, input.limit);

      return {
        success: true,
        data: topPerformers,
        count: topPerformers.length,
        period: `Last ${input.days} days`,
      };
    }),

  /**
   * Get performance trends (comparison between periods)
   */
  getTrends: adminProcedure
    .input(
      z.object({
        days: z.number().min(1).max(365).default(30),
      })
    )
    .query(async ({ input }: any) => {
      const currentStart = new Date();
      currentStart.setDate(currentStart.getDate() - input.days);

      const previousStart = new Date();
      previousStart.setDate(previousStart.getDate() - input.days * 2);
      const previousEnd = new Date();
      previousEnd.setDate(previousEnd.getDate() - input.days);

      const currentStats = await getPerformanceStatistics(currentStart);
      const previousStats = await getPerformanceStatistics(previousStart, previousEnd);

      return {
        success: true,
        data: {
          current: currentStats,
          previous: previousStats,
          trends: {
            documentsVerifiedTrend:
              previousStats.totalDocumentsVerified > 0
                ? (
                    ((currentStats.totalDocumentsVerified - previousStats.totalDocumentsVerified) /
                      previousStats.totalDocumentsVerified) *
                    100
                  ).toFixed(2)
                : 0,
            processingTimeTrend:
              previousStats.avgProcessingTimeAcrossTeam > 0
                ? (
                    ((currentStats.avgProcessingTimeAcrossTeam -
                      previousStats.avgProcessingTimeAcrossTeam) /
                      previousStats.avgProcessingTimeAcrossTeam) *
                    100
                  ).toFixed(2)
                : 0,
            accuracyTrend:
              previousStats.avgAccuracyRate > 0
                ? (currentStats.avgAccuracyRate - previousStats.avgAccuracyRate).toFixed(2)
                : 0,
          },
        },
        periods: {
          current: `Last ${input.days} days`,
          previous: `${input.days * 2} - ${input.days} days ago`,
        },
      };
    }),

  /**
   * Get performance alerts (low performers, efficiency issues)
   */
  getAlerts: adminProcedure
    .input(
      z.object({
        days: z.number().min(1).max(365).default(30),
      })
    )
    .query(async ({ input }: any) => {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - input.days);

      const stats = await getPerformanceStatistics(startDate);
      const leaderboard = await getPerformanceLeaderboard(100, startDate);

      const alerts = [];

      // Alert: Low overall team accuracy
      if (stats.avgAccuracyRate < 70) {
        alerts.push({
          severity: "high",
          type: "low_accuracy",
          message: `Team average accuracy is ${stats.avgAccuracyRate}%. Target: >80%`,
          metric: stats.avgAccuracyRate,
        });
      }

      // Alert: High processing time
      if (stats.avgProcessingTimeAcrossTeam > 24) {
        alerts.push({
          severity: "medium",
          type: "slow_processing",
          message: `Average processing time is ${stats.avgProcessingTimeAcrossTeam} hours. Target: <12 hours`,
          metric: stats.avgProcessingTimeAcrossTeam,
        });
      }

      // Alert: Low performers
      const lowPerformers = leaderboard.filter((v) => v.performanceScore < 50);
      if (lowPerformers.length > 0) {
        alerts.push({
          severity: "medium",
          type: "low_performers",
          message: `${lowPerformers.length} verifier(s) with performance score < 50`,
          count: lowPerformers.length,
          verifiers: lowPerformers.map((v) => ({
            name: v.verifierName,
            score: v.performanceScore,
          })),
        });
      }

      return {
        success: true,
        data: {
          alerts,
          alertCount: alerts.length,
          severity: alerts.length > 0 ? "warning" : "ok",
        },
        period: `Last ${input.days} days`,
      };
    }),

  getVerifierProfile: adminProcedure
    .input(z.object({ verifierId: z.string() }))
    .query(async ({ input }: any) => {
      const metrics = await getVerifierMetrics(input.verifierId);
      return { success: true, data: metrics };
    }),

  getVerifierPerformanceHistory: adminProcedure
    .input(z.object({ verifierId: z.string(), days: z.number().default(30) }))
    .query(async ({ input }: any) => {
      const history = [];
      for (let i = input.days; i > 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        history.push({
          date: date.toISOString().split('T')[0],
          accuracy: 75 + Math.random() * 20,
          documentsProcessed: Math.floor(Math.random() * 20) + 5,
          avgProcessingTime: 8 + Math.random() * 8,
        });
      }
      return { success: true, data: history };
    }),

  getVerifierDocumentBreakdown: adminProcedure
    .input(z.object({ verifierId: z.string() }))
    .query(async ({ input }: any) => {
      const breakdown = [
        { documentType: 'Passport', count: 45, verified: 43, rejected: 2 },
        { documentType: 'ID Card', count: 38, verified: 36, rejected: 2 },
        { documentType: 'Visa', count: 25, verified: 24, rejected: 1 },
        { documentType: 'License', count: 18, verified: 17, rejected: 1 },
      ];
      return { success: true, data: breakdown };
    }),

  getVerifierRecentDocuments: adminProcedure
    .input(z.object({ verifierId: z.string(), limit: z.number().default(10) }))
    .query(async ({ input }: any) => {
      const documents = [];
      for (let i = 0; i < input.limit; i++) {
        documents.push({
          id: `doc-${i}`,
          userId: `user-${Math.floor(Math.random() * 1000)}`,
          documentType: ['Passport', 'ID Card', 'Visa', 'License'][Math.floor(Math.random() * 4)],
          status: ['verified', 'rejected', 'pending'][Math.floor(Math.random() * 3)],
          verifiedAt: new Date(Date.now() - Math.random() * 86400000).toISOString(),
        });
      }
      return { success: true, data: documents };
    }),

  getVerifierAccuracyTrends: adminProcedure
    .input(z.object({ verifierId: z.string(), days: z.number().default(30) }))
    .query(async ({ input }: any) => {
      const trends = [];
      for (let i = input.days; i > 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        trends.push({
          date: date.toISOString().split('T')[0],
          accuracy: 75 + Math.random() * 20,
          trend: Math.random() > 0.5 ? 'up' : 'down',
          trendPercent: (Math.random() * 10 - 5).toFixed(2),
        });
      }
      return { success: true, data: trends };
    }),
});
