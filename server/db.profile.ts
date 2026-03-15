import { getDb } from "./db";
import { customerProfiles, customerPreferences, milesHistory, users } from "../drizzle/schema";
import { eq, desc } from "drizzle-orm";

/**
 * Create a new customer profile
 */
export async function createCustomerProfile(userId: number, data: {
  frequentFlyerNumber?: string;
  passportNumber?: string;
  passportCountry?: string;
  dateOfBirth?: Date;
  nationality?: string;
  gender?: "male" | "female" | "other";
  phoneNumber?: string;
  alternatePhone?: string;
  address?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(customerProfiles).values({
    userId,
    ...data,
  });
  return result;
}

/**
 * Get customer profile by user ID
 */
export async function getCustomerProfile(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const profiles = await db
    .select()
    .from(customerProfiles)
    .where(eq(customerProfiles.userId, userId))
    .limit(1);
  return profiles[0] || null;
}

/**
 * Update customer profile
 */
export async function updateCustomerProfile(userId: number, data: Partial<{
  frequentFlyerNumber?: string;
  passportNumber?: string;
  passportCountry?: string;
  dateOfBirth?: Date;
  nationality?: string;
  gender?: "male" | "female" | "other";
  phoneNumber?: string;
  alternatePhone?: string;
  address?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  totalMiles?: number;
  availableMiles?: number;
  redeemedMiles?: number;
  totalFlights?: number;
  totalSpent?: string;
  lastFlightDate?: Date;
  profileCompleteness?: number;
  isVerified?: boolean;
}>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.update(customerProfiles)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(eq(customerProfiles.userId, userId));
  return result;
}

/**
 * Create customer preferences
 */
export async function createCustomerPreferences(userId: number, data?: Partial<{
  emailNotifications?: boolean;
  smsNotifications?: boolean;
  pushNotifications?: boolean;
  marketingEmails?: boolean;
  loyaltyUpdates?: boolean;
  flightDeals?: boolean;
  preferredLanguage?: string;
  preferredCurrency?: string;
  seatPreference?: string;
  mealPreference?: string;
  specialRequests?: string;
}>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(customerPreferences).values({
    userId,
    ...data,
  });
  return result;
}

/**
 * Get customer preferences
 */
export async function getCustomerPreferences(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const prefs = await db
    .select()
    .from(customerPreferences)
    .where(eq(customerPreferences.userId, userId))
    .limit(1);
  return prefs[0] || null;
}

/**
 * Update customer preferences
 */
export async function updateCustomerPreferences(userId: number, data: Partial<{
  emailNotifications?: boolean;
  smsNotifications?: boolean;
  pushNotifications?: boolean;
  marketingEmails?: boolean;
  loyaltyUpdates?: boolean;
  flightDeals?: boolean;
  preferredLanguage?: string;
  preferredCurrency?: string;
  seatPreference?: string;
  mealPreference?: string;
  specialRequests?: string;
}>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.update(customerPreferences)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(eq(customerPreferences.userId, userId));
  return result;
}

/**
 * Add miles to customer account
 */
export async function addMiles(userId: number, miles: number, reason: string, bookingId?: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  // Add to miles history
  await db.insert(milesHistory).values({
    userId,
    milesChange: miles,
    reason,
    bookingId,
    description: `${miles} miles earned from ${reason}`,
  });

  // Update customer profile
  const profile = await getCustomerProfile(userId);
  if (profile) {
    const newAvailableMiles = (profile.availableMiles || 0) + miles;
    const newTotalMiles = (profile.totalMiles || 0) + miles;
    await updateCustomerProfile(userId, {
      availableMiles: newAvailableMiles,
      totalMiles: newTotalMiles,
    });
  }
}

/**
 * Redeem miles from customer account
 */
export async function redeemMiles(userId: number, miles: number, reason: string, bookingId?: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const profile = await getCustomerProfile(userId);
  if (!profile || profile.availableMiles < miles) {
    throw new Error("Insufficient miles to redeem");
  }

  // Add to miles history
  await db.insert(milesHistory).values({
    userId,
    milesChange: -miles,
    reason,
    bookingId,
    description: `${miles} miles redeemed for ${reason}`,
  });

  // Update customer profile
  const newAvailableMiles = (profile.availableMiles || 0) - miles;
  const newRedeemedMiles = (profile.redeemedMiles || 0) + miles;
  await updateCustomerProfile(userId, {
    availableMiles: newAvailableMiles,
    redeemedMiles: newRedeemedMiles,
  });
}

/**
 * Get miles history for a customer
 */
export async function getMilesHistory(userId: number, limit = 50) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const history = await db
    .select()
    .from(milesHistory)
    .where(eq(milesHistory.userId, userId))
    .orderBy(desc(milesHistory.createdAt))
    .limit(limit);
  return history;
}

/**
 * Calculate profile completeness percentage
 */
export function calculateProfileCompleteness(profile: any): number {
  const fields = [
    "frequentFlyerNumber",
    "passportNumber",
    "passportCountry",
    "dateOfBirth",
    "nationality",
    "gender",
    "phoneNumber",
    "address",
    "city",
    "state",
    "postalCode",
    "country",
  ];

  const filledFields = fields.filter((field) => profile[field]).length;
  return Math.round((filledFields / fields.length) * 100);
}

/**
 * Get customer profile with all related data
 */
export async function getFullCustomerProfile(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const profile = await getCustomerProfile(userId);
  const preferences = await getCustomerPreferences(userId);
  const milesHist = await getMilesHistory(userId, 10);
  const userList = await db
    .select()
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);
  const user = userList[0] || null;

  return {
    user,
    profile,
    preferences,
    recentMilesHistory: milesHist,
  };
}
