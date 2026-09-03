import { index, integer, real, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const profiles = sqliteTable('profiles', {
  id: integer('id').primaryKey(),
  name: text('name').notNull(),
  tagline: text('tagline').notNull(),
  shortBio: text('short_bio').notNull(),
  longBio: text('long_bio').notNull(),
  location: text('location').notNull(),
  email: text('email').notNull(),
  phone: text('phone'),
  githubUrl: text('github_url').notNull(),
  scholarUrl: text('scholar_url').notNull(),
  linkedinUrl: text('linkedin_url'),
  profileImageKey: text('profile_image_key'),
  updatedAt: text('updated_at').notNull(),
});

export const projects = sqliteTable('projects', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  title: text('title').notNull(),
  summary: text('summary').notNull(),
  tags: text('tags').notNull(),
  repoUrl: text('repo_url'),
  liveUrl: text('live_url'),
  imageKey: text('image_key'),
  featured: integer('featured', { mode: 'boolean' }).notNull().default(true),
  sortOrder: integer('sort_order').notNull().default(0),
});

export const publications = sqliteTable('publications', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  title: text('title').notNull(),
  authors: text('authors').notNull(),
  venue: text('venue').notNull(),
  year: integer('year').notNull(),
  summary: text('summary').notNull(),
  url: text('url').notNull(),
  imageKey: text('image_key'),
  sortOrder: integer('sort_order').notNull().default(0),
});

export const places = sqliteTable('places', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  city: text('city').notNull(),
  country: text('country').notNull(),
  latitude: real('latitude').notNull(),
  longitude: real('longitude').notNull(),
  year: integer('year'),
  note: text('note'),
  sortOrder: integer('sort_order').notNull().default(0),
});

export const liftEntries = sqliteTable(
  'lift_entries',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    date: text('date').notNull(),
    exercise: text('exercise').notNull(),
    weightLb: real('weight_lb'),
    sets: integer('sets').notNull(),
    reps: integer('reps').notNull(),
    notes: text('notes'),
    createdAt: text('created_at').notNull(),
  },
  (table) => [
    index('idx_lift_entries_exercise_date').on(table.exercise, table.date),
    index('idx_lift_entries_date').on(table.date),
  ],
);

export type ProfileRow = typeof profiles.$inferSelect;
export type ProjectRow = typeof projects.$inferSelect;
export type PublicationRow = typeof publications.$inferSelect;
export type PlaceRow = typeof places.$inferSelect;
export type LiftEntryRow = typeof liftEntries.$inferSelect;
