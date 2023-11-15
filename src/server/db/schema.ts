// Example model schema from the Drizzle docs
// https://orm.drizzle.team/docs/sql-schema-declaration

import { relations, sql } from "drizzle-orm";
import {
  bigint,
  index,
  mysqlTableCreator,
  timestamp,
  varchar,
} from "drizzle-orm/mysql-core";

/**
 * This is an example of how to use the multi-project schema feature of Drizzle ORM. Use the same
 * database instance for multiple projects.
 *
 * @see https://orm.drizzle.team/docs/goodies#multi-project-schema
 */
export const mysqlTable = mysqlTableCreator((name) => `vocabulary_${name}`);

export const word = mysqlTable(
  "word",
  {
    id: bigint("id", { mode: "number" }).primaryKey().autoincrement(),
    name: varchar("name", { length: 256 }),
    translation: varchar("translation", { length: 256 }),
    userId: varchar("user_id", { length: 256 }).notNull(),
    createdAt: timestamp("created_at")
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp("updatedAt").onUpdateNow(),
  },
  (example) => ({
    nameIndex: index("name_idx").on(example.name),
  }),
);

export type SelectWord = typeof word.$inferSelect;
export type InsertWord = typeof word.$inferInsert;

export const known = mysqlTable("known", {
  id: bigint("id", { mode: "number" }).primaryKey().autoincrement(),
  userId: varchar("user_id", { length: 256 }).notNull(),
  wordId: bigint("word_id", { mode: "number" }).notNull(),
  createdAt: timestamp("created_at")
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  updatedAt: timestamp("updatedAt").onUpdateNow(),
});

export const knownRelations = relations(known, ({ one }) => ({
  word: one(word, {
    fields: [known.wordId],
    references: [word.id],
  }),
}));

export type SelectKnown = typeof known.$inferSelect;
export type InsertKnown = typeof known.$inferInsert;
