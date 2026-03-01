import { z } from "zod";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import {
  getUserLoyaltyStatus,
  addLoyaltyPoints,
  redeemLoyaltyPoints,
  getLoyaltyPointHistory,
  getLoyaltyTiers,
  updateUserTier,
} from "./db.loyalty";

export const loyaltyRouter = router({
  /**
   * Get current user's loyalty status
   */
  getStatus: protectedProcedure.query(async ({ ctx }) => {
    const status = await getUserLoyaltyStatus(ctx.user.id);
    return status;
  }),

  /**
   * Get loyalty tiers
   */
  getTiers: publicProcedure.query(async () => {
    return getLoyaltyTiers();
  }),

  /**
   * Get loyalty point history
   */
  getPointHistory: protectedProcedure
    .input(z.object({ limit: z.number().default(50) }))
    .query(async ({ ctx, input }) => {
      return getLoyaltyPointHistory(ctx.user.id, input.limit);
    }),

  /**
   * Redeem loyalty points
   */
  redeemPoints: protectedProcedure
    .input(
      z.object({
        pointsToRedeem: z.number().min(1),
        reason: z.string(),
        description: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return redeemLoyaltyPoints(
        ctx.user.id,
        input.pointsToRedeem,
        input.reason,
        input.description
      );
    }),

  /**
   * Admin: Add points to user (for bookings, promotions, etc.)
   */
  addPoints: protectedProcedure
    .input(
      z.object({
        userId: z.number(),
        pointsToAdd: z.number().min(1),
        reason: z.string(),
        bookingId: z.number().optional(),
        description: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Only admins can add points to other users
      if (ctx.user.role !== "admin" && ctx.user.id !== input.userId) {
        throw new Error("Unauthorized");
      }

      return addLoyaltyPoints(
        input.userId,
        input.pointsToAdd,
        input.reason,
        input.bookingId,
        input.description
      );
    }),

  /**
   * Update user tier based on current points
   */
  updateTier: protectedProcedure.mutation(async ({ ctx }) => {
    return updateUserTier(ctx.user.id);
  }),
});
