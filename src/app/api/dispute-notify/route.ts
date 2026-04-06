import { createServiceClient } from '@/lib/supabase/server'
import { sendEmail } from '@/lib/email'
import { disputeFiledEmail } from '@/lib/email-templates'
import { NextResponse } from 'next/server'

const REASON_LABELS: Record<string, string> = {
  false_information: 'This feedback contains false information',
  identity_dispute: 'I am not the person described',
  harassment: 'This feedback is harassment or retaliation',
  inaccurate: 'The details are inaccurate or exaggerated',
  other: 'Other',
}

export async function POST(request: Request) {
  const { contentType, contentId, reason } = await request.json()
  if (!contentType || !contentId || !reason) return NextResponse.json({ ok: true })

  const supabase = await createServiceClient()

  // Find the original entry and its submitter
  let submitterEmail: string | null = null

  if (contentType === 'customer') {
    // contentId is the customer ID — find entries for this customer
    const { data: entries } = await supabase.from('entries').select('submitted_by').eq('customer_id', contentId).limit(10)
    if (entries && entries.length > 0) {
      const submitterIds = [...new Set(entries.map((e) => e.submitted_by).filter(Boolean))]
      for (const sid of submitterIds) {
        const { data: p } = await supabase.from('profiles').select('email').eq('id', sid).single()
        if (p?.email) {
          const email = disputeFiledEmail(REASON_LABELS[reason] || reason)
          sendEmail({ to: p.email, subject: email.subject, html: email.html }).catch(() => {})
        }
      }
    }
  } else if (contentType === 'worker') {
    const { data: entries } = await supabase.from('worker_entries').select('submitted_by').eq('worker_id', contentId).limit(10)
    if (entries && entries.length > 0) {
      const submitterIds = [...new Set(entries.map((e) => e.submitted_by).filter(Boolean))]
      for (const sid of submitterIds) {
        const { data: p } = await supabase.from('profiles').select('email').eq('id', sid).single()
        if (p?.email) {
          const email = disputeFiledEmail(REASON_LABELS[reason] || reason)
          sendEmail({ to: p.email, subject: email.subject, html: email.html }).catch(() => {})
        }
      }
    }
  }

  return NextResponse.json({ ok: true })
}
