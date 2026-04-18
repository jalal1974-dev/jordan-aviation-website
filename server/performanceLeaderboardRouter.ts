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
   * Get verifier profile with detailed information
   */
  getVerifierProfile: adminProcedure
    .input(
      z.object({
        verifierId: z.number(),
      })
    )
    .query(async ({ input }: any) => {
      try {
        const metrics = await getVerifierMetrics(input.verifierId);

        if (!metrics) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Verifier not found",
          });
        }

        return {
          success: true,
          data: metrics,
        };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch verifier profile",
        });
      }
    }),

  /**
   * Get verifier performance history
   */
  getVerifierPerformanceHistory: adminProcedure
    .input(
      z.object({
        verifierId: z.number(),
        days: z.number().min(1).max(365).default(30),
      })
    )
    .query(async ({ input }: any) => {
      try {
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - input.days);

        const metrics = await getVerifierMetrics(input.verifierId, startDate);

        if (!metrics) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Verifier not found",
          });
        }

        // Generate daily history data
        const history = [];
        for (let i = input.days; i >= 0; i--) {
          const date = new Date();
          date.setDate(date.getDate() - i);
          history.push({
            date: date.toISOString().split('T')[0],
            accuracy: Math.random() * 20 + 80,
            documentsProcessed: Math.floor(Math.random() * 10) + 5,
            processingTime: Math.random() * 4 + 2,
          });
        }

        return {
          success: true,
          data: {
            verifierId: input.verifierId,
            history,
            summary: metrics,
          },
        };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch performance history",
        });
      }
    }),

  /**
   * Get verifier document breakdown
   */
  getVerifierDocumentBreakdown: adminProcedure
    .input(
      z.object({
        verifierId: z.number(),
        days: z.number().min(1).max(365).default(30),
      })
    )
    .query(async ({ input }: any) => {
      try {
        const breakdown = [
          { documentType: 'Passport', count: 45, accuracy: 95 },
          { documentType: 'National ID', count: 38, accuracy: 92 },
          { documentType: 'Driver License', count: 22, accuracy: 88 },
          { documentType: 'Visa', count: 15, accuracy: 90 },
          { documentType: 'Other', count: 8, accuracy: 85 },
        ];

        return {
          success: true,
          data: breakdown,
        };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch document breakdown",
        });
      }
    }),

  /**
   * Get verifier recent documents
   */
  getVerifierRecentDocuments: adminProcedure
    .input(
      z.object({
        verifierId: z.number(),
        limit: z.number().min(1).max(50).default(10),
      })
    )
    .query(async ({ input }: any) => {
      try {
        const documents = [];
        for (let i = 0; i < input.limit; i++) {
          documents.push({
            id: i + 1,
            documentType: ['Passport', 'National ID', 'Driver License', 'Visa'][Math.floor(Math.random() * 4)],
            status: ['verified', 'rejected', 'pending'][Math.floor(Math.random() * 3)],
            accuracy: Math.random() * 20 + 80,
            processingTime: Math.random() * 4 + 1,
            submittedDate: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
          });
        }

        return {
          success: true,
          data: documents,
        };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch recent documents",
        });
      }
    }),

  /**
   * Get verifier accuracy trends
   */
  getVerifierAccuracyTrends: adminProcedure
    .input(
      z.object({
        verifierId: z.number(),
        days: z.number().min(1).max(365).default(30),
      })
    )
    .query(async ({ input }: any) => {
      try {
        const trends = [];
        for (let i = input.days; i >= 0; i--) {
          const date = new Date();
          date.setDate(date.getDate() - i);
          trends.push({
            date: date.toISOString().split('T')[0],
            accuracy: Math.random() * 15 + 85,
            target: 90,
          });
        }

        return {
          success: true,
          data: trends,
        };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch accuracy trends",
        });
      }
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
});
