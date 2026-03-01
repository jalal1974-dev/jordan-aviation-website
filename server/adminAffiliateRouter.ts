import { z } from "zod";
import { protectedProcedure, router } from "./_core/trpc";
import { TRPCError } from "@trpc/server";
import {
  getAllAffiliates,
  getAffiliateByIdAdmin,
  updateAffiliateStatusAdmin,
  updateAffiliateCommissionRate,
  getAllAffiliateReferralsAdmin,
  updateReferralCommissionStatus,
  createAffiliatePaymentAdmin,
  getAffiliatePaymentsAdmin,
  getAffiliateProgramStats,
  getTopPerformingAffiliates,
  getAffiliateReferralBreakdown,
  bulkUpdateReferralCommissionStatus,
  suspendAffiliate,
  reactivateAffiliate,
} from "./db.affiliate.admin";

const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== "admin") {
    throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
  }
  return next({ ctx });
});

export const adminAffiliateRouter = router({
  /**
   * Get all affiliates with optional filters
   */
  getAllAffiliates: adminProcedure
    .input(
      z.object({
        status: z.enum(["pending", "approved", "rejected", "suspended"]).optional(),
        limit: z.number().default(100),
        offset: z.number().default(0),
      })
    )
    .query(async ({ input }: any) => {
      try {
        const affiliates = await getAllAffiliates(input.status, input.limit, input.offset);
        return { success: true, affiliates };
      } catch (error) {
        return { success: false, error: String(error) };
      }
    }),

  /**
   * Get affiliate by ID
   */
  getAffiliateById: adminProcedure
    .input(z.object({ affiliateId: z.number() }))
    .query(async ({ input }: any) => {
      try {
        const affiliate = await getAffiliateByIdAdmin(input.affiliateId);
        return { success: true, affiliate: affiliate[0] || null };
      } catch (error) {
        return { success: false, error: String(error) };
      }
    }),

  /**
   * Update affiliate status
   */
  updateAffiliateStatus: adminProcedure
    .input(
      z.object({
        affiliateId: z.number(),
        status: z.enum(["pending", "approved", "rejected", "suspended"]),
      })
    )
    .mutation(async ({ input, ctx }: any) => {
      try {
        await updateAffiliateStatusAdmin(input.affiliateId, input.status);
        return { success: true };
      } catch (error) {
        return { success: false, error: String(error) };
      }
    }),

  /**
   * Update affiliate commission rate
   */
  updateCommissionRate: adminProcedure
    .input(
      z.object({
        affiliateId: z.number(),
        commissionRate: z.string(),
      })
    )
    .mutation(async ({ input }: any) => {
      try {
        await updateAffiliateCommissionRate(input.affiliateId, input.commissionRate);
        return { success: true };
      } catch (error) {
        return { success: false, error: String(error) };
      }
    }),

  /**
   * Get all affiliate referrals
   */
  getAllReferrals: adminProcedure
    .input(
      z.object({
        affiliateId: z.number().optional(),
        status: z.string().optional(),
        limit: z.number().default(100),
        offset: z.number().default(0),
      })
    )
    .query(async ({ input }: any) => {
      try {
        const referrals = await getAllAffiliateReferralsAdmin(
          input.affiliateId,
          input.status,
          input.limit,
          input.offset
        );
        return { success: true, referrals };
      } catch (error) {
        return { success: false, error: String(error) };
      }
    }),

  /**
   * Update referral commission status
   */
  updateReferralCommissionStatus: adminProcedure
    .input(
      z.object({
        referralId: z.number(),
        commissionStatus: z.enum(["pending", "approved", "paid"]),
      })
    )
    .mutation(async ({ input }: any) => {
      try {
        await updateReferralCommissionStatus(input.referralId, input.commissionStatus);
        return { success: true };
      } catch (error) {
        return { success: false, error: String(error) };
      }
    }),

  /**
   * Bulk update referral commission status
   */
  bulkUpdateReferralStatus: adminProcedure
    .input(
      z.object({
        referralIds: z.array(z.number()),
        commissionStatus: z.enum(["pending", "approved", "paid"]),
      })
    )
    .mutation(async ({ input }: any) => {
      try {
        await bulkUpdateReferralCommissionStatus(input.referralIds, input.commissionStatus);
        return { success: true, updated: input.referralIds.length };
      } catch (error) {
        return { success: false, error: String(error) };
      }
    }),

  /**
   * Create affiliate payment
   */
  createPayment: adminProcedure
    .input(
      z.object({
        affiliateId: z.number(),
        amount: z.string(),
        currency: z.string().default("USD"),
        status: z.enum(["pending", "completed", "failed"]).default("pending"),
        paymentMethod: z.string(),
        periodStart: z.date(),
        periodEnd: z.date(),
      })
    )
    .mutation(async ({ input }: any) => {
      try {
        const result = await createAffiliatePaymentAdmin({
          affiliateId: input.affiliateId,
          amount: input.amount,
          currency: input.currency,
          status: input.status as any,
          paymentMethod: input.paymentMethod,
          periodStart: input.periodStart,
          periodEnd: input.periodEnd,
        });
        return { success: true, paymentId: (result as any).insertId };
      } catch (error) {
        return { success: false, error: String(error) };
      }
    }),

  /**
   * Get affiliate payments
   */
  getPayments: adminProcedure
    .input(
      z.object({
        affiliateId: z.number().optional(),
        status: z.string().optional(),
        limit: z.number().default(100),
        offset: z.number().default(0),
      })
    )
    .query(async ({ input }: any) => {
      try {
        const payments = await getAffiliatePaymentsAdmin(
          input.affiliateId,
          input.status,
          input.limit,
          input.offset
        );
        return { success: true, payments };
      } catch (error) {
        return { success: false, error: String(error) };
      }
    }),

  /**
   * Get affiliate program statistics
   */
  getProgramStats: adminProcedure.query(async () => {
    try {
      const stats = await getAffiliateProgramStats();
      return { success: true, stats };
    } catch (error) {
      return { success: false, error: String(error) };
    }
  }),

  /**
   * Get top performing affiliates
   */
  getTopPerformers: adminProcedure
    .input(z.object({ limit: z.number().default(10) }))
    .query(async ({ input }: any) => {
      try {
        const affiliates = await getTopPerformingAffiliates(input.limit);
        return { success: true, affiliates };
      } catch (error) {
        return { success: false, error: String(error) };
      }
    }),

  /**
   * Get referral breakdown for affiliate
   */
  getReferralBreakdown: adminProcedure
    .input(z.object({ affiliateId: z.number() }))
    .query(async ({ input }: any) => {
      try {
        const breakdown = await getAffiliateReferralBreakdown(input.affiliateId);
        return { success: true, breakdown };
      } catch (error) {
        return { success: false, error: String(error) };
      }
    }),

  /**
   * Suspend affiliate
   */
  suspendAffiliate: adminProcedure
    .input(
      z.object({
        affiliateId: z.number(),
        reason: z.string(),
      })
    )
    .mutation(async ({ input }: any) => {
      try {
        await suspendAffiliate(input.affiliateId, input.reason);
        return { success: true };
      } catch (error) {
        return { success: false, error: String(error) };
      }
    }),

  /**
   * Reactivate affiliate
   */
  reactivateAffiliate: adminProcedure
    .input(z.object({ affiliateId: z.number() }))
    .mutation(async ({ input }: any) => {
      try {
        await reactivateAffiliate(input.affiliateId);
        return { success: true };
      } catch (error) {
        return { success: false, error: String(error) };
      }
    }),
});
