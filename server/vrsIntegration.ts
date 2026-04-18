/**
 * VRS (Verification Request System) Integration Service
 * Handles synchronization with external document verification systems
 * Manages webhook events, status updates, and document lifecycle
 */

import { getDb } from './db'
import { userDocuments } from '../drizzle/schema'
import { eq } from 'drizzle-orm'

export interface VRSConfig {
  apiUrl: string
  apiKey: string
  webhookSecret: string
  retryAttempts: number
  retryDelayMs: number
  timeoutMs: number
}

export interface VRSDocument {
  externalId: string
  userId: string
  documentType: string
  status: 'pending' | 'processing' | 'verified' | 'rejected' | 'expired'
  verificationScore?: number
  riskLevel?: 'low' | 'medium' | 'high'
  metadata?: Record<string, any>
  timestamp: number
}

export interface VRSWebhookPayload {
  eventType: 'document.verified' | 'document.rejected' | 'document.expired' | 'verification.started'
  documentId: string
  externalId: string
  status: string
  verificationScore?: number
  riskLevel?: string
  reason?: string
  timestamp: number
  signature: string
}

/**
 * VRS Integration Service
 * Manages all interactions with external verification systems
 */
export class VRSIntegrationService {
  private config: VRSConfig
  private retryQueue: Map<string, number> = new Map()

  constructor(config: VRSConfig) {
    this.config = config
  }

  /**
   * Submit document to VRS for verification
   */
  async submitDocumentForVerification(
    userId: string,
    documentId: string,
    documentUrl: string,
    documentType: string
  ): Promise<{ success: boolean; externalId?: string; error?: string }> {
    try {
      const payload = {
        userId,
        documentId,
        documentUrl,
        documentType,
        timestamp: Date.now(),
        callbackUrl: `${process.env.BUILT_IN_FORGE_API_URL}/api/webhooks/vrs`,
      }

      const response = await this.makeRequest('POST', '/documents/submit', payload)

      if (response.success) {
        // Store external ID mapping in metadata
        const db = await getDb()
        if (db) {
          const metadata = {
            externalVerificationId: response.externalId,
            submittedToVRS: true,
            submittedAt: new Date().toISOString(),
          }
          // @ts-ignore
          await db
            .update(userDocuments)
            .set({
              description: JSON.stringify(metadata),
              updatedAt: new Date(),
            })
            // @ts-ignore
            .where(eq(userDocuments.id, parseInt(documentId)))
        }

        return {
          success: true,
          externalId: response.externalId,
        }
      }

      return {
        success: false,
        error: response.error || 'Failed to submit document to VRS',
      }
    } catch (error) {
      console.error('[VRS] Error submitting document:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  }

  /**
   * Fetch verification status from VRS
   */
  async getVerificationStatus(externalId: string): Promise<VRSDocument | null> {
    try {
      const response = await this.makeRequest('GET', `/documents/${externalId}/status`, null)

      if (response.success) {
        return {
          externalId,
          userId: response.userId,
          documentType: response.documentType,
          status: response.status,
          verificationScore: response.verificationScore,
          riskLevel: response.riskLevel,
          metadata: response.metadata,
          timestamp: response.timestamp,
        }
      }

      return null
    } catch (error) {
      console.error('[VRS] Error fetching verification status:', error)
      return null
    }
  }

  /**
   * Process webhook event from VRS
   */
  async processWebhookEvent(payload: VRSWebhookPayload): Promise<boolean> {
    try {
      // Verify webhook signature
      if (!this.verifyWebhookSignature(payload)) {
        console.error('[VRS] Invalid webhook signature')
        return false
      }

      const db = await getDb()
      if (!db) {
        console.error('[VRS] Database not available')
        return false
      }

      // Find document by ID
      // @ts-ignore
      const documents = await db
        .select()
        .from(userDocuments)
        // @ts-ignore
        .where(eq(userDocuments.id, parseInt(payload.documentId)))
        .limit(1)

      const document = documents[0]

      if (!document) {
        console.error('[VRS] Document not found:', payload.documentId)
        return false
      }

      // Handle different event types
      switch (payload.eventType) {
        case 'document.verified':
          await this.handleDocumentVerified(document.id, payload, db)
          break
        case 'document.rejected':
          await this.handleDocumentRejected(document.id, payload, db)
          break
        case 'document.expired':
          await this.handleDocumentExpired(document.id, payload, db)
          break
        case 'verification.started':
          await this.handleVerificationStarted(document.id, payload, db)
          break
      }

      return true
    } catch (error) {
      console.error('[VRS] Error processing webhook event:', error)
      return false
    }
  }

  /**
   * Handle document verified event
   */
  private async handleDocumentVerified(
    documentId: number,
    payload: VRSWebhookPayload,
    db: any
  ): Promise<void> {
    const now = new Date()

    // Update document status
    // @ts-ignore
    await db
      .update(userDocuments)
      .set({
        verificationStatus: 'verified',
        verificationDate: now,
        updatedAt: now,
      })
      // @ts-ignore
      .where(eq(userDocuments.id, documentId))

    console.log('[VRS] Document verified - score:', payload.verificationScore)
    console.log('[VRS] Document verified:', documentId)
  }

  /**
   * Handle document rejected event
   */
  private async handleDocumentRejected(
    documentId: number,
    payload: VRSWebhookPayload,
    db: any
  ): Promise<void> {
    const now = new Date()

    // Update document status
    // @ts-ignore
    await db
      .update(userDocuments)
      .set({
        verificationStatus: 'rejected',
        rejectionReason: payload.reason || 'Failed VRS verification',
        updatedAt: now,
      })
      // @ts-ignore
      .where(eq(userDocuments.id, documentId))

    console.log('[VRS] Document rejected - reason:', payload.reason)
    console.log('[VRS] Document rejected:', documentId)
  }

  /**
   * Handle document expired event
   */
  private async handleDocumentExpired(
    documentId: number,
    payload: VRSWebhookPayload,
    db: any
  ): Promise<void> {
    const now = new Date()

    // @ts-ignore
    await db
      .update(userDocuments)
      .set({
        isExpired: true,
        updatedAt: now,
      })
      // @ts-ignore
      .where(eq(userDocuments.id, documentId))

    console.log('[VRS] Document expired:', documentId)
  }

  /**
   * Handle verification started event
   */
  private async handleVerificationStarted(
    documentId: number,
    payload: VRSWebhookPayload,
    db: any
  ): Promise<void> {
    const now = new Date()

    // @ts-ignore
    await db
      .update(userDocuments)
      .set({
        updatedAt: now,
      })
      // @ts-ignore
      .where(eq(userDocuments.id, documentId))

    console.log('[VRS] Verification started:', documentId)
  }

  /**
   * Retry failed submissions
   */
  async retryFailedSubmissions(): Promise<void> {
    try {
      const db = await getDb()
      if (!db) return

      // Retry documents that failed to submit
      // @ts-ignore
      const failedDocuments = await db
        .select()
        .from(userDocuments)
        // @ts-ignore
        .where(eq(userDocuments.verificationStatus, 'pending'))

      for (const doc of failedDocuments) {
        const docIdStr = String(doc.id)
        const retryCount = this.retryQueue.get(docIdStr) || 0

        if (retryCount < this.config.retryAttempts) {
          console.log(`[VRS] Retrying document submission: ${docIdStr}`)

          const result = await this.submitDocumentForVerification(
            String(doc.userId),
            docIdStr,
            doc.fileUrl,
            doc.documentType
          )

          if (result.success) {
            this.retryQueue.delete(docIdStr)
          } else {
            this.retryQueue.set(docIdStr, retryCount + 1)
          }
        } else {
          // Max retries exceeded - log but don't mark as failed
          this.retryQueue.delete(docIdStr)
        }
      }
    } catch (error) {
      console.error('[VRS] Error retrying failed submissions:', error)
    }
  }

  /**
   * Make HTTP request to VRS API
   */
  private async makeRequest(
    method: string,
    endpoint: string,
    payload: any
  ): Promise<any> {
    const url = `${this.config.apiUrl}${endpoint}`
    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${this.config.apiKey}`,
    }

    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), this.config.timeoutMs)

      const response = await fetch(url, {
        method,
        headers,
        body: payload ? JSON.stringify(payload) : undefined,
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        throw new Error(`VRS API error: ${response.status} ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      console.error('[VRS] API request failed:', error)
      throw error
    }
  }

  /**
   * Verify webhook signature
   */
  private verifyWebhookSignature(payload: VRSWebhookPayload): boolean {
    // In production, verify HMAC signature
    // This is a placeholder implementation
    return payload.signature !== undefined
  }

  /**
   * Sync all pending documents with VRS
   */
  async syncPendingDocuments(): Promise<void> {
    try {
      const db = await getDb()
      if (!db) return

      // @ts-ignore
      const pendingDocuments = await db
        .select()
        .from(userDocuments)
        // @ts-ignore
        .where(eq(userDocuments.verificationStatus, 'pending'))

      for (const doc of pendingDocuments) {
        // Try to get status from VRS
        const metadata = doc.description ? JSON.parse(doc.description) : {}
        if (metadata.externalVerificationId) {
          const status = await this.getVerificationStatus(metadata.externalVerificationId)

          if (status) {
            // Update local status based on VRS status
            if (status.status === 'verified') {
              await this.handleDocumentVerified(doc.id, {
                eventType: 'document.verified',
                documentId: String(doc.id),
                externalId: metadata.externalVerificationId,
                status: 'verified',
                verificationScore: status.verificationScore,
                riskLevel: status.riskLevel,
                timestamp: Date.now(),
                signature: '',
              }, db)
            }
          }
        }
      }
    } catch (error) {
      console.error('[VRS] Error syncing pending documents:', error)
    }
  }
}

/**
 * Initialize VRS service with configuration
 */
export function initializeVRSService(): VRSIntegrationService {
  const config: VRSConfig = {
    apiUrl: process.env.VRS_API_URL || 'https://vrs.example.com/api',
    apiKey: process.env.VRS_API_KEY || '',
    webhookSecret: process.env.VRS_WEBHOOK_SECRET || '',
    retryAttempts: 3,
    retryDelayMs: 5000,
    timeoutMs: 30000,
  }

  return new VRSIntegrationService(config)
}
