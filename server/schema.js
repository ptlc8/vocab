import {
  pgTable,
  serial,
  integer,
  smallint,
  text,
  timestamp,
  primaryKey,
  check,
  unique,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

//
// TABLE word
//
export const word = pgTable(
  "word",
  {
    id: serial("id").primaryKey(),

    text: text("text").notNull().unique(),

    difficulty: smallint("difficulty")
      .notNull(),

    register: text("register")
      .notNull(),

    shortDefinition: text("short_definition").notNull(),
    longDefinition: text("long_definition").notNull(),

    origin: text("origin"),
    notes: text("notes"),

    createdAt: timestamp("created_at", {
      mode: "date",
      withTimezone: true,
    })
      .notNull()
      .defaultNow(),

    updatedAt: timestamp("updated_at", {
      mode: "date",
      withTimezone: true,
    })
      .notNull()
      .defaultNow()
      .$onUpdateFn(() => new Date()),
  },
  (t) => [
    check("word_difficulty_between_1_5", sql`${t.difficulty} BETWEEN 1 AND 5`),

    check(
      "word_register_allowed_values",
      sql`${t.register} in ('familier', 'courant', 'soutenu', 'litteraire', 'technique')`,
    ),
  ],
);

//
// TABLE category
//
export const category = pgTable("category", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
});

//
// TABLE word_category (table de jointure)
//
export const wordCategory = pgTable(
  "word_category",
  {
    wordId: integer("word_id")
      .notNull()
      .references(() => word.id, { onDelete: "cascade" }),

    categoryId: integer("category_id")
      .notNull()
      .references(() => category.id, { onDelete: "cascade" }),
  },
  (t) => [
    primaryKey({
      name: "word_category_pkey",
      columns: [t.wordId, t.categoryId],
    }),
  ],
);

//
// TABLE example
//
export const example = pgTable("example", {
  id: serial("id").primaryKey(),
  wordId: integer("word_id")
    .notNull()
    .references(() => word.id, { onDelete: "cascade" }),
  sentence: text("sentence").notNull(),
});

//
// TABLE near_words
//
export const nearWords = pgTable(
  "near_words",
  {
    id: serial("id").primaryKey(),

    word1Id: integer("word1_id")
      .notNull()
      .references(() => word.id, { onDelete: "cascade" }),

    word2Id: integer("word2_id")
      .notNull()
      .references(() => word.id, { onDelete: "cascade" }),
  },
  (t) => [
    check("no_self_near", sql`${t.word1Id} <> ${t.word2Id}`),
    unique("near_words_pair_unique").on(t.word1Id, t.word2Id),
  ],
);

//
// TABLE confusion
//
export const confusion = pgTable(
  "confusion",
  {
    id: serial("id").primaryKey(),

    word1Id: integer("word1_id")
      .notNull()
      .references(() => word.id, { onDelete: "cascade" }),

    word2Id: integer("word2_id")
      .notNull()
      .references(() => word.id, { onDelete: "cascade" }),

    nuance: text("nuance").notNull(),
  },
  (t) => [
    check("no_self_confusion", sql`${t.word1Id} <> ${t.word2Id}`),
    unique("confusion_pair_unique").on(t.word1Id, t.word2Id),
  ],
);
