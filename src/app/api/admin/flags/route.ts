import { createServiceClient, createClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/admin'
import { sendEmail } from '@/lib/email'
import { disputeReviewedEmail } from '@/lib/email-templates'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const supabase = await createClient()
  if (!await requireAdmin(supabase)) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })

  const { searchParams } = new URL(request.url)
  const status = searchParams.get('status') ?? 'pending'

  const admin = await createServiceClient()
  let query = admin.from('content_flags')
    .select('id, content_type, content_id, reason, description, status, admin_notes, created_at, contact_name, contact_email, attachment_paths, profiles(email, display_username)')
    .order('created_at', { ascending: false })
    .limit(50)

  if (status !== 'all') query = query.eq('status', status)

  const { data } = await query
  return NextResponse.json({ data: data ?? [] })
}

export async function PATCH(request: Request) {
  const supabase = await createClient()
  if (!await requireAdmin(supabase)) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })

  const { flagId, action, notes, includeNotes } = await request.json()
  const admin = await createServiceClient()

  // Fetch the flag for email notification
  const { data: flag } = await admin.from('content_flags').select('content_type, content_id, contact_email, created_at').eq('id', flagId).single()

  if (action === 'dismiss') {
    await admin.from('content_flags').update({ status: 'dismissed', admin_notes: notes || null }).eq('id', flagId)
  } else if (action === 'action_taken') {
    if (flag) {
      if (flag.content_type === 'entry') await admin.from('entries').delete().eq('id', flag.content_id)
      else if (flag.content_type === 'worker_entry') await admin.from('worker_entries').delete().eq('id', flag.content_id)
      else if (flag.content_type === 'comment') await admin.from('comments').update({ is_deleted: true }).eq('id', flag.content_id)
    }
    await admin.from('content_flags').update({ status: 'action_taken', admin_notes: notes || null }).eq('id', flagId)
  }

  // Send notification email to disputant if they provided an email
  if (flag?.contact_email && (action === 'dismiss' || action === 'action_taken')) {
    const email = disputeReviewedEmail(
      action as 'dismissed' | 'action_taken',
      flag.created_at,
      action === 'action_taken' && includeNotes && notes ? notes : undefined,
    )
    sendEmail({ to: flag.contact_email, subject: email.subject, html: email.html }).catch(() => {})
  }

  return NextResponse.json({ success: true, emailSent: !!flag?.contact_email })
}
