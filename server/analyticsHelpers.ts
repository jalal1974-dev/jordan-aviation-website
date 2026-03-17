import { userDocuments } from "../drizzle/schema";
import { sql, desc, and, gte, lte } from "drizzle-orm";
import { getDb } from "./db";

/**
 * Analytics Helpers for Document Verification
 * Provides statistical data for admin analytics dashboard
 */

export interface VerificationTrendData {
  date: string;
  verified: number;
  rejected: number;
  pending: number;
}

export interface DocumentTypeStats {
  type: string;
  total: number;
  verified: number;
  rejected: number;
  pending: number;
  verificationRate: number;
  avgProcessingTime: number;
}

export interface VerificationMetrics {
  totalDocuments: number;
  verifiedCount: number;
  rejectedCount: number;
  pendingCount: number;
  overallVerificationRate: number;
  avgProcessingTimeHours: number;
  topRejectionReasons: Array<{ reason: string; count: number }>;
  documentTypeStats: DocumentTypeStats[];
  verificationTrend: VerificationTrendData[];
}

/**
 * Get verification trends for the past 30 days
 */
export async function getVerificationTrends(
  days: number = 30
): Promise<VerificationTrendData[]> {
  const database = await getDb();
  if (!database) throw new Error("Database not available");

  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  try {
    const trends = await database
      .select({
        date: sql<string>`DATE(${userDocuments.createdAt})`,
        verified: sql<number>`COUNT(CASE WHEN ${userDocuments.verificationStatus} = 'verified' THEN 1 END)`,
        rejected: sql<number>`COUNT(CASE WHEN ${userDocuments.verificationStatus} = 'rejected' THEN 1 END)`,
        pending: sql<number>`COUNT(CASE WHEN ${userDocuments.verificationStatus} = 'pending' THEN 1 END)`,
      })
      .from(userDocuments)
      .where(gte(userDocuments.createdAt, startDate))
      .groupBy(sql`DATE(${userDocuments.createdAt})`)
      .orderBy(sql`DATE(${userDocuments.createdAt})`);

    return trends.map((t: any) => ({
      date: t.date,
      verified: Number(t.verified) || 0,
      rejected: Number(t.rejected) || 0,
      pending: Number(t.pending) || 0,
    }));
  } catch (error) {
    console.error("Error fetching verification trends:", error);
    return [];
  }
}

/**
 * Get statistics by document type
 */
export async function getDocumentTypeStatistics(): Promise<DocumentTypeStats[]> {
  const database = await getDb();
  if (!database) throw new Error("Database not available");

  try {
    const stats = await database
      .select({
        type: userDocuments.documentType,
        total: sql<number>`COUNT(*)`,
        verified: sql<number>`COUNT(CASE WHEN ${userDocuments.verificationStatus} = 'verified' THEN 1 END)`,
        rejected: sql<number>`COUNT(CASE WHEN ${userDocuments.verificationStatus} = 'rejected' THEN 1 END)`,
        pending: sql<number>`COUNT(CASE WHEN ${userDocuments.verificationStatus} = 'pending' THEN 1 END)`,
        avgProcessingTime: sql<number>`AVG(CASE WHEN ${userDocuments.verificationDate} IS NOT NULL THEN TIMESTAMPDIFF(HOUR, ${userDocuments.createdAt}, ${userDocuments.verificationDate}) ELSE NULL END)`,
      })
      .from(userDocuments)
      .groupBy(userDocuments.documentType);

    return stats.map((s: any) => ({
      type: s.type,
      total: Number(s.total) || 0,
      verified: Number(s.verified) || 0,
      rejected: Number(s.rejected) || 0,
      pending: Number(s.pending) || 0,
      verificationRate:
        Number(s.total) > 0
          ? ((Number(s.verified) / Number(s.total)) * 100).toFixed(2) as any
          : 0,
      avgProcessingTime: Number(s.avgProcessingTime) || 0,
    }));
  } catch (error) {
    console.error("Error fetching document type statistics:", error);
    return [];
  }
}

/**
 * Get top rejection reasons
 */
export async function getTopRejectionReasons(
  limit: number = 10
): Promise<Array<{ reason: string; count: number }>> {
  const database = await getDb();
  if (!database) throw new Error("Database not available");

  try {
    const reasons = await database
      .select({
        reason: userDocuments.rejectionReason,
        count: sql<number>`COUNT(*)`,
      })
      .from(userDocuments)
      .where(
        and(
          sql`${userDocuments.rejectionReason} IS NOT NULL`,
          sql`${userDocuments.rejectionReason} != ''`
        )
      )
      .groupBy(userDocuments.rejectionReason)
      .orderBy(desc(sql`COUNT(*)`))
      .limit(limit);

    return reasons
      .filter((r: any) => r.reason)
      .map((r: any) => ({
        reason: r.reason || "Unknown",
        count: Number(r.count) || 0,
      }));
  } catch (error) {
    console.error("Error fetching rejection reasons:", error);
    return [];
  }
}

/**
 * Get average processing time in hours
 */
export async function getAverageProcessingTime(): Promise<number> {
  const database = await getDb();
  if (!database) throw new Error("Database not available");

  try {
    const result = await database
      .select({
        avgHours: sql<number>`AVG(TIMESTAMPDIFF(HOUR, ${userDocuments.createdAt}, ${userDocuments.verificationDate}))`,
      })
      .from(userDocuments)
      .where(sql`${userDocuments.verificationDate} IS NOT NULL`);

    return Number(result[0]?.avgHours) || 0;
  } catch (error) {
    console.error("Error fetching average processing time:", error);
    return 0;
  }
}

/**
 * Get comprehensive verification metrics
 */
export async function getComprehensiveVerificationMetrics(): Promise<VerificationMetrics> {
  const database = await getDb();
  if (!database) throw new Error("Database not available");

  try {
    // Get overall counts
    const overallStats = await database
      .select({
        total: sql<number>`COUNT(*)`,
        verified: sql<number>`COUNT(CASE WHEN ${userDocuments.verificationStatus} = 'verified' THEN 1 END)`,
        rejected: sql<number>`COUNT(CASE WHEN ${userDocuments.verificationStatus} = 'rejected' THEN 1 END)`,
        pending: sql<number>`COUNT(CASE WHEN ${userDocuments.verificationStatus} = 'pending' THEN 1 END)`,
      })
      .from(userDocuments);

    const stats = overallStats[0];
    const totalDocuments = Number(stats.total) || 0;
    const verifiedCount = Number(stats.verified) || 0;
    const rejectedCount = Number(stats.rejected) || 0;
    const pendingCount = Number(stats.pending) || 0;

    // Get other metrics in parallel
    const [
      typeStats,
      topReasons,
      avgProcessingTime,
      trends,
    ] = await Promise.all([
      getDocumentTypeStatistics(),
      getTopRejectionReasons(5),
      getAverageProcessingTime(),
      getVerificationTrends(30),
    ]);

    return {
      totalDocuments,
      verifiedCount,
      rejectedCount,
      pendingCount,
      overallVerificationRate:
        totalDocuments > 0
          ? ((verifiedCount / totalDocuments) * 100).toFixed(2) as any
          : 0,
      avgProcessingTimeHours: avgProcessingTime,
      topRejectionReasons: topReasons,
      documentTypeStats: typeStats,
      verificationTrend: trends,
    };
  } catch (error) {
    console.error("Error fetching comprehensive metrics:", error);
    return {
      totalDocuments: 0,
      verifiedCount: 0,
      rejectedCount: 0,
      pendingCount: 0,
      overallVerificationRate: 0,
      avgProcessingTimeHours: 0,
      topRejectionReasons: [],
      documentTypeStats: [],
      verificationTrend: [],
    };
  }
}

/**
 * Get verification metrics for a specific date range
 */
export async function getVerificationMetricsForDateRange(
  startDate: Date,
  endDate: Date
): Promise<VerificationMetrics> {
  const database = await getDb();
  if (!database) throw new Error("Database not available");

  try {
    const overallStats = await database
      .select({
        total: sql<number>`COUNT(*)`,
        verified: sql<number>`COUNT(CASE WHEN ${userDocuments.verificationStatus} = 'verified' THEN 1 END)`,
        rejected: sql<number>`COUNT(CASE WHEN ${userDocuments.verificationStatus} = 'rejected' THEN 1 END)`,
        pending: sql<number>`COUNT(CASE WHEN ${userDocuments.verificationStatus} = 'pending' THEN 1 END)`,
      })
      .from(userDocuments)
      .where(
        and(
          gte(userDocuments.createdAt, startDate),
          lte(userDocuments.createdAt, endDate)
        )
      );

    const stats = overallStats[0];
    const totalDocuments = Number(stats.total) || 0;
    const verifiedCount = Number(stats.verified) || 0;
    const rejectedCount = Number(stats.rejected) || 0;
    const pendingCount = Number(stats.pending) || 0;

    return {
      totalDocuments,
      verifiedCount,
      rejectedCount,
      pendingCount,
      overallVerificationRate:
        totalDocuments > 0
          ? ((verifiedCount / totalDocuments) * 100).toFixed(2) as any
          : 0,
      avgProcessingTimeHours: 0,
      topRejectionReasons: [],
      documentTypeStats: [],
      verificationTrend: [],
    };
  } catch (error) {
    console.error("Error fetching metrics for date range:", error);
    return {
      totalDocuments: 0,
      verifiedCount: 0,
      rejectedCount: 0,
      pendingCount: 0,
      overallVerificationRate: 0,
      avgProcessingTimeHours: 0,
      topRejectionReasons: [],
      documentTypeStats: [],
      verificationTrend: [],
    };
  }
}
