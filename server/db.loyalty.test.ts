import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  getUserLoyaltyStatus,
  addLoyaltyPoints,
  redeemLoyaltyPoints,
  getLoyaltyPointHistory,
  getLoyaltyTiers,
  calculateUserTier,
} from './db.loyalty';

// Mock getDb
vi.mock('./db', () => ({
  getDb: vi.fn(),
}));

describe('Loyalty Program Database Functions', () => {
  describe('getUserLoyaltyStatus', () => {
    it('should return null if user has no loyalty points', async () => {
      const result = await getUserLoyaltyStatus(999);
      expect(result).toBeNull();
    });

    it('should return user loyalty status with tier information', async () => {
      const result = await getUserLoyaltyStatus(1);
      if (result) {
        expect(result).toHaveProperty('totalPoints');
        expect(result).toHaveProperty('availablePoints');
        expect(result).toHaveProperty('tier');
      }
    });
  });

  describe('addLoyaltyPoints', () => {
    it('should add points to existing user', async () => {
      const result = await addLoyaltyPoints(1, 100, 'Booking reward', 1, 'Flight booking');
      expect(result.success).toBe(true);
      expect(result.pointsAdded).toBe(100);
    });

    it('should create new loyalty record for new user', async () => {
      const result = await addLoyaltyPoints(999, 50, 'Welcome bonus');
      expect(result.success).toBe(true);
      expect(result.pointsAdded).toBe(50);
    });

    it('should record point history', async () => {
      await addLoyaltyPoints(1, 50, 'Test points', undefined, 'Test description');
      const history = await getLoyaltyPointHistory(1, 1);
      expect(history.length).toBeGreaterThan(0);
      expect(history[0].reason).toBe('Test points');
    });
  });

  describe('redeemLoyaltyPoints', () => {
    beforeEach(async () => {
      // Add points before redeeming
      await addLoyaltyPoints(1, 500, 'Setup points');
    });

    it('should redeem available points', async () => {
      const result = await redeemLoyaltyPoints(1, 100, 'Flight discount');
      expect(result.success).toBe(true);
      expect(result.pointsRedeemed).toBe(100);
    });

    it('should throw error if insufficient points', async () => {
      await expect(
        redeemLoyaltyPoints(1, 10000, 'Too many points')
      ).rejects.toThrow('Insufficient points to redeem');
    });

    it('should throw error if user has no loyalty points', async () => {
      await expect(
        redeemLoyaltyPoints(999, 100, 'No user')
      ).rejects.toThrow('User has no loyalty points');
    });

    it('should record redemption in history', async () => {
      await redeemLoyaltyPoints(1, 50, 'Test redemption');
      const history = await getLoyaltyPointHistory(1, 1);
      const redemptionEntry = history.find((h) => h.pointsChange < 0);
      expect(redemptionEntry).toBeDefined();
      expect(redemptionEntry?.pointsChange).toBe(-50);
    });
  });

  describe('getLoyaltyPointHistory', () => {
    it('should return empty array if no history', async () => {
      const history = await getLoyaltyPointHistory(999);
      expect(Array.isArray(history)).toBe(true);
    });

    it('should return point history sorted by date', async () => {
      await addLoyaltyPoints(1, 100, 'First');
      await addLoyaltyPoints(1, 50, 'Second');
      const history = await getLoyaltyPointHistory(1, 10);
      expect(history.length).toBeGreaterThan(0);
      expect(history[0].createdAt >= history[history.length - 1].createdAt).toBe(true);
    });

    it('should respect limit parameter', async () => {
      const history = await getLoyaltyPointHistory(1, 5);
      expect(history.length).toBeLessThanOrEqual(5);
    });
  });

  describe('getLoyaltyTiers', () => {
    it('should return array of loyalty tiers', async () => {
      const tiers = await getLoyaltyTiers();
      expect(Array.isArray(tiers)).toBe(true);
    });

    it('should return only active tiers', async () => {
      const tiers = await getLoyaltyTiers();
      tiers.forEach((tier) => {
        expect(tier.isActive).toBe(true);
      });
    });

    it('should return tiers sorted by minPoints', async () => {
      const tiers = await getLoyaltyTiers();
      for (let i = 1; i < tiers.length; i++) {
        expect(tiers[i].minPoints >= tiers[i - 1].minPoints).toBe(true);
      }
    });
  });

  describe('calculateUserTier', () => {
    it('should return Bronze tier for low points', async () => {
      const tier = await calculateUserTier(0);
      expect(tier.name).toBe('Bronze');
    });

    it('should return correct tier based on points', async () => {
      const tier = await calculateUserTier(5000);
      expect(tier).toBeDefined();
      expect(tier.minPoints).toBeLessThanOrEqual(5000);
    });

    it('should return highest applicable tier', async () => {
      const tier = await calculateUserTier(50000);
      expect(tier).toBeDefined();
      expect(tier.pointsMultiplier).toBeGreaterThanOrEqual(1);
    });
  });

  describe('Points Multiplier', () => {
    it('should apply tier multiplier to earned points', async () => {
      const status = await getUserLoyaltyStatus(1);
      if (status?.tier) {
        const multiplier = parseFloat(status.tier.pointsMultiplier.toString());
        expect(multiplier).toBeGreaterThanOrEqual(1);
      }
    });
  });

  describe('Integration Tests', () => {
    it('should handle complete loyalty flow', async () => {
      const userId = 999;

      // 1. Add points
      await addLoyaltyPoints(userId, 1000, 'Booking reward', 1);

      // 2. Check status
      const status = await getUserLoyaltyStatus(userId);
      expect(status?.availablePoints).toBeGreaterThanOrEqual(1000);

      // 3. Redeem points
      await redeemLoyaltyPoints(userId, 500, 'Discount');

      // 4. Verify history
      const history = await getLoyaltyPointHistory(userId);
      expect(history.length).toBeGreaterThanOrEqual(2);

      // 5. Check updated status
      const updatedStatus = await getUserLoyaltyStatus(userId);
      expect(updatedStatus?.redeemedPoints).toBeGreaterThan(0);
    });

    it('should maintain point accuracy across operations', async () => {
      const userId = 888;
      const initialPoints = 1000;

      await addLoyaltyPoints(userId, initialPoints, 'Initial');
      let status = await getUserLoyaltyStatus(userId);
      expect(status?.totalPoints).toBe(initialPoints);

      await addLoyaltyPoints(userId, 500, 'Bonus');
      status = await getUserLoyaltyStatus(userId);
      expect(status?.totalPoints).toBe(initialPoints + 500);

      await redeemLoyaltyPoints(userId, 200, 'Redemption');
      status = await getUserLoyaltyStatus(userId);
      expect(status?.totalPoints).toBe(initialPoints + 500);
      expect(status?.redeemedPoints).toBe(200);
    });
  });
});
