import { z } from "zod";
import { protectedProcedure } from "./_core/trpc";
import { TRPCError } from "@trpc/server";
import { router } from "./_core/trpc";

// Helper to ensure user is admin
const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== "admin") {
    throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
  }
  return next({ ctx });
});
import {
  getAllSettings,
  getSettingsByCategory,
  getSettingByKey,
  upsertSetting,
  deleteSetting,
  getLoyaltySettings,
  getAffiliateSettings,
  parseSettingValue,
} from "./db.settings";

export const adminSettingsRouter = router({
  /**
   * Get all program settings
   */
  getAll: adminProcedure.query(async () => {
    return getAllSettings();
  }),

  /**
   * Get settings by category
   */
  getByCategory: adminProcedure
    .input(z.object({ category: z.string() }))
    .query(async ({ input }: any) => {
      return getSettingsByCategory(input.category);
    }),

  /**
   * Get loyalty program settings
   */
  getLoyaltySettings: adminProcedure.query(async () => {
    return getLoyaltySettings();
  }),

  /**
   * Get affiliate program settings
   */
  getAffiliateSettings: adminProcedure.query(async () => {
    return getAffiliateSettings();
  }),

  /**
   * Get a specific setting
   */
  getByKey: adminProcedure
    .input(z.object({ key: z.string() }))
    .query(async ({ input }: any) => {
      return getSettingByKey(input.key);
    }),

  /**
   * Update or create a setting
   */
  upsert: adminProcedure
    .input(
      z.object({
        key: z.string(),
        value: z.string(),
        category: z.enum(["loyalty", "affiliate", "general"]),
        dataType: z.enum(["string", "number", "boolean", "json"]),
        description: z.string().optional(),
      })
    )
    .mutation(async ({ input }: any) => {
      await upsertSetting(
        input.key,
        input.value,
        input.category,
        input.dataType,
        input.description
      );
      return { success: true, message: "Setting updated successfully" };
    }),

  /**
   * Delete a setting
   */
  delete: adminProcedure
    .input(z.object({ key: z.string() }))
    .mutation(async ({ input }: any) => {
      await deleteSetting(input.key);
      return { success: true, message: "Setting deleted successfully" };
    }),

  /**
   * Get loyalty tier multiplier
   */
  getLoyaltyMultiplier: adminProcedure.query(async () => {
    const setting = await getSettingByKey("loyalty_points_multiplier");
    return setting
      ? parseSettingValue(setting.settingValue, setting.dataType)
      : 1;
  }),

  /**
   * Update loyalty tier multiplier
   */
  updateLoyaltyMultiplier: adminProcedure
    .input(z.object({ multiplier: z.number().positive() }))
    .mutation(async ({ input }: any) => {
      await upsertSetting(
        "loyalty_points_multiplier",
        input.multiplier.toString(),
        "loyalty",
        "number",
        "Points earned per dollar spent"
      );
      return { success: true, multiplier: input.multiplier };
    }),

  /**
   * Get affiliate commission rate
   */
  getAffiliateCommissionRate: adminProcedure.query(async () => {
    const setting = await getSettingByKey("affiliate_commission_rate");
    return setting
      ? parseSettingValue(setting.settingValue, setting.dataType)
      : 0.1;
  }),

  /**
   * Update affiliate commission rate
   */
  updateAffiliateCommissionRate: adminProcedure
    .input(z.object({ rate: z.number().min(0).max(1) }))
    .mutation(async ({ input }: any) => {
      await upsertSetting(
        "affiliate_commission_rate",
        input.rate.toString(),
        "affiliate",
        "number",
        "Commission rate as decimal (0.1 = 10%)"
      );
      return { success: true, rate: input.rate };
    }),

  /**
   * Get miles earning rate
   */
  getMilesEarningRate: adminProcedure.query(async () => {
    const setting = await getSettingByKey("miles_earning_rate");
    return setting
      ? parseSettingValue(setting.settingValue, setting.dataType)
      : 1;
  }),

  /**
   * Update miles earning rate
   */
  updateMilesEarningRate: adminProcedure
    .input(z.object({ rate: z.number().positive() }))
    .mutation(async ({ input }: any) => {
      await upsertSetting(
        "miles_earning_rate",
        input.rate.toString(),
        "loyalty",
        "number",
        "Miles earned per kilometer flown"
      );
      return { success: true, rate: input.rate };
    }),
});
