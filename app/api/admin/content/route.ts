import { NextResponse } from 'next/server';
import { z } from 'zod';
import { ensureDatabase, getDatabase, loadSiteData } from '@/lib/database';
import { requireOwner } from '@/lib/owner';

const text = (max = 5000) => z.string().trim().min(1).max(max);
const nullableText = (max = 1000) => z.union([z.string().trim().max(max), z.null()]).transform((v) => v || null);
const nullableUrl = z.union([z.string().trim().url(), z.literal(''), z.null()]).transform((v) => v || null);
const profileSchema = z.object({ name: text(100), tagline: text(160), shortBio: text(800), longBio: text(5000), location: text(200), email: z.string().trim().email(), phone: nullableText(50), githubUrl: z.string().trim().url(), scholarUrl: z.string().trim().url(), linkedinUrl: nullableUrl, profileImageKey: nullableText(500) });
const projectSchema = z.object({ title: text(160), summary: text(1200), tags: text(400), repoUrl: nullableUrl, liveUrl: nullableUrl, imageKey: nullableText(500), featured: z.boolean().default(true), sortOrder: z.number().int().min(0).max(999) });
const publicationSchema = z.object({ title: text(500), authors: text(800), venue: text(300), year: z.number().int().min(1900).max(2100), summary: text(1500), url: z.string().trim().url(), imageKey: nullableText(500), sortOrder: z.number().int().min(0).max(999) });
const placeSchema = z.object({ city: text(120), country: text(120), latitude: z.number().min(-90).max(90), longitude: z.number().min(-180).max(180), year: z.number().int().min(1900).max(2100).nullable(), note: nullableText(1000), sortOrder: z.number().int().min(0).max(999) });
const liftSchema = z.object({ date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/), exercise: z.enum(['bench-press','back-squat','overhead-press','push-ups']), weightLb: z.number().positive().max(2000).nullable(), sets: z.number().int().positive().max(100), reps: z.number().int().positive().max(1000), notes: nullableText(1000) }).superRefine((value, ctx) => { if (value.exercise !== 'push-ups' && value.weightLb == null) ctx.addIssue({ code: 'custom', message: 'Weight is required for weighted exercises', path: ['weightLb'] }); });
const requestSchema = z.object({ resource: z.enum(['profile','projects','publications','places','lifts']), action: z.enum(['create','update','delete']), id: z.number().int().positive().optional(), data: z.unknown().optional() });

export async function GET() {
  const owner = await requireOwner();
  if (!owner.ok) return NextResponse.json({ error: owner.status === 401 ? 'Sign in required' : 'Owner access required' }, { status: owner.status });
  return NextResponse.json(await loadSiteData());
}

export async function POST(request: Request) {
  const owner = await requireOwner();
  if (!owner.ok) return NextResponse.json({ error: owner.status === 401 ? 'Sign in required' : 'Owner access required' }, { status: owner.status });
  try {
    const command = requestSchema.parse(await request.json());
    await ensureDatabase(); const db = getDatabase();
    if (command.action === 'delete') {
      if (!command.id || command.resource === 'profile') return NextResponse.json({ error: 'A deletable record id is required' }, { status: 400 });
      const table = command.resource === 'lifts' ? 'lift_entries' : command.resource;
      await db.prepare(`DELETE FROM ${table} WHERE id = ?`).bind(command.id).run();
    } else if (command.resource === 'profile') {
      const v = profileSchema.parse(command.data);
      await db.prepare(`UPDATE profiles SET name=?, tagline=?, short_bio=?, long_bio=?, location=?, email=?, phone=?, github_url=?, scholar_url=?, linkedin_url=?, profile_image_key=?, updated_at=? WHERE id=1`)
        .bind(v.name,v.tagline,v.shortBio,v.longBio,v.location,v.email,v.phone,v.githubUrl,v.scholarUrl,v.linkedinUrl,v.profileImageKey,new Date().toISOString()).run();
    } else if (command.resource === 'projects') {
      const v = projectSchema.parse(command.data);
      if (command.action === 'create') await db.prepare(`INSERT INTO projects (title,summary,tags,repo_url,live_url,image_key,featured,sort_order) VALUES (?,?,?,?,?,?,?,?)`).bind(v.title,v.summary,v.tags,v.repoUrl,v.liveUrl,v.imageKey,v.featured?1:0,v.sortOrder).run();
      else { if (!command.id) throw new Error('Project id is required'); await db.prepare(`UPDATE projects SET title=?,summary=?,tags=?,repo_url=?,live_url=?,image_key=?,featured=?,sort_order=? WHERE id=?`).bind(v.title,v.summary,v.tags,v.repoUrl,v.liveUrl,v.imageKey,v.featured?1:0,v.sortOrder,command.id).run(); }
    } else if (command.resource === 'publications') {
      const v = publicationSchema.parse(command.data);
      if (command.action === 'create') await db.prepare(`INSERT INTO publications (title,authors,venue,year,summary,url,image_key,sort_order) VALUES (?,?,?,?,?,?,?,?)`).bind(v.title,v.authors,v.venue,v.year,v.summary,v.url,v.imageKey,v.sortOrder).run();
      else { if (!command.id) throw new Error('Publication id is required'); await db.prepare(`UPDATE publications SET title=?,authors=?,venue=?,year=?,summary=?,url=?,image_key=?,sort_order=? WHERE id=?`).bind(v.title,v.authors,v.venue,v.year,v.summary,v.url,v.imageKey,v.sortOrder,command.id).run(); }
    } else if (command.resource === 'places') {
      const v = placeSchema.parse(command.data);
      if (command.action === 'create') await db.prepare(`INSERT INTO places (city,country,latitude,longitude,year,note,sort_order) VALUES (?,?,?,?,?,?,?)`).bind(v.city,v.country,v.latitude,v.longitude,v.year,v.note,v.sortOrder).run();
      else { if (!command.id) throw new Error('Place id is required'); await db.prepare(`UPDATE places SET city=?,country=?,latitude=?,longitude=?,year=?,note=?,sort_order=? WHERE id=?`).bind(v.city,v.country,v.latitude,v.longitude,v.year,v.note,v.sortOrder,command.id).run(); }
    } else {
      const v = liftSchema.parse(command.data); const weight = v.exercise === 'push-ups' ? null : v.weightLb;
      if (command.action === 'create') await db.prepare(`INSERT INTO lift_entries (date,exercise,weight_lb,sets,reps,notes,created_at) VALUES (?,?,?,?,?,?,?)`).bind(v.date,v.exercise,weight,v.sets,v.reps,v.notes,new Date().toISOString()).run();
      else { if (!command.id) throw new Error('Lift id is required'); await db.prepare(`UPDATE lift_entries SET date=?,exercise=?,weight_lb=?,sets=?,reps=?,notes=? WHERE id=?`).bind(v.date,v.exercise,weight,v.sets,v.reps,v.notes,command.id).run(); }
    }
    return NextResponse.json(await loadSiteData());
  } catch (error) {
    const message = error instanceof z.ZodError ? error.issues[0]?.message : error instanceof Error ? error.message : 'Unable to save';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
