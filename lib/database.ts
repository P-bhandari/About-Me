import { portfolioCurationSql } from './portfolio-curation';
import { portfolioVisibilityCorrectionSql } from './portfolio-visibility-correction';
import { projectMigrationSql } from './project-migration';
import { toPublicProfile, type PublicSiteData } from './site-data';
import { env } from 'cloudflare:workers';
import { fallbackProfile, fallbackProjects, fallbackPublications, type SiteData } from './site-data';

let schemaReady: Promise<void> | null = null;

export function getDatabase(): D1Database {
  if (!env.DB) throw new Error('Database binding is unavailable');
  return env.DB;
}

export async function ensureDatabase() {
  if (schemaReady) return schemaReady;
  schemaReady = initialize(getDatabase()).catch(error => { schemaReady = null; throw error; });
  return schemaReady;
}

async function initialize(db: D1Database) {
  await db.batch([
    db.prepare('CREATE TABLE IF NOT EXISTS site_content_migrations (name TEXT PRIMARY KEY NOT NULL)'),
    db.prepare(`CREATE TABLE IF NOT EXISTS profiles (
      id INTEGER PRIMARY KEY, name TEXT NOT NULL, tagline TEXT NOT NULL,
      short_bio TEXT NOT NULL, long_bio TEXT NOT NULL, location TEXT NOT NULL,
      email TEXT NOT NULL, phone TEXT, github_url TEXT NOT NULL,
      scholar_url TEXT NOT NULL, linkedin_url TEXT, profile_image_key TEXT,
      updated_at TEXT NOT NULL
    )`),
    db.prepare(`CREATE TABLE IF NOT EXISTS projects (
      id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT NOT NULL, summary TEXT NOT NULL,
      tags TEXT NOT NULL, repo_url TEXT, live_url TEXT, image_key TEXT,
      featured INTEGER NOT NULL DEFAULT 1, published INTEGER NOT NULL DEFAULT 1, archived INTEGER NOT NULL DEFAULT 0, sort_order INTEGER NOT NULL DEFAULT 0
    )`),
    db.prepare(`CREATE TABLE IF NOT EXISTS publications (
      id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT NOT NULL, authors TEXT NOT NULL,
      venue TEXT NOT NULL, year INTEGER NOT NULL, summary TEXT NOT NULL, url TEXT NOT NULL,
      image_key TEXT, sort_order INTEGER NOT NULL DEFAULT 0
    )`),
    db.prepare(`CREATE TABLE IF NOT EXISTS places (
      id INTEGER PRIMARY KEY AUTOINCREMENT, city TEXT NOT NULL, country TEXT NOT NULL,
      latitude REAL NOT NULL, longitude REAL NOT NULL, year INTEGER, note TEXT,
      sort_order INTEGER NOT NULL DEFAULT 0
    )`),
    db.prepare(`CREATE TABLE IF NOT EXISTS lift_entries (
      id INTEGER PRIMARY KEY AUTOINCREMENT, date TEXT NOT NULL, exercise TEXT NOT NULL,
      weight_lb REAL, sets INTEGER NOT NULL, reps INTEGER NOT NULL, notes TEXT,
      created_at TEXT NOT NULL
    )`),
    db.prepare('CREATE INDEX IF NOT EXISTS idx_lift_entries_exercise_date ON lift_entries(exercise, date)'),
    db.prepare('CREATE INDEX IF NOT EXISTS idx_lift_entries_date ON lift_entries(date)'),
  ]);

  await db.prepare(`INSERT OR IGNORE INTO profiles
    (id, name, tagline, short_bio, long_bio, location, email, phone, github_url, scholar_url, linkedin_url, profile_image_key, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
    .bind(fallbackProfile.id, fallbackProfile.name, fallbackProfile.tagline, fallbackProfile.shortBio, fallbackProfile.longBio,
      fallbackProfile.location, fallbackProfile.email, fallbackProfile.phone, fallbackProfile.githubUrl,
      fallbackProfile.scholarUrl, fallbackProfile.linkedinUrl, fallbackProfile.profileImageKey, fallbackProfile.updatedAt).run();

  const catalogApplied = await db.prepare("SELECT name FROM site_content_migrations WHERE name = 'portfolio-catalog-2026-09-14'").first();
  if (!catalogApplied) await db.batch(projectMigrationSql.map(sql => db.prepare(sql)));

  const curationApplied = await db.prepare("SELECT name FROM site_content_migrations WHERE name = 'portfolio-curation-2026-09-14'").first();
  if (!curationApplied) await db.batch(portfolioCurationSql.map(sql => db.prepare(sql)));

  const visibilityCorrectionApplied = await db.prepare("SELECT name FROM site_content_migrations WHERE name = 'portfolio-visibility-correction-2026-09-20'").first();
  if (!visibilityCorrectionApplied) await db.batch(portfolioVisibilityCorrectionSql.map(sql => db.prepare(sql)));

  const publicationCount = await db.prepare('SELECT COUNT(*) AS count FROM publications').first<{ count: number }>();
  if (!publicationCount?.count) {
    await db.batch(fallbackPublications.map((item) => db.prepare(`INSERT INTO publications
      (id, title, authors, venue, year, summary, url, image_key, sort_order)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`)
      .bind(item.id, item.title, item.authors, item.venue, item.year, item.summary, item.url, item.imageKey, item.sortOrder)));
  }
  await db.prepare('PRAGMA optimize').run();
}

export async function loadSiteData(): Promise<SiteData> {
  await ensureDatabase();
  const db = getDatabase();
  const [profile, projects, publications, places, lifts] = await Promise.all([
    db.prepare(`SELECT id, name, tagline, short_bio AS shortBio, long_bio AS longBio, location, email, phone,
      github_url AS githubUrl, scholar_url AS scholarUrl, linkedin_url AS linkedinUrl,
      profile_image_key AS profileImageKey, updated_at AS updatedAt FROM profiles WHERE id = 1`).first(),
    db.prepare(`SELECT id, title, summary, tags, repo_url AS repoUrl, live_url AS liveUrl, image_key AS imageKey,
      featured, published, archived, sort_order AS sortOrder FROM projects ORDER BY sort_order, id`).all(),
    db.prepare(`SELECT id, title, authors, venue, year, summary, url, image_key AS imageKey,
      sort_order AS sortOrder FROM publications ORDER BY sort_order, id`).all(),
    db.prepare(`SELECT id, city, country, latitude, longitude, year, note, sort_order AS sortOrder
      FROM places ORDER BY sort_order, city`).all(),
    db.prepare(`SELECT id, date, exercise, weight_lb AS weightLb, sets, reps, notes, created_at AS createdAt
      FROM lift_entries ORDER BY date, id`).all(),
  ]);
  return {
    profile: profile as SiteData['profile'],
    projects: projects.results.map((item: any) => ({ ...item, featured: Boolean(item.featured), published: Boolean(item.published), archived: Boolean(item.archived) })) as SiteData['projects'],
    publications: publications.results as SiteData['publications'],
    places: places.results as SiteData['places'],
    lifts: lifts.results as SiteData['lifts'],
  };
}

export async function loadSiteDataSafe(): Promise<SiteData> {
  try { return await loadSiteData(); } catch { return { ...fallbackDataClone() }; }
}

function fallbackDataClone(): SiteData {
  return { profile: { ...fallbackProfile }, projects: fallbackProjects.map((x) => ({ ...x })), publications: fallbackPublications.map((x) => ({ ...x })), places: [], lifts: [] };
}

// Public rendering never queries or serializes private profile, travel, or fitness records.
export async function loadPublicSiteDataSafe(): Promise<PublicSiteData> {
  try {
    await ensureDatabase();
    const db = getDatabase();
    const [profile, projects, publications] = await Promise.all([
      db.prepare(`SELECT name, tagline, short_bio AS shortBio, long_bio AS longBio, email,
        github_url AS githubUrl, scholar_url AS scholarUrl, linkedin_url AS linkedinUrl
        FROM profiles WHERE id = 1`).first(),
      db.prepare(`SELECT id, title, summary, tags, repo_url AS repoUrl, live_url AS liveUrl,
        image_key AS imageKey, featured, published, archived, sort_order AS sortOrder
        FROM projects WHERE published = 1 ORDER BY sort_order, id`).all(),
      db.prepare(`SELECT id, title, authors, venue, year, summary, url, image_key AS imageKey,
        sort_order AS sortOrder FROM publications ORDER BY sort_order, id`).all(),
    ]);
    return {
      profile: (profile ?? toPublicProfile(fallbackProfile)) as PublicSiteData['profile'],
      projects: projects.results.map((item: any) => ({ ...item, featured: Boolean(item.featured), published: Boolean(item.published), archived: Boolean(item.archived) })),
      publications: publications.results as PublicSiteData['publications'],
    };
  } catch (error) {
    console.error('Public portfolio data unavailable', error instanceof Error ? error.message : 'Unknown error');
    // Do not resurrect owner-hidden projects when their current visibility cannot be read.
    return { profile: toPublicProfile(fallbackProfile), projects: [], publications: fallbackPublications };
  }
}
