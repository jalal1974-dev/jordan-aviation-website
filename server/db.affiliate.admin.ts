import { getDb } from "./db";
import { eq, desc, and } from "drizzle-orm";
import {
  affiliates,
  affiliateReferrals,
  affiliatePayments,
  InsertAffiliatePayment,
} from "../drizzle/schema";

/**
 * Get all affiliates with optional filters
 */
export async function getAllAffiliates(status?: string, limit = 100, offset = 0) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  let query = db.select().from(affiliates);

  if (status) {
    const filtered = await query.where(eq(affiliates.status, status as any));
    return filtered
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(offset, offset + limit);
  }

  const all = await query;
  return all
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(offset, offset + limit);
}

/**
 * Get affiliate by ID
 */
export async function getAffiliateByIdAdmin(affiliateId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return db
    .select()
    .from(affiliates)
    .where(eq(affiliates.id, affiliateId))
    .limit(1);
}

/**
 * Update affiliate status
 */
export async function updateAffiliateStatusAdmin(
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
 * Update affiliate commission rate
 */
export async function updateAffiliateCommissionRate(
  affiliateId: number,
  commissionRate: string
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return db
    .update(affiliates)
    .set({ commissionRate })
    .where(eq(affiliates.id, affiliateId));
}

/**
 * Get all affiliate referrals for admin
 */
export async function getAllAffiliateReferralsAdmin(
  affiliateId?: number,
  status?: string,
  limit = 100,
  offset = 0
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  let query = db.select().from(affiliateReferrals);

  if (affiliateId) {
    const filtered = await query.where(eq(affiliateReferrals.affiliateId, affiliateId));
    if (status) {
      return filtered
        .filter((r) => r.status === status)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(offset, offset + limit);
    }
    return filtered
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(offset, offset + limit);
  }

  const all = await query;
  if (status) {
    return all
      .filter((r) => r.status === status)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(offset, offset + limit);
  }

  return all
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(offset, offset + limit);
}

/**
 * Update referral commission status
 */
export async function updateReferralCommissionStatus(
  referralId: number,
  commissionStatus: "pending" | "approved" | "paid"
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return db
    .update(affiliateReferrals)
    .set({ commissionStatus })
    .where(eq(affiliateReferrals.id, referralId));
}

/**
 * Create affiliate payment
 */
export async function createAffiliatePaymentAdmin(
  data: Omit<InsertAffiliatePayment, "createdAt">
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return db.insert(affiliatePayments).values(data);
}

/**
 * Get affiliate payments for admin
 */
export async function getAffiliatePaymentsAdmin(
  affiliateId?: number,
  status?: string,
  limit = 100,
  offset = 0
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  let query = db.select().from(affiliatePayments);

  if (affiliateId) {
    const filtered = await query.where(eq(affiliatePayments.affiliateId, affiliateId));
    if (status) {
      return filtered
        .filter((p) => p.status === status)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(offset, offset + limit);
    }
    return filtered
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(offset, offset + limit);
  }

  const all = await query;
  if (status) {
    return all
      .filter((p) => p.status === status)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(offset, offset + limit);
  }

  return all
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(offset, offset + limit);
}

/**
 * Get affiliate program statistics
 */
export async function getAffiliateProgramStats() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const allAffiliates = await db.select().from(affiliates);
  const allReferrals = await db.select().from(affiliateReferrals);
  const allPayments = await db.select().from(affiliatePayments);

  const approvedAffiliates = allAffiliates.filter((a) => a.status === "approved").length;
  const pendingAffiliates = allAffiliates.filter((a) => a.status === "pending").length;
  const totalReferrals = allReferrals.length;
  const completedReferrals = allReferrals.filter((r) => r.status === "completed").length;
  const totalEarnings = allAffiliates.reduce(
    (sum, a) => sum + parseFloat(a.totalEarnings.toString()),
    0
  );
  const totalPaid = allPayments
    .filter((p) => p.status === "completed")
    .reduce((sum, p) => sum + parseFloat(p.amount.toString()), 0);

  return {
    totalAffiliates: allAffiliates.length,
    approvedAffiliates,
    pendingAffiliates,
    suspendedAffiliates: allAffiliates.filter((a) => a.status === "suspended").length,
    totalReferrals,
    completedReferrals,
    conversionRate: totalReferrals > 0 ? ((completedReferrals / totalReferrals) * 100).toFixed(2) : "0",
    totalEarnings: totalEarnings.toFixed(2),
    totalPaid: totalPaid.toFixed(2),
    pendingPayments: allPayments
      .filter((p) => p.status === "pending")
      .reduce((sum, p) => sum + parseFloat(p.amount.toString()), 0)
      .toFixed(2),
  };
}

/**
 * Get top performing affiliates
 */
export async function getTopPerformingAffiliates(limit = 10) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const allAffiliates = await db.select().from(affiliates);
  return allAffiliates
    .sort((a, b) => parseFloat(b.totalEarnings.toString()) - parseFloat(a.totalEarnings.toString()))
    .slice(0, limit);
}

/**
 * Get affiliate referral breakdown by status
 */
export async function getAffiliateReferralBreakdown(affiliateId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const referrals = await db
    .select()
    .from(affiliateReferrals)
    .where(eq(affiliateReferrals.affiliateId, affiliateId));

  return {
    total: referrals.length,
    clicked: referrals.filter((r) => r.status === "clicked").length,
    signedUp: referrals.filter((r) => r.status === "signed_up").length,
    booked: referrals.filter((r) => r.status === "booked").length,
    completed: referrals.filter((r) => r.status === "completed").length,
  };
}

/**
 * Bulk update referral commission status
 */
export async function bulkUpdateReferralCommissionStatus(
  referralIds: number[],
  commissionStatus: "pending" | "approved" | "paid"
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const updates = referralIds.map((id) =>
    db
      .update(affiliateReferrals)
      .set({ commissionStatus })
      .where(eq(affiliateReferrals.id, id))
  );

  return Promise.all(updates);
}

/**
 * Suspend affiliate
 */
export async function suspendAffiliate(affiliateId: number, reason: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return db
    .update(affiliates)
    .set({
      status: "suspended",
    })
    .where(eq(affiliates.id, affiliateId));
}

/**
 * Reactivate affiliate
 */
export async function reactivateAffiliate(affiliateId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return db
    .update(affiliates)
    .set({
      status: "approved",
    })
    .where(eq(affiliates.id, affiliateId));
}
