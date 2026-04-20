import { emailService } from "./emailProviderService";

/**
 * Scheduled Job Service
 * Manages background jobs for automated report generation and delivery
 * Uses simple interval-based scheduling (can be replaced with node-cron for production)
 */

export interface ScheduledJob {
  id: number;
  name: string;
  frequency: "daily" | "weekly" | "biweekly" | "monthly";
  sendTime: string; // HH:MM format
  recipients: string[];
  format: "csv" | "json" | "html";
  enabled: boolean;
  lastExecuted?: Date;
  nextExecution?: Date;
}

export interface JobExecutionResult {
  jobId: number;
  success: boolean;
  executedAt: Date;
  messageId?: string;
  error?: string;
}

class ScheduledJobService {
  private jobs: Map<number, ScheduledJob> = new Map();
  private executionHistory: JobExecutionResult[] = [];
  private checkInterval: NodeJS.Timeout | null = null;
  private readonly CHECK_INTERVAL_MS = 60000; // Check every minute

  /**
   * Initialize the job scheduler
   */
  async initialize(): Promise<void> {
    console.log("[ScheduledJobService] Initializing job scheduler...");

    // Start the job checker
    this.startJobChecker();

    console.log("[ScheduledJobService] Job scheduler initialized");
  }

  /**
   * Start the background job checker
   */
  private startJobChecker(): void {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
    }

    this.checkInterval = setInterval(() => {
      this.checkAndExecuteJobs();
    }, this.CHECK_INTERVAL_MS);

    console.log("[ScheduledJobService] Job checker started");
  }

  /**
   * Stop the job scheduler
   */
  async shutdown(): Promise<void> {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }

    console.log("[ScheduledJobService] Job scheduler stopped");
  }

  /**
   * Add a scheduled job
   */
  addJob(job: ScheduledJob): void {
    this.jobs.set(job.id, job);
    this.calculateNextExecution(job);
    console.log(`[ScheduledJobService] Job added: ${job.name} (ID: ${job.id})`);
  }

  /**
   * Remove a scheduled job
   */
  removeJob(jobId: number): boolean {
    const removed = this.jobs.delete(jobId);
    if (removed) {
      console.log(`[ScheduledJobService] Job removed: ID ${jobId}`);
    }
    return removed;
  }

  /**
   * Update a scheduled job
   */
  updateJob(jobId: number, updates: Partial<ScheduledJob>): boolean {
    const job = this.jobs.get(jobId);
    if (!job) return false;

    const updatedJob = { ...job, ...updates };
    this.jobs.set(jobId, updatedJob);
    this.calculateNextExecution(updatedJob);
    console.log(`[ScheduledJobService] Job updated: ID ${jobId}`);
    return true;
  }

  /**
   * Get all jobs
   */
  getJobs(): ScheduledJob[] {
    return Array.from(this.jobs.values());
  }

  /**
   * Get execution history
   */
  getExecutionHistory(limit: number = 100): JobExecutionResult[] {
    return this.executionHistory.slice(-limit);
  }

  /**
   * Calculate next execution time for a job
   */
  private calculateNextExecution(job: ScheduledJob): void {
    const now = new Date();
    const [hours, minutes] = job.sendTime.split(":").map(Number);

    let nextExecution = new Date(now);
    nextExecution.setHours(hours, minutes, 0, 0);

    // If the time has already passed today, schedule for next occurrence
    if (nextExecution <= now) {
      switch (job.frequency) {
        case "daily":
          nextExecution.setDate(nextExecution.getDate() + 1);
          break;
        case "weekly":
          nextExecution.setDate(nextExecution.getDate() + 7);
          break;
        case "biweekly":
          nextExecution.setDate(nextExecution.getDate() + 14);
          break;
        case "monthly":
          nextExecution.setMonth(nextExecution.getMonth() + 1);
          break;
      }
    }

    job.nextExecution = nextExecution;
  }

  /**
   * Check and execute jobs that are due
   */
  private async checkAndExecuteJobs(): Promise<void> {
    const now = new Date();
    const jobsToExecute: ScheduledJob[] = [];

    // Find jobs that are due
    for (const job of Array.from(this.jobs.values())) {
      if (
        job.enabled &&
        job.nextExecution &&
        job.nextExecution <= now
      ) {
        jobsToExecute.push(job);
      }
    }

    // Execute jobs
    for (const job of jobsToExecute) {
      await this.executeJob(job);
    }
  }

  /**
   * Execute a single job
   */
  private async executeJob(job: ScheduledJob): Promise<void> {
    console.log(`[ScheduledJobService] Executing job: ${job.name} (ID: ${job.id})`);

    try {
      // Generate report content (placeholder - would be replaced with actual report generation)
      const reportContent = this.generateReportContent(job);

      // Send email
      const emailResult = await emailService.sendEmail({
        to: job.recipients,
        subject: `Performance Report - ${new Date().toLocaleDateString()}`,
        htmlContent: reportContent,
      });

      if (emailResult.success) {
        // Record successful execution
        const result: JobExecutionResult = {
          jobId: job.id,
          success: true,
          executedAt: new Date(),
          messageId: emailResult.messageId,
        };

        this.executionHistory.push(result);
        console.log(
          `[ScheduledJobService] Job executed successfully: ${job.name}`
        );

        // Update job's last executed time and calculate next execution
        job.lastExecuted = new Date();
        this.calculateNextExecution(job);
      } else {
        throw new Error(emailResult.error || "Email send failed");
      }
    } catch (error) {
      // Record failed execution
      const result: JobExecutionResult = {
        jobId: job.id,
        success: false,
        executedAt: new Date(),
        error: error instanceof Error ? error.message : "Unknown error",
      };

      this.executionHistory.push(result);
      console.error(
        `[ScheduledJobService] Job execution failed: ${job.name}`,
        error
      );

      // Reschedule for next occurrence
      this.calculateNextExecution(job);
    }
  }

  /**
   * Generate report content (placeholder)
   */
  private generateReportContent(job: ScheduledJob): string {
    const now = new Date();
    const period = this.getPeriodLabel(job.frequency);

    return emailService.generatePerformanceReportTemplate({
      recipientName: "Admin",
      reportPeriod: period,
      totalVerifiers: 15,
      totalDocumentsProcessed: 1250,
      averageAccuracy: 94.5,
      topPerformers: [
        { name: "John Doe", accuracy: 98.5, documentsProcessed: 250 },
        { name: "Jane Smith", accuracy: 97.2, documentsProcessed: 230 },
        { name: "Ahmed Hassan", accuracy: 96.1, documentsProcessed: 215 },
      ],
      recommendations: [
        "Increase training for verifiers with accuracy below 90%",
        "Implement peer review for high-volume documents",
        "Consider bonus incentives for top performers",
      ],
    });
  }

  /**
   * Get human-readable period label
   */
  private getPeriodLabel(frequency: string): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.toLocaleString("default", { month: "long" });

    switch (frequency) {
      case "daily":
        return `${month} ${now.getDate()}, ${year}`;
      case "weekly":
        const weekStart = new Date(now);
        weekStart.setDate(now.getDate() - now.getDay());
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);
        return `${month} ${weekStart.getDate()}-${weekEnd.getDate()}, ${year}`;
      case "biweekly":
        const biweekStart = new Date(now);
        biweekStart.setDate(now.getDate() - 14);
        return `${biweekStart.toLocaleDateString()} - ${now.toLocaleDateString()}`;
      case "monthly":
        return `${month} ${year}`;
      default:
        return now.toLocaleDateString();
    }
  }

  /**
   * Get job status
   */
  getJobStatus(jobId: number): {
    job?: ScheduledJob;
    lastExecution?: JobExecutionResult;
    nextExecution?: Date;
  } {
    const job = this.jobs.get(jobId);
    if (!job) return {};

    const lastExecution = this.executionHistory
      .filter((r) => r.jobId === jobId)
      .pop();

    return {
      job,
      lastExecution,
      nextExecution: job.nextExecution,
    };
  }

  /**
   * Manually trigger a job
   */
  async triggerJobNow(jobId: number): Promise<JobExecutionResult | null> {
    const job = this.jobs.get(jobId);
    if (!job) return null;

    console.log(
      `[ScheduledJobService] Manually triggering job: ${job.name} (ID: ${jobId})`
    );

    try {
      const reportContent = this.generateReportContent(job);
      const emailResult = await emailService.sendEmail({
        to: job.recipients,
        subject: `Performance Report - Manual Trigger - ${new Date().toLocaleDateString()}`,
        htmlContent: reportContent,
      });

      const result: JobExecutionResult = {
        jobId,
        success: emailResult.success,
        executedAt: new Date(),
        messageId: emailResult.messageId,
        error: emailResult.error,
      };

      this.executionHistory.push(result);
      return result;
    } catch (error) {
      const result: JobExecutionResult = {
        jobId,
        success: false,
        executedAt: new Date(),
        error: error instanceof Error ? error.message : "Unknown error",
      };

      this.executionHistory.push(result);
      return result;
    }
  }
}

export const scheduledJobService = new ScheduledJobService();
