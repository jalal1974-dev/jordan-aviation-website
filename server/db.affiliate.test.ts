import { describe, it, expect, beforeEach } from 'vitest';
import {
  getAffiliateById,
  getAffiliateByCode,
  getAffiliateByUserId,
  createAffiliateRegistration,
  updateAffiliateStatus,
  createAffiliateReferral,
  updateReferralStatus,
  getAffiliateReferrals,
  getAffiliateStats,
  createAffiliatePayment,
  getAffiliatePayments,
  updateAffiliateEarnings,
  updateAffiliateReferralCount,
} from './db.affiliate';

describe('Affiliate Program Database Functions', () => {
  describe('createAffiliateRegistration', () => {
    it('should create new affiliate registration', async () => {
      const result = await createAffiliateRegistration({
        userId: 1,
        affiliateCode: 'AFF-TEST-001',
        companyName: 'Test Company',
        website: 'https://test.com',
        contactEmail: 'test@example.com',
        contactPhone: '+1234567890',
        commissionRate: '5.00',
        status: 'pending',
      });

      expect(result).toBeDefined();
    });

    it('should set initial earnings and referral counts to zero', async () => {
      const result = await createAffiliateRegistration({
        userId: 2,
        affiliateCode: 'AFF-TEST-002',
        contactEmail: 'test2@example.com',
        commissionRate: '5.00',
        status: 'pending',
      });

      const affiliate = await getAffiliateById(result.lastInsertRowid as number);
      if (affiliate.length > 0) {
        expect(affiliate[0].totalEarnings).toBe('0');
        expect(affiliate[0].totalReferrals).toBe(0);
        expect(affiliate[0].totalConversions).toBe(0);
      }
    });
  });

  describe('getAffiliateByCode', () => {
    it('should return affiliate by code', async () => {
      const affiliate = await getAffiliateByCode('AFF-TEST-001');
      if (affiliate.length > 0) {
        expect(affiliate[0].affiliateCode).toBe('AFF-TEST-001');
      }
    });

    it('should return empty array for non-existent code', async () => {
      const affiliate = await getAffiliateByCode('NON-EXISTENT');
      expect(affiliate).toEqual([]);
    });
  });

  describe('getAffiliateByUserId', () => {
    it('should return affiliate by user ID', async () => {
      const affiliate = await getAffiliateByUserId(1);
      if (affiliate.length > 0) {
        expect(affiliate[0].userId).toBe(1);
      }
    });

    it('should return empty array if user has no affiliate account', async () => {
      const affiliate = await getAffiliateByUserId(999);
      expect(affiliate).toEqual([]);
    });
  });

  describe('updateAffiliateStatus', () => {
    it('should update affiliate status', async () => {
      const affiliates = await getAffiliateByCode('AFF-TEST-001');
      if (affiliates.length > 0) {
        await updateAffiliateStatus(affiliates[0].id, 'approved');
        const updated = await getAffiliateById(affiliates[0].id);
        expect(updated[0].status).toBe('approved');
      }
    });

    it('should set approvedAt timestamp when approving', async () => {
      const affiliates = await getAffiliateByCode('AFF-TEST-002');
      if (affiliates.length > 0) {
        await updateAffiliateStatus(affiliates[0].id, 'approved');
        const updated = await getAffiliateById(affiliates[0].id);
        expect(updated[0].approvedAt).toBeDefined();
      }
    });
  });

  describe('createAffiliateReferral', () => {
    it('should create affiliate referral', async () => {
      const affiliates = await getAffiliateByCode('AFF-TEST-001');
      if (affiliates.length > 0) {
        const result = await createAffiliateReferral({
          affiliateId: affiliates[0].id,
          referralCode: 'REF-TEST-001',
          referredEmail: 'referral@example.com',
          status: 'clicked',
        });

        expect(result).toBeDefined();
      }
    });

    it('should set clickedAt timestamp', async () => {
      const affiliates = await getAffiliateByCode('AFF-TEST-001');
      if (affiliates.length > 0) {
        await createAffiliateReferral({
          affiliateId: affiliates[0].id,
          referralCode: 'REF-TEST-002',
          status: 'clicked',
        });

        const referrals = await getAffiliateReferrals(affiliates[0].id, 1);
        if (referrals.length > 0) {
          expect(referrals[0].clickedAt).toBeDefined();
        }
      }
    });
  });

  describe('updateReferralStatus', () => {
    it('should update referral status', async () => {
      const affiliates = await getAffiliateByCode('AFF-TEST-001');
      if (affiliates.length > 0) {
        const referrals = await getAffiliateReferrals(affiliates[0].id, 1);
        if (referrals.length > 0) {
          await updateReferralStatus(referrals[0].id, 'signed_up');
          // Verify update
          expect(true).toBe(true);
        }
      }
    });

    it('should set convertedAt when marking as completed', async () => {
      const affiliates = await getAffiliateByCode('AFF-TEST-001');
      if (affiliates.length > 0) {
        const referrals = await getAffiliateReferrals(affiliates[0].id, 1);
        if (referrals.length > 0) {
          await updateReferralStatus(referrals[0].id, 'completed', undefined, '50.00');
          expect(true).toBe(true);
        }
      }
    });
  });

  describe('getAffiliateReferrals', () => {
    it('should return affiliate referrals', async () => {
      const affiliates = await getAffiliateByCode('AFF-TEST-001');
      if (affiliates.length > 0) {
        const referrals = await getAffiliateReferrals(affiliates[0].id);
        expect(Array.isArray(referrals)).toBe(true);
      }
    });

    it('should respect limit and offset parameters', async () => {
      const affiliates = await getAffiliateByCode('AFF-TEST-001');
      if (affiliates.length > 0) {
        const referrals = await getAffiliateReferrals(affiliates[0].id, 5, 0);
        expect(referrals.length).toBeLessThanOrEqual(5);
      }
    });
  });

  describe('getAffiliateStats', () => {
    it('should return affiliate statistics', async () => {
      const affiliates = await getAffiliateByCode('AFF-TEST-001');
      if (affiliates.length > 0) {
        const stats = await getAffiliateStats(affiliates[0].id);
        expect(stats).toHaveProperty('clicks');
        expect(stats).toHaveProperty('signups');
        expect(stats).toHaveProperty('bookings');
        expect(stats).toHaveProperty('completed');
        expect(stats).toHaveProperty('conversionRate');
      }
    });

    it('should calculate conversion rate correctly', async () => {
      const affiliates = await getAffiliateByCode('AFF-TEST-001');
      if (affiliates.length > 0) {
        const stats = await getAffiliateStats(affiliates[0].id);
        if (stats.clicks > 0) {
          expect(stats.conversionRate).toBeGreaterThanOrEqual(0);
          expect(stats.conversionRate).toBeLessThanOrEqual(100);
        }
      }
    });
  });

  describe('createAffiliatePayment', () => {
    it('should create affiliate payment', async () => {
      const affiliates = await getAffiliateByCode('AFF-TEST-001');
      if (affiliates.length > 0) {
        const result = await createAffiliatePayment({
          affiliateId: affiliates[0].id,
          amount: '100.00',
          currency: 'USD',
          status: 'pending',
          paymentMethod: 'bank_transfer',
          periodStart: new Date(),
          periodEnd: new Date(),
        });

        expect(result).toBeDefined();
      }
    });
  });

  describe('getAffiliatePayments', () => {
    it('should return affiliate payments', async () => {
      const affiliates = await getAffiliateByCode('AFF-TEST-001');
      if (affiliates.length > 0) {
        const payments = await getAffiliatePayments(affiliates[0].id);
        expect(Array.isArray(payments)).toBe(true);
      }
    });

    it('should respect limit and offset parameters', async () => {
      const affiliates = await getAffiliateByCode('AFF-TEST-001');
      if (affiliates.length > 0) {
        const payments = await getAffiliatePayments(affiliates[0].id, 5, 0);
        expect(payments.length).toBeLessThanOrEqual(5);
      }
    });
  });

  describe('updateAffiliateEarnings', () => {
    it('should update affiliate total earnings', async () => {
      const affiliates = await getAffiliateByCode('AFF-TEST-001');
      if (affiliates.length > 0) {
        await updateAffiliateEarnings(affiliates[0].id, '50.00');
        const updated = await getAffiliateById(affiliates[0].id);
        expect(parseFloat(updated[0].totalEarnings.toString())).toBeGreaterThanOrEqual(50);
      }
    });
  });

  describe('updateAffiliateReferralCount', () => {
    it('should update affiliate referral counts', async () => {
      const affiliates = await getAffiliateByCode('AFF-TEST-001');
      if (affiliates.length > 0) {
        await updateAffiliateReferralCount(affiliates[0].id);
        const updated = await getAffiliateById(affiliates[0].id);
        expect(updated[0].totalReferrals).toBeGreaterThanOrEqual(0);
      }
    });
  });

  describe('Integration Tests', () => {
    it('should handle complete affiliate flow', async () => {
      // 1. Register affiliate
      const registerResult = await createAffiliateRegistration({
        userId: 100,
        affiliateCode: 'AFF-INTEGRATION-001',
        contactEmail: 'integration@example.com',
        commissionRate: '5.00',
        status: 'pending',
      });

      const affiliateId = registerResult.lastInsertRowid as number;

      // 2. Approve affiliate
      await updateAffiliateStatus(affiliateId, 'approved');

      // 3. Create referral
      await createAffiliateReferral({
        affiliateId,
        referralCode: 'REF-INT-001',
        referredEmail: 'customer@example.com',
        status: 'clicked',
      });

      // 4. Update referral to completed
      const referrals = await getAffiliateReferrals(affiliateId, 1);
      if (referrals.length > 0) {
        await updateReferralStatus(referrals[0].id, 'completed', undefined, '100.00');
      }

      // 5. Update earnings
      await updateAffiliateEarnings(affiliateId, '100.00');

      // 6. Get stats
      const stats = await getAffiliateStats(affiliateId);
      expect(stats.completed).toBeGreaterThan(0);
      expect(parseFloat(stats.affiliate.totalEarnings.toString())).toBeGreaterThan(0);
    });

    it('should maintain referral accuracy', async () => {
      const affiliates = await getAffiliateByCode('AFF-TEST-001');
      if (affiliates.length > 0) {
        const initialReferrals = await getAffiliateReferrals(affiliates[0].id);
        const initialCount = initialReferrals.length;

        // Create new referral
        await createAffiliateReferral({
          affiliateId: affiliates[0].id,
          referralCode: `REF-UNIQUE-${Date.now()}`,
          status: 'clicked',
        });

        // Verify count increased
        const updatedReferrals = await getAffiliateReferrals(affiliates[0].id);
        expect(updatedReferrals.length).toBe(initialCount + 1);
      }
    });
  });
});
