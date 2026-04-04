import { createServiceClient, createClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/admin'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const supabase = await createClient()
  if (!await requireAdmin(supabase)) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })

  const { searchParams } = new URL(request.url)
  const status = searchParams.get('status') ?? 'pending'

  const admin = await createServiceClient()
  let query = admin.from('content_flags')
    .select('id, content_type, content_id, reason, description, status, admin_notes, created_at, profiles(email, display_username)')
    .order('created_at', { ascending: false })
    .limit(50)

  if (status !== 'all') query = query.eq('status', status)

  const { data } = await query
  return NextResponse.json({ data: data ?? [] })
}

export async function PATCH(request: Request) {
  const supabase = await createClient()
  if (!await requireAdmin(supabase)) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })

  const { flagId, action, notes } = await request.json()
  const admin = await createServiceClient()

  if (action === 'dismiss') {
    await admin.from('content_flags').update({ status: 'dismissed', admin_notes: notes || null }).eq('id', flagId)
  } else if (action === 'action_taken') {
    const { data: flag } = await admin.from('content_flags').select('content_type, content_id').eq('id', flagId).single()
    if (flag) {
      if (flag.content_type === 'entry') await admin.from('entries').delete().eq('id', flag.content_id)
      else if (flag.content_type === 'worker_entry') await admin.from('worker_entries').delete().eq('id', flag.content_id)
      else if (flag.content_type === 'comment') await admin.from('comments').update({ is_deleted: true }).eq('id', flag.content_id)
    }
    await admin.from('content_flags').update({ status: 'action_taken', admin_notes: notes || null }).eq('id', flagId)
  }

  return NextResponse.json({ success: true })
}
