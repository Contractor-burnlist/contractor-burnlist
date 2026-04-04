import { createServiceClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const q = searchParams.get('q')?.trim()
  if (!q) return NextResponse.json({ data: [] })

  const supabase = await createServiceClient()
  const p = `%${q}%`

  const [{ data: customers }, { data: workers }] = await Promise.all([
    supabase
      .from('customers')
      .select('id, display_name, city, state, flag_count, risk_level, entries(id)')
      .or(`full_name.ilike.${p},city.ilike.${p},display_name.ilike.${p}`)
      .order('flag_count', { ascending: false })
      .limit(10),
    supabase
      .from('workers')
      .select('id, display_name, city, state, flag_count, risk_level, trade_specialty, worker_entries(id)')
      .or(`full_name.ilike.${p},city.ilike.${p},display_name.ilike.${p},trade_specialty.ilike.${p}`)
      .order('flag_count', { ascending: false })
      .limit(10),
  ])

  const results = [
    ...(customers ?? []).map((c: any) => ({
      id: c.id,
      type: 'customer',
      display_name: c.display_name,
      city: c.city,
      state: c.state,
      flag_count: c.flag_count,
      risk_level: c.risk_level,
      trade: null,
      entry_count: Array.isArray(c.entries) ? c.entries.length : 0,
    })),
    ...(workers ?? []).map((w: any) => ({
      id: w.id,
      type: 'worker',
      display_name: w.display_name,
      city: w.city,
      state: w.state,
      flag_count: w.flag_count,
      risk_level: w.risk_level,
      trade: w.trade_specialty || null,
      entry_count: Array.isArray(w.worker_entries) ? w.worker_entries.length : 0,
    })),
  ].sort((a, b) => b.flag_count - a.flag_count).slice(0, 20)

  return NextResponse.json({ data: results })
}
