import { eq, and, gte, lte, desc } from "drizzle-orm";
import { bookings, offers, flights, destinations, auditLogs, websiteSettings } from "../drizzle/schema";
import { getDb } from "./db";

// ============= BOOKINGS QUERIES =============

export async function getAllBookings(limit = 50, offset = 0) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db
    .select()
    .from(bookings)
    .orderBy(desc(bookings.createdAt))
    .limit(limit)
    .offset(offset);
}

export async function getBookingById(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.select().from(bookings).where(eq(bookings.id, id)).limit(1);
  return result[0];
}

export async function getBookingsByStatus(status: string, limit = 50, offset = 0) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db
    .select()
    .from(bookings)
    .where(eq(bookings.status, status as any))
    .orderBy(desc(bookings.createdAt))
    .limit(limit)
    .offset(offset);
}

export async function updateBookingStatus(id: number, status: string, paymentStatus?: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const updateData: any = { status };
  if (paymentStatus) updateData.paymentStatus = paymentStatus;

  return await db.update(bookings).set(updateData).where(eq(bookings.id, id));
}

export async function getBookingStats() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db
    .select({
      status: bookings.status,
      count: bookings.id,
    })
    .from(bookings)
    .groupBy(bookings.status);

  return result;
}

// ============= OFFERS QUERIES =============

export async function getAllOffers(limit = 50, offset = 0) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db
    .select()
    .from(offers)
    .orderBy(desc(offers.createdAt))
    .limit(limit)
    .offset(offset);
}

export async function getOfferById(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.select().from(offers).where(eq(offers.id, id)).limit(1);
  return result[0];
}

export async function getActiveOffers() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const now = new Date();
  return await db
    .select()
    .from(offers)
    .where(
      and(
        eq(offers.isActive, true),
        lte(offers.validFrom, now),
        gte(offers.validUntil, now)
      )
    )
    .orderBy(desc(offers.createdAt));
}

export async function createOffer(data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(offers).values(data);
  return result;
}

export async function updateOffer(id: number, data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db.update(offers).set(data).where(eq(offers.id, id));
}

export async function deleteOffer(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db.delete(offers).where(eq(offers.id, id));
}

export async function incrementOfferUsage(offerId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const offer = await getOfferById(offerId);
  if (!offer) throw new Error("Offer not found");

  return await db
    .update(offers)
    .set({ currentUsage: (offer.currentUsage || 0) + 1 })
    .where(eq(offers.id, offerId));
}

// ============= FLIGHTS QUERIES =============

export async function getAllFlights(limit = 50, offset = 0) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db
    .select()
    .from(flights)
    .orderBy(desc(flights.departureTime))
    .limit(limit)
    .offset(offset);
}

export async function getFlightById(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.select().from(flights).where(eq(flights.id, id)).limit(1);
  return result[0];
}

export async function createFlight(data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db.insert(flights).values(data);
}

export async function updateFlight(id: number, data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db.update(flights).set(data).where(eq(flights.id, id));
}

export async function deleteFlight(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db.delete(flights).where(eq(flights.id, id));
}

// ============= DESTINATIONS QUERIES =============

export async function getAllDestinations() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db.select().from(destinations).where(eq(destinations.isActive, true));
}

export async function getDestinationById(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.select().from(destinations).where(eq(destinations.id, id)).limit(1);
  return result[0];
}

export async function createDestination(data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db.insert(destinations).values(data);
}

export async function updateDestination(id: number, data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db.update(destinations).set(data).where(eq(destinations.id, id));
}

// ============= WEBSITE SETTINGS QUERIES =============

export async function getWebsiteSetting(key: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db
    .select()
    .from(websiteSettings)
    .where(eq(websiteSettings.key, key))
    .limit(1);
  return result[0];
}

export async function getAllWebsiteSettings() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db.select().from(websiteSettings);
}

export async function updateWebsiteSetting(key: string, value: string, updatedBy: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const existing = await getWebsiteSetting(key);

  if (existing) {
    return await db
      .update(websiteSettings)
      .set({ value, updatedBy })
      .where(eq(websiteSettings.key, key));
  } else {
    return await db.insert(websiteSettings).values({
      key,
      value,
      category: "general",
      updatedBy,
    });
  }
}

// ============= AUDIT LOG QUERIES =============

export async function createAuditLog(data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db.insert(auditLogs).values(data);
}

export async function getAuditLogs(limit = 100, offset = 0) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db
    .select()
    .from(auditLogs)
    .orderBy(desc(auditLogs.createdAt))
    .limit(limit)
    .offset(offset);
}

export async function getAuditLogsByAdmin(adminId: number, limit = 50, offset = 0) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db
    .select()
    .from(auditLogs)
    .where(eq(auditLogs.adminId, adminId))
    .orderBy(desc(auditLogs.createdAt))
    .limit(limit)
    .offset(offset);
}
