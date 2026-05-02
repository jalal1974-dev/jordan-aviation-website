# Jordan Aviation - Integration Requirements & Secrets Documentation

**Last Updated**: May 2, 2026

---

## Overview

This document outlines all external integrations, required environment secrets, and configuration information needed to fully deploy and operate the Jordan Aviation platform. Please provide these details when ready, and they will be configured in the system.

---

## 1. VRS Integration (Document Verification System)

### Purpose
The VRS (Verification & Recognition System) handles automated document verification, OCR processing, and fraud detection for user-submitted documents.

### Required Secrets

| Secret Name | Type | Description | Example | Status |
|---|---|---|---|---|
| `VRS_API_URL` | URL | Base URL for VRS API endpoint | `https://api.vrs-provider.com/v1` | ⏳ Pending |
| `VRS_API_KEY` | API Key | Authentication key for VRS API requests | `vrs_key_xxxxxxxxxxxxx` | ⏳ Pending |
| `VRS_WEBHOOK_SECRET` | Secret | Secret key for validating VRS webhook signatures | `webhook_secret_xxxxxxxxxxxxx` | ⏳ Pending |

### Integration Points
- **Document Upload**: When users upload documents, they are sent to VRS for verification
- **Webhook Handler**: VRS sends verification results back via webhook at `/api/vrs/webhook`
- **Admin Dashboard**: Verification status and results displayed in admin panel
- **Notifications**: Real-time alerts sent when verification completes

### Configuration File
- Location: `server/vrsIntegration.ts`
- Router: `server/routers.ts` (under `admin.vrs` namespace)

### Testing
- Mock VRS responses available for development
- Set `VRS_API_URL` to mock endpoint or use mock provider for testing

---

## 2. Email Provider Integration

### Purpose
Sends transactional emails for:
- Document verification notifications
- Performance alerts and reports
- Scheduled report delivery
- Admin notifications

### Supported Providers

#### Option A: SendGrid (Recommended)
| Secret Name | Type | Description | Example | Status |
|---|---|---|---|---|
| `EMAIL_PROVIDER` | String | Set to `sendgrid` | `sendgrid` | ⏳ Pending |
| `SENDGRID_API_KEY` | API Key | SendGrid API key | `SG.xxxxxxxxxxxxx` | ⏳ Pending |

**Setup Steps**:
1. Create SendGrid account at https://sendgrid.com
2. Generate API key in Settings > API Keys
3. Provide the API key value

#### Option B: AWS SES (Simple Email Service)
| Secret Name | Type | Description | Example | Status |
|---|---|---|---|---|
| `EMAIL_PROVIDER` | String | Set to `aws-ses` | `aws-ses` | ⏳ Pending |
| `AWS_REGION` | String | AWS region | `us-east-1` | ⏳ Pending |
| `AWS_ACCESS_KEY_ID` | Access Key | AWS access key | `AKIAIOSFODNN7EXAMPLE` | ⏳ Pending |
| `AWS_SECRET_ACCESS_KEY` | Secret Key | AWS secret key | `wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY` | ⏳ Pending |

**Setup Steps**:
1. Create AWS account and enable SES
2. Verify sender email address in SES
3. Generate IAM access keys with SES permissions
4. Provide credentials

#### Option C: SMTP Server
| Secret Name | Type | Description | Example | Status |
|---|---|---|---|---|
| `EMAIL_PROVIDER` | String | Set to `smtp` | `smtp` | ⏳ Pending |
| `SMTP_HOST` | Hostname | SMTP server hostname | `smtp.gmail.com` | ⏳ Pending |
| `SMTP_PORT` | Number | SMTP server port | `587` | ⏳ Pending |
| `SMTP_USER` | Email | SMTP authentication username | `noreply@jordanaviation.com` | ⏳ Pending |
| `SMTP_PASSWORD` | Password | SMTP authentication password | `app_password_xxxxx` | ⏳ Pending |
| `SMTP_FROM_EMAIL` | Email | Sender email address | `noreply@jordanaviation.com` | ⏳ Pending |

**Setup Steps**:
1. Configure SMTP server (Gmail, Office365, custom server)
2. Generate app-specific password if required
3. Provide connection details

#### Option D: Mock Provider (Development Only)
| Secret Name | Type | Description | Example | Status |
|---|---|---|---|---|
| `EMAIL_PROVIDER` | String | Set to `mock` | `mock` | ✅ Ready |

**Features**: Logs emails to console instead of sending

### Configuration File
- Location: `server/emailProviderService.ts`
- Router: `server/routers.ts` (under `admin.reports` namespace)

### Email Templates
- Performance reports: HTML formatted with charts and metrics
- Document notifications: Status updates and action items
- Alert notifications: Severity-based formatting

---

## 3. Real-time Notification System

### Purpose
Delivers real-time admin notifications via WebSocket for:
- Document verification events
- Performance alerts
- System events
- Scheduled report completion

### Configuration
- **Service**: `server/websocketNotificationService.ts`
- **Persistence**: `server/notificationPersistenceService.ts`
- **Integration**: `server/notificationIntegrationRouter.ts`

### Features
- Real-time WebSocket connections
- Notification history (100 per admin)
- Read/unread status tracking
- Severity-based categorization
- Admin-specific filtering

### No Additional Secrets Required
- Uses built-in Manus OAuth for authentication
- No external service dependencies

---

## 4. Scheduled Report System

### Purpose
Automatically generates and delivers performance reports on configured schedules

### Configuration
- **Service**: `server/scheduledJobService.ts`
- **Router**: `server/routers.ts` (under `admin.reports` namespace)
- **UI**: `client/src/pages/ScheduledReportManager.tsx`

### Features
- Daily, weekly, bi-weekly, monthly schedules
- Multiple email recipients
- CSV, JSON, HTML export formats
- Execution history tracking
- Manual trigger capability

### Required Secrets
- Email provider secrets (see Section 2)

---

## 5. Dynamic Dates & Pricing System

### Purpose
Generates future-dated offers and prices relative to May 1, 2026 reference date

### Configuration
- **Service**: `server/dynamicDateService.ts`
- **Reference Date**: May 1, 2026 (UTC)
- **Seed Data**: `server/seedData.ts`

### Features
- Automatic seasonal price adjustments
- Future-dated offer generation
- Fare calendar generation
- Upcoming flight dates

### No Additional Secrets Required
- Uses system date/time only

---

## 6. Document Verification Workflow

### Purpose
Complete workflow for document submission, verification, and user notifications

### Configuration
- **Database**: `drizzle/schema.ts` (userDocuments, documentVerifications tables)
- **Services**: 
  - `server/bulkEmailCampaignService.ts`
  - `server/documentUploadRouter.ts`
  - `server/documentVerificationRouter.ts`

### Required Secrets
- Email provider secrets (see Section 2)
- VRS integration secrets (see Section 1)

### Features
- Real-time upload validation
- Risk scoring and recommendations
- Bulk email campaigns
- Automated workflow triggers

---

## 7. Admin Performance & Analytics

### Purpose
Comprehensive admin dashboards for verifier performance, alerts, and bonus calculations

### Configuration
- **Dashboards**:
  - `client/src/pages/AdminPerformanceDashboard.tsx`
  - `client/src/pages/VerifierProfileDashboard.tsx`
- **Services**:
  - `server/performanceLeaderboardRouter.ts`
  - `server/performanceAnalyticsExportService.ts`
  - `server/bonusCalculatorService.ts`

### Features
- Real-time performance metrics
- Performance alerts and escalation
- Bonus simulation and calculation
- Export functionality (CSV, JSON, HTML)
- Bilingual support (English/Arabic)

### No Additional Secrets Required
- Uses internal database only

---

## 8. Language & Localization

### Purpose
Bilingual support (English/Arabic) with RTL layout

### Configuration
- **Context**: `client/src/contexts/LanguageContext.tsx`
- **Translations**: Comprehensive admin dashboard translations added
- **Components**: All admin pages support language switching

### Supported Languages
- English (en)
- Arabic (ar) with RTL layout

### No Additional Secrets Required
- Uses client-side language selection

---

## Summary of Required Actions

### Immediate Actions (Required for Production)

- [ ] **Choose Email Provider**: Select one of the four options (SendGrid, AWS SES, SMTP, or Mock)
- [ ] **Provide Email Provider Credentials**: Supply the required secrets for chosen provider
- [ ] **Provide VRS Integration Details**: Supply VRS API URL, key, and webhook secret
- [ ] **Test Email Delivery**: Verify emails are being sent correctly
- [ ] **Test VRS Integration**: Verify document verification workflow

### Optional Enhancements

- [ ] Configure custom SMTP server for email delivery
- [ ] Set up AWS SES for high-volume email sending
- [ ] Configure SendGrid for advanced email analytics
- [ ] Set up additional VRS providers for redundancy

---

## Integration Timeline

| Phase | Component | Status | Dependencies |
|---|---|---|---|
| ✅ Phase 1 | Real-time Notification System | Complete | None |
| ✅ Phase 2 | Service Initialization | Complete | None |
| ✅ Phase 3 | Arabic Language Support | Complete | None |
| ⏳ Phase 4 | VRS Integration Secrets | Pending | User input |
| ⏳ Phase 5 | Email Provider Secrets | Pending | User input |
| ⏳ Phase 6 | End-to-end Testing | Pending | Phases 4-5 |
| ⏳ Phase 7 | Production Deployment | Pending | All phases |

---

## How to Provide Secrets

When you're ready to provide the secrets, please share them in one of these formats:

### Format 1: Direct Message
```
VRS_API_URL: https://api.vrs-provider.com/v1
VRS_API_KEY: vrs_key_xxxxxxxxxxxxx
VRS_WEBHOOK_SECRET: webhook_secret_xxxxxxxxxxxxx
EMAIL_PROVIDER: sendgrid
SENDGRID_API_KEY: SG.xxxxxxxxxxxxx
```

### Format 2: JSON
```json
{
  "VRS_API_URL": "https://api.vrs-provider.com/v1",
  "VRS_API_KEY": "vrs_key_xxxxxxxxxxxxx",
  "VRS_WEBHOOK_SECRET": "webhook_secret_xxxxxxxxxxxxx",
  "EMAIL_PROVIDER": "sendgrid",
  "SENDGRID_API_KEY": "SG.xxxxxxxxxxxxx"
}
```

### Format 3: Environment File
```
VRS_API_URL=https://api.vrs-provider.com/v1
VRS_API_KEY=vrs_key_xxxxxxxxxxxxx
VRS_WEBHOOK_SECRET=webhook_secret_xxxxxxxxxxxxx
EMAIL_PROVIDER=sendgrid
SENDGRID_API_KEY=SG.xxxxxxxxxxxxx
```

---

## Support & Questions

For questions about any of these integrations or to provide the required secrets, please let me know:
- Which email provider you'd like to use
- Your VRS provider details
- Any other integration requirements

I'll configure everything once you provide the necessary information.

---

**Next Steps**: 
1. Review this document
2. Gather the required secrets from your service providers
3. Provide them when ready
4. I'll configure and test the integrations
5. System will be ready for production deployment
