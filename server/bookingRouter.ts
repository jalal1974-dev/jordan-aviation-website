import { z } from "zod";
import { protectedProcedure, router } from "./_core/trpc";
import {
  createBookingWithMilesPoints,
  getBookingWithMilesPoints,
  getUserBookings,
  confirmBooking,
  cancelBooking,
  addFlightRoute,
  calculateMilesEarned,
  calculatePointsEarned,
} from "./db.booking";
import { getDb } from "./db";
import { programSettings } from "../drizzle/schema";
import { eq } from "drizzle-orm";

/**
 * Get current miles and points multipliers from settings
 */
async function getMultipliers() {
  const db = await getDb();
  if (!db) return { milesMultiplier: 1.0, pointsMultiplier: 1.0 };

  const milesSettings = await db
    .select()
    .from(programSettings)
    .where(eq(programSettings.settingKey, "milesEarningRate"))
    .limit(1);

  const pointsSettings = await db
    .select()
    .from(programSettings)
    .where(eq(programSettings.settingKey, "loyaltyPointsMultiplier"))
    .limit(1);

  const milesMultiplier = milesSettings.length > 0 ? parseFloat(milesSettings[0].settingValue) : 1.0;
  const pointsMultiplier = pointsSettings.length > 0 ? parseFloat(pointsSettings[0].settingValue) : 1.0;

  return { milesMultiplier, pointsMultiplier };
}

export const bookingRouter = router({
  /**
   * Create a new booking with automatic miles and points calculation
   */
  createBooking: protectedProcedure
    .input(
      z.object({
        flightNumber: z.string(),
        departureAirport: z.string(),
        arrivalAirport: z.string(),
        departureDate: z.date(),
        returnDate: z.date().optional(),
        numberOfPassengers: z.number().min(1),
        cabinClass: z.enum(["economy", "business", "first"]),
        baseFare: z.number().positive(),
        taxes: z.number().min(0),
        addOnsTotal: z.number().min(0),
        totalPrice: z.number().positive(),
        currency: z.string().default("USD"),
        selectedSeats: z.array(z.string()).optional(),
        passengerDetails: z
          .array(
            z.object({
              title: z.string(),
              firstName: z.string(),
              lastName: z.string(),
              email: z.string().email(),
            })
          )
          .optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { milesMultiplier, pointsMultiplier } = await getMultipliers();

      // Generate booking reference
      const bookingReference = `JA${Date.now().toString().slice(-8)}`;

      const result = await createBookingWithMilesPoints(
        {
          ...input,
          bookingReference,
          userId: ctx.user.id,
        },
        milesMultiplier,
        pointsMultiplier
      );

      return result;
    }),

  /**
   * Get booking details with miles and points info
   */
  getBooking: protectedProcedure
    .input(z.object({ bookingId: z.number() }))
    .query(async ({ ctx, input }) => {
      const booking = await getBookingWithMilesPoints(input.bookingId);

      if (!booking || booking.userId !== ctx.user.id) {
        throw new Error("Booking not found");
      }

      return booking;
    }),

  /**
   * Get all bookings for the current user
   */
  getUserBookings: protectedProcedure.query(async ({ ctx }) => {
    return getUserBookings(ctx.user.id);
  }),

  /**
   * Confirm a booking after payment
   */
  confirmBooking: protectedProcedure
    .input(
      z.object({
        bookingId: z.number(),
        paymentStatus: z.enum(["paid", "refunded"]).default("paid"),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const booking = await getBookingWithMilesPoints(input.bookingId);

      if (!booking || booking.userId !== ctx.user.id) {
        throw new Error("Booking not found");
      }

      return confirmBooking(input.bookingId, input.paymentStatus);
    }),

  /**
   * Cancel a booking and reverse miles/points
   */
  cancelBooking: protectedProcedure
    .input(z.object({ bookingId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const booking = await getBookingWithMilesPoints(input.bookingId);

      if (!booking || booking.userId !== ctx.user.id) {
        throw new Error("Booking not found");
      }

      return cancelBooking(input.bookingId);
    }),

  /**
   * Calculate estimated miles and points for a flight
   */
  calculateMilesAndPoints: protectedProcedure
    .input(
      z.object({
        departureAirport: z.string(),
        arrivalAirport: z.string(),
        cabinClass: z.enum(["economy", "business", "first"]),
        baseFare: z.number().positive(),
      })
    )
    .query(async ({ input }) => {
      const { milesMultiplier, pointsMultiplier } = await getMultipliers();

      // For now, use a default distance. In production, you'd look this up
      const distance = 1000; // Default 1000 km

      const milesEarned = calculateMilesEarned(distance, input.cabinClass, milesMultiplier);
      const pointsEarned = calculatePointsEarned(input.baseFare, pointsMultiplier);

      return {
        milesEarned,
        pointsEarned,
        distance,
      };
    }),

  /**
   * Get booking history with miles/points summary
   */
  getBookingHistory: protectedProcedure
    .input(
      z.object({
        limit: z.number().default(10),
        offset: z.number().default(0),
      })
    )
    .query(async ({ ctx, input }) => {
      const bookings = await getUserBookings(ctx.user.id);

      // Calculate totals
      const totalMiles = bookings.reduce((sum, b) => sum + (b.milesPoints?.milesEarned || 0), 0);
      const totalPoints = bookings.reduce((sum, b) => sum + (b.milesPoints?.pointsEarned || 0), 0);

      // Apply pagination
      const paginatedBookings = bookings.slice(input.offset, input.offset + input.limit);

      return {
        bookings: paginatedBookings,
        totalMiles,
        totalPoints,
        totalCount: bookings.length,
      };
    }),
});
