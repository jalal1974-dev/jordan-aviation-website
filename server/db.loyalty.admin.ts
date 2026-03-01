import { getDb } from "./db";
import { eq, desc } from "drizzle-orm";
import {
  loyaltyTiers,
  userLoyaltyPoints,
  loyaltyPointHistory,
  InsertLoyaltyTier,
} from "../drizzle/schema";

/**
 * Create new loyalty tier
 */
export async function createLoyaltyTier(data: Omit<InsertLoyaltyTier, "createdAt" | "updatedAt">) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return db.insert(loyaltyTiers).values(data);
}

/**
 * Update loyalty tier
 */
export async function updateLoyaltyTier(
  tierId: number,
  data: Partial<Omit<InsertLoyaltyTier, "id" | "createdAt" | "updatedAt">>
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return db
    .update(loyaltyTiers)
    .set(data)
    .where(eq(loyaltyTiers.id, tierId));
}

/**
 * Delete loyalty tier
 */
export async function deleteLoyaltyTier(tierId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return db
    .delete(loyaltyTiers)
    .where(eq(loyaltyTiers.id, tierId));
}

/**
 * Get all loyalty tiers including inactive
 */
export async function getAllLoyaltyTiers() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return db
    .select()
    .from(loyaltyTiers)
    .orderBy((table) => table.minPoints);
}

/**
 * Get loyalty tier by ID
 */
export async function getLoyaltyTierById(tierId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return db
    .select()
    .from(loyaltyTiers)
    .where(eq(loyaltyTiers.id, tierId))
    .limit(1);
}

/**
 * Adjust user loyalty points (admin override)
 */
export async function adjustUserLoyaltyPoints(
  userId: number,
  pointsAdjustment: number,
  reason: string,
  description?: string
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const userPoints = await db
    .select()
    .from(userLoyaltyPoints)
    .where(eq(userLoyaltyPoints.userId, userId))
    .limit(1);

  if (!userPoints.length) {
    throw new Error("User loyalty record not found");
  }

  const newTotalPoints = userPoints[0].totalPoints + pointsAdjustment;
  const newAvailablePoints = Math.max(0, userPoints[0].availablePoints + pointsAdjustment);

  await db
    .update(userLoyaltyPoints)
    .set({
      totalPoints: newTotalPoints,
      availablePoints: newAvailablePoints,
    })
    .where(eq(userLoyaltyPoints.userId, userId));

  // Record adjustment in history
  await db.insert(loyaltyPointHistory).values({
    userId,
    pointsChange: pointsAdjustment,
    reason,
    description: description || "Admin adjustment",
  });

  return { success: true, newTotalPoints, newAvailablePoints };
}

/**
 * Get all users with loyalty points
 */
export async function getAllUsersWithLoyaltyPoints(limit = 100, offset = 0) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return db
    .select()
    .from(userLoyaltyPoints)
    .orderBy((table) => desc(table.totalPoints))
    .limit(limit)
    .offset(offset);
}

/**
 * Get loyalty program statistics
 */
export async function getLoyaltyProgramStats() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const allUsers = await db.select().from(userLoyaltyPoints);
  const allHistory = await db.select().from(loyaltyPointHistory);

  const totalPointsIssued = allHistory
    .filter((h) => h.pointsChange > 0)
    .reduce((sum, h) => sum + h.pointsChange, 0);

  const totalPointsRedeemed = allHistory
    .filter((h) => h.pointsChange < 0)
    .reduce((sum, h) => sum + Math.abs(h.pointsChange), 0);

  const activeMembers = allUsers.filter((u) => u.totalPoints > 0).length;
  const averagePointsPerUser = allUsers.length > 0
    ? Math.round(allUsers.reduce((sum, u) => sum + u.totalPoints, 0) / allUsers.length)
    : 0;

  return {
    totalMembers: allUsers.length,
    activeMembers,
    totalPointsIssued,
    totalPointsRedeemed,
    averagePointsPerUser,
    totalPointsInCirculation: allUsers.reduce((sum, u) => sum + u.availablePoints, 0),
  };
}

/**
 * Get loyalty tier distribution
 */
export async function getLoyaltyTierDistribution() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const tiers = await getAllLoyaltyTiers();
  const users = await getAllUsersWithLoyaltyPoints(10000, 0);

  const distribution = tiers.map((tier) => {
    const nextTier = tiers.find((t) => t.minPoints > tier.minPoints);
    const usersInTier = users.filter(
      (u) => u.totalPoints >= tier.minPoints &&
             (!nextTier || u.totalPoints < nextTier.minPoints)
    ).length;

    return {
      tierId: tier.id,
      tierName: tier.name,
      minPoints: tier.minPoints,
      userCount: usersInTier,
      percentage: users.length > 0 ? ((usersInTier / users.length) * 100).toFixed(2) : "0",
    };
  });

  return distribution;
}

/**
 * Reset user loyalty points (careful operation)
 */
export async function resetUserLoyaltyPoints(userId: number, reason: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const userPoints = await db
    .select()
    .from(userLoyaltyPoints)
    .where(eq(userLoyaltyPoints.userId, userId))
    .limit(1);

  if (!userPoints.length) {
    throw new Error("User loyalty record not found");
  }

  const pointsToRemove = userPoints[0].availablePoints;

  await db
    .update(userLoyaltyPoints)
    .set({
      availablePoints: 0,
      totalPoints: 0,
      redeemedPoints: 0,
    })
    .where(eq(userLoyaltyPoints.userId, userId));

  // Record reset in history
  await db.insert(loyaltyPointHistory).values({
    userId,
    pointsChange: -pointsToRemove,
    reason,
    description: "Admin reset",
  });

  return { success: true };
}

/**
 * Get point history for admin review
 */
export async function getPointHistoryForAdmin(userId?: number, limit = 100, offset = 0) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  let baseQuery = db.select().from(loyaltyPointHistory);

  if (userId) {
    const filtered = await baseQuery.where(eq(loyaltyPointHistory.userId, userId));
    return filtered
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(offset, offset + limit);
  }

  const all = await baseQuery;
  return all
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(offset, offset + limit);
}
