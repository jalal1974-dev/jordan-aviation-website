import { getDb } from "./db";
import { userDocuments, users } from "../drizzle/schema";
import { eq, and, gte, lte } from "drizzle-orm";

/**
 * Performance Metrics Service
 * Tracks and calculates verifier performance metrics for leaderboard
 */

export interface VerifierMetrics {
  verifierId: number;
  verifierName: string;
  verifierEmail: string;
  documentsVerified: number;
  documentsRejected: number;
  totalDocumentsProcessed: number;
  averageProcessingTimeHours: number;
  verificationAccuracyRate: number;
  rejectionRate: number;
  avgTimePerDocument: number;
  performanceScore: number;
  rank: number;
}

export interface LeaderboardEntry {
  rank: number;
  verifierId: number;
  verifierName: string;
  documentsProcessed: number;
  averageProcessingTime: number;
  accuracyRate: number;
  performanceScore: number;
  trend: "up" | "down" | "stable";
  trendPercentage: number;
}

/**
 * Get metrics for a single verifier
 */
export async function getVerifierMetrics(
  verifierId: number,
  startDate?: Date,
  endDate?: Date
): Promise<VerifierMetrics | null> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  try {
    const verifier = await db
      .select()
      .from(users)
      .where(eq(users.id, verifierId))
      .then((rows) => rows[0]);

    if (!verifier) return null;

    const start = startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // Last 30 days
    const end = endDate || new Date();

    // Get all documents processed by this verifier
    const verifiedDocs = await db
      .select()
      .from(userDocuments)
      .where(
        and(
          eq(userDocuments.verifiedBy, verifierId),
          eq(userDocuments.verificationStatus, "verified"),
          gte(userDocuments.updatedAt, start),
          lte(userDocuments.updatedAt, end)
        )
      );

    const rejectedDocs = await db
      .select()
      .from(userDocuments)
      .where(
        and(
          eq(userDocuments.verifiedBy, verifierId),
          eq(userDocuments.verificationStatus, "rejected"),
          gte(userDocuments.updatedAt, start),
          lte(userDocuments.updatedAt, end)
        )
      );

    const totalProcessed = verifiedDocs.length + rejectedDocs.length;

    // Calculate average processing time
    let totalProcessingTime = 0;
    verifiedDocs.forEach((doc) => {
      if (doc.createdAt && doc.updatedAt) {
        const processingTime = doc.updatedAt.getTime() - doc.createdAt.getTime();
        totalProcessingTime += processingTime;
      }
    });

    rejectedDocs.forEach((doc) => {
      if (doc.createdAt && doc.updatedAt) {
        const processingTime = doc.updatedAt.getTime() - doc.createdAt.getTime();
        totalProcessingTime += processingTime;
      }
    });

    const avgProcessingTimeHours =
      totalProcessed > 0 ? totalProcessingTime / (totalProcessed * 60 * 60 * 1000) : 0;
    const avgTimePerDocument = totalProcessed > 0 ? avgProcessingTimeHours / totalProcessed : 0;

    // Calculate accuracy rate (assuming verified = accurate, rejected = inaccurate for this metric)
    const verificationAccuracyRate =
      totalProcessed > 0 ? (verifiedDocs.length / totalProcessed) * 100 : 0;
    const rejectionRate = totalProcessed > 0 ? (rejectedDocs.length / totalProcessed) * 100 : 0;

    // Calculate performance score (0-100)
    // Based on: volume (40%), speed (30%), accuracy (30%)
    const volumeScore = Math.min((totalProcessed / 100) * 100, 100); // Max 100 docs/period
    const speedScore = Math.max(100 - avgProcessingTimeHours, 0); // Faster is better
    const accuracyScore = verificationAccuracyRate;

    const performanceScore = (volumeScore * 0.4 + speedScore * 0.3 + accuracyScore * 0.3) / 100;

    return {
      verifierId,
      verifierName: verifier.name || "Unknown",
      verifierEmail: verifier.email || "",
      documentsVerified: verifiedDocs.length,
      documentsRejected: rejectedDocs.length,
      totalDocumentsProcessed: totalProcessed,
      averageProcessingTimeHours: Math.round(avgProcessingTimeHours * 100) / 100,
      verificationAccuracyRate: Math.round(verificationAccuracyRate * 100) / 100,
      rejectionRate: Math.round(rejectionRate * 100) / 100,
      avgTimePerDocument: Math.round(avgTimePerDocument * 100) / 100,
      performanceScore: Math.round(performanceScore * 100) / 100,
      rank: 0, // Will be set when calculating leaderboard
    };
  } catch (error) {
    console.error("Error getting verifier metrics:", error);
    return null;
  }
}

/**
 * Get performance leaderboard for all verifiers
 */
export async function getPerformanceLeaderboard(
  limit: number = 50,
  startDate?: Date,
  endDate?: Date
): Promise<LeaderboardEntry[]> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  try {
    // Get all admin users (verifiers)
    const verifiers = await db
      .select()
      .from(users)
      .where(eq(users.role, "admin"));

    // Get metrics for each verifier
    const metricsPromises = verifiers.map((v) => getVerifierMetrics(v.id, startDate, endDate));
    const allMetrics = await Promise.all(metricsPromises);
    const validMetrics = allMetrics.filter((m) => m !== null) as VerifierMetrics[];

    // Sort by performance score descending
    validMetrics.sort((a, b) => b.performanceScore - a.performanceScore);

    // Create leaderboard entries with rank and trend
    const leaderboard: LeaderboardEntry[] = validMetrics.slice(0, limit).map((metric, index) => ({
      rank: index + 1,
      verifierId: metric.verifierId,
      verifierName: metric.verifierName,
      documentsProcessed: metric.totalDocumentsProcessed,
      averageProcessingTime: metric.averageProcessingTimeHours,
      accuracyRate: metric.verificationAccuracyRate,
      performanceScore: metric.performanceScore,
      trend: "stable" as const, // Would calculate from previous period
      trendPercentage: 0,
    }));

    return leaderboard;
  } catch (error) {
    console.error("Error getting performance leaderboard:", error);
    return [];
  }
}

/**
 * Get performance statistics for dashboard
 */
export async function getPerformanceStatistics(
  startDate?: Date,
  endDate?: Date
): Promise<{
  totalVerifiers: number;
  totalDocumentsVerified: number;
  avgProcessingTimeAcrossTeam: number;
  avgAccuracyRate: number;
  topPerformer: VerifierMetrics | null;
  teamPerformanceScore: number;
}> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  try {
    const start = startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate || new Date();

    // Get all verified documents in period
    const allVerified = await db
      .select()
      .from(userDocuments)
      .where(
        and(
          eq(userDocuments.verificationStatus, "verified"),
          gte(userDocuments.updatedAt, start),
          lte(userDocuments.updatedAt, end)
        )
      );

    // Get all rejected documents in period
    const allRejected = await db
      .select()
      .from(userDocuments)
      .where(
        and(
          eq(userDocuments.verificationStatus, "rejected"),
          gte(userDocuments.updatedAt, start),
          lte(userDocuments.updatedAt, end)
        )
      );

    const totalDocuments = allVerified.length + allRejected.length;

    // Calculate average processing time
    let totalProcessingTime = 0;
    [...allVerified, ...allRejected].forEach((doc) => {
      if (doc.createdAt && doc.updatedAt) {
        totalProcessingTime += doc.updatedAt.getTime() - doc.createdAt.getTime();
      }
    });

    const avgProcessingTime =
      totalDocuments > 0 ? totalProcessingTime / (totalDocuments * 60 * 60 * 1000) : 0;

    // Get verifier metrics
    const verifiers = await db
      .select()
      .from(users)
      .where(eq(users.role, "admin"));

    const metricsPromises = verifiers.map((v) => getVerifierMetrics(v.id, start, end));
    const allMetrics = await Promise.all(metricsPromises);
    const validMetrics = allMetrics.filter((m) => m !== null) as VerifierMetrics[];

    const avgAccuracyRate =
      validMetrics.length > 0
        ? validMetrics.reduce((sum, m) => sum + m.verificationAccuracyRate, 0) / validMetrics.length
        : 0;

    const avgPerformanceScore =
      validMetrics.length > 0
        ? validMetrics.reduce((sum, m) => sum + m.performanceScore, 0) / validMetrics.length
        : 0;

    const topPerformer =
      validMetrics.length > 0 ? validMetrics.reduce((prev, current) => (prev.performanceScore > current.performanceScore ? prev : current)) : null;

    return {
      totalVerifiers: validMetrics.length,
      totalDocumentsVerified: allVerified.length,
      avgProcessingTimeAcrossTeam: Math.round(avgProcessingTime * 100) / 100,
      avgAccuracyRate: Math.round(avgAccuracyRate * 100) / 100,
      topPerformer,
      teamPerformanceScore: Math.round(avgPerformanceScore * 100) / 100,
    };
  } catch (error) {
    console.error("Error getting performance statistics:", error);
    return {
      totalVerifiers: 0,
      totalDocumentsVerified: 0,
      avgProcessingTimeAcrossTeam: 0,
      avgAccuracyRate: 0,
      topPerformer: null,
      teamPerformanceScore: 0,
    };
  }
}

/**
 * Get performance comparison for a verifier vs team average
 */
export async function getPerformanceComparison(
  verifierId: number,
  startDate?: Date,
  endDate?: Date
): Promise<{
  verifierMetrics: VerifierMetrics | null;
  teamAverage: {
    avgProcessingTime: number;
    avgAccuracyRate: number;
    avgPerformanceScore: number;
  };
  comparison: {
    processingTimeVsTeam: number; // Positive = slower, negative = faster
    accuracyVsTeam: number;
    performanceVsTeam: number;
  };
}> {
  const verifierMetrics = await getVerifierMetrics(verifierId, startDate, endDate);
  const stats = await getPerformanceStatistics(startDate, endDate);

  const teamAverage = {
    avgProcessingTime: stats.avgProcessingTimeAcrossTeam,
    avgAccuracyRate: stats.avgAccuracyRate,
    avgPerformanceScore: stats.teamPerformanceScore,
  };

  return {
    verifierMetrics,
    teamAverage,
    comparison: {
      processingTimeVsTeam: verifierMetrics
        ? verifierMetrics.averageProcessingTimeHours - teamAverage.avgProcessingTime
        : 0,
      accuracyVsTeam: verifierMetrics
        ? verifierMetrics.verificationAccuracyRate - teamAverage.avgAccuracyRate
        : 0,
      performanceVsTeam: verifierMetrics
        ? verifierMetrics.performanceScore - teamAverage.avgPerformanceScore
        : 0,
    },
  };
}
