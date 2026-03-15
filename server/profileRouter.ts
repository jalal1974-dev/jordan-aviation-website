import { router, protectedProcedure } from "./_core/trpc";
import { z } from "zod";
import {
  createCustomerProfile,
  getCustomerProfile,
  updateCustomerProfile,
  createCustomerPreferences,
  getCustomerPreferences,
  updateCustomerPreferences,
  getFullCustomerProfile,
  calculateProfileCompleteness,
  addMiles,
  redeemMiles,
  getMilesHistory,
} from "./db.profile";

const profileSchema = z.object({
  frequentFlyerNumber: z.string().optional(),
  passportNumber: z.string().optional(),
  passportCountry: z.string().length(2).optional(),
  dateOfBirth: z.date().optional(),
  nationality: z.string().length(2).optional(),
  gender: z.enum(["male", "female", "other"]).optional(),
  phoneNumber: z.string().optional(),
  alternatePhone: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  postalCode: z.string().optional(),
  country: z.string().length(2).optional(),
});

const preferencesSchema = z.object({
  emailNotifications: z.boolean().optional(),
  smsNotifications: z.boolean().optional(),
  pushNotifications: z.boolean().optional(),
  marketingEmails: z.boolean().optional(),
  loyaltyUpdates: z.boolean().optional(),
  flightDeals: z.boolean().optional(),
  preferredLanguage: z.string().optional(),
  preferredCurrency: z.string().length(3).optional(),
  seatPreference: z.string().optional(),
  mealPreference: z.string().optional(),
  specialRequests: z.string().optional(),
});

export const profileRouter = router({
  /**
   * Create or get customer profile
   */
  getOrCreateProfile: protectedProcedure.query(async ({ ctx }) => {
    const existingProfile = await getCustomerProfile(ctx.user.id);
    
    if (existingProfile) {
      return existingProfile;
    }

    // Create default profile
    await createCustomerProfile(ctx.user.id, {});
    await createCustomerPreferences(ctx.user.id, {});
    
    return await getCustomerProfile(ctx.user.id);
  }),

  /**
   * Get full customer profile with all related data
   */
  getFullProfile: protectedProcedure.query(async ({ ctx }) => {
    return await getFullCustomerProfile(ctx.user.id);
  }),

  /**
   * Update customer profile
   */
  updateProfile: protectedProcedure
    .input(profileSchema)
    .mutation(async ({ ctx, input }) => {
      const profile = await updateCustomerProfile(ctx.user.id, input);
      
      // Calculate profile completeness
      const updated = await getCustomerProfile(ctx.user.id);
      if (updated) {
        const completeness = calculateProfileCompleteness(updated);
        await updateCustomerProfile(ctx.user.id, {
          profileCompleteness: completeness,
        });
      }

      return updated;
    }),

  /**
   * Get customer preferences
   */
  getPreferences: protectedProcedure.query(async ({ ctx }) => {
    let prefs = await getCustomerPreferences(ctx.user.id);
    
    if (!prefs) {
      await createCustomerPreferences(ctx.user.id, {});
      prefs = await getCustomerPreferences(ctx.user.id);
    }

    return prefs;
  }),

  /**
   * Update customer preferences
   */
  updatePreferences: protectedProcedure
    .input(preferencesSchema)
    .mutation(async ({ ctx, input }) => {
      return await updateCustomerPreferences(ctx.user.id, input);
    }),

  /**
   * Get miles balance
   */
  getMilesBalance: protectedProcedure.query(async ({ ctx }) => {
    const profile = await getCustomerProfile(ctx.user.id);
    if (!profile) {
      throw new Error("Profile not found");
    }

    return {
      totalMiles: profile.totalMiles || 0,
      availableMiles: profile.availableMiles || 0,
      redeemedMiles: profile.redeemedMiles || 0,
    };
  }),

  /**
   * Get miles history
   */
  getMilesHistory: protectedProcedure
    .input(z.object({ limit: z.number().default(50) }))
    .query(async ({ ctx, input }) => {
      return await getMilesHistory(ctx.user.id, input.limit);
    }),

  /**
   * Add miles (admin only for now)
   */
  addMiles: protectedProcedure
    .input(z.object({
      miles: z.number().positive(),
      reason: z.string(),
      bookingId: z.number().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      // In production, this should check if user is admin or system
      if (ctx.user.role !== "admin") {
        throw new Error("Unauthorized");
      }

      await addMiles(ctx.user.id, input.miles, input.reason, input.bookingId);
      return await getCustomerProfile(ctx.user.id);
    }),

  /**
   * Redeem miles
   */
  redeemMiles: protectedProcedure
    .input(z.object({
      miles: z.number().positive(),
      reason: z.string(),
      bookingId: z.number().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      await redeemMiles(ctx.user.id, input.miles, input.reason, input.bookingId);
      return await getCustomerProfile(ctx.user.id);
    }),

  /**
   * Get profile completeness
   */
  getProfileCompleteness: protectedProcedure.query(async ({ ctx }) => {
    const profile = await getCustomerProfile(ctx.user.id);
    if (!profile) {
      throw new Error("Profile not found");
    }

    return {
      completeness: profile.profileCompleteness || 0,
      isComplete: (profile.profileCompleteness || 0) >= 80,
    };
  }),
});
