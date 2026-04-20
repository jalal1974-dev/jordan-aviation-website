import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { scheduledJobService, ScheduledJob } from "./scheduledJobService";

describe("Scheduled Job Service Tests", () => {
  beforeEach(async () => {
    // Initialize service before each test
    await scheduledJobService.initialize();
  });

  afterEach(async () => {
    // Shutdown service after each test
    await scheduledJobService.shutdown();
  });

  describe("Job Management", () => {
    it("should add a new job", () => {
      const job: ScheduledJob = {
        id: 1,
        name: "Daily Report",
        frequency: "daily",
        sendTime: "09:00",
        recipients: ["admin@example.com"],
        format: "html",
        enabled: true,
      };

      scheduledJobService.addJob(job);
      const jobs = scheduledJobService.getJobs();

      expect(jobs).toHaveLength(1);
      expect(jobs[0].name).toBe("Daily Report");
    });

    it("should remove a job", () => {
      const job: ScheduledJob = {
        id: 1,
        name: "Test Job",
        frequency: "daily",
        sendTime: "09:00",
        recipients: ["admin@example.com"],
        format: "html",
        enabled: true,
      };

      scheduledJobService.addJob(job);
      expect(scheduledJobService.getJobs()).toHaveLength(1);

      const removed = scheduledJobService.removeJob(1);
      expect(removed).toBe(true);
      expect(scheduledJobService.getJobs()).toHaveLength(0);
    });

    it("should update a job", () => {
      const job: ScheduledJob = {
        id: 1,
        name: "Original Name",
        frequency: "daily",
        sendTime: "09:00",
        recipients: ["admin@example.com"],
        format: "html",
        enabled: true,
      };

      scheduledJobService.addJob(job);
      const updated = scheduledJobService.updateJob(1, { name: "Updated Name" });

      expect(updated).toBe(true);
      const jobs = scheduledJobService.getJobs();
      expect(jobs[0].name).toBe("Updated Name");
    });

    it("should return false when updating non-existent job", () => {
      const updated = scheduledJobService.updateJob(999, { name: "Test" });
      expect(updated).toBe(false);
    });

    it("should retrieve all jobs", () => {
      const job1: ScheduledJob = {
        id: 1,
        name: "Job 1",
        frequency: "daily",
        sendTime: "09:00",
        recipients: ["admin@example.com"],
        format: "html",
        enabled: true,
      };

      const job2: ScheduledJob = {
        id: 2,
        name: "Job 2",
        frequency: "weekly",
        sendTime: "10:00",
        recipients: ["admin@example.com"],
        format: "csv",
        enabled: true,
      };

      scheduledJobService.addJob(job1);
      scheduledJobService.addJob(job2);

      const jobs = scheduledJobService.getJobs();
      expect(jobs).toHaveLength(2);
      expect(jobs.map((j) => j.name)).toContain("Job 1");
      expect(jobs.map((j) => j.name)).toContain("Job 2");
    });
  });

  describe("Job Scheduling", () => {
    it("should calculate next execution for daily job", () => {
      const job: ScheduledJob = {
        id: 1,
        name: "Daily Job",
        frequency: "daily",
        sendTime: "09:00",
        recipients: ["admin@example.com"],
        format: "html",
        enabled: true,
      };

      scheduledJobService.addJob(job);
      const status = scheduledJobService.getJobStatus(1);

      expect(status.nextExecution).toBeDefined();
      expect(status.nextExecution?.getHours()).toBe(9);
      expect(status.nextExecution?.getMinutes()).toBe(0);
    });

    it("should calculate next execution for weekly job", () => {
      const job: ScheduledJob = {
        id: 1,
        name: "Weekly Job",
        frequency: "weekly",
        sendTime: "10:00",
        recipients: ["admin@example.com"],
        format: "html",
        enabled: true,
      };

      scheduledJobService.addJob(job);
      const status = scheduledJobService.getJobStatus(1);

      expect(status.nextExecution).toBeDefined();
      expect(status.nextExecution?.getHours()).toBe(10);
    });

    it("should calculate next execution for monthly job", () => {
      const job: ScheduledJob = {
        id: 1,
        name: "Monthly Job",
        frequency: "monthly",
        sendTime: "08:00",
        recipients: ["admin@example.com"],
        format: "html",
        enabled: true,
      };

      scheduledJobService.addJob(job);
      const status = scheduledJobService.getJobStatus(1);

      expect(status.nextExecution).toBeDefined();
      expect(status.nextExecution?.getHours()).toBe(8);
    });

    it("should handle multiple recipients", () => {
      const job: ScheduledJob = {
        id: 1,
        name: "Multi-recipient Job",
        frequency: "daily",
        sendTime: "09:00",
        recipients: [
          "admin1@example.com",
          "admin2@example.com",
          "admin3@example.com",
        ],
        format: "html",
        enabled: true,
      };

      scheduledJobService.addJob(job);
      const status = scheduledJobService.getJobStatus(1);

      expect(status.job?.recipients).toHaveLength(3);
    });
  });

  describe("Job Status and History", () => {
    it("should track execution history", () => {
      const job: ScheduledJob = {
        id: 1,
        name: "Test Job",
        frequency: "daily",
        sendTime: "09:00",
        recipients: ["admin@example.com"],
        format: "html",
        enabled: true,
      };

      scheduledJobService.addJob(job);
      const history = scheduledJobService.getExecutionHistory();

      expect(Array.isArray(history)).toBe(true);
    });

    it("should return job status", () => {
      const job: ScheduledJob = {
        id: 1,
        name: "Status Test Job",
        frequency: "daily",
        sendTime: "09:00",
        recipients: ["admin@example.com"],
        format: "html",
        enabled: true,
      };

      scheduledJobService.addJob(job);
      const status = scheduledJobService.getJobStatus(1);

      expect(status.job).toBeDefined();
      expect(status.job?.name).toBe("Status Test Job");
      expect(status.nextExecution).toBeDefined();
    });

    it("should return null status for non-existent job", () => {
      const status = scheduledJobService.getJobStatus(999);

      expect(status.job).toBeUndefined();
    });
  });

  describe("Job Formats", () => {
    it("should support HTML format", () => {
      const job: ScheduledJob = {
        id: 1,
        name: "HTML Job",
        frequency: "daily",
        sendTime: "09:00",
        recipients: ["admin@example.com"],
        format: "html",
        enabled: true,
      };

      scheduledJobService.addJob(job);
      const jobs = scheduledJobService.getJobs();

      expect(jobs[0].format).toBe("html");
    });

    it("should support CSV format", () => {
      const job: ScheduledJob = {
        id: 1,
        name: "CSV Job",
        frequency: "daily",
        sendTime: "09:00",
        recipients: ["admin@example.com"],
        format: "csv",
        enabled: true,
      };

      scheduledJobService.addJob(job);
      const jobs = scheduledJobService.getJobs();

      expect(jobs[0].format).toBe("csv");
    });

    it("should support JSON format", () => {
      const job: ScheduledJob = {
        id: 1,
        name: "JSON Job",
        frequency: "daily",
        sendTime: "09:00",
        recipients: ["admin@example.com"],
        format: "json",
        enabled: true,
      };

      scheduledJobService.addJob(job);
      const jobs = scheduledJobService.getJobs();

      expect(jobs[0].format).toBe("json");
    });
  });

  describe("Job Frequencies", () => {
    it("should support daily frequency", () => {
      const job: ScheduledJob = {
        id: 1,
        name: "Daily",
        frequency: "daily",
        sendTime: "09:00",
        recipients: ["admin@example.com"],
        format: "html",
        enabled: true,
      };

      scheduledJobService.addJob(job);
      expect(scheduledJobService.getJobs()[0].frequency).toBe("daily");
    });

    it("should support weekly frequency", () => {
      const job: ScheduledJob = {
        id: 1,
        name: "Weekly",
        frequency: "weekly",
        sendTime: "09:00",
        recipients: ["admin@example.com"],
        format: "html",
        enabled: true,
      };

      scheduledJobService.addJob(job);
      expect(scheduledJobService.getJobs()[0].frequency).toBe("weekly");
    });

    it("should support bi-weekly frequency", () => {
      const job: ScheduledJob = {
        id: 1,
        name: "Bi-weekly",
        frequency: "biweekly",
        sendTime: "09:00",
        recipients: ["admin@example.com"],
        format: "html",
        enabled: true,
      };

      scheduledJobService.addJob(job);
      expect(scheduledJobService.getJobs()[0].frequency).toBe("biweekly");
    });

    it("should support monthly frequency", () => {
      const job: ScheduledJob = {
        id: 1,
        name: "Monthly",
        frequency: "monthly",
        sendTime: "09:00",
        recipients: ["admin@example.com"],
        format: "html",
        enabled: true,
      };

      scheduledJobService.addJob(job);
      expect(scheduledJobService.getJobs()[0].frequency).toBe("monthly");
    });
  });

  describe("Job Enable/Disable", () => {
    it("should support enabled jobs", () => {
      const job: ScheduledJob = {
        id: 1,
        name: "Enabled Job",
        frequency: "daily",
        sendTime: "09:00",
        recipients: ["admin@example.com"],
        format: "html",
        enabled: true,
      };

      scheduledJobService.addJob(job);
      expect(scheduledJobService.getJobs()[0].enabled).toBe(true);
    });

    it("should support disabled jobs", () => {
      const job: ScheduledJob = {
        id: 1,
        name: "Disabled Job",
        frequency: "daily",
        sendTime: "09:00",
        recipients: ["admin@example.com"],
        format: "html",
        enabled: false,
      };

      scheduledJobService.addJob(job);
      expect(scheduledJobService.getJobs()[0].enabled).toBe(false);
    });

    it("should allow toggling job enabled state", () => {
      const job: ScheduledJob = {
        id: 1,
        name: "Toggle Job",
        frequency: "daily",
        sendTime: "09:00",
        recipients: ["admin@example.com"],
        format: "html",
        enabled: true,
      };

      scheduledJobService.addJob(job);
      expect(scheduledJobService.getJobs()[0].enabled).toBe(true);

      scheduledJobService.updateJob(1, { enabled: false });
      expect(scheduledJobService.getJobs()[0].enabled).toBe(false);

      scheduledJobService.updateJob(1, { enabled: true });
      expect(scheduledJobService.getJobs()[0].enabled).toBe(true);
    });
  });

  describe("Service Lifecycle", () => {
    it("should initialize without errors", async () => {
      const service = scheduledJobService;
      expect(service).toBeDefined();
    });

    it("should shutdown without errors", async () => {
      const service = scheduledJobService;
      await service.shutdown();
      expect(service).toBeDefined();
    });
  });
});
