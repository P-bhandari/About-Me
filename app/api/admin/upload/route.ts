import { env } from 'cloudflare:workers';
import { NextResponse } from 'next/server';
import { requireOwner } from '@/lib/owner';

const allowed = new Set(['image/jpeg','image/png','image/webp']);

export async function POST(request: Request) {
  const owner = await requireOwner();
  if (!owner.ok) return NextResponse.json({ error: 'Owner access required' }, { status: owner.status });
  const data = await request.formData(); const file = data.get('file');
  if (!(file instanceof File)) return NextResponse.json({ error: 'Choose an image' }, { status: 400 });
  if (!allowed.has(file.type) || file.size > 5 * 1024 * 1024) return NextResponse.json({ error: 'Use a JPG, PNG, or WebP image under 5 MB' }, { status: 400 });
  const safeName = file.name.toLowerCase().replace(/[^a-z0-9.-]+/g,'-').slice(-80);
  const key = `uploads/${crypto.randomUUID()}-${safeName}`;
  await env.FILES.put(key, await file.arrayBuffer(), { httpMetadata: { contentType: file.type, cacheControl: 'public, max-age=31536000, immutable' } });
  return NextResponse.json({ key, url: `/api/files/${key}` });
}
