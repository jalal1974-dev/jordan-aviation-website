import { getDb } from "./db";
import {
  affiliates,
  affiliateReferrals,
  affiliatePayments,
  InsertAffiliate,
  InsertAffiliateReferral,
  InsertAffiliatePayment,
} from "../drizzle/schema";
import { eq, desc, and, gte, lte } from "drizzle-orm";

/**
 * Get affiliate by ID
 */
export async function getAffiliateById(affiliateId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return db
    .select()
    .from(affiliates)
    .where(eq(affiliates.id, affiliateId))
    .limit(1);
}

/**
 * Get affiliate by code
 */
export async function getAffiliateByCode(affiliateCode: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return db
    .select()
    .from(affiliates)
    .where(eq(affiliates.affiliateCode, affiliateCode))
    .limit(1);
}

/**
 * Get affiliate by user ID
 */
export async function getAffiliateByUserId(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return db
    .select()
    .from(affiliates)
    .where(eq(affiliates.userId, userId))
    .limit(1);
}

/**
 * Create new affiliate registration
 */
export async function createAffiliateRegistration(
  data: Omit<InsertAffiliate, "createdAt" | "updatedAt" | "totalEarnings" | "totalReferrals" | "totalConversions">
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(affiliates).values({
    ...data,
    totalEarnings: "0",
    totalReferrals: 0,
    totalConversions: 0,
  });

  return result;
}

/**
 * Update affiliate status
 */
export async function updateAffiliateStatus(
  affiliateId: number,
  status: "pending" | "approved" | "rejected" | "suspended"
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const updateData: any = { status };
  if (status === "approved") {
    updateData.approvedAt = new Date();
  }

  return db
    .update(affiliates)
    .set(updateData)
    .where(eq(affiliates.id, affiliateId));
}

/**
 * Create affiliate referral
 */
export async function createAffiliateReferral(
  data: Omit<InsertAffiliateReferral, "createdAt" | "updatedAt">
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return db.insert(affiliateReferrals).values({
    ...data,
    clickedAt: new Date(),
  });
}

/**
 * Update referral status
 */
export async function updateReferralStatus(
  referralId: number,
  status: "clicked" | "signed_up" | "booked" | "completed",
  bookingId?: number,
  commissionAmount?: string
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const updateData: any = { status };

  if (status === "signed_up") {
    updateData.convertedAt = new Date();
  } else if (status === "booked" || status === "completed") {
    updateData.convertedAt = new Date();
    if (bookingId) updateData.bookingId = bookingId;
    if (commissionAmount) {
      updateData.commissionAmount = commissionAmount;
      updateData.commissionStatus = "pending";
    }
  }

  return db
    .update(affiliateReferrals)
    .set(updateData)
    .where(eq(affiliateReferrals.id, referralId));
}

/**
 * Get affiliate referrals
 */
export async function getAffiliateReferrals(
  affiliateId: number,
  limit = 50,
  offset = 0
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return db
    .select()
    .from(affiliateReferrals)
    .where(eq(affiliateReferrals.affiliateId, affiliateId))
    .orderBy((table) => desc(table.createdAt))
    .limit(limit)
    .offset(offset);
}

/**
 * Get affiliate statistics
 */
export async function getAffiliateStats(affiliateId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const affiliate = await getAffiliateById(affiliateId);
  if (!affiliate.length) {
    throw new Error("Affiliate not found");
  }

  const referrals = await db
    .select()
    .from(affiliateReferrals)
    .where(eq(affiliateReferrals.affiliateId, affiliateId));

  const clicks = referrals.filter((r) => r.status === "clicked").length;
  const signups = referrals.filter((r) => r.status === "signed_up").length;
  const bookings = referrals.filter((r) => r.status === "booked").length;
  const completed = referrals.filter((r) => r.status === "completed").length;
  const pendingCommissions = referrals.filter(
    (r) => r.commissionStatus === "pending"
  ).length;

  return {
    affiliate: affiliate[0],
    clicks,
    signups,
    bookings,
    completed,
    totalReferrals: referrals.length,
    conversionRate: referrals.length > 0 ? (completed / clicks) * 100 : 0,
    pendingCommissions,
  };
}

/**
 * Create affiliate payment
 */
export async function createAffiliatePayment(
  data: Omit<InsertAffiliatePayment, "createdAt">
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return db.insert(affiliatePayments).values(data);
}

/**
 * Get affiliate payments
 */
export async function getAffiliatePayments(
  affiliateId: number,
  limit = 50,
  offset = 0
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return db
    .select()
    .from(affiliatePayments)
    .where(eq(affiliatePayments.affiliateId, affiliateId))
    .orderBy((table) => desc(table.createdAt))
    .limit(limit)
    .offset(offset);
}

/**
 * Update affiliate earnings
 */
export async function updateAffiliateEarnings(
  affiliateId: number,
  earningsToAdd: string
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const affiliate = await getAffiliateById(affiliateId);
  if (!affiliate.length) {
    throw new Error("Affiliate not found");
  }

  const currentEarnings = parseFloat(affiliate[0].totalEarnings.toString());
  const newEarnings = currentEarnings + parseFloat(earningsToAdd);

  return db
    .update(affiliates)
    .set({
      totalEarnings: newEarnings.toString(),
    })
    .where(eq(affiliates.id, affiliateId));
}

/**
 * Update affiliate referral count
 */
export async function updateAffiliateReferralCount(affiliateId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const referrals = await db
    .select()
    .from(affiliateReferrals)
    .where(eq(affiliateReferrals.affiliateId, affiliateId));

  const conversions = referrals.filter(
    (r) => r.status === "completed"
  ).length;

  return db
    .update(affiliates)
    .set({
      totalReferrals: referrals.length,
      totalConversions: conversions,
    })
    .where(eq(affiliates.id, affiliateId));
}
