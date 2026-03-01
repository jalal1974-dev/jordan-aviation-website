import { getDb } from "./db";
import {
  userLoyaltyPoints,
  loyaltyPointHistory,
  loyaltyTiers,
  InsertLoyaltyPointHistory,
} from "../drizzle/schema";
import { eq, and, gte, lte, desc } from "drizzle-orm";

/**
 * Get user's loyalty points and tier information
 */
export async function getUserLoyaltyStatus(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const userPoints = await db
    .select()
    .from(userLoyaltyPoints)
    .where(eq(userLoyaltyPoints.userId, userId))
    .limit(1);

  if (!userPoints.length) {
    return null;
  }

  const tier = await db
    .select()
    .from(loyaltyTiers)
    .where(eq(loyaltyTiers.id, userPoints[0].currentTierId))
    .limit(1);

  return {
    ...userPoints[0],
    tier: tier[0] || null,
  };
}

/**
 * Add loyalty points to a user
 */
export async function addLoyaltyPoints(
  userId: number,
  pointsToAdd: number,
  reason: string,
  bookingId?: number,
  description?: string
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Get current user loyalty points
  const currentStatus = await getUserLoyaltyStatus(userId);

  if (!currentStatus) {
    // Create new loyalty record if doesn't exist
    const defaultTier = await db
      .select()
      .from(loyaltyTiers)
      .where(eq(loyaltyTiers.name, "Bronze"))
      .limit(1);

    if (!defaultTier.length) {
      throw new Error("Default loyalty tier not found");
    }

    await db.insert(userLoyaltyPoints).values({
      userId,
      totalPoints: pointsToAdd,
      availablePoints: pointsToAdd,
      redeemedPoints: 0,
      currentTierId: defaultTier[0].id,
    });
  } else {
    // Update existing points
    const newTotalPoints = currentStatus.totalPoints + pointsToAdd;
    const newAvailablePoints = currentStatus.availablePoints + pointsToAdd;

    await db
      .update(userLoyaltyPoints)
      .set({
        totalPoints: newTotalPoints,
        availablePoints: newAvailablePoints,
      })
      .where(eq(userLoyaltyPoints.userId, userId));
  }

  // Record point history
  await db.insert(loyaltyPointHistory).values({
    userId,
    pointsChange: pointsToAdd,
    reason,
    bookingId,
    description,
  });

  return { success: true, pointsAdded: pointsToAdd };
}

/**
 * Redeem loyalty points
 */
export async function redeemLoyaltyPoints(
  userId: number,
  pointsToRedeem: number,
  reason: string,
  description?: string
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const currentStatus = await getUserLoyaltyStatus(userId);

  if (!currentStatus) {
    throw new Error("User has no loyalty points");
  }

  if (currentStatus.availablePoints < pointsToRedeem) {
    throw new Error("Insufficient points to redeem");
  }

  const newAvailablePoints = currentStatus.availablePoints - pointsToRedeem;
  const newRedeemedPoints = currentStatus.redeemedPoints + pointsToRedeem;

  await db
    .update(userLoyaltyPoints)
    .set({
      availablePoints: newAvailablePoints,
      redeemedPoints: newRedeemedPoints,
    })
    .where(eq(userLoyaltyPoints.userId, userId));

  // Record negative point history
  await db.insert(loyaltyPointHistory).values({
    userId,
    pointsChange: -pointsToRedeem,
    reason,
    description,
  });

  return { success: true, pointsRedeemed: pointsToRedeem };
}

/**
 * Get loyalty point history for a user
 */
export async function getLoyaltyPointHistory(userId: number, limit = 50) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return db
    .select()
    .from(loyaltyPointHistory)
    .where(eq(loyaltyPointHistory.userId, userId))
    .orderBy((table) => desc(table.createdAt))
    .limit(limit);
}

/**
 * Get all loyalty tiers
 */
export async function getLoyaltyTiers() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return db
    .select()
    .from(loyaltyTiers)
    .where(eq(loyaltyTiers.isActive, true))
    .orderBy((table) => table.minPoints);
}

/**
 * Calculate tier based on points
 */
export async function calculateUserTier(totalPoints: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const tiers = await db
    .select()
    .from(loyaltyTiers)
    .where(eq(loyaltyTiers.isActive, true))
    .orderBy((table) => table.minPoints);

  // Find the highest tier the user qualifies for
  let userTier = tiers[0];
  for (const tier of tiers) {
    if (totalPoints >= tier.minPoints) {
      userTier = tier;
    } else {
      break;
    }
  }

  return userTier;
}

/**
 * Update user tier based on points
 */
export async function updateUserTier(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const currentStatus = await getUserLoyaltyStatus(userId);

  if (!currentStatus) {
    return null;
  }

  const newTier = await calculateUserTier(currentStatus.totalPoints);

  if (newTier.id !== currentStatus.currentTierId) {
    await db
      .update(userLoyaltyPoints)
      .set({ currentTierId: newTier.id })
      .where(eq(userLoyaltyPoints.userId, userId));

    return newTier;
  }

  return currentStatus.tier;
}
