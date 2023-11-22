import { and, eq, inArray, sql } from "drizzle-orm";
import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { known, word } from "~/server/db/schema";

export const knownRouter = createTRPCRouter({
  getAll: publicProcedure.input(z.string()).query(({ ctx, input }) => {
    return ctx.db.query.known.findMany({
      where: (known, { eq }) => eq(known.userId, input),
    });
  }),
  getAllWithWord: publicProcedure.input(z.string()).query(({ ctx, input }) => {
    return ctx.db.query.known.findMany({
      where: (known, { eq }) => eq(known.userId, input),
      with: { word: true },
    });
  }),
  getAllByUserId: publicProcedure.input(z.string()).query(({ ctx, input }) => {
    return ctx.db.query.known.findMany({
      where: (known, { eq }) => eq(known.userId, input),
      with: {
        word: {
          // @ts-ignore
          where: eq(word.userId, input),
        },
      },
    });
  }),
  getUsersWithKnownCount: publicProcedure.query(async ({ ctx }) => {
    const result = await ctx.db
      .select({
        userId: known.userId,
        count: sql<string>`count(${known.id})`,
      })
      .from(known)
      .groupBy(known.userId);
    return result.map((e) => ({ ...e, count: parseInt(e.count) }));
  }),
  getUniqueUserIds: publicProcedure.query(async ({ ctx }) => {
    const result = await ctx.db
      .selectDistinct({ userId: known.userId })
      .from(known);
    return result.map((e) => e.userId);
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
  delete: publicProcedure
    .input(
      z.object({
        userId: z.string().min(1),
        wordId: z.number(),
      }),
    )
    .mutation(async ({ ctx, input: { userId, wordId } }) => {
      return ctx.db
        .delete(known)
        .where(and(eq(known.userId, userId), eq(known.wordId, wordId)));
    }),
  deleteManyById: publicProcedure
    .input(
      z.object({
        userId: z.string(),
        ids: z.array(z.number()),
      }),
    )
    .mutation(async ({ ctx, input: { userId, ids } }) => {
      return ctx.db
        .delete(known)
        .where(and(eq(known.userId, userId), inArray(known.id, ids)));
    }),
  deleteById: publicProcedure
    .input(z.number())
    .mutation(async ({ ctx, input }) => {
      return ctx.db.delete(known).where(eq(known.id, input));
    }),
});
