import { createServiceClient, createClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/admin'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const supabase = await createClient()
  if (!await requireAdmin(supabase)) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })

  const { searchParams } = new URL(request.url)
  const page = Number(searchParams.get('page') ?? '1')
  const search = searchParams.get('search') ?? ''
  const limit = 25
  const offset = (page - 1) * limit

  const admin = await createServiceClient()
  let query = admin.from('profiles')
    .select('id, email, display_username, business_name, trade, trust_score, reputation_points, reputation_rank, comment_count, is_verified, is_banned, subscription_status, subscription_tier, created_at')
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (search) {
    query = query.or(`email.ilike.%${search}%,display_username.ilike.%${search}%,business_name.ilike.%${search}%`)
  }

  const { data } = await query
  return NextResponse.json({ data: data ?? [] })
}

export async function PATCH(request: Request) {
  const supabase = await createClient()
  if (!await requireAdmin(supabase)) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })

  const { userId, action } = await request.json()
  const admin = await createServiceClient()

  if (action === 'toggle_verified') {
    const { data: profile } = await admin.from('profiles').select('is_verified').eq('id', userId).single()
    await admin.from('profiles').update({ is_verified: !profile?.is_verified }).eq('id', userId)
  } else if (action === 'ban') {
    await admin.from('profiles').update({ is_banned: true, subscription_status: 'inactive' }).eq('id', userId)
  } else if (action === 'unban') {
    await admin.from('profiles').update({ is_banned: false }).eq('id', userId)
  }

  return NextResponse.json({ success: true })
}
