import { stripe } from '@/lib/stripe'
import { createServiceClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')!

  let event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as any
    const userId = session.metadata?.userId
    const customerId = session.customer as string
    const subscriptionId = session.subscription as string

    if (userId) {
      const supabase = await createServiceClient()

      // Determine tier from the subscription
      let tier = 'basic'
      try {
        const subscription = await stripe.subscriptions.retrieve(subscriptionId)
        const amount = subscription.items.data[0]?.price?.unit_amount || 0
        tier = amount >= 3900 ? 'pro' : 'basic'
      } catch {}

      // Update profile
      await supabase
        .from('profiles')
        .update({
          subscription_status: 'active',
          subscription_tier: tier,
          stripe_customer_id: customerId,
        })
        .eq('id', userId)
    }
  }

  if (event.type === 'customer.subscription.deleted') {
    const subscription = event.data.object as any
    const customerId = subscription.customer as string

    const supabase = await createServiceClient()

    await supabase
      .from('profiles')
      .update({
        subscription_status: 'inactive',
        subscription_tier: null,
      })
      .eq('stripe_customer_id', customerId)
  }

  if (event.type === 'customer.subscription.updated') {
    const subscription = event.data.object as any
    const customerId = subscription.customer as string
    const status = subscription.status === 'active' ? 'active' : 'inactive'

    let tier = 'basic'
    const amount = subscription.items.data[0]?.price?.unit_amount || 0
    tier = amount >= 3900 ? 'pro' : 'basic'

    const supabase = await createServiceClient()

    await supabase
      .from('profiles')
      .update({
        subscription_status: status,
        subscription_tier: tier,
      })
      .eq('stripe_customer_id', customerId)
  }

  return NextResponse.json({ received: true })
}
