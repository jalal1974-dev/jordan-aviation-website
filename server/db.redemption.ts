import { eq, and, gte, lte, desc, sql } from "drizzle-orm";
import { redemptionOptions, redemptionHistory, userLoyaltyPoints, milesHistory } from "../drizzle/schema";
import { getDb } from "./db";

/**
 * Get all active redemption options with filters
 */
export async function getAvailableRedemptionOptions(filters?: {
  type?: string;
  category?: string;
  maxMilesRequired?: number;
}) {
  const db = await getDb();
  if (!db) return [];

  const conditions = [eq(redemptionOptions.isActive, true)];

  if (filters?.type) {
    conditions.push(eq(redemptionOptions.type, filters.type as any));
  }

  if (filters?.category) {
    conditions.push(eq(redemptionOptions.category, filters.category));
  }

  if (filters?.maxMilesRequired) {
    conditions.push(lte(redemptionOptions.milesRequired, filters.maxMilesRequired));
  }

  // Check expiry
  conditions.push(
    sql`(${redemptionOptions.validUntil} IS NULL OR ${redemptionOptions.validUntil} > NOW())`
  );

  const options = await db
    .select()
    .from(redemptionOptions)
    .where(and(...conditions))
    .orderBy(redemptionOptions.sortOrder);

  return options;
}

/**
 * Get single redemption option by ID
 */
export async function getRedemptionOption(id: number) {
  const db = await getDb();
  if (!db) return null;

  const option = await db
    .select()
    .from(redemptionOptions)
    .where(eq(redemptionOptions.id, id))
    .limit(1);

  return option.length > 0 ? option[0] : null;
}

/**
 * Create a new redemption record
 */
export async function createRedemption(data: {
  userId: number;
  redemptionOptionId: number;
  bookingId?: number;
  milesSpent: number;
}) {
  const db = await getDb();
  if (!db) return null;

  // Generate confirmation code
  const confirmationCode = `RDM-${Date.now()}-${Math.random().toString(36).substring(7).toUpperCase()}`;

  await db.insert(redemptionHistory).values({
    userId: data.userId,
    redemptionOptionId: data.redemptionOptionId,
    bookingId: data.bookingId,
    milesSpent: data.milesSpent,
    confirmationCode,
    status: "pending",
  });

  return {
    confirmationCode,
  };
}

/**
 * Get user's redemption history
 */
export async function getUserRedemptionHistory(userId: number, limit = 20, offset = 0) {
  const db = await getDb();
  if (!db) return [];

  const history = await db
    .select({
      id: redemptionHistory.id,
      redemptionOptionId: redemptionHistory.redemptionOptionId,
      milesSpent: redemptionHistory.milesSpent,
      status: redemptionHistory.status,
      confirmationCode: redemptionHistory.confirmationCode,
      appliedDate: redemptionHistory.appliedDate,
      expiryDate: redemptionHistory.expiryDate,
      createdAt: redemptionHistory.createdAt,
      optionName: redemptionOptions.name,
      optionType: redemptionOptions.type,
    })
    .from(redemptionHistory)
    .leftJoin(
      redemptionOptions,
      eq(redemptionHistory.redemptionOptionId, redemptionOptions.id)
    )
    .where(eq(redemptionHistory.userId, userId))
    .orderBy(desc(redemptionHistory.createdAt))
    .limit(limit)
    .offset(offset);

  return history;
}

/**
 * Get redemption statistics for a user
 */
export async function getUserRedemptionStats(userId: number) {
  const db = await getDb();
  if (!db) {
    return {
      totalRedemptions: 0,
      totalMilesRedeemed: 0,
      pendingRedemptions: 0,
      appliedRedemptions: 0,
    };
  }

  const stats = await db
    .select({
      totalRedemptions: sql<number>`COUNT(*)`,
      totalMilesRedeemed: sql<number>`COALESCE(SUM(milesSpent), 0)`,
      pendingRedemptions: sql<number>`SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END)`,
      appliedRedemptions: sql<number>`SUM(CASE WHEN status = 'applied' THEN 1 ELSE 0 END)`,
    })
    .from(redemptionHistory)
    .where(eq(redemptionHistory.userId, userId));

  return stats[0] || {
    totalRedemptions: 0,
    totalMilesRedeemed: 0,
    pendingRedemptions: 0,
    appliedRedemptions: 0,
  };
}

/**
 * Update redemption status
 */
export async function updateRedemptionStatus(
  redemptionId: number,
  status: "pending" | "approved" | "applied" | "cancelled" | "expired",
  appliedDate?: Date
) {
  const db = await getDb();
  if (!db) return null;

  const updateData: any = { status };
  if (appliedDate) {
    updateData.appliedDate = appliedDate;
  }

  const result = await db
    .update(redemptionHistory)
    .set(updateData)
    .where(eq(redemptionHistory.id, redemptionId));

  return result;
}

/**
 * Deduct miles from user account when redemption is applied
 */
export async function deductMilesForRedemption(
  userId: number,
  milesAmount: number,
  redemptionId: number,
  reason: string
) {
  const db = await getDb();
  if (!db) return null;

  // Get current miles balance
  const loyaltyPoints = await db
    .select()
    .from(userLoyaltyPoints)
    .where(eq(userLoyaltyPoints.userId, userId))
    .limit(1);

  if (loyaltyPoints.length === 0) {
    return null;
  }

  const currentMiles = loyaltyPoints[0].availablePoints;

  if (currentMiles < milesAmount) {
    throw new Error("Insufficient miles balance");
  }

  // Update miles balance (using availablePoints field for miles)
  await db
    .update(userLoyaltyPoints)
    .set({
      availablePoints: currentMiles - milesAmount,
      redeemedPoints: (loyaltyPoints[0].redeemedPoints || 0) + milesAmount,
    })
    .where(eq(userLoyaltyPoints.userId, userId));

  // Record in miles history
  await db.insert(milesHistory).values({
    userId,
    milesChange: -milesAmount,
    reason: `Redemption: ${reason}`,
    referenceId: redemptionId.toString(),
  });

  return {
    previousBalance: loyaltyPoints[0].availablePoints,
    newBalance: loyaltyPoints[0].availablePoints - milesAmount,
    milesSpent: milesAmount,
  };
}

/**
 * Check if user can redeem a specific option
 */
export async function canUserRedeem(userId: number, redemptionOptionId: number) {
  const db = await getDb();
  if (!db) return { canRedeem: false, reason: "Database error" };

  // Get redemption option
  const option = await getRedemptionOption(redemptionOptionId);
  if (!option) {
    return { canRedeem: false, reason: "Redemption option not found" };
  }

  if (!option.isActive) {
    return { canRedeem: false, reason: "This redemption option is no longer available" };
  }

  // Check availability
  if (option.totalRedemptionsAvailable && option.currentRedemptions >= option.totalRedemptionsAvailable) {
    return { canRedeem: false, reason: "This redemption option is sold out" };
  }

  // Check user's miles balance
  const loyaltyPoints = await db
    .select()
    .from(userLoyaltyPoints)
    .where(eq(userLoyaltyPoints.userId, userId))
    .limit(1);

  if (loyaltyPoints.length === 0 || loyaltyPoints[0].availablePoints < option.milesRequired) {
    return { canRedeem: false, reason: "Insufficient miles balance" };
  }

  // Check user redemption limit
  if (option.maxRedemptionsPerUser) {
    const userRedemptions = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(redemptionHistory)
      .where(
        and(
          eq(redemptionHistory.userId, userId),
          eq(redemptionHistory.redemptionOptionId, redemptionOptionId),
          sql`status IN ('applied', 'approved')`
        )
      );

    if (userRedemptions[0]?.count >= option.maxRedemptionsPerUser) {
      return {
        canRedeem: false,
        reason: `You have reached the maximum redemptions for this option (${option.maxRedemptionsPerUser})`,
      };
    }
  }

  return { canRedeem: true };
}

/**
 * Get redemption option details with availability
 */
export async function getRedemptionOptionWithAvailability(id: number) {
  const db = await getDb();
  if (!db) return null;

  const option = await getRedemptionOption(id);
  if (!option) return null;

  const availableSlots =
    option.totalRedemptionsAvailable === null
      ? null
      : Math.max(0, option.totalRedemptionsAvailable - (option.currentRedemptions || 0));

  return {
    ...option,
    availableSlots,
    isSoldOut:
      option.totalRedemptionsAvailable !== null &&
      option.currentRedemptions >= option.totalRedemptionsAvailable,
  };
}
