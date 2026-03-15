import { z } from "zod";
import { protectedProcedure, router } from "./_core/trpc";
import { bookings, bookingMilesPoints, milesHistory, loyaltyPointHistory } from "../drizzle/schema";
import { eq, and, gte, lte, desc, sql } from "drizzle-orm";
import { getDb } from "./db";

export const bookingHistoryRouter = router({
  /**
   * Get paginated booking history with filters and sorting
   */
  getBookingHistory: protectedProcedure
    .input(
      z.object({
        limit: z.number().max(100).default(10),
        offset: z.number().default(0),
        sortBy: z.enum(["date", "price", "milesEarned", "pointsEarned"]).default("date"),
        sortOrder: z.enum(["asc", "desc"]).default("desc"),
        dateFrom: z.date().optional(),
        dateTo: z.date().optional(),
        status: z.enum(["pending", "confirmed", "cancelled", "completed"]).optional(),
        searchQuery: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) return { bookings: [], total: 0 };

      // Build conditions array
      const conditions = [eq(bookings.userId, ctx.user.id)];

      if (input.dateFrom) {
        conditions.push(gte(bookings.departureDate, input.dateFrom));
      }

      if (input.dateTo) {
        conditions.push(lte(bookings.departureDate, input.dateTo));
      }

      if (input.status) {
        conditions.push(eq(bookings.status, input.status));
      }

      if (input.searchQuery) {
        const searchTerm = `%${input.searchQuery}%`;
        conditions.push(
          sql`(${bookings.bookingReference} LIKE ${searchTerm} OR 
              ${bookings.departureAirport} LIKE ${searchTerm} OR 
              ${bookings.arrivalAirport} LIKE ${searchTerm} OR
              ${bookings.flightNumber} LIKE ${searchTerm})`
        );
      }

      // Build base query
      let query: any = db
        .select({
          id: bookings.id,
          bookingReference: bookings.bookingReference,
          flightNumber: bookings.flightNumber,
          departureAirport: bookings.departureAirport,
          arrivalAirport: bookings.arrivalAirport,
          departureDate: bookings.departureDate,
          returnDate: bookings.returnDate,
          numberOfPassengers: bookings.numberOfPassengers,
          cabinClass: bookings.cabinClass,
          totalPrice: bookings.totalPrice,
          currency: bookings.currency,
          status: bookings.status,
          paymentStatus: bookings.paymentStatus,
          createdAt: bookings.createdAt,
          milesEarned: bookingMilesPoints.milesEarned,
          pointsEarned: bookingMilesPoints.pointsEarned,
          distance: bookingMilesPoints.distance,
        })
        .from(bookings)
        .leftJoin(bookingMilesPoints, eq(bookings.id, bookingMilesPoints.bookingId))
        .where(and(...conditions));

      // Apply sorting
      const sortMap: Record<string, any> = {
        date: bookings.departureDate,
        price: bookings.totalPrice,
        milesEarned: bookingMilesPoints.milesEarned,
        pointsEarned: bookingMilesPoints.pointsEarned,
      };

      const sortColumn = sortMap[input.sortBy] || bookings.departureDate;
      query = query.orderBy(
        input.sortOrder === "desc" ? desc(sortColumn) : sortColumn
      );

      // Get total count
      const countResult = await db
        .select({ count: sql<number>`count(*)` })
        .from(bookings)
        .where(and(...conditions));

      const total = countResult[0]?.count || 0;

      // Apply pagination
      const bookingList = await query.limit(input.limit).offset(input.offset);

      return {
        bookings: bookingList,
        total,
        limit: input.limit,
        offset: input.offset,
      };
    }),

  /**
   * Get detailed booking information
   */
  getBookingDetail: protectedProcedure
    .input(z.object({ bookingId: z.number() }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) return null;

      const booking = await db
        .select()
        .from(bookings)
        .where(and(eq(bookings.id, input.bookingId), eq(bookings.userId, ctx.user.id)))
        .limit(1);

      if (booking.length === 0) return null;

      const milesPoints = await db
        .select()
        .from(bookingMilesPoints)
        .where(eq(bookingMilesPoints.bookingId, input.bookingId))
        .limit(1);

      return {
        ...booking[0],
        milesPoints: milesPoints.length > 0 ? milesPoints[0] : null,
      };
    }),

  /**
   * Get booking statistics and analytics
   */
  getBookingStatistics: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) {
      return {
        totalBookings: 0,
        totalMilesEarned: 0,
        totalPointsEarned: 0,
        totalSpent: 0,
        averageBookingValue: 0,
        topDestination: null,
        bookingsByStatus: {},
        bookingsByMonth: [],
      };
    }

    // Get all bookings for user
    const userBookings = (await db
      .select()
      .from(bookings)
      .where(eq(bookings.userId, ctx.user.id))) as any[];

    // Get miles and points
    const milesData = (await db
      .select()
      .from(bookingMilesPoints)
      .where(
        sql`${bookingMilesPoints.bookingId} IN (SELECT id FROM bookings WHERE userId = ${ctx.user.id})`
      )) as any[];

    // Calculate totals
    const totalMilesEarned = milesData.reduce((sum, m) => sum + (m.milesEarned || 0), 0);
    const totalPointsEarned = milesData.reduce((sum, m) => sum + (m.pointsEarned || 0), 0);
    const totalSpent = userBookings.reduce(
      (sum, b) => sum + parseFloat(b.totalPrice.toString()),
      0
    );
    const averageBookingValue =
      userBookings.length > 0 ? totalSpent / userBookings.length : 0;

    // Find top destination
    const destinationCounts: Record<string, number> = {};
    userBookings.forEach((b) => {
      const key = `${b.departureAirport}-${b.arrivalAirport}`;
      destinationCounts[key] = (destinationCounts[key] || 0) + 1;
    });

    const topDestination =
      Object.entries(destinationCounts).sort(([, a], [, b]) => b - a)[0]?.[0] || null;

    // Bookings by status
    const bookingsByStatus: Record<string, number> = {};
    userBookings.forEach((b) => {
      bookingsByStatus[b.status] = (bookingsByStatus[b.status] || 0) + 1;
    });

    // Bookings by month (last 12 months)
    const bookingsByMonth: Array<{ month: string; count: number; totalSpent: number }> = [];
    const now = new Date();
    for (let i = 11; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthKey = date.toISOString().slice(0, 7);
      const monthBookings = userBookings.filter(
        (b) => new Date(b.createdAt).toISOString().slice(0, 7) === monthKey
      );
      bookingsByMonth.push({
        month: monthKey,
        count: monthBookings.length,
        totalSpent: monthBookings.reduce(
          (sum, b) => sum + parseFloat(b.totalPrice.toString()),
          0
        ),
      });
    }

    return {
      totalBookings: userBookings.length,
      totalMilesEarned,
      totalPointsEarned,
      totalSpent: Math.round(totalSpent * 100) / 100,
      averageBookingValue: Math.round(averageBookingValue * 100) / 100,
      topDestination,
      bookingsByStatus,
      bookingsByMonth,
    };
  }),

  /**
   * Get miles and points history
   */
  getRewardsHistory: protectedProcedure
    .input(
      z.object({
        limit: z.number().max(100).default(20),
        offset: z.number().default(0),
        type: z.enum(["miles", "points", "all"]).default("all"),
      })
    )
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) return { history: [], total: 0 };

      let milesHistory_: any[] = [];
      let pointsHistory_: any[] = [];

      if (input.type === "miles" || input.type === "all") {
        milesHistory_ = (await db
          .select()
          .from(milesHistory)
          .where(eq(milesHistory.userId, ctx.user.id))
          .orderBy(desc(milesHistory.createdAt))
          .limit(input.limit)
          .offset(input.offset)) as any[];
      }

      if (input.type === "points" || input.type === "all") {
        pointsHistory_ = (await db
          .select()
          .from(loyaltyPointHistory)
          .where(eq(loyaltyPointHistory.userId, ctx.user.id))
          .orderBy(desc(loyaltyPointHistory.createdAt))
          .limit(input.limit)
          .offset(input.offset)) as any[];
      }

      // Combine and sort
      const combined = [
        ...milesHistory_.map((m) => ({
          ...m,
          type: "miles" as const,
          amount: m.milesChange,
          createdAt: m.createdAt,
        })),
        ...pointsHistory_.map((p) => ({
          ...p,
          type: "points" as const,
          amount: p.pointsChange,
          createdAt: p.createdAt,
        })),
      ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

      return {
        history: combined.slice(0, input.limit),
        total: combined.length,
      };
    }),

  /**
   * Export booking history as CSV or JSON
   */
  exportBookingHistory: protectedProcedure
    .input(
      z.object({
        format: z.enum(["csv", "json"]).default("csv"),
        dateFrom: z.date().optional(),
        dateTo: z.date().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) return null;

      const conditions = [eq(bookings.userId, ctx.user.id)];

      if (input.dateFrom) {
        conditions.push(gte(bookings.departureDate, input.dateFrom));
      }

      if (input.dateTo) {
        conditions.push(lte(bookings.departureDate, input.dateTo));
      }

      const bookingList = (await db
        .select()
        .from(bookings)
        .where(and(...conditions))
        .orderBy(desc(bookings.departureDate))) as any[];

      if (input.format === "json") {
        return JSON.stringify(bookingList, null, 2);
      }

      // Generate CSV
      const headers = [
        "Booking Reference",
        "Flight Number",
        "Route",
        "Departure Date",
        "Passengers",
        "Cabin Class",
        "Total Price",
        "Currency",
        "Status",
        "Payment Status",
        "Booked Date",
      ];

      const rows = bookingList.map((b: any) => [
        b.bookingReference,
        b.flightNumber,
        `${b.departureAirport}-${b.arrivalAirport}`,
        new Date(b.departureDate).toISOString().split("T")[0],
        b.numberOfPassengers,
        b.cabinClass,
        parseFloat(b.totalPrice.toString()).toFixed(2),
        b.currency,
        b.status,
        b.paymentStatus,
        new Date(b.createdAt).toISOString().split("T")[0],
      ]);

      const csv = [headers, ...rows]
        .map((row) => row.map((cell) => `"${cell}"`).join(","))
        .join("\n");

      return csv;
    }),
});
