import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { protectedProcedure, router } from "./_core/trpc";
import {
  getComprehensiveVerificationMetrics,
  getVerificationMetricsForDateRange,
  getVerificationTrends,
  getDocumentTypeStatistics,
  getTopRejectionReasons,
  getAverageProcessingTime,
} from "./analyticsHelpers";

/**
 * Analytics Router for Document Verification
 * Provides metrics and statistics for admin dashboard
 */
export const analyticsRouter = router({
  /**
   * Get comprehensive verification metrics
   */
  getComprehensiveMetrics: protectedProcedure.query(async ({ ctx }) => {
    if (ctx.user.role !== "admin") {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "Only admins can access analytics",
      });
    }

    try {
      const metrics = await getComprehensiveVerificationMetrics();
      return {
        success: true,
        data: metrics,
      };
    } catch (error) {
      console.error("Error fetching comprehensive metrics:", error);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to fetch analytics metrics",
      });
    }
  }),

  /**
   * Get verification metrics for a specific date range
   */
  getMetricsForDateRange: protectedProcedure
    .input(
      z.object({
        startDate: z.date(),
        endDate: z.date(),
      })
    )
    .query(async ({ ctx, input }) => {
      if (ctx.user.role !== "admin") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only admins can access analytics",
        });
      }

      try {
        const metrics = await getVerificationMetricsForDateRange(
          input.startDate,
          input.endDate
        );
        return {
          success: true,
          data: metrics,
        };
      } catch (error) {
        console.error("Error fetching date range metrics:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch analytics for date range",
        });
      }
    }),

  /**
   * Get verification trends
   */
  getVerificationTrends: protectedProcedure
    .input(
      z.object({
        days: z.number().min(1).max(365).default(30),
      })
    )
    .query(async ({ ctx, input }) => {
      if (ctx.user.role !== "admin") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only admins can access analytics",
        });
      }

      try {
        const trends = await getVerificationTrends(input.days);
        return {
          success: true,
          data: trends,
        };
      } catch (error) {
        console.error("Error fetching trends:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch verification trends",
        });
      }
    }),

  /**
   * Get document type statistics
   */
  getDocumentTypeStats: protectedProcedure.query(async ({ ctx }) => {
    if (ctx.user.role !== "admin") {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "Only admins can access analytics",
      });
    }

    try {
      const stats = await getDocumentTypeStatistics();
      return {
        success: true,
        data: stats,
      };
    } catch (error) {
      console.error("Error fetching document type stats:", error);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to fetch document type statistics",
      });
    }
  }),

  /**
   * Get top rejection reasons
   */
  getTopRejectionReasons: protectedProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(20).default(10),
      })
    )
    .query(async ({ ctx, input }) => {
      if (ctx.user.role !== "admin") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only admins can access analytics",
        });
      }

      try {
        const reasons = await getTopRejectionReasons(input.limit);
        return {
          success: true,
          data: reasons,
        };
      } catch (error) {
        console.error("Error fetching rejection reasons:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch rejection reasons",
        });
      }
    }),

  /**
   * Get average processing time
   */
  getAverageProcessingTime: protectedProcedure.query(async ({ ctx }) => {
    if (ctx.user.role !== "admin") {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "Only admins can access analytics",
      });
    }

    try {
      const avgTime = await getAverageProcessingTime();
      return {
        success: true,
        data: {
          avgProcessingTimeHours: avgTime,
        },
      };
    } catch (error) {
      console.error("Error fetching average processing time:", error);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to fetch average processing time",
      });
    }
  }),
});
