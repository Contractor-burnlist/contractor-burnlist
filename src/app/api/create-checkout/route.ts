import { stripe } from '@/lib/stripe'
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  console.log('[create-checkout] Starting checkout session creation')
  console.log('[create-checkout] STRIPE_SECRET_KEY exists:', !!process.env.STRIPE_SECRET_KEY)

  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError) {
    console.error('[create-checkout] Auth error:', authError.message)
  }

  if (!user) {
    console.log('[create-checkout] No user found — returning 401')
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  console.log('[create-checkout] User:', user.id, user.email)

  let body
  try {
    body = await request.json()
  } catch (e: any) {
    console.error('[create-checkout] Failed to parse request body:', e.message)
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const { priceId } = body
  console.log('[create-checkout] Price ID:', priceId)

  if (!priceId) {
    console.log('[create-checkout] No priceId provided — returning 400')
    return NextResponse.json({ error: 'Price ID is required' }, { status: 400 })
  }

  const origin = process.env.NEXT_PUBLIC_APP_URL || request.headers.get('origin') || 'http://localhost:3000'
  console.log('[create-checkout] Origin:', origin)

  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${origin}/dashboard?success=true`,
      cancel_url: `${origin}/pricing`,
      customer_email: user.email!,
      metadata: {
        userId: user.id,
      },
    })

    console.log('[create-checkout] Session created:', session.id, session.url)
    return NextResponse.json({ url: session.url })
  } catch (err: any) {
    console.error('[create-checkout] Stripe error:', err.type, err.message, err.raw?.message)
    return NextResponse.json(
      { error: err.message || 'Failed to create checkout session' },
      { status: 500 }
    )
  }
}
