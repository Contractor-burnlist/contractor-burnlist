import { createServiceClient } from '@/lib/supabase/server'
import AdminFlaggedClient from './AdminFlaggedClient'

export default async function AdminFlaggedPage() {
  const supabase = await createServiceClient()

  const { data: flags } = await supabase
    .from('content_flags')
    .select('id, content_type, content_id, reason, description, status, admin_notes, created_at, contact_name, contact_email, attachment_paths, user_id, profiles(email, display_username)')
    .order('created_at', { ascending: false })
    .limit(100)

  return <AdminFlaggedClient initialFlags={flags ?? []} />
}
