import { z } from "zod";
import { publicProcedure, router } from "./_core/trpc";
import { protectedProcedure } from "./_core/trpc";
import {
  getAvailableRedemptionOptions,
  getRedemptionOption,
  createRedemption,
  getUserRedemptionHistory,
  getUserRedemptionStats,
  updateRedemptionStatus,
  deductMilesForRedemption,
  canUserRedeem,
  getRedemptionOptionWithAvailability,
} from "./db.redemption";

export const redemptionRouter = router({
  /**
   * Get all available redemption options with optional filters
   */
  getAvailableOptions: publicProcedure
    .input(
      z
        .object({
          type: z.string().optional(),
          category: z.string().optional(),
          maxMilesRequired: z.number().optional(),
        })
        .optional()
    )
    .query(async ({ input }: any) => {
      return await getAvailableRedemptionOptions(input);
    }),

  /**
   * Get single redemption option details
   */
  getOption: publicProcedure
    .input(z.number())
    .query(async ({ input }: any) => {
      return await getRedemptionOptionWithAvailability(input);
    }),

  /**
   * Check if user can redeem a specific option
   */
  canRedeem: protectedProcedure
    .input(z.number())
    .query(async ({ ctx, input }: any) => {
      return await canUserRedeem(ctx.user.id, input);
    }),

  /**
   * Create a redemption request
   */
  redeem: protectedProcedure
    .input(
      z.object({
        redemptionOptionId: z.number(),
        bookingId: z.number().optional(),
      })
    )
    .mutation(async ({ ctx, input }: any) => {
      // Check if user can redeem
      const canRedeemCheck = await canUserRedeem(ctx.user.id, input.redemptionOptionId);
      if (!canRedeemCheck.canRedeem) {
        throw new Error(canRedeemCheck.reason);
      }

      // Get redemption option details
      const option = await getRedemptionOption(input.redemptionOptionId);
      if (!option) {
        throw new Error("Redemption option not found");
      }

      // Create redemption record
      const result = await createRedemption({
        userId: ctx.user.id,
        redemptionOptionId: input.redemptionOptionId,
        bookingId: input.bookingId,
        milesSpent: option.milesRequired,
      });

      // Deduct miles from user account
      const deductResult = await deductMilesForRedemption(
        ctx.user.id,
        option.milesRequired,
        input.redemptionOptionId,
        option.name
      );

      // Update redemption status to approved
      // Note: In production, this would be done after admin approval
      // await updateRedemptionStatus(
      //   input.redemptionOptionId,
      //   "approved",
      //   new Date()
      // );

      return {
        success: true,
        confirmationCode: result?.confirmationCode,
        milesSpent: option.milesRequired,
        newBalance: deductResult?.newBalance,
        message: `Successfully redeemed ${option.name}. Confirmation code: ${result?.confirmationCode}`,
      };
    }),

  /**
   * Get user's redemption history
   */
  getHistory: protectedProcedure
    .input(
      z.object({
        limit: z.number().default(20),
        offset: z.number().default(0),
      })
    )
    .query(async ({ ctx, input }: any) => {
      return await getUserRedemptionHistory(ctx.user.id, input.limit, input.offset);
    }),

  /**
   * Get user's redemption statistics
   */
  getStats: protectedProcedure.query(async ({ ctx }: any) => {
    return await getUserRedemptionStats(ctx.user.id);
  }),

  /**
   * Get redemption options by category
   */
  getByCategory: publicProcedure
    .input(z.string())
    .query(async ({ input }: any) => {
      return await getAvailableRedemptionOptions({ category: input });
    }),

  /**
   * Get redemption options by type
   */
  getByType: publicProcedure
    .input(z.string())
    .query(async ({ input }: any) => {
      return await getAvailableRedemptionOptions({ type: input });
    }),

  /**
   * Search redemption options
   */
  search: publicProcedure
    .input(
      z.object({
        query: z.string(),
        type: z.string().optional(),
        maxMiles: z.number().optional(),
      })
    )
    .query(async ({ input }: any) => {
      // Get all available options first
      const options = await getAvailableRedemptionOptions({
        type: input.type,
        maxMilesRequired: input.maxMiles,
      });

      // Filter by search query
      const query = input.query.toLowerCase();
      return options.filter(
        (opt) =>
          opt.name.toLowerCase().includes(query) ||
          opt.nameAr.includes(query) ||
          opt.description.toLowerCase().includes(query)
      );
    }),
});
