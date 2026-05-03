import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, decimal, boolean, json, index } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// Bookings Table
export const bookings = mysqlTable("bookings", {
  id: int("id").autoincrement().primaryKey(),
  bookingReference: varchar("bookingReference", { length: 20 }).notNull().unique(),
  userId: int("userId").notNull(),
  flightNumber: varchar("flightNumber", { length: 10 }).notNull(),
  departureAirport: varchar("departureAirport", { length: 3 }).notNull(),
  arrivalAirport: varchar("arrivalAirport", { length: 3 }).notNull(),
  departureDate: timestamp("departureDate").notNull(),
  returnDate: timestamp("returnDate"),
  numberOfPassengers: int("numberOfPassengers").notNull(),
  cabinClass: mysqlEnum("cabinClass", ["economy", "business", "first"]).default("economy").notNull(),
  baseFare: decimal("baseFare", { precision: 10, scale: 2 }).notNull(),
  taxes: decimal("taxes", { precision: 10, scale: 2 }).default("0"),
  addOnsTotal: decimal("addOnsTotal", { precision: 10, scale: 2 }).default("0"),
  totalPrice: decimal("totalPrice", { precision: 10, scale: 2 }).notNull(),
  currency: varchar("currency", { length: 3 }).default("USD").notNull(),
  status: mysqlEnum("status", ["pending", "confirmed", "cancelled", "completed"]).default("pending").notNull(),
  paymentStatus: mysqlEnum("paymentStatus", ["unpaid", "paid", "refunded"]).default("unpaid").notNull(),
  selectedSeats: json("selectedSeats").$type<string[]>(),
  passengerDetails: json("passengerDetails").$type<Array<{
    title: string;
    firstName: string;
    lastName: string;
    email: string;
  }>>(),
  contactEmail: varchar("contactEmail", { length: 320 }).notNull(),
  contactPhone: varchar("contactPhone", { length: 20 }).notNull(),
  specialRequests: text("specialRequests"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Booking = typeof bookings.$inferSelect;
export type InsertBooking = typeof bookings.$inferInsert;

// Offers Table
export const offers = mysqlTable("offers", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  titleAr: varchar("titleAr", { length: 255 }).notNull(),
  description: text("description").notNull(),
  descriptionAr: text("descriptionAr").notNull(),
  code: varchar("code", { length: 50 }).notNull().unique(),
  discountType: mysqlEnum("discountType", ["percentage", "fixed"]).notNull(),
  discountValue: decimal("discountValue", { precision: 10, scale: 2 }).notNull(),
  maxDiscount: decimal("maxDiscount", { precision: 10, scale: 2 }),
  minBookingAmount: decimal("minBookingAmount", { precision: 10, scale: 2 }).default("0"),
  validFrom: timestamp("validFrom").notNull(),
  validUntil: timestamp("validUntil").notNull(),
  maxUsage: int("maxUsage"),
  currentUsage: int("currentUsage").default(0),
  applicableRoutes: json("applicableRoutes").$type<string[]>(),
  applicableCabinClasses: json("applicableCabinClasses").$type<string[]>(),
  isActive: boolean("isActive").default(true).notNull(),
  createdBy: int("createdBy").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Offer = typeof offers.$inferSelect;
export type InsertOffer = typeof offers.$inferInsert;

// Flights Table
export const flights = mysqlTable("flights", {
  id: int("id").autoincrement().primaryKey(),
  flightNumber: varchar("flightNumber", { length: 10 }).notNull().unique(),
  departureAirport: varchar("departureAirport", { length: 3 }).notNull(),
  arrivalAirport: varchar("arrivalAirport", { length: 3 }).notNull(),
  departureTime: timestamp("departureTime").notNull(),
  arrivalTime: timestamp("arrivalTime").notNull(),
  aircraft: varchar("aircraft", { length: 100 }).notNull(),
  totalSeats: int("totalSeats").notNull(),
  availableSeats: int("availableSeats").notNull(),
  economyPrice: decimal("economyPrice", { precision: 10, scale: 2 }).notNull(),
  businessPrice: decimal("businessPrice", { precision: 10, scale: 2 }),
  firstPrice: decimal("firstPrice", { precision: 10, scale: 2 }),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Flight = typeof flights.$inferSelect;
export type InsertFlight = typeof flights.$inferInsert;

// Website Settings Table
export const websiteSettings = mysqlTable("websiteSettings", {
  id: int("id").autoincrement().primaryKey(),
  key: varchar("key", { length: 100 }).notNull().unique(),
  value: text("value").notNull(),
  description: text("description"),
  category: varchar("category", { length: 50 }).notNull(),
  updatedBy: int("updatedBy").notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type WebsiteSetting = typeof websiteSettings.$inferSelect;
export type InsertWebsiteSetting = typeof websiteSettings.$inferInsert;

// Destinations Table
export const destinations = mysqlTable("destinations", {
  id: int("id").autoincrement().primaryKey(),
  code: varchar("code", { length: 3 }).notNull().unique(),
  name: varchar("name", { length: 100 }).notNull(),
  nameAr: varchar("nameAr", { length: 100 }).notNull(),
  description: text("description"),
  descriptionAr: text("descriptionAr"),
  imageUrl: text("imageUrl"),
  basePrice: decimal("basePrice", { precision: 10, scale: 2 }).notNull(),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Destination = typeof destinations.$inferSelect;
export type InsertDestination = typeof destinations.$inferInsert;

// Admin Audit Log Table
export const auditLogs = mysqlTable("auditLogs", {
  id: int("id").autoincrement().primaryKey(),
  adminId: int("adminId").notNull(),
  action: varchar("action", { length: 100 }).notNull(),
  entityType: varchar("entityType", { length: 50 }).notNull(),
  entityId: int("entityId"),
  oldValues: json("oldValues").$type<Record<string, unknown>>(),
  newValues: json("newValues").$type<Record<string, unknown>>(),
  details: text("details"),
  ipAddress: varchar("ipAddress", { length: 45 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type AuditLog = typeof auditLogs.$inferSelect;
export type InsertAuditLog = typeof auditLogs.$inferInsert;

// Loyalty Program Tables
export const loyaltyTiers = mysqlTable("loyaltyTiers", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 50 }).notNull().unique(),
  nameAr: varchar("nameAr", { length: 50 }).notNull(),
  minPoints: int("minPoints").notNull(),
  maxPoints: int("maxPoints"),
  pointsMultiplier: decimal("pointsMultiplier", { precision: 3, scale: 2 }).default("1.00").notNull(),
  benefitsDescription: text("benefitsDescription"),
  benefitsDescriptionAr: text("benefitsDescriptionAr"),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type LoyaltyTier = typeof loyaltyTiers.$inferSelect;
export type InsertLoyaltyTier = typeof loyaltyTiers.$inferInsert;

export const userLoyaltyPoints = mysqlTable("userLoyaltyPoints", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  totalPoints: int("totalPoints").default(0).notNull(),
  availablePoints: int("availablePoints").default(0).notNull(),
  redeemedPoints: int("redeemedPoints").default(0).notNull(),
  currentTierId: int("currentTierId").notNull(),
  pointsExpireAt: timestamp("pointsExpireAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type UserLoyaltyPoints = typeof userLoyaltyPoints.$inferSelect;
export type InsertUserLoyaltyPoints = typeof userLoyaltyPoints.$inferInsert;

export const loyaltyPointHistory = mysqlTable("loyaltyPointHistory", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  pointsChange: int("pointsChange").notNull(),
  reason: varchar("reason", { length: 100 }).notNull(),
  bookingId: int("bookingId"),
  referenceId: varchar("referenceId", { length: 100 }),
  description: text("description"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type LoyaltyPointHistory = typeof loyaltyPointHistory.$inferSelect;
export type InsertLoyaltyPointHistory = typeof loyaltyPointHistory.$inferInsert;

// Affiliate Program Tables
export const affiliates = mysqlTable("affiliates", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  affiliateCode: varchar("affiliateCode", { length: 50 }).notNull().unique(),
  companyName: varchar("companyName", { length: 255 }),
  website: varchar("website", { length: 255 }),
  contactEmail: varchar("contactEmail", { length: 320 }).notNull(),
  contactPhone: varchar("contactPhone", { length: 20 }),
  commissionRate: decimal("commissionRate", { precision: 5, scale: 2 }).default("5.00").notNull(),
  status: mysqlEnum("status", ["pending", "approved", "rejected", "suspended"]).default("pending").notNull(),
  totalEarnings: decimal("totalEarnings", { precision: 12, scale: 2 }).default("0").notNull(),
  totalReferrals: int("totalReferrals").default(0).notNull(),
  totalConversions: int("totalConversions").default(0).notNull(),
  paymentMethod: varchar("paymentMethod", { length: 50 }),
  paymentDetails: json("paymentDetails").$type<Record<string, unknown>>(),
  approvedAt: timestamp("approvedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Affiliate = typeof affiliates.$inferSelect;
export type InsertAffiliate = typeof affiliates.$inferInsert;

export const affiliateReferrals = mysqlTable("affiliateReferrals", {
  id: int("id").autoincrement().primaryKey(),
  affiliateId: int("affiliateId").notNull(),
  referralCode: varchar("referralCode", { length: 50 }).notNull().unique(),
  referredUserId: int("referredUserId"),
  referredEmail: varchar("referredEmail", { length: 320 }),
  status: mysqlEnum("status", ["clicked", "signed_up", "booked", "completed"]).default("clicked").notNull(),
  bookingId: int("bookingId"),
  commissionAmount: decimal("commissionAmount", { precision: 12, scale: 2 }),
  commissionStatus: mysqlEnum("commissionStatus", ["pending", "approved", "paid"]).default("pending").notNull(),
  clickedAt: timestamp("clickedAt"),
  convertedAt: timestamp("convertedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type AffiliateReferral = typeof affiliateReferrals.$inferSelect;
export type InsertAffiliateReferral = typeof affiliateReferrals.$inferInsert;

export const affiliatePayments = mysqlTable("affiliatePayments", {
  id: int("id").autoincrement().primaryKey(),
  affiliateId: int("affiliateId").notNull(),
  amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
  currency: varchar("currency", { length: 3 }).default("USD").notNull(),
  status: mysqlEnum("status", ["pending", "processing", "completed", "failed"]).default("pending").notNull(),
  paymentMethod: varchar("paymentMethod", { length: 50 }).notNull(),
  transactionId: varchar("transactionId", { length: 100 }),
  periodStart: timestamp("periodStart").notNull(),
  periodEnd: timestamp("periodEnd").notNull(),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  completedAt: timestamp("completedAt"),
});

export type AffiliatePayment = typeof affiliatePayments.$inferSelect;
export type InsertAffiliatePayment = typeof affiliatePayments.$inferInsert;

// Customer Profile Tables
export const customerProfiles = mysqlTable("customerProfiles", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().unique(),
  frequentFlyerNumber: varchar("frequentFlyerNumber", { length: 50 }).unique(),
  passportNumber: varchar("passportNumber", { length: 50 }),
  passportCountry: varchar("passportCountry", { length: 2 }),
  dateOfBirth: timestamp("dateOfBirth"),
  nationality: varchar("nationality", { length: 2 }),
  gender: mysqlEnum("gender", ["male", "female", "other"]),
  phoneNumber: varchar("phoneNumber", { length: 20 }),
  alternatePhone: varchar("alternatePhone", { length: 20 }),
  address: text("address"),
  city: varchar("city", { length: 100 }),
  state: varchar("state", { length: 100 }),
  postalCode: varchar("postalCode", { length: 20 }),
  country: varchar("country", { length: 2 }),
  totalMiles: int("totalMiles").default(0).notNull(),
  availableMiles: int("availableMiles").default(0).notNull(),
  redeemedMiles: int("redeemedMiles").default(0).notNull(),
  totalFlights: int("totalFlights").default(0).notNull(),
  totalSpent: decimal("totalSpent", { precision: 12, scale: 2 }).default("0").notNull(),
  lastFlightDate: timestamp("lastFlightDate"),
  profileCompleteness: int("profileCompleteness").default(0).notNull(),
  isVerified: boolean("isVerified").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type CustomerProfile = typeof customerProfiles.$inferSelect;
export type InsertCustomerProfile = typeof customerProfiles.$inferInsert;

export const customerPreferences = mysqlTable("customerPreferences", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().unique(),
  emailNotifications: boolean("emailNotifications").default(true).notNull(),
  smsNotifications: boolean("smsNotifications").default(false).notNull(),
  pushNotifications: boolean("pushNotifications").default(true).notNull(),
  marketingEmails: boolean("marketingEmails").default(true).notNull(),
  loyaltyUpdates: boolean("loyaltyUpdates").default(true).notNull(),
  flightDeals: boolean("flightDeals").default(true).notNull(),
  preferredLanguage: varchar("preferredLanguage", { length: 5 }).default("en").notNull(),
  preferredCurrency: varchar("preferredCurrency", { length: 3 }).default("USD").notNull(),
  seatPreference: varchar("seatPreference", { length: 20 }),
  mealPreference: varchar("mealPreference", { length: 50 }),
  specialRequests: text("specialRequests"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type CustomerPreferences = typeof customerPreferences.$inferSelect;
export type InsertCustomerPreferences = typeof customerPreferences.$inferInsert;

export const milesHistory = mysqlTable("milesHistory", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  milesChange: int("milesChange").notNull(),
  reason: varchar("reason", { length: 100 }).notNull(),
  bookingId: int("bookingId"),
  referenceId: varchar("referenceId", { length: 100 }),
  description: text("description"),
  expiresAt: timestamp("expiresAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type MilesHistory = typeof milesHistory.$inferSelect;
export type InsertMilesHistory = typeof milesHistory.$inferInsert;

// Program Settings Table
export const programSettings = mysqlTable("programSettings", {
  id: int("id").autoincrement().primaryKey(),
  settingKey: varchar("settingKey", { length: 100 }).notNull().unique(),
  settingValue: text("settingValue").notNull(),
  description: text("description"),
  category: varchar("category", { length: 50 }).notNull(), // 'loyalty', 'affiliate', 'general'
  dataType: varchar("dataType", { length: 20 }).notNull(), // 'string', 'number', 'boolean', 'json'
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ProgramSettings = typeof programSettings.$inferSelect;
export type InsertProgramSettings = typeof programSettings.$inferInsert;

// Booking Miles & Points History Table
export const bookingMilesPoints = mysqlTable("bookingMilesPoints", {
  id: int("id").autoincrement().primaryKey(),
  bookingId: int("bookingId").notNull(),
  userId: int("userId").notNull(),
  milesEarned: int("milesEarned").notNull().default(0),
  pointsEarned: int("pointsEarned").notNull().default(0),
  distance: int("distance").notNull(), // in kilometers
  cabinClass: varchar("cabinClass", { length: 20 }).notNull(), // economy, business, first
  milesMultiplier: decimal("milesMultiplier", { precision: 5, scale: 2 }).default("1.0").notNull(),
  pointsMultiplier: decimal("pointsMultiplier", { precision: 5, scale: 2 }).default("1.0").notNull(),
  baseFare: decimal("baseFare", { precision: 10, scale: 2 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type BookingMilesPoints = typeof bookingMilesPoints.$inferSelect;
export type InsertBookingMilesPoints = typeof bookingMilesPoints.$inferInsert;

// Flight Routes Table (for distance calculation)
export const flightRoutes = mysqlTable("flightRoutes", {
  id: int("id").autoincrement().primaryKey(),
  departureAirport: varchar("departureAirport", { length: 3 }).notNull(),
  arrivalAirport: varchar("arrivalAirport", { length: 3 }).notNull(),
  distance: int("distance").notNull(), // in kilometers
  flightDuration: int("flightDuration").notNull(), // in minutes
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type FlightRoute = typeof flightRoutes.$inferSelect;
export type InsertFlightRoute = typeof flightRoutes.$inferInsert;


// Redemption Options Table
export const redemptionOptions = mysqlTable("redemptionOptions", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  nameAr: varchar("nameAr", { length: 100 }).notNull(),
  description: text("description").notNull(),
  descriptionAr: text("descriptionAr").notNull(),
  type: mysqlEnum("type", ["flight_upgrade", "seat_upgrade", "free_flight", "lounge_access", "baggage", "other"]).notNull(),
  milesRequired: int("milesRequired").notNull(),
  category: varchar("category", { length: 50 }).notNull(), // economy_to_business, business_to_first, etc.
  benefits: text("benefits").notNull(), // JSON string describing benefits
  benefitsAr: text("benefitsAr").notNull(), // Arabic version
  image: varchar("image", { length: 500 }), // CDN URL
  isActive: boolean("isActive").default(true).notNull(),
  validFrom: timestamp("validFrom").defaultNow().notNull(),
  validUntil: timestamp("validUntil"),
  maxRedemptionsPerUser: int("maxRedemptionsPerUser"), // null = unlimited
  totalRedemptionsAvailable: int("totalRedemptionsAvailable"), // null = unlimited
  currentRedemptions: int("currentRedemptions").default(0).notNull(),
  sortOrder: int("sortOrder").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type RedemptionOption = typeof redemptionOptions.$inferSelect;
export type InsertRedemptionOption = typeof redemptionOptions.$inferInsert;

// User Redemptions History Table
export const redemptionHistory = mysqlTable("redemptionHistory", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  redemptionOptionId: int("redemptionOptionId").notNull(),
  bookingId: int("bookingId"), // null for non-booking redemptions
  milesSpent: int("milesSpent").notNull(),
  status: mysqlEnum("status", ["pending", "approved", "applied", "cancelled", "expired"]).default("pending").notNull(),
  confirmationCode: varchar("confirmationCode", { length: 20 }).unique(),
  appliedDate: timestamp("appliedDate"),
  expiryDate: timestamp("expiryDate"),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type RedemptionHistory = typeof redemptionHistory.$inferSelect;
export type InsertRedemptionHistory = typeof redemptionHistory.$inferInsert;


// ============================================================================
// USER PROFILE MANAGEMENT FEATURE
// ============================================================================

// Extended User Profile Table
export const userProfiles = mysqlTable(
  "userProfiles",
  {
    id: int("id").autoincrement().primaryKey(),
    userId: int("userId").notNull().unique().references(() => users.id, { onDelete: "cascade" }),
    
    // Personal Information
    firstName: varchar("firstName", { length: 100 }),
    lastName: varchar("lastName", { length: 100 }),
    dateOfBirth: timestamp("dateOfBirth"),
    gender: mysqlEnum("gender", ["male", "female", "other", "prefer_not_to_say"]),
    nationality: varchar("nationality", { length: 100 }),
    
    // Contact Information
    phoneNumber: varchar("phoneNumber", { length: 20 }),
    alternatePhone: varchar("alternatePhone", { length: 20 }),
    
    // Address Information
    street: varchar("street", { length: 255 }),
    city: varchar("city", { length: 100 }),
    state: varchar("state", { length: 100 }),
    postalCode: varchar("postalCode", { length: 20 }),
    country: varchar("country", { length: 100 }),
    
    // Passport Information
    passportNumber: varchar("passportNumber", { length: 50 }),
    passportIssueDate: timestamp("passportIssueDate"),
    passportExpiryDate: timestamp("passportExpiryDate"),
    passportCountry: varchar("passportCountry", { length: 100 }),
    
    // Frequent Flyer Information
    frequentFlyerNumber: varchar("frequentFlyerNumber", { length: 50 }),
    frequentFlyerStatus: varchar("frequentFlyerStatus", { length: 50 }), // bronze, silver, gold, platinum
    
    // Emergency Contact
    emergencyContactName: varchar("emergencyContactName", { length: 100 }),
    emergencyContactPhone: varchar("emergencyContactPhone", { length: 20 }),
    emergencyContactRelation: varchar("emergencyContactRelation", { length: 50 }),
    
    // Profile Completion
    profileCompletionPercentage: int("profileCompletionPercentage").default(0).notNull(),
    isVerified: boolean("isVerified").default(false).notNull(),
    verificationDate: timestamp("verificationDate"),
    
    // Metadata
    profilePhotoUrl: varchar("profilePhotoUrl", { length: 500 }),
    bio: text("bio"),
    preferredLanguage: varchar("preferredLanguage", { length: 10 }).default("en").notNull(),
    
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => {
    return {
      userIdIdx: index("userProfiles_userId_idx").on(table.userId),
      passportNumberIdx: index("userProfiles_passportNumber_idx").on(table.passportNumber),
      frequentFlyerNumberIdx: index("userProfiles_frequentFlyerNumber_idx").on(table.frequentFlyerNumber),
    };
  }
);

export type UserProfile = typeof userProfiles.$inferSelect;
export type InsertUserProfile = typeof userProfiles.$inferInsert;

// User Preferences Table
export const userPreferences = mysqlTable(
  "userPreferences",
  {
    id: int("id").autoincrement().primaryKey(),
    userId: int("userId").notNull().unique().references(() => users.id, { onDelete: "cascade" }),
    
    // Notification Preferences
    emailNotifications: boolean("emailNotifications").default(true).notNull(),
    smsNotifications: boolean("smsNotifications").default(false).notNull(),
    pushNotifications: boolean("pushNotifications").default(true).notNull(),
    
    // Email Notification Types
    bookingConfirmations: boolean("bookingConfirmations").default(true).notNull(),
    flightReminders: boolean("flightReminders").default(true).notNull(),
    promotionalOffers: boolean("promotionalOffers").default(true).notNull(),
    loyaltyUpdates: boolean("loyaltyUpdates").default(true).notNull(),
    newsAndUpdates: boolean("newsAndUpdates").default(false).notNull(),
    
    // Travel Preferences
    preferredSeat: varchar("preferredSeat", { length: 50 }), // window, aisle, middle
    mealPreference: varchar("mealPreference", { length: 50 }), // vegetarian, vegan, kosher, halal, etc.
    wheelchairAssistance: boolean("wheelchairAssistance").default(false).notNull(),
    specialAssistance: text("specialAssistance"),
    
    // Communication Preferences
    preferredContactMethod: varchar("preferredContactMethod", { length: 50 }).default("email").notNull(), // email, sms, phone
    communicationLanguage: varchar("communicationLanguage", { length: 10 }).default("en").notNull(),
    
    // Privacy & Marketing
    shareDataWithPartners: boolean("shareDataWithPartners").default(false).notNull(),
    allowThirdPartyMarketing: boolean("allowThirdPartyMarketing").default(false).notNull(),
    
    // Accessibility
    darkMode: boolean("darkMode").default(false).notNull(),
    largeText: boolean("largeText").default(false).notNull(),
    highContrast: boolean("highContrast").default(false).notNull(),
    
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => {
    return {
      userIdIdx: index("userPreferences_userId_idx").on(table.userId),
    };
  }
);

export type UserPreferences = typeof userPreferences.$inferSelect;
export type InsertUserPreferences = typeof userPreferences.$inferInsert;

// Profile Change History Table (Audit Trail)
export const profileHistory = mysqlTable(
  "profileHistory",
  {
    id: int("id").autoincrement().primaryKey(),
    userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
    
    // Change Details
    fieldName: varchar("fieldName", { length: 100 }).notNull(),
    oldValue: text("oldValue"),
    newValue: text("newValue"),
    changeType: mysqlEnum("changeType", ["created", "updated", "deleted", "verified"]).notNull(),
    
    // Metadata
    changedBy: int("changedBy"), // admin user ID if changed by admin, null if by user
    ipAddress: varchar("ipAddress", { length: 45 }),
    userAgent: text("userAgent"),
    reason: text("reason"),
    
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  (table) => {
    return {
      userIdIdx: index("profileHistory_userId_idx").on(table.userId),
      changedByIdx: index("profileHistory_changedBy_idx").on(table.changedBy),
      createdAtIdx: index("profileHistory_createdAt_idx").on(table.createdAt),
    };
  }
);

export type ProfileHistory = typeof profileHistory.$inferSelect;
export type InsertProfileHistory = typeof profileHistory.$inferInsert;

// User Documents Table
export const userDocuments = mysqlTable(
  "userDocuments",
  {
    id: int("id").autoincrement().primaryKey(),
    userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
    
    // Document Details
    documentType: mysqlEnum("documentType", ["passport", "national_id", "driver_license", "visa", "other"]).notNull(),
    documentName: varchar("documentName", { length: 255 }).notNull(),
    documentNumber: varchar("documentNumber", { length: 100 }),
    
    // File Information
    fileUrl: varchar("fileUrl", { length: 500 }).notNull(), // CDN URL
    fileKey: varchar("fileKey", { length: 255 }).notNull(), // S3 key
    fileName: varchar("fileName", { length: 255 }).notNull(),
    fileSize: int("fileSize").notNull(), // in bytes
    mimeType: varchar("mimeType", { length: 50 }).notNull(),
    
    // Document Validity
    issueDate: timestamp("issueDate"),
    expiryDate: timestamp("expiryDate"),
    isExpired: boolean("isExpired").default(false).notNull(),
    
    // Verification
    verificationStatus: mysqlEnum("verificationStatus", ["pending", "verified", "rejected"]).default("pending").notNull(),
    verificationDate: timestamp("verificationDate"),
    verifiedBy: int("verifiedBy"), // admin user ID
    rejectionReason: text("rejectionReason"),
    
    // Metadata
    description: text("description"),
    isPublic: boolean("isPublic").default(false).notNull(),
    
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => {
    return {
      userIdIdx: index("userDocuments_userId_idx").on(table.userId),
      documentTypeIdx: index("userDocuments_documentType_idx").on(table.documentType),
      verificationStatusIdx: index("userDocuments_verificationStatus_idx").on(table.verificationStatus),
      expiryDateIdx: index("userDocuments_expiryDate_idx").on(table.expiryDate),
    };
  }
);

export type UserDocument = typeof userDocuments.$inferSelect;
export type InsertUserDocument = typeof userDocuments.$inferInsert;

// User Notifications Table
export const userNotifications = mysqlTable(
  "userNotifications",
  {
    id: int("id").autoincrement().primaryKey(),
    userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
    
    // Notification Content
    title: varchar("title", { length: 255 }).notNull(),
    titleAr: varchar("titleAr", { length: 255 }).notNull(),
    message: text("message").notNull(),
    messageAr: text("messageAr").notNull(),
    
    // Notification Type & Category
    type: mysqlEnum("type", [
      "booking_confirmation",
      "flight_reminder",
      "flight_update",
      "booking_update",
      "promotional_offer",
      "loyalty_update",
      "document_verification",
      "payment_confirmation",
      "system_alert",
      "general_message"
    ]).notNull(),
    
    category: mysqlEnum("category", [
      "booking",
      "flight",
      "loyalty",
      "payment",
      "account",
      "promotion",
      "system"
    ]).notNull(),
    
    // Severity Level
    severity: mysqlEnum("severity", ["low", "medium", "high", "critical"]).default("medium").notNull(),
    
    // Related Data
    relatedEntityType: varchar("relatedEntityType", { length: 50 }), // booking, flight, document, etc.
    relatedEntityId: int("relatedEntityId"), // ID of the related entity
    actionUrl: varchar("actionUrl", { length: 500 }), // URL to take action on notification
    
    // Status
    isRead: boolean("isRead").default(false).notNull(),
    readAt: timestamp("readAt"),
    isArchived: boolean("isArchived").default(false).notNull(),
    archivedAt: timestamp("archivedAt"),
    isPinned: boolean("isPinned").default(false).notNull(),
    
    // Metadata
    metadata: json("metadata").$type<Record<string, any>>(),
    
    // Delivery Status
    emailSent: boolean("emailSent").default(false).notNull(),
    smsSent: boolean("smsSent").default(false).notNull(),
    pushSent: boolean("pushSent").default(false).notNull(),
    
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    expiresAt: timestamp("expiresAt"), // Auto-delete old notifications
  },
  (table) => {
    return {
      userIdIdx: index("userNotifications_userId_idx").on(table.userId),
      typeIdx: index("userNotifications_type_idx").on(table.type),
      categoryIdx: index("userNotifications_category_idx").on(table.category),
      isReadIdx: index("userNotifications_isRead_idx").on(table.isRead),
      createdAtIdx: index("userNotifications_createdAt_idx").on(table.createdAt),
      userIdCreatedAtIdx: index("userNotifications_userId_createdAt_idx").on(table.userId, table.createdAt),
    };
  }
);

export type UserNotification = typeof userNotifications.$inferSelect;
export type InsertUserNotification = typeof userNotifications.$inferInsert;
