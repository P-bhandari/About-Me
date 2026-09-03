import { chatGPTSignOutPath, requireChatGPTUser } from '@/app/chatgpt-auth';
import { DashboardClient } from '@/components/dashboard-client';
import { loadSiteDataSafe } from '@/lib/database';
import { isOwnerEmail } from '@/lib/owner';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const user = await requireChatGPTUser('/dashboard');
  if (!isOwnerEmail(user.email)) return <main className="denied"><span>403</span><h1>Owner access only</h1><p>You’re signed in as {user.email}, but this account is not authorized to edit the portfolio.</p><a href={chatGPTSignOutPath('/')}>Sign out</a></main>;
  const data = await loadSiteDataSafe();
  return <DashboardClient initialData={data} ownerName={user.displayName} signOutPath={chatGPTSignOutPath('/')} />;
}
