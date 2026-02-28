import { z } from "zod";
import { protectedProcedure, router } from "./_core/trpc";
import { TRPCError } from "@trpc/server";
import * as adminDb from "./adminDb";

// Helper to ensure user is admin
const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== "admin") {
    throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
  }
  return next({ ctx });
});

export const adminRouter = router({
  // ============= BOOKINGS =============
  bookings: router({
    list: adminProcedure
      .input(
        z.object({
          limit: z.number().default(50),
          offset: z.number().default(0),
        })
      )
      .query(async ({ input }) => {
        return await adminDb.getAllBookings(input.limit, input.offset);
      }),

    getById: adminProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return await adminDb.getBookingById(input.id);
      }),

    byStatus: adminProcedure
      .input(
        z.object({
          status: z.enum(["pending", "confirmed", "cancelled", "completed"]),
          limit: z.number().default(50),
          offset: z.number().default(0),
        })
      )
      .query(async ({ input }) => {
        return await adminDb.getBookingsByStatus(input.status, input.limit, input.offset);
      }),

    updateStatus: adminProcedure
      .input(
        z.object({
          id: z.number(),
          status: z.enum(["pending", "confirmed", "cancelled", "completed"]),
          paymentStatus: z.enum(["unpaid", "paid", "refunded"]).optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        await adminDb.updateBookingStatus(input.id, input.status, input.paymentStatus);

        // Log action
        await adminDb.createAuditLog({
          adminId: ctx.user.id,
          action: "UPDATE_BOOKING_STATUS",
          entityType: "booking",
          entityId: input.id,
          newValues: { status: input.status, paymentStatus: input.paymentStatus },
          ipAddress: ctx.req.ip,
        });

        return { success: true };
      }),

    stats: adminProcedure.query(async () => {
      return await adminDb.getBookingStats();
    }),
  }),

  // ============= OFFERS =============
  offers: router({
    list: adminProcedure
      .input(
        z.object({
          limit: z.number().default(50),
          offset: z.number().default(0),
        })
      )
      .query(async ({ input }) => {
        return await adminDb.getAllOffers(input.limit, input.offset);
      }),

    getById: adminProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return await adminDb.getOfferById(input.id);
      }),

    active: adminProcedure.query(async () => {
      return await adminDb.getActiveOffers();
    }),

    create: adminProcedure
      .input(
        z.object({
          title: z.string(),
          titleAr: z.string(),
          description: z.string(),
          descriptionAr: z.string(),
          code: z.string(),
          discountType: z.enum(["percentage", "fixed"]),
          discountValue: z.number(),
          maxDiscount: z.number().optional(),
          minBookingAmount: z.number().optional(),
          validFrom: z.date(),
          validUntil: z.date(),
          maxUsage: z.number().optional(),
          applicableRoutes: z.array(z.string()).optional(),
          applicableCabinClasses: z.array(z.string()).optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        const result = await adminDb.createOffer({
          ...input,
          createdBy: ctx.user.id,
        });

        await adminDb.createAuditLog({
          adminId: ctx.user.id,
          action: "CREATE_OFFER",
          entityType: "offer",
          newValues: input,
          ipAddress: ctx.req.ip,
        });

        return result;
      }),

    update: adminProcedure
      .input(
        z.object({
          id: z.number(),
          title: z.string().optional(),
          titleAr: z.string().optional(),
          description: z.string().optional(),
          descriptionAr: z.string().optional(),
          discountValue: z.number().optional(),
          maxDiscount: z.number().optional(),
          validFrom: z.date().optional(),
          validUntil: z.date().optional(),
          isActive: z.boolean().optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        const { id, ...updateData } = input;
        const oldOffer = await adminDb.getOfferById(id);

        await adminDb.updateOffer(id, updateData);

        await adminDb.createAuditLog({
          adminId: ctx.user.id,
          action: "UPDATE_OFFER",
          entityType: "offer",
          entityId: id,
          oldValues: oldOffer,
          newValues: updateData,
          ipAddress: ctx.req.ip,
        });

        return { success: true };
      }),

    delete: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input, ctx }) => {
        const offer = await adminDb.getOfferById(input.id);

        await adminDb.deleteOffer(input.id);

        await adminDb.createAuditLog({
          adminId: ctx.user.id,
          action: "DELETE_OFFER",
          entityType: "offer",
          entityId: input.id,
          oldValues: offer,
          ipAddress: ctx.req.ip,
        });

        return { success: true };
      }),
  }),

  // ============= FLIGHTS =============
  flights: router({
    list: adminProcedure
      .input(
        z.object({
          limit: z.number().default(50),
          offset: z.number().default(0),
        })
      )
      .query(async ({ input }) => {
        return await adminDb.getAllFlights(input.limit, input.offset);
      }),

    getById: adminProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return await adminDb.getFlightById(input.id);
      }),

    create: adminProcedure
      .input(
        z.object({
          flightNumber: z.string(),
          departureAirport: z.string(),
          arrivalAirport: z.string(),
          departureTime: z.date(),
          arrivalTime: z.date(),
          aircraft: z.string(),
          totalSeats: z.number(),
          availableSeats: z.number(),
          economyPrice: z.number(),
          businessPrice: z.number().optional(),
          firstPrice: z.number().optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        const result = await adminDb.createFlight(input);

        await adminDb.createAuditLog({
          adminId: ctx.user.id,
          action: "CREATE_FLIGHT",
          entityType: "flight",
          newValues: input,
          ipAddress: ctx.req.ip,
        });

        return result;
      }),

    update: adminProcedure
      .input(
        z.object({
          id: z.number(),
          availableSeats: z.number().optional(),
          economyPrice: z.number().optional(),
          businessPrice: z.number().optional(),
          firstPrice: z.number().optional(),
          isActive: z.boolean().optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        const { id, ...updateData } = input;
        const oldFlight = await adminDb.getFlightById(id);

        await adminDb.updateFlight(id, updateData);

        await adminDb.createAuditLog({
          adminId: ctx.user.id,
          action: "UPDATE_FLIGHT",
          entityType: "flight",
          entityId: id,
          oldValues: oldFlight,
          newValues: updateData,
          ipAddress: ctx.req.ip,
        });

        return { success: true };
      }),

    delete: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input, ctx }) => {
        const flight = await adminDb.getFlightById(input.id);

        await adminDb.deleteFlight(input.id);

        await adminDb.createAuditLog({
          adminId: ctx.user.id,
          action: "DELETE_FLIGHT",
          entityType: "flight",
          entityId: input.id,
          oldValues: flight,
          ipAddress: ctx.req.ip,
        });

        return { success: true };
      }),
  }),

  // ============= DESTINATIONS =============
  destinations: router({
    list: adminProcedure.query(async () => {
      return await adminDb.getAllDestinations();
    }),

    getById: adminProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return await adminDb.getDestinationById(input.id);
      }),

    create: adminProcedure
      .input(
        z.object({
          code: z.string(),
          name: z.string(),
          nameAr: z.string(),
          description: z.string().optional(),
          descriptionAr: z.string().optional(),
          imageUrl: z.string().optional(),
          basePrice: z.number(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        const result = await adminDb.createDestination(input);

        await adminDb.createAuditLog({
          adminId: ctx.user.id,
          action: "CREATE_DESTINATION",
          entityType: "destination",
          newValues: input,
          ipAddress: ctx.req.ip,
        });

        return result;
      }),

    update: adminProcedure
      .input(
        z.object({
          id: z.number(),
          name: z.string().optional(),
          nameAr: z.string().optional(),
          description: z.string().optional(),
          descriptionAr: z.string().optional(),
          imageUrl: z.string().optional(),
          basePrice: z.number().optional(),
          isActive: z.boolean().optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        const { id, ...updateData } = input;
        const oldDestination = await adminDb.getDestinationById(id);

        await adminDb.updateDestination(id, updateData);

        await adminDb.createAuditLog({
          adminId: ctx.user.id,
          action: "UPDATE_DESTINATION",
          entityType: "destination",
          entityId: id,
          oldValues: oldDestination,
          newValues: updateData,
          ipAddress: ctx.req.ip,
        });

        return { success: true };
      }),
  }),

  // ============= WEBSITE SETTINGS =============
  settings: router({
    list: adminProcedure.query(async () => {
      return await adminDb.getAllWebsiteSettings();
    }),

    get: adminProcedure
      .input(z.object({ key: z.string() }))
      .query(async ({ input }) => {
        return await adminDb.getWebsiteSetting(input.key);
      }),

    update: adminProcedure
      .input(
        z.object({
          key: z.string(),
          value: z.string(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        const oldValue = await adminDb.getWebsiteSetting(input.key);

        await adminDb.updateWebsiteSetting(input.key, input.value, ctx.user.id);

        await adminDb.createAuditLog({
          adminId: ctx.user.id,
          action: "UPDATE_SETTING",
          entityType: "setting",
          oldValues: { value: oldValue?.value },
          newValues: { value: input.value },
          ipAddress: ctx.req.ip,
        });

        return { success: true };
      }),
  }),

  // ============= AUDIT LOGS =============
  auditLogs: router({
    list: adminProcedure
      .input(
        z.object({
          limit: z.number().default(100),
          offset: z.number().default(0),
        })
      )
      .query(async ({ input }) => {
        return await adminDb.getAuditLogs(input.limit, input.offset);
      }),

    byAdmin: adminProcedure
      .input(
        z.object({
          adminId: z.number(),
          limit: z.number().default(50),
          offset: z.number().default(0),
        })
      )
      .query(async ({ input }) => {
        return await adminDb.getAuditLogsByAdmin(input.adminId, input.limit, input.offset);
      }),
  }),
});
