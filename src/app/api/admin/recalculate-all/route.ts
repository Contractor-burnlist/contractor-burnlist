import { createServiceClient, createClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/admin'
import { calculateCustomerRisk, calculateWorkerRisk } from '@/lib/risk-score'
import { NextResponse } from 'next/server'

export async function POST() {
  const supabase = await createClient()
  if (!await requireAdmin(supabase)) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })

  const admin = await createServiceClient()
  let customerCount = 0
  let workerCount = 0

  const { data: customers } = await admin.from('customers').select('id')
  for (const c of customers ?? []) {
    const { data: entries } = await admin.from('entries').select('submitted_by, amount_owed, category_tags, incident_date, created_at, submitter_verified, is_verified_submission').eq('customer_id', c.id)
    const result = calculateCustomerRisk(entries ?? [])
    await admin.from('customers').update({
      risk_score: result.score, risk_level: result.label.toLowerCase().replace(' ', '_'),
      risk_factors: result.factors, risk_calculated_at: new Date().toISOString(),
    }).eq('id', c.id)
    customerCount++
  }

  const { data: workers } = await admin.from('workers').select('id')
  for (const w of workers ?? []) {
    const { data: entries } = await admin.from('worker_entries').select('submitted_by, category_tags, incident_date, created_at, submitter_verified, is_verified_submission').eq('worker_id', w.id)
    const result = calculateWorkerRisk(entries ?? [])
    await admin.from('workers').update({
      risk_score: result.score, risk_level: result.label.toLowerCase().replace(' ', '_'),
      risk_factors: result.factors, risk_calculated_at: new Date().toISOString(),
    }).eq('id', w.id)
    workerCount++
  }

  return NextResponse.json({ message: `Recalculated risk for ${customerCount} customers and ${workerCount} workers` })
}
