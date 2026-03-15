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
