import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, decimal, boolean, json } from "drizzle-orm/mysql-core";

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
