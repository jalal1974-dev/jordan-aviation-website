import { getDb } from "./db";
import { userDocuments, users, userProfiles } from "../drizzle/schema";
import { eq, and, lt, gte, lte, sql } from "drizzle-orm";
import { sendDocumentReminderEmail } from "./emailNotificationService";

/**
 * Bulk Email Campaign Service
 * Manages automated email campaigns for document verification reminders
 */

export interface EmailCampaignResult {
  campaignId: string;
  campaignType: string;
  totalRecipients: number;
  emailsSent: number;
  emailsFailed: number;
  startTime: Date;
  endTime: Date;
  duration: number; // in seconds
}

export interface PendingDocumentReminder {
  userId: number;
  userEmail: string;
  userName: string;
  documentType: string;
  documentName: string;
  submittedDate: Date;
  daysWaiting: number;
}

export interface ExpiringDocumentReminder {
  userId: number;
  userEmail: string;
  userName: string;
  documentType: string;
  documentName: string;
  expiryDate: Date;
  daysUntilExpiry: number;
}

/**
 * Get users with pending document verifications
 * Returns users who have submitted documents but are still waiting for verification
 */
export async function getPendingDocumentReminders(
  minDaysWaiting: number = 3
): Promise<PendingDocumentReminder[]> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  try {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - minDaysWaiting);

    const results = await db
      .select({
        userId: userDocuments.userId,
        userEmail: users.email,
        userName: userProfiles.firstName,
        documentType: userDocuments.documentType,
        documentName: userDocuments.documentName,
        submittedDate: userDocuments.createdAt,
      })
      .from(userDocuments)
      .innerJoin(users, eq(userDocuments.userId, users.id))
      .leftJoin(userProfiles, eq(userDocuments.userId, userProfiles.userId))
      .where(
        and(
          eq(userDocuments.verificationStatus, "pending"),
          lte(userDocuments.createdAt, cutoffDate)
        )
      )
      .groupBy(userDocuments.id);

    return results.map((r: any) => ({
      userId: r.userId,
      userEmail: r.userEmail,
      userName: r.userName || "User",
      documentType: r.documentType,
      documentName: r.documentName,
      submittedDate: r.submittedDate,
      daysWaiting: Math.floor(
        (new Date().getTime() - r.submittedDate.getTime()) / (1000 * 60 * 60 * 24)
      ),
    }));
  } catch (error) {
    console.error("Error fetching pending document reminders:", error);
    return [];
  }
}

/**
 * Get users with expiring documents
 * Returns users whose documents are expiring soon
 */
export async function getExpiringDocumentReminders(
  daysUntilExpiry: number = 30
): Promise<ExpiringDocumentReminder[]> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  try {
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + daysUntilExpiry);

    const results = await db
      .select({
        userId: userDocuments.userId,
        userEmail: users.email,
        userName: userProfiles.firstName,
        documentType: userDocuments.documentType,
        documentName: userDocuments.documentName,
        expiryDate: userDocuments.expiryDate,
      })
      .from(userDocuments)
      .innerJoin(users, eq(userDocuments.userId, users.id))
      .leftJoin(userProfiles, eq(userDocuments.userId, userProfiles.userId))
      .where(
        and(
          eq(userDocuments.verificationStatus, "verified"),
          gte(userDocuments.expiryDate, startDate),
          lte(userDocuments.expiryDate, endDate)
        )
      );

    return results.map((r: any) => ({
      userId: r.userId,
      userEmail: r.userEmail,
      userName: r.userName || "User",
      documentType: r.documentType,
      documentName: r.documentName,
      expiryDate: r.expiryDate,
      daysUntilExpiry: Math.floor(
        (r.expiryDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
      ),
    }));
  } catch (error) {
    console.error("Error fetching expiring document reminders:", error);
    return [];
  }
}

/**
 * Send pending document reminder emails
 */
export async function sendPendingDocumentReminders(): Promise<EmailCampaignResult> {
  const startTime = new Date();
  const campaignId = `pending-${Date.now()}`;
  let emailsSent = 0;
  let emailsFailed = 0;

  try {
    const reminders = await getPendingDocumentReminders(3);

    for (const reminder of reminders) {
      try {
        await sendDocumentReminderEmail({
          userId: reminder.userId,
          userEmail: reminder.userEmail,
          userName: reminder.userName,
          documentType: reminder.documentType,
          documentName: reminder.documentName,
          reminderType: "pending",
          daysWaiting: reminder.daysWaiting,
        });
        emailsSent++;
      } catch (error) {
        console.error(
          `Failed to send pending reminder to ${reminder.userEmail}:`,
          error
        );
        emailsFailed++;
      }
    }

    const endTime = new Date();
    const duration = Math.floor(
      (endTime.getTime() - startTime.getTime()) / 1000
    );

    return {
      campaignId,
      campaignType: "pending_documents",
      totalRecipients: reminders.length,
      emailsSent,
      emailsFailed,
      startTime,
      endTime,
      duration,
    };
  } catch (error) {
    console.error("Error in pending document reminder campaign:", error);
    const endTime = new Date();
    const duration = Math.floor(
      (endTime.getTime() - startTime.getTime()) / 1000
    );

    return {
      campaignId,
      campaignType: "pending_documents",
      totalRecipients: 0,
      emailsSent,
      emailsFailed,
      startTime,
      endTime,
      duration,
    };
  }
}

/**
 * Send expiring document reminder emails
 */
export async function sendExpiringDocumentReminders(): Promise<EmailCampaignResult> {
  const startTime = new Date();
  const campaignId = `expiring-${Date.now()}`;
  let emailsSent = 0;
  let emailsFailed = 0;

  try {
    const reminders = await getExpiringDocumentReminders(30);

    for (const reminder of reminders) {
      try {
        await sendDocumentReminderEmail({
          userId: reminder.userId,
          userEmail: reminder.userEmail,
          userName: reminder.userName,
          documentType: reminder.documentType,
          documentName: reminder.documentName,
          reminderType: "expiring",
          expiryDate: reminder.expiryDate,
          daysUntilExpiry: reminder.daysUntilExpiry,
        });
        emailsSent++;
      } catch (error) {
        console.error(
          `Failed to send expiring reminder to ${reminder.userEmail}:`,
          error
        );
        emailsFailed++;
      }
    }

    const endTime = new Date();
    const duration = Math.floor(
      (endTime.getTime() - startTime.getTime()) / 1000
    );

    return {
      campaignId,
      campaignType: "expiring_documents",
      totalRecipients: reminders.length,
      emailsSent,
      emailsFailed,
      startTime,
      endTime,
      duration,
    };
  } catch (error) {
    console.error("Error in expiring document reminder campaign:", error);
    const endTime = new Date();
    const duration = Math.floor(
      (endTime.getTime() - startTime.getTime()) / 1000
    );

    return {
      campaignId,
      campaignType: "expiring_documents",
      totalRecipients: 0,
      emailsSent,
      emailsFailed,
      startTime,
      endTime,
      duration,
    };
  }
}

/**
 * Send all reminder campaigns
 */
export async function sendAllReminderCampaigns(): Promise<EmailCampaignResult[]> {
  const results: EmailCampaignResult[] = [];

  // Send pending document reminders
  const pendingResult = await sendPendingDocumentReminders();
  results.push(pendingResult);

  // Send expiring document reminders
  const expiringResult = await sendExpiringDocumentReminders();
  results.push(expiringResult);

  return results;
}

/**
 * Get campaign statistics
 */
export async function getCampaignStatistics(
  campaignType?: string
): Promise<{
  totalCampaigns: number;
  totalEmailsSent: number;
  totalEmailsFailed: number;
  successRate: number;
}> {
  // In production, this would query a campaigns table
  // For now, return placeholder stats
  return {
    totalCampaigns: 0,
    totalEmailsSent: 0,
    totalEmailsFailed: 0,
    successRate: 0,
  };
}

/**
 * Schedule automatic reminder campaigns
 * This should be called by a cron job or scheduler
 */
export async function scheduleAutomaticCampaigns(): Promise<void> {
  try {
    console.log("[Email Campaign] Starting automatic reminder campaigns...");
    const results = await sendAllReminderCampaigns();

    for (const result of results) {
      console.log(
        `[Email Campaign] ${result.campaignType}: ${result.emailsSent}/${result.totalRecipients} emails sent (${result.emailsFailed} failed) in ${result.duration}s`
      );
    }
  } catch (error) {
    console.error("[Email Campaign] Error in automatic campaigns:", error);
  }
}
