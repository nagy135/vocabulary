import { eq } from "drizzle-orm";
import { z } from "zod";
import { levenshteinDistance } from "~/helpers";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { word } from "~/server/db/schema";
const DISTANCE = 1;

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
      const words = await ctx.db.query.word.findMany();
      const matches: [number, string][] = [];
      for (const word of words) {
        if (!word.name || !word.translation) continue;
        const nameDistance = levenshteinDistance(word.name, name);
        const translationDistance = levenshteinDistance(
          word.translation,
          translation,
        );

        if (nameDistance <= DISTANCE || translationDistance <= DISTANCE)
          matches.push([
            Math.min(nameDistance, translationDistance),
            `${word.name} => ${word.translation}`,
          ]);
      }
      if (matches.length) {
        matches.sort((a, b) => (a[0] < b[0] ? -1 : 1));
        throw Error(matches.map((e) => e[1]).join(", "));
      }
      const result = await ctx.db.insert(word).values({
        name,
        translation,
        userId,
      });
      return result;
    }),

  getAllByUserId: publicProcedure.input(z.string()).query(({ ctx, input }) => {
    return ctx.db.query.word.findMany({
      where: eq(word.userId, input),
    });
  }),
  getAll: publicProcedure.query(({ ctx }) => {
    return ctx.db.query.word.findMany();
  }),
});
