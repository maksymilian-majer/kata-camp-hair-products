import {
  jsonb,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';

// Quiz responses - user's hair profile
export const questionnaires = pgTable('questionnaires', {
  id: uuid('id').primaryKey().defaultRandom(),
  hairType: varchar('hair_type', { length: 50 }).notNull(),
  concerns: jsonb('concerns').$type<string[]>().notNull(),
  goals: jsonb('goals').$type<string[]>().notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Product label scans - what user scanned in store
export const scans = pgTable('scans', {
  id: uuid('id').primaryKey().defaultRandom(),
  questionnaireId: uuid('questionnaire_id')
    .references(() => questionnaires.id)
    .notNull(),
  productName: varchar('product_name', { length: 255 }).notNull(),
  brand: varchar('brand', { length: 100 }),
  ingredients: text('ingredients').notNull(),
  imageUrl: varchar('image_url', { length: 500 }),
  aiAnalysis: jsonb('ai_analysis').$type<AiAnalysis>(),
  compatibilityScore: varchar('compatibility_score', { length: 10 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Saved scans - user's favorites
export const favorites = pgTable('favorites', {
  id: uuid('id').primaryKey().defaultRandom(),
  questionnaireId: uuid('questionnaire_id')
    .references(() => questionnaires.id)
    .notNull(),
  scanId: uuid('scan_id')
    .references(() => scans.id)
    .notNull(),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Type for AI analysis result
export interface AiAnalysis {
  summary: string;
  pros: string[];
  cons: string[];
  recommendation: string;
}

// Export types inferred from schema
export type Questionnaire = typeof questionnaires.$inferSelect;
export type NewQuestionnaire = typeof questionnaires.$inferInsert;

export type Scan = typeof scans.$inferSelect;
export type NewScan = typeof scans.$inferInsert;

export type Favorite = typeof favorites.$inferSelect;
export type NewFavorite = typeof favorites.$inferInsert;
