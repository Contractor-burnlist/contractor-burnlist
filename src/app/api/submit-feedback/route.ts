import { createClient, createServiceClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  // Verify auth server-side
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    // Fallback to session
    const { data: { session } } = await supabase.auth.getSession()
    if (!session?.user) {
      return NextResponse.json({ error: 'Please log in to submit feedback.' }, { status: 401 })
    }
    // Use session user
    var userId = session.user.id
    var userEmail = session.user.email
  } else {
    var userId = user.id
    var userEmail = user.email
  }

  const body = await request.json()
  const { type, customerForm, workerForm, isVerified, isProfileComplete } = body

  if (!type || (type !== 'customer' && type !== 'worker')) {
    return NextResponse.json({ error: 'Invalid feedback type.' }, { status: 400 })
  }

  const admin = await createServiceClient()

  if (type === 'customer') {
    const f = customerForm
    if (!f?.full_name || !f?.address || !f?.city || !f?.state) {
      return NextResponse.json({ error: 'Missing required customer fields.' }, { status: 400 })
    }

    const displayName = f.full_name.trim().split(/\s+/).map((p: string) => p[0]?.toUpperCase() + '.').join('')

    const { data: customer, error: customerErr } = await admin.from('customers').insert({
      full_name: f.full_name, display_name: displayName,
      address: f.address, city: f.city, state: f.state,
      zip: f.zip || null, phone: f.phone || null, email: f.email || null,
    }).select('id').single()

    if (customerErr) {
      console.error('[submit-feedback] Customer insert error:', customerErr.message)
      return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 })
    }

    const { error: entryErr } = await admin.from('entries').insert({
      customer_id: customer.id, submitted_by: userId,
      description: f.description,
      amount_owed: f.amount_owed ? parseFloat(f.amount_owed) : null,
      incident_date: f.incident_date, category_tags: f.categories,
      submitter_verified: isVerified ?? false,
      submitter_profile_complete: isProfileComplete ?? false,
    })

    if (entryErr) {
      console.error('[submit-feedback] Entry insert error:', entryErr.message)
      return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 })
    }

    // Recalculate risk (fire-and-forget)
    fetch(new URL('/api/recalculate-risk', request.url).toString(), {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'customer', id: customer.id }),
    }).catch(() => {})

    return NextResponse.json({ success: true, id: customer.id })
  }

  // Worker
  const f = workerForm
  if (!f?.full_name || !f?.city || !f?.state) {
    return NextResponse.json({ error: 'Missing required worker fields.' }, { status: 400 })
  }

  const { data: worker, error: workerErr } = await admin.from('workers').insert({
    full_name: f.full_name, phone: f.phone || null,
    city: f.city, state: f.state, trade_specialty: f.trade_specialty || null,
  }).select('id').single()

  if (workerErr) {
    console.error('[submit-feedback] Worker insert error:', workerErr.message)
    return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 })
  }

  const { error: entryErr } = await admin.from('worker_entries').insert({
    worker_id: worker.id, submitted_by: userId,
    description: f.description, incident_date: f.incident_date,
    category_tags: f.categories,
    submitter_verified: isVerified ?? false,
    submitter_profile_complete: isProfileComplete ?? false,
  })

  if (entryErr) {
    console.error('[submit-feedback] Worker entry insert error:', entryErr.message)
    return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 })
  }

  fetch(new URL('/api/recalculate-risk', request.url).toString(), {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ type: 'worker', id: worker.id }),
  }).catch(() => {})

  return NextResponse.json({ success: true, id: worker.id })
}
