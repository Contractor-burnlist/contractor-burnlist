import { createServiceClient } from '@/lib/supabase/server'
import { calculateCustomerRisk, calculateWorkerRisk } from '@/lib/risk-score'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const { type, id } = await request.json()
  if (!type || !id) return NextResponse.json({ error: 'type and id required' }, { status: 400 })

  const supabase = await createServiceClient()

  if (type === 'customer') {
    const { data: entries } = await supabase.from('entries').select('submitted_by, amount_owed, category_tags, incident_date, created_at, submitter_verified, is_verified_submission').eq('customer_id', id)
    const result = calculateCustomerRisk(entries ?? [])
    await supabase.from('customers').update({
      risk_score: result.score,
      risk_level: result.label.toLowerCase().replace(' ', '_'),
      risk_factors: result.factors,
      risk_calculated_at: new Date().toISOString(),
    }).eq('id', id)
    return NextResponse.json({ score: result.score, label: result.label })
  }

  if (type === 'worker') {
    const { data: entries } = await supabase.from('worker_entries').select('submitted_by, category_tags, incident_date, created_at, submitter_verified, is_verified_submission').eq('worker_id', id)
    const result = calculateWorkerRisk(entries ?? [])
    await supabase.from('workers').update({
      risk_score: result.score,
      risk_level: result.label.toLowerCase().replace(' ', '_'),
      risk_factors: result.factors,
      risk_calculated_at: new Date().toISOString(),
    }).eq('id', id)
    return NextResponse.json({ score: result.score, label: result.label })
  }

  return NextResponse.json({ error: 'Invalid type' }, { status: 400 })
}
