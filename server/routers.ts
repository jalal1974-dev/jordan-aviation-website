import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { adminRouter } from "./adminRouter";
import { adminLoyaltyRouter } from "./adminLoyaltyRouter";
import { adminAffiliateRouter } from "./adminAffiliateRouter";
import { loyaltyRouter } from "./loyaltyRouter";
import { affiliateRouter } from "./affiliateRouter";
import { profileRouter } from "./profileRouter";
import { bookingRouter } from "./bookingRouter";
import { bookingHistoryRouter } from "./bookingHistoryRouter";
import { redemptionRouter } from "./redemptionRouter";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  loyalty: loyaltyRouter,
  affiliate: affiliateRouter,
  profile: profileRouter,
  booking: bookingRouter,
  bookingHistory: bookingHistoryRouter,
  redemption: redemptionRouter,
  admin: router({
    bookings: adminRouter.bookings,
    offers: adminRouter.offers,
    flights: adminRouter.flights,
    destinations: adminRouter.destinations,
    settings: adminRouter.settings,
    auditLogs: adminRouter.auditLogs,
    loyalty: adminLoyaltyRouter,
    affiliate: adminAffiliateRouter,
  }),
});

export type AppRouter = typeof appRouter;
