import { wordRouter } from "~/server/api/routers/post";
import { knownRouter } from "~/server/api/routers/known";
import { createTRPCRouter } from "~/server/api/trpc";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  word: wordRouter,
  known: knownRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
