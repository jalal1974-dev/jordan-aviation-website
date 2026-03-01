import { z } from "zod";
import { protectedProcedure, router } from "./_core/trpc";
import { TRPCError } from "@trpc/server";
import {
  createLoyaltyTier,
  updateLoyaltyTier,
  deleteLoyaltyTier,
  getAllLoyaltyTiers,
  getLoyaltyTierById,
  adjustUserLoyaltyPoints,
  getAllUsersWithLoyaltyPoints,
  getLoyaltyProgramStats,
  getLoyaltyTierDistribution,
  resetUserLoyaltyPoints,
  getPointHistoryForAdmin,
} from "./db.loyalty.admin";

// Helper to ensure user is admin
const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== "admin") {
    throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
  }
  return next({ ctx });
});

export const adminLoyaltyRouter = router({
  /**
   * Get all loyalty tiers (including inactive)
   */
  getAllTiers: adminProcedure.query(async () => {
    try {
      const tiers = await getAllLoyaltyTiers();
      return { success: true, tiers };
    } catch (error) {
      return { success: false, error: String(error) };
    }
  }),

  /**
   * Get loyalty tier by ID
   */
  getTierById: adminProcedure
    .input(z.object({ tierId: z.number() }))
    .query(async ({ input }: any) => {
      try {
        const tier = await getLoyaltyTierById(input.tierId);
        return { success: true, tier: tier[0] || null };
      } catch (error) {
        return { success: false, error: String(error) };
      }
    }),

  /**
   * Create new loyalty tier
   */
  createTier: adminProcedure
    .input(
      z.object({
        name: z.string(),
        nameAr: z.string(),
        minPoints: z.number(),
        pointsMultiplier: z.number(),
        benefits: z.string().optional(),
        isActive: z.boolean().default(true),
      })
    )
      .mutation(async ({ input }: any) => {
      try {
        const result = await createLoyaltyTier({
          name: input.name,
          nameAr: input.nameAr,
          minPoints: input.minPoints,
          pointsMultiplier: input.pointsMultiplier.toString(),
          benefitsDescription: input.benefits,
          isActive: input.isActive,
        });
        return { success: true, tierId: (result as any).insertId };
      } catch (error) {
        return { success: false, error: String(error) };
      }
    }),

  /**
   * Update loyalty tier
   */
  updateTier: adminProcedure
    .input(
      z.object({
        tierId: z.number(),
        name: z.string().optional(),
        nameAr: z.string().optional(),
        minPoints: z.number().optional(),
        pointsMultiplier: z.number().optional(),
        benefits: z.string().optional(),
        isActive: z.boolean().optional(),
      })
    )
    .mutation(async ({ input }: any) => {
      try {
        const updateData: any = {};
        if (input.name) updateData.name = input.name;
        if (input.nameAr) updateData.nameAr = input.nameAr;
        if (input.minPoints !== undefined) updateData.minPoints = input.minPoints;
        if (input.pointsMultiplier !== undefined)
          updateData.pointsMultiplier = input.pointsMultiplier.toString();
        if (input.benefits !== undefined) updateData.benefitsDescription = input.benefits;
        if (input.isActive !== undefined) updateData.isActive = input.isActive;

        await updateLoyaltyTier(input.tierId, updateData);
        return { success: true };
      } catch (error) {
        return { success: false, error: String(error) };
      }
    }),

  /**
   * Delete loyalty tier
   */
  deleteTier: adminProcedure
    .input(z.object({ tierId: z.number() }))
    .mutation(async ({ input }: any) => {
      try {
        await deleteLoyaltyTier(input.tierId);
        return { success: true };
      } catch (error) {
        return { success: false, error: String(error) };
      }
    }),

  /**
   * Adjust user loyalty points (admin override)
   */
  adjustUserPoints: adminProcedure
    .input(
      z.object({
        userId: z.number(),
        pointsAdjustment: z.number(),
        reason: z.string(),
        description: z.string().optional(),
      })
    )
    .mutation(async ({ input }: any) => {
      try {
        const result = await adjustUserLoyaltyPoints(
          input.userId,
          input.pointsAdjustment,
          input.reason,
          input.description
        );
        return { success: true, newTotalPoints: result.newTotalPoints, newAvailablePoints: result.newAvailablePoints };
      } catch (error) {
        return { success: false, error: String(error) };
      }
    }),

  /**
   * Get all users with loyalty points
   */
  getAllUsersWithPoints: adminProcedure
    .input(z.object({ limit: z.number().default(100), offset: z.number().default(0) }))
    .query(async ({ input }: any) => {
      try {
        const users = await getAllUsersWithLoyaltyPoints(input.limit, input.offset);
        return { success: true, users };
      } catch (error) {
        return { success: false, error: String(error) };
      }
    }),

  /**
   * Get loyalty program statistics
   */
  getProgramStats: adminProcedure.query(async () => {
    try {
      const stats = await getLoyaltyProgramStats();
      return { success: true, stats };
    } catch (error) {
      return { success: false, error: String(error) };
    }
  }),

  /**
   * Get loyalty tier distribution
   */
  getTierDistribution: adminProcedure.query(async () => {
    try {
      const distribution = await getLoyaltyTierDistribution();
      return { success: true, distribution };
    } catch (error) {
      return { success: false, error: String(error) };
    }
  }),

  /**
   * Reset user loyalty points (careful operation)
   */
  resetUserPoints: adminProcedure
    .input(
      z.object({
        userId: z.number(),
        reason: z.string(),
      })
    )
    .mutation(async ({ input }: any) => {
      try {
        const result = await resetUserLoyaltyPoints(input.userId, input.reason);
        return { success: true };
      } catch (error) {
        return { success: false, error: String(error) };
      }
    }),

  /**
   * Get point history for admin review
   */
  getPointHistory: adminProcedure
    .input(
      z.object({
        userId: z.number().optional(),
        limit: z.number().default(100),
        offset: z.number().default(0),
      })
    )
    .query(async ({ input }: any) => {
      try {
        const history = await getPointHistoryForAdmin(input.userId, input.limit, input.offset);
        return { success: true, history };
      } catch (error) {
        return { success: false, error: String(error) };
      }
    }),
});
