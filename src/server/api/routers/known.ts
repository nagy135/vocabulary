import { eq } from "drizzle-orm";
import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { known } from "~/server/db/schema";

export const knownRouter = createTRPCRouter({
  getAllByUserId: publicProcedure.input(z.string()).query(({ ctx, input }) => {
    return ctx.db.query.known.findMany({
      where: eq(known.userId, input),
    });
  }),
  create: publicProcedure
    .input(
      z.object({
        userId: z.string().min(1),
        wordId: z.number(),
      }),
    )
    .mutation(async ({ ctx, input: { userId, wordId } }) => {
      return ctx.db.insert(known).values({
        userId,
        wordId,
      });
    }),
});
