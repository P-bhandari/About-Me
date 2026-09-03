import { getChatGPTUser } from '@/app/chatgpt-auth';

const DEFAULT_OWNER_EMAIL = 'piyush1995bhandari@gmail.com';

export function isOwnerEmail(email: string) {
  const ownerEmail = process.env.OWNER_EMAIL ?? DEFAULT_OWNER_EMAIL;
  return email.toLowerCase() === ownerEmail.toLowerCase() ||
    (process.env.NODE_ENV !== 'production' && email.toLowerCase() === 'seedy@sites.test');
}

export async function requireOwner() {
  const user = await getChatGPTUser();
  if (!user) return { ok: false as const, status: 401, user: null };
  if (!isOwnerEmail(user.email)) return { ok: false as const, status: 403, user };
  return { ok: true as const, status: 200, user };
}
