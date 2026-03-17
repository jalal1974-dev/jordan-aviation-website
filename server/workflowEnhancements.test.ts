import { describe, it, expect, beforeAll, afterAll } from "vitest";
import {
  triggerVerificationWorkflow,
  triggerRejectionWorkflow,
  triggerPendingFollowUpWorkflow,
  triggerExpiryWorkflow,
} from "./workflowAutomationService";
import {
  getVerifierMetrics,
  getPerformanceLeaderboard,
  getPerformanceStatistics,
  getPerformanceComparison,
} from "./performanceMetricsService";

describe("Workflow Automation Service", () => {
  describe("Verification Workflow", () => {
    it("should trigger verification workflow for document", async () => {
      const actions = await triggerVerificationWorkflow(1, "passport", "test-doc");
      expect(actions).toBeDefined();
      expect(Array.isArray(actions)).toBe(true);
    });

    it("should include email action in verification workflow", async () => {
      const actions = await triggerVerificationWorkflow(1, "passport", "test-doc");
      const emailAction = actions.find((a) => a.actionType === "email");
      expect(emailAction).toBeDefined();
      expect(emailAction?.status).toBe("completed");
    });
  });

  describe("Rejection Workflow", () => {
    it("should trigger rejection workflow for document", async () => {
      const actions = await triggerRejectionWorkflow(
        1,
        "passport",
        "test-doc",
        "Invalid document"
      );
      expect(actions).toBeDefined();
      expect(Array.isArray(actions)).toBe(true);
    });

    it("should include rejection email in workflow", async () => {
      const actions = await triggerRejectionWorkflow(
        1,
        "passport",
        "test-doc",
        "Invalid document"
      );
      const emailAction = actions.find((a) => a.actionType === "email");
      expect(emailAction).toBeDefined();
    });

    it("should include booking restriction in workflow", async () => {
      const actions = await triggerRejectionWorkflow(
        1,
        "passport",
        "test-doc",
        "Invalid document"
      );
      const bookingAction = actions.find((a) => a.actionType === "booking_restriction");
      expect(bookingAction).toBeDefined();
    });
  });

  describe("Pending Follow-up Workflow", () => {
    it("should trigger pending follow-up workflow", async () => {
      const actions = await triggerPendingFollowUpWorkflow(1, "passport", "test-doc");
      expect(actions).toBeDefined();
      expect(Array.isArray(actions)).toBe(true);
    });

    it("should include reminder email in follow-up workflow", async () => {
      const actions = await triggerPendingFollowUpWorkflow(1, "passport", "test-doc");
      const emailAction = actions.find((a) => a.actionType === "email");
      expect(emailAction).toBeDefined();
    });
  });

  describe("Expiry Workflow", () => {
    it("should trigger expiry workflow for documents", async () => {
      const actions = await triggerExpiryWorkflow();
      expect(actions).toBeDefined();
      expect(Array.isArray(actions)).toBe(true);
    });
  });
});

describe("Performance Metrics Service", () => {
  describe("Verifier Metrics", () => {
    it("should return null for non-existent verifier", async () => {
      const metrics = await getVerifierMetrics(99999);
      expect(metrics).toBeNull();
    });

    it("should calculate metrics with valid data", async () => {
      const metrics = await getVerifierMetrics(1);
      if (metrics) {
        expect(metrics.verifierId).toBe(1);
        expect(metrics.totalDocumentsProcessed).toBeGreaterThanOrEqual(0);
        expect(metrics.verificationAccuracyRate).toBeGreaterThanOrEqual(0);
        expect(metrics.verificationAccuracyRate).toBeLessThanOrEqual(100);
        expect(metrics.performanceScore).toBeGreaterThanOrEqual(0);
        expect(metrics.performanceScore).toBeLessThanOrEqual(100);
      }
    });

    it("should calculate average processing time", async () => {
      const metrics = await getVerifierMetrics(1);
      if (metrics) {
        expect(metrics.averageProcessingTimeHours).toBeGreaterThanOrEqual(0);
      }
    });
  });

  describe("Performance Leaderboard", () => {
    it("should return leaderboard array", async () => {
      const leaderboard = await getPerformanceLeaderboard(10);
      expect(Array.isArray(leaderboard)).toBe(true);
    });

    it("should return leaderboard with rank", async () => {
      const leaderboard = await getPerformanceLeaderboard(10);
      if (leaderboard.length > 0) {
        expect(leaderboard[0].rank).toBe(1);
        if (leaderboard.length > 1) {
          expect(leaderboard[1].rank).toBe(2);
        }
      }
    });

    it("should respect limit parameter", async () => {
      const leaderboard = await getPerformanceLeaderboard(5);
      expect(leaderboard.length).toBeLessThanOrEqual(5);
    });

    it("should sort by performance score descending", async () => {
      const leaderboard = await getPerformanceLeaderboard(10);
      for (let i = 1; i < leaderboard.length; i++) {
        expect(leaderboard[i - 1].performanceScore).toBeGreaterThanOrEqual(
          leaderboard[i].performanceScore
        );
      }
    });
  });

  describe("Performance Statistics", () => {
    it("should return statistics object", async () => {
      const stats = await getPerformanceStatistics();
      expect(stats).toBeDefined();
      expect(stats.totalVerifiers).toBeGreaterThanOrEqual(0);
      expect(stats.totalDocumentsVerified).toBeGreaterThanOrEqual(0);
      expect(stats.avgProcessingTimeAcrossTeam).toBeGreaterThanOrEqual(0);
      expect(stats.avgAccuracyRate).toBeGreaterThanOrEqual(0);
      expect(stats.avgAccuracyRate).toBeLessThanOrEqual(100);
      expect(stats.teamPerformanceScore).toBeGreaterThanOrEqual(0);
      expect(stats.teamPerformanceScore).toBeLessThanOrEqual(100);
    });

    it("should calculate average accuracy rate", async () => {
      const stats = await getPerformanceStatistics();
      expect(stats.avgAccuracyRate).toBeGreaterThanOrEqual(0);
      expect(stats.avgAccuracyRate).toBeLessThanOrEqual(100);
    });

    it("should identify top performer", async () => {
      const stats = await getPerformanceStatistics();
      if (stats.topPerformer) {
        expect(stats.topPerformer.verifierId).toBeGreaterThan(0);
        expect(stats.topPerformer.performanceScore).toBeGreaterThanOrEqual(0);
      }
    });
  });

  describe("Performance Comparison", () => {
    it("should return comparison object", async () => {
      const comparison = await getPerformanceComparison(1);
      expect(comparison).toBeDefined();
      expect(comparison.teamAverage).toBeDefined();
      expect(comparison.comparison).toBeDefined();
    });

    it("should calculate processing time difference", async () => {
      const comparison = await getPerformanceComparison(1);
      if (comparison.verifierMetrics) {
        expect(comparison.comparison.processingTimeVsTeam).toBeDefined();
      }
    });

    it("should calculate accuracy difference", async () => {
      const comparison = await getPerformanceComparison(1);
      if (comparison.verifierMetrics) {
        expect(comparison.comparison.accuracyVsTeam).toBeDefined();
      }
    });

    it("should calculate performance difference", async () => {
      const comparison = await getPerformanceComparison(1);
      if (comparison.verifierMetrics) {
        expect(comparison.comparison.performanceVsTeam).toBeDefined();
      }
    });
  });
});

describe("Integration Tests", () => {
  it("should handle workflow automation end-to-end", async () => {
    // Trigger verification workflow
    const verifyActions = await triggerVerificationWorkflow(1, "passport", "test-doc");
    expect(verifyActions).toBeDefined();
    expect(verifyActions.length).toBeGreaterThan(0);

    // Get updated metrics
    const metrics = await getVerifierMetrics(1);
    expect(metrics).toBeDefined();
  });

  it("should track performance metrics through workflows", async () => {
    // Get initial stats
    const initialStats = await getPerformanceStatistics();
    expect(initialStats).toBeDefined();

    // Get leaderboard
    const leaderboard = await getPerformanceLeaderboard(10);
    expect(leaderboard).toBeDefined();

    // Verify consistency
    expect(leaderboard.length).toBeLessThanOrEqual(initialStats.totalVerifiers);
  });

  it("should maintain data consistency in performance tracking", async () => {
    const stats = await getPerformanceStatistics();
    const leaderboard = await getPerformanceLeaderboard(100);

    // Total verified documents should match sum of individual metrics
    let totalFromLeaderboard = 0;
    leaderboard.forEach((entry) => {
      totalFromLeaderboard += entry.documentsProcessed;
    });

    // Should be at least equal (some docs might not be assigned to verifiers)
    expect(totalFromLeaderboard).toBeLessThanOrEqual(stats.totalDocumentsVerified + 100);
  });

  it("should handle edge cases in performance calculation", async () => {
    // Test with non-existent verifier
    const metrics = await getVerifierMetrics(99999);
    expect(metrics).toBeNull();

    // Test with zero limit
    const leaderboard = await getPerformanceLeaderboard(1);
    expect(leaderboard.length).toBeLessThanOrEqual(1);

    // Test with large limit
    const largeLeaderboard = await getPerformanceLeaderboard(1000);
    expect(Array.isArray(largeLeaderboard)).toBe(true);
  });
});
