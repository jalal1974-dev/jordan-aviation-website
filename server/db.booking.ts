import { getDb } from "./db";
import { bookings, bookingMilesPoints, flightRoutes, userLoyaltyPoints, milesHistory, loyaltyPointHistory } from "../drizzle/schema";
import { eq, and } from "drizzle-orm";

/**
 * Calculate miles earned based on distance and cabin class
 */
export function calculateMilesEarned(distance: number, cabinClass: string, milesMultiplier: number = 1.0): number {
  // Base: 1 mile per km
  let baseMiles = distance;

  // Apply cabin class multiplier
  const cabinMultipliers: Record<string, number> = {
    economy: 1.0,
    business: 1.5,
    first: 2.0,
  };

  const cabinMultiplier = cabinMultipliers[cabinClass] || 1.0;
  const totalMiles = Math.round(baseMiles * cabinMultiplier * milesMultiplier);

  return totalMiles;
}

/**
 * Calculate loyalty points based on booking amount
 */
export function calculatePointsEarned(baseFare: number, pointsMultiplier: number = 1.0): number {
  // Base: 1 point per dollar spent
  const basePoints = Math.round(baseFare);
  const totalPoints = Math.round(basePoints * pointsMultiplier);

  return totalPoints;
}

/**
 * Get flight distance from routes table
 */
export async function getFlightDistance(departureAirport: string, arrivalAirport: string): Promise<number> {
  const db = await getDb();
  if (!db) return 0;

  const route = await db
    .select()
    .from(flightRoutes)
    .where(
      and(
        eq(flightRoutes.departureAirport, departureAirport),
        eq(flightRoutes.arrivalAirport, arrivalAirport)
      )
    )
    .limit(1);

  return route.length > 0 ? route[0].distance : 0;
}

/**
 * Create booking with automatic miles and points calculation
 */
export async function createBookingWithMilesPoints(
  bookingData: {
    bookingReference: string;
    userId: number;
    flightNumber: string;
    departureAirport: string;
    arrivalAirport: string;
    departureDate: Date;
    returnDate?: Date;
    numberOfPassengers: number;
    cabinClass: string;
    baseFare: number;
    taxes: number;
    addOnsTotal: number;
    totalPrice: number;
    currency: string;
    selectedSeats?: string[];
    passengerDetails?: any[];
  },
  milesMultiplier: number = 1.0,
  pointsMultiplier: number = 1.0
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Get flight distance
  const distance = await getFlightDistance(bookingData.departureAirport, bookingData.arrivalAirport);

  // Calculate miles and points
  const milesEarned = calculateMilesEarned(distance, bookingData.cabinClass, milesMultiplier);
  const pointsEarned = calculatePointsEarned(bookingData.baseFare, pointsMultiplier);

  // Create booking
  const bookingResult = await db.insert(bookings).values({
    bookingReference: bookingData.bookingReference,
    userId: bookingData.userId,
    flightNumber: bookingData.flightNumber,
    departureAirport: bookingData.departureAirport,
    arrivalAirport: bookingData.arrivalAirport,
    departureDate: bookingData.departureDate,
    returnDate: bookingData.returnDate,
    numberOfPassengers: bookingData.numberOfPassengers,
    cabinClass: bookingData.cabinClass as "economy" | "business" | "first",
    baseFare: bookingData.baseFare.toString(),
    taxes: bookingData.taxes.toString(),
    addOnsTotal: bookingData.addOnsTotal.toString(),
    totalPrice: bookingData.totalPrice.toString(),
    currency: bookingData.currency,
    selectedSeats: bookingData.selectedSeats,
    passengerDetails: bookingData.passengerDetails,
    contactEmail: bookingData.passengerDetails?.[0]?.email || "",
    contactPhone: bookingData.passengerDetails?.[0]?.phone || "",
  });

  const bookingId = bookingResult[0].insertId as number;

  // Record miles and points earned
  await db.insert(bookingMilesPoints).values({
    bookingId,
    userId: bookingData.userId,
    milesEarned,
    pointsEarned,
    distance,
    cabinClass: bookingData.cabinClass,
    milesMultiplier: milesMultiplier.toString(),
    pointsMultiplier: pointsMultiplier.toString(),
    baseFare: bookingData.baseFare.toString(),
  });

  // Award miles to user
  if (milesEarned > 0) {
    await db.insert(milesHistory).values({
      userId: bookingData.userId,
      milesChange: milesEarned,
      reason: `Flight booking ${bookingData.bookingReference}`,
      bookingId,
      description: `${bookingData.departureAirport} to ${bookingData.arrivalAirport} (${bookingData.cabinClass})`,
    });
  }

  // Award loyalty points to user
  if (pointsEarned > 0) {
    // Get current loyalty points
    const currentPoints = await db
      .select()
      .from(userLoyaltyPoints)
      .where(eq(userLoyaltyPoints.userId, bookingData.userId))
      .limit(1);

    if (currentPoints.length > 0) {
      // Update existing record
      await db
        .update(userLoyaltyPoints)
        .set({
          totalPoints: currentPoints[0].totalPoints + pointsEarned,
          availablePoints: currentPoints[0].availablePoints + pointsEarned,
        })
        .where(eq(userLoyaltyPoints.userId, bookingData.userId));
    } else {
      // Create new record - need to get a tier first
      await db.insert(userLoyaltyPoints).values({
        userId: bookingData.userId,
        totalPoints: pointsEarned,
        availablePoints: pointsEarned,
        redeemedPoints: 0,
        currentTierId: 1, // Default to first tier
      });
    }

    // Record in history
    await db.insert(loyaltyPointHistory).values({
      userId: bookingData.userId,
      pointsChange: pointsEarned,
      reason: `Flight booking ${bookingData.bookingReference}`,
      bookingId,
      description: `${bookingData.departureAirport} to ${bookingData.arrivalAirport}`,
    });
  }

  return {
    bookingId,
    bookingReference: bookingData.bookingReference,
    milesEarned,
    pointsEarned,
    distance,
  };
}

/**
 * Get booking details with miles and points info
 */
export async function getBookingWithMilesPoints(bookingId: number) {
  const db = await getDb();
  if (!db) return null;

  const booking = await db.select().from(bookings).where(eq(bookings.id, bookingId)).limit(1);

  if (booking.length === 0) {
    return null;
  }

  const milesPoints = await db
    .select()
    .from(bookingMilesPoints)
    .where(eq(bookingMilesPoints.bookingId, bookingId))
    .limit(1);

  return {
    ...booking[0],
    milesPoints: milesPoints.length > 0 ? milesPoints[0] : null,
  };
}

/**
 * Get all bookings for a user
 */
export async function getUserBookings(userId: number) {
  const db = await getDb();
  if (!db) return [];

  const userBookings = await db
    .select()
    .from(bookings)
    .where(eq(bookings.userId, userId));

  // Get miles/points for each booking
  const bookingsWithMiles = await Promise.all(
    userBookings.map(async (booking) => {
      const milesPoints = await db
        .select()
        .from(bookingMilesPoints)
        .where(eq(bookingMilesPoints.bookingId, booking.id))
        .limit(1);

      return {
        ...booking,
        milesPoints: milesPoints.length > 0 ? milesPoints[0] : null,
      };
    })
  );

  return bookingsWithMiles;
}

/**
 * Confirm booking and update status
 */
export async function confirmBooking(bookingId: number, paymentStatus: "paid" | "refunded" = "paid") {
  const db = await getDb();
  if (!db) return null;

  await db
    .update(bookings)
    .set({
      status: "confirmed",
      paymentStatus,
    })
    .where(eq(bookings.id, bookingId));

  return getBookingWithMilesPoints(bookingId);
}

/**
 * Cancel booking and reverse miles/points
 */
export async function cancelBooking(bookingId: number) {
  const db = await getDb();
  if (!db) return null;

  const booking = await getBookingWithMilesPoints(bookingId);

  if (!booking || !booking.milesPoints) {
    return null;
  }

  // Update booking status
  await db
    .update(bookings)
    .set({
      status: "cancelled",
      paymentStatus: "refunded",
    })
    .where(eq(bookings.id, bookingId));

  // Reverse miles
  if (booking.milesPoints.milesEarned > 0) {
    await db.insert(milesHistory).values({
      userId: booking.userId,
      milesChange: -booking.milesPoints.milesEarned,
      reason: `Booking cancellation ${booking.bookingReference}`,
      bookingId,
      description: `Reversed miles from cancelled booking`,
    });
  }

  // Reverse points
  if (booking.milesPoints.pointsEarned > 0) {
    const currentPoints = await db
      .select()
      .from(userLoyaltyPoints)
      .where(eq(userLoyaltyPoints.userId, booking.userId))
      .limit(1);

    if (currentPoints.length > 0) {
      await db
        .update(userLoyaltyPoints)
        .set({
          totalPoints: Math.max(0, currentPoints[0].totalPoints - booking.milesPoints.pointsEarned),
          availablePoints: Math.max(0, currentPoints[0].availablePoints - booking.milesPoints.pointsEarned),
        })
        .where(eq(userLoyaltyPoints.userId, booking.userId));
    }

    await db.insert(loyaltyPointHistory).values({
      userId: booking.userId,
      pointsChange: -booking.milesPoints.pointsEarned,
      reason: `Booking cancellation ${booking.bookingReference}`,
      bookingId,
      description: `Reversed points from cancelled booking`,
    });
  }

  return booking;
}

/**
 * Add flight route for distance calculation
 */
export async function addFlightRoute(
  departureAirport: string,
  arrivalAirport: string,
  distance: number,
  flightDuration: number
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.insert(flightRoutes).values({
    departureAirport,
    arrivalAirport,
    distance,
    flightDuration,
  });
}
