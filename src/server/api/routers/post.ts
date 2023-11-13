import { eq } from "drizzle-orm";
import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { word } from "~/server/db/schema";

export const wordRouter = createTRPCRouter({
  create: publicProcedure
    .input(
      z.object({
        name: z.string().min(1),
        translation: z.string().min(1),
        userId: z.string().min(1),
      }),
    )
    .mutation(async ({ ctx, input: { name, translation, userId } }) => {
      await ctx.db.insert(word).values({
        name,
        translation,
        userId,
      });
    }),

  hello: publicProcedure.input(z.string()).query(({ ctx, input }) => {
    console.log("================\n", "input: ", input, "\n================");
    return ctx.db.query.word.findFirst();
  }),
  getAllByUserId: publicProcedure.input(z.string()).query(({ ctx, input }) => {
    return ctx.db.query.word.findMany({
      where: eq(word.userId, input),
    });
  }),
});
