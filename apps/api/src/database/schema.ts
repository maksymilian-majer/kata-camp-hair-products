// import {
//   jsonb,
//   pgTable,
//   text,
//   timestamp,
//   uuid,
//   varchar,
// } from 'drizzle-orm/pg-core';
// Example:
// Quiz responses - user's hair profile
// export const questionnaires = pgTable('questionnaires', {
//   id: uuid('id').primaryKey().defaultRandom(),
//   userId: uuid('user_id').notNull(),
//   hairType: varchar('hair_type', { length: 50 }).notNull(),
//   concerns: jsonb('concerns').$type<string[]>().notNull(),
//   goals: jsonb('goals').$type<string[]>().notNull(),
//   createdAt: timestamp('created_at').defaultNow().notNull(),
//   deletedAt: timestamp('deleted_at').defaultNow().notNull(),
// });
// Export types inferred from schema
// export type Questionnaire = typeof questionnaires.$inferSelect;
// export type NewQuestionnaire = typeof questionnaires.$inferInsert;
export type DrizzleSchemaTemp = 'drizzle';
