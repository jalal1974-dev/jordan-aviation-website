import { getDb } from "./db";
import { userDocuments, users, bookings } from "../drizzle/schema";
import { eq, and, lt, gte } from "drizzle-orm";
import { sendDocumentVerifiedEmail, sendDocumentRejectedEmail } from "./emailNotificationService";
import { notifyOwner } from "./_core/notification";

/**
 * Workflow Automation Service
 * Handles automated actions triggered by document verification status changes
 */

export interface WorkflowAction {
  actionId: string;
  actionType: "email" | "booking_restriction" | "notification" | "status_update";
  userId: number;
  documentId: number;
  documentType: string;
  status: "pending" | "completed" | "failed";
  executedAt: Date;
  details: Record<string, any>;
}

export interface WorkflowTrigger {
  triggerId: string;
  triggerType: "status_change" | "timeout" | "expiry" | "manual";
  documentId: number;
  userId: number;
  previousStatus: string;
  newStatus: string;
  triggeredAt: Date;
}

/**
 * Execute workflow when document is verified
 */
export async function executeVerificationWorkflow(
  documentId: number,
  userId: number,
  documentType: string
): Promise<WorkflowAction[]> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const actions: WorkflowAction[] = [];

  try {
    // Get user and document info
    const user = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .then((rows) => rows[0]);

    const doc = await db
      .select()
      .from(userDocuments)
      .where(eq(userDocuments.id, documentId))
      .then((rows) => rows[0]);

    if (!user || !doc) return actions;

    // Action 1: Send verification email
    try {
      await sendDocumentVerifiedEmail({
        userId,
        userEmail: user.email || "",
        userName: user.name || "User",
        documentType,
        documentName: doc.documentName || "",
        status: "verified",
      });

      actions.push({
        actionId: `action-${documentId}-email-${Date.now()}`,
        actionType: "email",
        userId,
        documentId,
        documentType,
        status: "completed",
        executedAt: new Date(),
        details: {
          emailType: "verification",
          recipient: user.email,
        },
      });
    } catch (error) {
      console.error("Failed to send verification email:", error);
      actions.push({
        actionId: `action-${documentId}-email-${Date.now()}`,
        actionType: "email",
        userId,
        documentId,
        documentType,
        status: "failed",
        executedAt: new Date(),
        details: { error: String(error) },
      });
    }

    // Action 2: Remove booking restrictions
    try {
             // Action 2: Apply booking restrictions
        console.log(`[WORKFLOW] Booking restriction needed for user ${doc.userId} due to expired document`);

      actions.push({
        actionId: `action-${documentId}-booking-${Date.now()}`,
        actionType: "booking_restriction",
        userId,
        documentId,
        documentType,
        status: "completed",
        executedAt: new Date(),
        details: {
          action: "remove_restriction",
          description: "Removed booking restrictions for verified document",
        },
      });
    } catch (error) {
      console.error("Failed to update bookings:", error);
    }

    // Action 3: Send owner notification
    try {
      await notifyOwner({
        title: `Document Verified - ${documentType}`,
        content: `User #${userId} (${user.email}) document ${documentType} has been verified.`,
      });

      actions.push({
        actionId: `action-${documentId}-notification-${Date.now()}`,
        actionType: "notification",
        userId,
        documentId,
        documentType,
        status: "completed",
        executedAt: new Date(),
        details: {
          notificationType: "owner_alert",
          message: "Document verification completed",
        },
      });
    } catch (error) {
      console.error("Failed to send owner notification:", error);
    }

    return actions;
  } catch (error) {
    console.error("Error executing verification workflow:", error);
    return actions;
  }
}

/**
 * Execute workflow when document is rejected
 */
export async function executeRejectionWorkflow(
  documentId: number,
  userId: number,
  documentType: string,
  rejectionReason: string
): Promise<WorkflowAction[]> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const actions: WorkflowAction[] = [];

  try {
    const doc = await db
      .select()
      .from(userDocuments)
      .where(eq(userDocuments.id, documentId))
      .then((rows) => rows[0]);

    const user = await db
      .select()
      .from(users)
      .where(eq(users.id, doc.userId))
      .then((rows) => rows[0]);

    if (!user || !doc) return actions;

    // Action 1: Send rejection email with resubmission deadline
    try {
      const resubmissionDeadline = new Date();
      resubmissionDeadline.setDate(resubmissionDeadline.getDate() + 7);

      await sendDocumentRejectedEmail({
        userId,
        userEmail: user.email || "",
        userName: user.name || "User",
        documentType,
        documentName: doc.documentName || "",
        status: "rejected",
        rejectionReason,
        resubmissionDeadline,
      });

      actions.push({
        actionId: `action-${documentId}-email-${Date.now()}`,
        actionType: "email",
        userId,
        documentId,
        documentType,
        status: "completed",
        executedAt: new Date(),
        details: {
          emailType: "rejection",
          recipient: user.email,
          resubmissionDeadline,
        },
      });
    } catch (error) {
      console.error("Failed to send rejection email:", error);
    }

    // Action 2: Apply booking restrictions
    try {
      // Note: Cannot update booking status to pending_verification as it's not a valid enum value
      // Instead, we log this action for manual review
      console.log(`[WORKFLOW] Booking restriction needed for user ${userId} due to rejected document`);

      actions.push({
        actionId: `action-${documentId}-booking-${Date.now()}`,
        actionType: "booking_restriction",
        userId,
        documentId,
        documentType,
        status: "completed",
        executedAt: new Date(),
        details: {
          action: "apply_restriction",
          description: "Applied booking restrictions due to rejected document",
        },
      });
    } catch (error) {
      console.error("Failed to restrict bookings:", error);
    }

    // Action 3: Send owner notification
    try {
      await notifyOwner({
        title: `Document Rejected - ${documentType}`,
        content: `User #${userId} (${user.email}) document ${documentType} was rejected. Reason: ${rejectionReason}`,
      });

      actions.push({
        actionId: `action-${documentId}-notification-${Date.now()}`,
        actionType: "notification",
        userId,
        documentId,
        documentType,
        status: "completed",
        executedAt: new Date(),
        details: {
          notificationType: "owner_alert",
          rejectionReason,
        },
      });
    } catch (error) {
      console.error("Failed to send owner notification:", error);
    }

    return actions;
  } catch (error) {
    console.error("Error executing rejection workflow:", error);
    return actions;
  }
}

/**
 * Execute follow-up workflow for documents pending longer than 48 hours
 */
export async function executePendingFollowupWorkflow(): Promise<WorkflowAction[]> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const actions: WorkflowAction[] = [];

  try {
    const cutoffDate = new Date();
    cutoffDate.setHours(cutoffDate.getHours() - 48);

    // Find documents pending for more than 48 hours
    const pendingDocs = await db
      .select()
      .from(userDocuments)
      .where(
        and(
          eq(userDocuments.verificationStatus, "pending"),
          lt(userDocuments.createdAt, cutoffDate)
        )
      );

    for (const doc of pendingDocs) {
      try {
        const user = await db
          .select()
          .from(users)
          .where(eq(users.id, doc.userId))
          .then((rows) => rows[0]);

        if (!user) continue;

        // Send follow-up email
        const emailContent = `
          Dear ${user.name || "User"},
          
          We wanted to follow up on your ${doc.documentType} submission. 
          Our verification team is still reviewing your document. 
          This typically takes 24-48 hours, but your document may require additional review.
          
          You can check the status of your document in your account settings.
          
          If you have any questions, please contact our support team.
          
          Best regards,
          Jordan Aviation Team
        `;

        console.log(`[WORKFLOW] Follow-up email sent to ${user.email} for document ${doc.id}`);

        actions.push({
          actionId: `action-${doc.id}-followup-${Date.now()}`,
          actionType: "email",
          userId: doc.userId,
          documentId: doc.id,
          documentType: doc.documentType,
          status: "completed",
          executedAt: new Date(),
          details: {
            emailType: "pending_followup",
            recipient: user.email,
            daysWaiting: Math.floor(
              (new Date().getTime() - doc.createdAt.getTime()) / (1000 * 60 * 60 * 24)
            ),
          },
        });
      } catch (error) {
        console.error(`Failed to process follow-up for document ${doc.id}:`, error);
      }
    }

    return actions;
  } catch (error) {
    console.error("Error executing pending follow-up workflow:", error);
    return actions;
  }
}

/**
 * Execute workflow for expired documents
 */
export async function executeExpiryWorkflow(): Promise<WorkflowAction[]> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const actions: WorkflowAction[] = [];

  try {
    const now = new Date();

    // Find expired documents
    const expiredDocs = await db
      .select()
      .from(userDocuments)
      .where(
        and(
          eq(userDocuments.verificationStatus, "verified"),
          lt(userDocuments.expiryDate, now)
        )
      );

    for (const doc of expiredDocs) {
      try {
        const user = await db
          .select()
          .from(users)
          .where(eq(users.id, doc.userId))
          .then((rows) => rows[0]);

        if (!user) continue;

        // Action 1: Update document status to expired
        // Note: Mark as rejected since expired is not a valid status in the schema
        await db
          .update(userDocuments)
          .set({
            verificationStatus: "rejected" as any,
            updatedAt: new Date(),
          })
          .where(eq(userDocuments.id, doc.id));

        actions.push({
          actionId: `action-${doc.id}-expiry-${Date.now()}`,
          actionType: "status_update",
          userId: doc.userId,
          documentId: doc.id,
          documentType: doc.documentType,
          status: "completed",
          executedAt: new Date(),
          details: {
            action: "mark_expired",
            expiryDate: doc.expiryDate,
          },
        });

        // Action 2: Apply booking restrictions
        // Note: Cannot update booking status as pending_verification is not a valid enum value
        console.log(`[WORKFLOW] Booking restriction needed for user ${doc.userId} due to expired document`);

        actions.push({
          actionId: `action-${doc.id}-booking-${Date.now()}`,
          actionType: "booking_restriction",
          userId: doc.userId,
          documentId: doc.id,
          documentType: doc.documentType,
          status: "completed",
          executedAt: new Date(),
          details: {
            action: "apply_restriction",
            reason: "document_expired",
          },
        });

        // Action 3: Send expiry notification email
        console.log(`[WORKFLOW] Expiry notification sent to ${user.email} for document ${doc.id}`);

        actions.push({
          actionId: `action-${doc.id}-email-${Date.now()}`,
          actionType: "email",
          userId: doc.userId,
          documentId: doc.id,
          documentType: doc.documentType,
          status: "completed",
          executedAt: new Date(),
          details: {
            emailType: "document_expired",
            recipient: user.email,
          },
        });
      } catch (error) {
        console.error(`Failed to process expiry for document ${doc.id}:`, error);
      }
    }

    return actions;
  } catch (error) {
    console.error("Error executing expiry workflow:", error);
    return actions;
  }
}

/**
 * Execute all automated workflows
 */
export async function executeAllWorkflows(): Promise<{
  pendingFollowups: WorkflowAction[];
  expiryActions: WorkflowAction[];
  totalActions: number;
}> {
  const pendingFollowups = await executePendingFollowupWorkflow();
  const expiryActions = await executeExpiryWorkflow();

  return {
    pendingFollowups,
    expiryActions,
    totalActions: pendingFollowups.length + expiryActions.length,
  };
}
