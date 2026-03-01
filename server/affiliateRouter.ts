import { z } from "zod";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { getDb } from "./db";
import { eq } from "drizzle-orm";
import { affiliateReferrals } from "../drizzle/schema";
import {
  getAffiliateByUserId,
  getAffiliateByCode,
  createAffiliateRegistration,
  getAffiliateStats,
  getAffiliateReferrals,
  getAffiliatePayments,
  createAffiliateReferral,
  updateReferralStatus,
} from "./db.affiliate";

/**
 * Generate unique affiliate code
 */
function generateAffiliateCode(): string {
  return `AFF-${Date.now()}-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;
}

/**
 * Generate unique referral code
 */
function generateReferralCode(): string {
  return `REF-${Date.now()}-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;
}

export const affiliateRouter = router({
  /**
   * Register as affiliate
   */
  register: protectedProcedure
    .input(
      z.object({
        companyName: z.string().optional(),
        website: z.string().url().optional(),
        contactEmail: z.string().email(),
        contactPhone: z.string().optional(),
        commissionRate: z.number().min(0).max(100).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Check if user already has affiliate account
      const existing = await getAffiliateByUserId(ctx.user.id);
      if (existing.length > 0) {
        throw new Error("User already has an affiliate account");
      }

      const affiliateCode = generateAffiliateCode();

      return createAffiliateRegistration({
        userId: ctx.user.id,
        affiliateCode,
        companyName: input.companyName,
        website: input.website,
        contactEmail: input.contactEmail,
        contactPhone: input.contactPhone,
        commissionRate: input.commissionRate?.toString() || "5.00",
        status: "pending",
      });
    }),

  /**
   * Get current user's affiliate account
   */
  getMyAccount: protectedProcedure.query(async ({ ctx }) => {
    const affiliate = await getAffiliateByUserId(ctx.user.id);
    return affiliate.length > 0 ? affiliate[0] : null;
  }),

  /**
   * Get affiliate statistics
   */
  getStats: protectedProcedure.query(async ({ ctx }) => {
    const affiliate = await getAffiliateByUserId(ctx.user.id);
    if (!affiliate.length) {
      throw new Error("User is not an affiliate");
    }

    return getAffiliateStats(affiliate[0].id);
  }),

  /**
   * Get affiliate referrals
   */
  getReferrals: protectedProcedure
    .input(
      z.object({
        limit: z.number().default(50),
        offset: z.number().default(0),
      })
    )
    .query(async ({ ctx, input }) => {
      const affiliate = await getAffiliateByUserId(ctx.user.id);
      if (!affiliate.length) {
        throw new Error("User is not an affiliate");
      }

      return getAffiliateReferrals(
        affiliate[0].id,
        input.limit,
        input.offset
      );
    }),

  /**
   * Get affiliate payments
   */
  getPayments: protectedProcedure
    .input(
      z.object({
        limit: z.number().default(50),
        offset: z.number().default(0),
      })
    )
    .query(async ({ ctx, input }) => {
      const affiliate = await getAffiliateByUserId(ctx.user.id);
      if (!affiliate.length) {
        throw new Error("User is not an affiliate");
      }

      return getAffiliatePayments(
        affiliate[0].id,
        input.limit,
        input.offset
      );
    }),

  /**
   * Get referral link for affiliate
   */
  getShareLink: protectedProcedure.query(async ({ ctx }) => {
    const affiliate = await getAffiliateByUserId(ctx.user.id);
    if (!affiliate.length) {
      throw new Error("User is not an affiliate");
    }

    const baseUrl = process.env.VITE_APP_URL || "https://jordanaviation.com";
    const referralCode = generateReferralCode();

    // Create referral record
    await createAffiliateReferral({
      affiliateId: affiliate[0].id,
      referralCode,
      status: "clicked",
    });

    return {
      referralCode,
      shareLink: `${baseUrl}?ref=${referralCode}`,
      affiliateCode: affiliate[0].affiliateCode,
    };
  }),

  /**
   * Track referral click (public)
   */
  trackClick: publicProcedure
    .input(z.object({ referralCode: z.string() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const referral = await db
        .select()
        .from(affiliateReferrals)
        .where(eq(affiliateReferrals.referralCode, input.referralCode))
        .limit(1);

      if (!referral.length) {
        throw new Error("Invalid referral code");
      }

      // Update click timestamp
      await updateReferralStatus(referral[0].id, "clicked");

      return { success: true };
    }),
});
