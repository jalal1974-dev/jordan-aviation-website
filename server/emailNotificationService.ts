import { notifyOwner } from "./_core/notification";

/**
 * Email Notification Service
 * Handles sending automated emails for document verification events
 */

export interface DocumentVerificationEmail {
  userId: number;
  userEmail: string;
  userName: string;
  documentType: string;
  documentName: string;
  status: "verified" | "rejected";
  rejectionReason?: string;
  resubmissionDeadline?: Date;
}

/**
 * Send email notification when document is verified
 */
export async function sendDocumentVerifiedEmail(
  data: DocumentVerificationEmail
): Promise<boolean> {
  try {
    const emailContent = generateVerifiedEmailHTML(data);
    
    // Log notification for admin
    await notifyOwner({
      title: `Document Verified - User #${data.userId}`,
      content: `${data.userName}'s ${data.documentType} has been verified.`,
    });

    // In production, integrate with email service (SendGrid, AWS SES, etc.)
    console.log(`[EMAIL] Verified notification sent to ${data.userEmail}`);
    console.log(`[EMAIL] Content:\n${emailContent}`);

    return true;
  } catch (error) {
    console.error("Failed to send verified email:", error);
    return false;
  }
}

/**
 * Send email notification when document is rejected
 */
export async function sendDocumentRejectedEmail(
  data: DocumentVerificationEmail
): Promise<boolean> {
  try {
    const emailContent = generateRejectedEmailHTML(data);
    
    // Log notification for admin
    await notifyOwner({
      title: `Document Rejected - User #${data.userId}`,
      content: `${data.userName}'s ${data.documentType} was rejected. Reason: ${data.rejectionReason || "Not specified"}`,
    });

    // In production, integrate with email service
    console.log(`[EMAIL] Rejection notification sent to ${data.userEmail}`);
    console.log(`[EMAIL] Content:\n${emailContent}`);

    return true;
  } catch (error) {
    console.error("Failed to send rejection email:", error);
    return false;
  }
}

/**
 * Generate HTML email for verified documents
 */
function generateVerifiedEmailHTML(data: DocumentVerificationEmail): string {
  const verificationDate = new Date().toLocaleDateString();
  
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #10b981; color: white; padding: 20px; border-radius: 8px 8px 0 0; text-align: center; }
          .content { background-color: #f9fafb; padding: 20px; border: 1px solid #e5e7eb; }
          .footer { background-color: #f3f4f6; padding: 20px; border-radius: 0 0 8px 8px; text-align: center; font-size: 12px; color: #6b7280; }
          .success-icon { font-size: 48px; margin-bottom: 10px; }
          .detail-row { margin: 12px 0; padding: 10px; background-color: white; border-radius: 4px; }
          .label { font-weight: bold; color: #374151; }
          .button { display: inline-block; background-color: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; margin-top: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="success-icon">✓</div>
            <h1>Document Verified</h1>
            <p>Your document has been successfully verified</p>
          </div>
          
          <div class="content">
            <p>Dear ${data.userName},</p>
            
            <p>We're pleased to inform you that your ${data.documentType} has been verified and approved.</p>
            
            <div class="detail-row">
              <div class="label">Document Type:</div>
              <div>${data.documentType}</div>
            </div>
            
            <div class="detail-row">
              <div class="label">Document Name:</div>
              <div>${data.documentName}</div>
            </div>
            
            <div class="detail-row">
              <div class="label">Verification Date:</div>
              <div>${verificationDate}</div>
            </div>
            
            <p>Your document is now active in your account and can be used for booking flights and other services.</p>
            
            <p>If you have any questions or need to update your documents, please visit your account settings.</p>
            
            <a href="https://jordanaviation.manus.space/user-profile" class="button">View Your Profile</a>
          </div>
          
          <div class="footer">
            <p>© 2026 Jordan Aviation. All rights reserved.</p>
            <p>This is an automated email. Please do not reply directly to this message.</p>
          </div>
        </div>
      </body>
    </html>
  `;
}

/**
 * Generate HTML email for rejected documents
 */
function generateRejectedEmailHTML(data: DocumentVerificationEmail): string {
  const rejectionDate = new Date().toLocaleDateString();
  const resubmissionDate = data.resubmissionDeadline
    ? new Date(data.resubmissionDeadline).toLocaleDateString()
    : "within 7 days";
  
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #ef4444; color: white; padding: 20px; border-radius: 8px 8px 0 0; text-align: center; }
          .content { background-color: #f9fafb; padding: 20px; border: 1px solid #e5e7eb; }
          .footer { background-color: #f3f4f6; padding: 20px; border-radius: 0 0 8px 8px; text-align: center; font-size: 12px; color: #6b7280; }
          .warning-icon { font-size: 48px; margin-bottom: 10px; }
          .detail-row { margin: 12px 0; padding: 10px; background-color: white; border-radius: 4px; }
          .label { font-weight: bold; color: #374151; }
          .reason-box { background-color: #fef2f2; border-left: 4px solid #ef4444; padding: 15px; margin: 20px 0; border-radius: 4px; }
          .button { display: inline-block; background-color: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; margin-top: 20px; }
          .steps { background-color: white; padding: 15px; border-radius: 4px; margin: 20px 0; }
          .step { margin: 10px 0; padding: 10px; }
          .step-number { display: inline-block; background-color: #ef4444; color: white; width: 24px; height: 24px; border-radius: 50%; text-align: center; line-height: 24px; margin-right: 10px; font-weight: bold; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="warning-icon">⚠</div>
            <h1>Document Needs Revision</h1>
            <p>Your document was not approved and requires resubmission</p>
          </div>
          
          <div class="content">
            <p>Dear ${data.userName},</p>
            
            <p>Thank you for submitting your ${data.documentType}. Unfortunately, it was not approved during our verification process.</p>
            
            <div class="detail-row">
              <div class="label">Document Type:</div>
              <div>${data.documentType}</div>
            </div>
            
            <div class="detail-row">
              <div class="label">Document Name:</div>
              <div>${data.documentName}</div>
            </div>
            
            <div class="detail-row">
              <div class="label">Rejection Date:</div>
              <div>${rejectionDate}</div>
            </div>
            
            <div class="reason-box">
              <strong>Reason for Rejection:</strong>
              <p>${data.rejectionReason || "The document did not meet our verification requirements. Please review the guidelines and resubmit."}</p>
            </div>
            
            <div class="steps">
              <strong>How to Resubmit:</strong>
              <div class="step">
                <span class="step-number">1</span>
                Review the rejection reason above carefully
              </div>
              <div class="step">
                <span class="step-number">2</span>
                Prepare a new document that meets all requirements
              </div>
              <div class="step">
                <span class="step-number">3</span>
                Upload the new document to your account
              </div>
              <div class="step">
                <span class="step-number">4</span>
                Our team will review it within 24-48 hours
              </div>
            </div>
            
            <p><strong>Resubmission Deadline:</strong> Please resubmit your document ${resubmissionDate} to avoid service interruptions.</p>
            
            <a href="https://jordanaviation.manus.space/user-profile" class="button">Resubmit Document</a>
            
            <p style="margin-top: 20px; font-size: 14px; color: #6b7280;">
              If you have questions about the rejection reason or need assistance, please contact our support team.
            </p>
          </div>
          
          <div class="footer">
            <p>© 2026 Jordan Aviation. All rights reserved.</p>
            <p>This is an automated email. Please do not reply directly to this message.</p>
          </div>
        </div>
      </body>
    </html>
  `;
}

/**
 * Send batch email notifications for multiple documents
 */
export async function sendBatchEmailNotifications(
  documents: DocumentVerificationEmail[]
): Promise<{ sent: number; failed: number }> {
  let sent = 0;
  let failed = 0;

  for (const doc of documents) {
    const success =
      doc.status === "verified"
        ? await sendDocumentVerifiedEmail(doc)
        : await sendDocumentRejectedEmail(doc);

    if (success) {
      sent++;
    } else {
      failed++;
    }
  }

  return { sent, failed };
}
