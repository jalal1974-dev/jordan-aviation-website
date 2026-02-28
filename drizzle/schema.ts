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