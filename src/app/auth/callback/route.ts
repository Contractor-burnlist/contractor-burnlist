import { createClient, createServiceClient } from '@/lib/supabase/server'
import { sendEmail } from '@/lib/email'
import { welcomeEmail } from '@/lib/email-templates'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') || '/dashboard'
  const origin = process.env.NEXT_PUBLIC_APP_URL || new URL(request.url).origin

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      // Send welcome email on first login (non-blocking)
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (user?.email) {
          const admin = await createServiceClient()
          const { data: profile, error: profileErr } = await admin
            .from('profiles')
            .select('welcome_email_sent')
            .eq('id', user.id)
            .single()

          if (profileErr) {
            console.error('[welcome-email] Profile lookup failed:', profileErr.message)
          } else if (profile && !profile.welcome_email_sent) {
            console.error('[welcome-email] Sending to:', user.email)
            const email = welcomeEmail()
            await sendEmail({ to: user.email, subject: email.subject, html: email.html })
            await admin.from('profiles').update({ welcome_email_sent: true }).eq('id', user.id)
            console.error('[welcome-email] Sent and marked')
          }
        }
      } catch (err: any) {
        console.error('[welcome-email] Error:', err.message)
      }

      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  return NextResponse.redirect(`${origin}/auth/login?error=true`)
}
