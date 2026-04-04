import { createServiceClient, createClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/admin'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const supabase = await createClient()
  if (!await requireAdmin(supabase)) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })

  const { searchParams } = new URL(request.url)
  const type = searchParams.get('type') ?? 'all'
  const page = Number(searchParams.get('page') ?? '1')
  const limit = 25
  const offset = (page - 1) * limit

  const admin = await createServiceClient()
  const results: any[] = []

  if (type !== 'worker') {
    const { data } = await admin.from('entries')
      .select('id, description, amount_owed, incident_date, category_tags, submitter_verified, created_at, customer_id, submitted_by, customers(full_name, display_name, city, state, flag_count), profiles(email)')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)
    for (const e of data ?? []) results.push({ ...e, report_type: 'customer' })
  }
  if (type !== 'customer') {
    const { data } = await admin.from('worker_entries')
      .select('id, description, incident_date, category_tags, submitter_verified, created_at, worker_id, submitted_by, workers(full_name, display_name, city, state, trade_specialty, flag_count), profiles(email)')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)
    for (const e of data ?? []) results.push({ ...e, report_type: 'worker' })
  }

  results.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
  return NextResponse.json({ data: results.slice(0, limit) })
}

export async function DELETE(request: Request) {
  const supabase = await createClient()
  if (!await requireAdmin(supabase)) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })

  const { id, type, deleteParent } = await request.json()
  const admin = await createServiceClient()

  if (deleteParent) {
    if (type === 'customer') await admin.from('customers').delete().eq('id', id)
    else await admin.from('workers').delete().eq('id', id)
  } else {
    if (type === 'customer') await admin.from('entries').delete().eq('id', id)
    else await admin.from('worker_entries').delete().eq('id', id)
  }

  return NextResponse.json({ success: true })
}
