# Jordan Aviation - Project TODO

## Core Features
- [x] Basic homepage layout
- [x] Navigation menu with language/currency switching
- [x] Flight search form
- [x] Destination cards
- [x] Fix nested anchor tag errors

## Loyalty Program
- [x] Create loyalty program database schema (users_loyalty_points, loyalty_tiers, point_history)
- [x] Implement loyalty points calculation logic (points per booking)
- [x] Create loyalty tier system (Bronze, Silver, Gold, Platinum)
- [x] Build loyalty dashboard page for members
- [x] Display current points balance and tier status
- [x] Show point history and redemption options
- [x] Create tRPC procedures for loyalty operations (getPoints, redeemPoints, getTierStatus)
- [x] Write unit tests for loyalty features

## Affiliate Program
- [x] Create affiliate program database schema (affiliates, affiliate_referrals, affiliate_earnings)
- [x] Implement affiliate registration and approval workflow
- [x] Generate unique affiliate referral links/codes
- [x] Build affiliate dashboard page for partners
- [x] Display referral statistics (clicks, conversions, earnings)
- [x] Show commission structure and payment history
- [x] Create tRPC procedures for affiliate operations (registerAffiliate, trackReferral, getEarnings)
- [x] Implement referral tracking and commission calculation
- [x] Write unit tests for affiliate features

## Integration
- [ ] Add loyalty/affiliate links to navigation menu
- [x] Integrate admin panel links into main navigation menu
- [ ] Create admin panel for managing loyalty tiers and affiliate commissions
- [ ] Implement email notifications for loyalty milestones
- [ ] Add affiliate marketing materials (banners, links)
- [ ] Create API endpoints for affiliate tracking

## Testing & Deployment
- [ ] Test loyalty point calculations
- [ ] Test affiliate referral tracking
- [ ] Test commission payouts
- [ ] Performance testing with multiple users
- [ ] Security review for affiliate links
- [ ] Save checkpoint after all features complete

## Admin Panel - Loyalty Management
- [x] Create admin database helpers for loyalty operations
- [x] Build admin tRPC procedures for loyalty tier CRUD
- [x] Build admin tRPC procedures for user point management
- [x] Create loyalty tiers management page
- [x] Create user loyalty points management page
- [x] Add point adjustment functionality
- [x] Create loyalty program analytics dashboard

## Admin Panel - Affiliate Management
- [x] Create admin database helpers for affiliate operations
- [x] Build admin tRPC procedures for affiliate CRUD
- [x] Build admin tRPC procedures for referral management
- [x] Create affiliate applications review page
- [x] Create affiliate directory and management page
- [x] Create referral tracking and management page
- [x] Create commission management and payment page
- [x] Create affiliate program analytics dashboard

## Admin Panel - General
- [x] Create admin dashboard layout with role-based access
- [x] Build admin navigation with program management links
- [ ] Create program settings and configuration page
- [ ] Add audit logging for admin actions
- [x] Create comprehensive analytics and reporting dashboard
- [ ] Implement data export functionality

## Customer Profile & Registration
- [x] Extend database schema for customer profiles (passport info, contact details, preferences)
- [x] Create customer_profiles table with frequent flyer number and miles tracking
- [x] Create customer_preferences table for notification and communication settings
- [x] Build customer registration page with multi-step form
- [x] Implement form validation and error handling
- [x] Create customer profile dashboard page
- [x] Display personal information and travel history
- [x] Show loyalty points and miles balance
- [x] Allow profile updates and preference management
- [x] Create tRPC procedures for profile CRUD operations
- [x] Integrate profile data with loyalty and miles calculation
- [ ] Write unit tests for profile features


## Navigation & User Access
- [x] Add sign-up and sign-in buttons to navigation bar
- [x] Make registration easily accessible from main navigation
- [x] Show user profile menu when logged in
- [x] Display quick access to profile and account settings


## Booking System Integration with Miles & Points
- [x] Extend database schema with bookings table (flight details, passenger info, booking status)
- [x] Add booking_miles_history table to track miles earned per booking
- [x] Create miles calculation logic based on distance and ticket class
- [x] Create loyalty points calculation logic based on booking amount
- [x] Build booking creation tRPC procedure with automatic miles/points award
- [x] Create booking page UI with flight search and selection
- [x] Build passenger details form with validation
- [x] Create payment integration for booking confirmation
- [x] Build booking confirmation page showing earned miles and points
- [ ] Display miles/points breakdown in confirmation email
- [x] Update customer profile with new miles and points balance
- [ ] Create booking history page for customers
- [ ] Write unit tests for booking and miles calculation
- [ ] Write integration tests for complete booking flow


## Booking History Dashboard
- [x] Create booking history database helpers with filtering and sorting
- [x] Build tRPC procedures for booking history retrieval and analytics
- [x] Create booking history dashboard page with table view
- [x] Add filters for date range, route, status, and booking type
- [x] Implement sorting by date, price, miles earned, points earned
- [x] Build booking detail modal showing full trip information
- [ ] Add receipt download functionality (PDF/Email)
- [x] Create analytics section with total miles/points earned
- [ ] Add charts for booking trends and spending patterns
- [x] Implement pagination for large booking lists
- [x] Add search functionality by booking reference or route
- [ ] Create export functionality for booking history (CSV/PDF)
- [ ] Write tests for booking history features


## Miles Redemption System
- [x] Create redemption_options table with reward types (upgrades, free flights, seat upgrades)
- [x] Add redemption_history table to track user redemptions
- [x] Create database helpers for redemption operations
- [x] Build tRPC procedures for fetching available rewards and processing redemptions
- [x] Create miles redemption page with reward catalog
- [x] Display available rewards with miles cost and benefits
- [x] Implement reward filtering by type (flights, upgrades, etc.)
- [x] Build redemption checkout flow with confirmation
- [x] Add redemption history tracking and display
- [ ] Integrate with booking system to apply redeemed upgrades
- [ ] Send redemption confirmation emails
- [ ] Create admin interface to manage redemption options
- [ ] Write tests for redemption features


## Admin Document Verification Dashboard
- [x] Phase 1: Backend admin procedures for document verification
- [x] Phase 2: Admin dashboard UI with document list and preview
- [x] Phase 3: Bulk approval/rejection with filters
- [x] Phase 4: Navigation integration to admin menu
- [x] Phase 5: Testing and validation


## Document Verification Enhancements
- [x] Feature 1: Email Notifications for document verification status
- [x] Feature 2: Document verification analytics dashboard with charts
- [x] Feature 3: Automated document validation with pre-checks


## Advanced Document Verification Features
- [x] Feature 1: Analytics Dashboard UI with charts and statistics
- [x] Feature 2: Document Upload Enhancement with real-time validation feedback
- [x] Feature 3: Bulk Email Campaigns for pending/expiring documents


## Document Verification Workflow Enhancements
- [x] Feature 1: Automated workflows for verification status changes
- [x] Feature 2: Verification Performance Leaderboard for admins
- [x] Feature 3: User Document Status Notifications in dashboard


## Admin Performance Dashboard UI
- [x] Phase 1: Dashboard Layout & Statistics Cards
- [x] Phase 2: Performance Charts & Visualizations
- [x] Phase 3: Leaderboard Table & Filtering
- [x] Phase 4: Performance Details & Drill-down
- [x] Phase 5: Testing & Integration

## Advanced Admin Features
- [x] Feature 1: Verifier drill-down profile pages with performance history
- [x] Feature 2: Performance alerts and email notifications system
- [x] Feature 3: Incentive and bonus calculator tool

## Advanced Admin UI Dashboards
- [ ] Feature 1: Verifier Profile UI Dashboard with charts and drill-down
- [ ] Feature 2: Admin Alert Management Dashboard with severity and escalation
- [ ] Feature 3: Bonus Simulation Tool UI with configuration comparison

## ScheduledReports Router Implementation
- [x] getSchedules - Fetch all scheduled reports for admin
- [x] createSchedule - Create new report schedules
- [x] updateSchedule - Update existing schedules
- [x] deleteSchedule - Delete schedules
- [x] enableSchedule - Enable schedules
- [x] disableSchedule - Disable schedules
- [x] triggerNow - Manually trigger report generation
- [x] In-memory storage implementation (ready for database migration)

## VerifierMetrics Type Extension
- [x] Added accuracy property (alias for verificationAccuracyRate)
- [x] Added avgProcessingHours property (alias for averageProcessingTimeHours)
- [x] Added volumeScore, speedScore, qualityScore properties
- [x] Added lastUpdated, trend, trendPercentage properties
- [x] All properties optional for backward compatibility

## Email Provider Integration
- [x] Multi-provider support (SendGrid, AWS SES, SMTP, Mock)
- [x] Environment-based configuration
- [x] SendGrid API integration
- [x] HTML email template generation
- [x] Professional performance report templates
- [x] Support for attachments and reply-to addresses
- [x] 17 comprehensive unit tests (all passing)

## Testing & Verification
- [x] Email Provider Service tests (7 tests)
- [x] Template Formatting tests (5 tests)
- [x] Configuration tests (2 tests)
- [x] Data Validation tests (3 tests)
- [x] All tests passing successfully


## ScheduledReports Router Integration
- [x] Integrated scheduledReportsRouter into main appRouter
- [x] Registered under admin.reports namespace
- [x] ScheduledReportManager UI can now communicate with backend

## Background Job Scheduler Implementation
- [x] ScheduledJobService with job management (add, remove, update, retrieve)
- [x] Automatic job execution checker (runs every minute)
- [x] Support for daily, weekly, bi-weekly, monthly schedules
- [x] Email integration for automated report delivery
- [x] Execution history tracking and monitoring
- [x] Manual job triggering capability
- [x] Error handling and retry scheduling
- [x] Job status tracking (last execution, next scheduled)
- [x] 24 comprehensive unit tests (all passing)

## Scheduled Job Service Tests
- [x] Job Management tests (5 tests)
- [x] Job Scheduling tests (4 tests)
- [x] Job Status & History tests (3 tests)
- [x] Job Formats tests (3 tests)
- [x] Job Frequencies tests (4 tests)
- [x] Job Enable/Disable tests (3 tests)
- [x] Service Lifecycle tests (2 tests)
- [x] All 24 tests passing successfully


## Dynamic Dates and Prices Implementation
- [x] Create DynamicDateService with May 1, 2026 reference date
- [x] Generate dynamic offers with future dates (5 offers)
- [x] Generate dynamic prices for all routes (6 routes)
- [x] Generate fare calendar for any month
- [x] Generate upcoming flight dates (30+ days)
- [x] Create seed data generators for database
- [x] Create useDynamicDates React hook for frontend
- [x] Update Home.tsx to use dynamic dates
- [x] Update fare calendar display to show May 2026
- [x] Set default departure date to first available future date
- [x] Implement seasonal price adjustments (summer 1.2x, winter 0.8x)
- [x] 32 comprehensive unit tests for DynamicDateService (all passing)
- [x] All dates and prices now future-oriented from May 1, 2026


## Arabic Translation Corrections
- [x] Replace "طير" with "سافر" (correct verb for "fly") throughout website
- [x] Verify company name "الأردنية للطيران" preserved in all instances
- [x] Fix compound words and grammatical structures
- [x] Test Arabic translations in all pages (Home, About, Charter, FlightStatus, Offers)
- [x] Ensure consistency of "سافر" verb usage across all components
