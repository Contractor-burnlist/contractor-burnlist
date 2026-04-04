import { createServiceClient, createClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/admin'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const supabase = await createClient()
  if (!await requireAdmin(supabase)) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })

  const { searchParams } = new URL(request.url)
  const status = searchParams.get('status') ?? 'all'
  const page = Number(searchParams.get('page') ?? '1')
  const limit = 25
  const offset = (page - 1) * limit

  const admin = await createServiceClient()
  let query = admin.from('comments')
    .select('id, content, is_deleted, created_at, user_id, entry_id, worker_entry_id, profiles(email, display_username, reputation_points)')
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (status === 'active') query = query.eq('is_deleted', false)
  if (status === 'deleted') query = query.eq('is_deleted', true)

  const { data, count } = await query
  return NextResponse.json({ data: data ?? [], count })
}

export async function PATCH(request: Request) {
  const supabase = await createClient()
  if (!await requireAdmin(supabase)) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })

  const { ids, action } = await request.json()
  const admin = await createServiceClient()

  if (action === 'delete') {
    await admin.from('comments').update({ is_deleted: true }).in('id', ids)
  } else if (action === 'restore') {
    await admin.from('comments').update({ is_deleted: false }).in('id', ids)
  }

  return NextResponse.json({ success: true })
}
