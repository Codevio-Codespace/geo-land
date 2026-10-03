import { redirect } from 'next/navigation';
import { AdminBar } from '@/components/admin/AdminBar';
import { currentUser } from '@/lib/supabase/server';
import { hasServiceRole } from '@/lib/supabase/admin';
import { isSupabaseConfigured } from '@/lib/supabase/config';

export default async function ProtectedAdminLayout({ children }: { children: React.ReactNode }) {
  if (!isSupabaseConfigured() || !hasServiceRole()) {
    redirect('/admin/login?err=' + encodeURIComponent('Supabase is not configured yet.'));
  }
  const user = await currentUser();
  if (!user) redirect('/admin/login');
  return (
    <>
      <AdminBar username={user.email || user.id} />
      <main className="admin-page">{children}</main>
    </>
  );
}
