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

  const supabase = await createServiceClient()

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as any
    const userId = session.metadata?.userId
    const customerId = session.customer as string
    const subscriptionId = session.subscription as string

    if (userId && subscriptionId) {
      const subscription = await stripe.subscriptions.retrieve(subscriptionId)
      const priceId = subscription.items.data[0]?.price?.id || ''
      const tier = priceId === process.env.NEXT_PUBLIC_FORTRESS_PRICE_ID ? 'fortress' : 'shield'
      const periodEnd = new Date((subscription as any).current_period_end * 1000).toISOString()

      // Upsert subscriptions table
      await supabase.from('subscriptions').upsert({
        user_id: userId,
        stripe_subscription_id: subscription.id,
        stripe_price_id: priceId,
        tier: tier,
        status: 'active',
        current_period_end: periodEnd,
      }, { onConflict: 'user_id' })

      // Update profiles table
      await supabase.from('profiles').update({
        subscription_status: 'active',
        subscription_tier: tier,
        stripe_customer_id: customerId,
      }).eq('id', userId)
    }
  }

  if (event.type === 'customer.subscription.deleted') {
    const subscription = event.data.object as any
    const customerId = subscription.customer as string

    // Update subscriptions via stripe_subscription_id
    await supabase.from('subscriptions').update({
      status: 'inactive',
    }).eq('stripe_subscription_id', subscription.id)

    // Update profiles
    await supabase.from('profiles').update({
      subscription_status: 'inactive',
      subscription_tier: null,
    }).eq('stripe_customer_id', customerId)
  }

  if (event.type === 'customer.subscription.updated') {
    const subscription = event.data.object as any
    const customerId = subscription.customer as string
    const status = subscription.status === 'active' ? 'active' : 'inactive'
    const priceId = subscription.items.data[0]?.price?.id || ''
    const tier = priceId === process.env.NEXT_PUBLIC_FORTRESS_PRICE_ID ? 'fortress' : 'shield'
    const periodEnd = new Date((subscription as any).current_period_end * 1000).toISOString()

    // Update subscriptions table
    await supabase.from('subscriptions').update({
      stripe_price_id: priceId,
      tier: tier,
      status: status,
      current_period_end: periodEnd,
    }).eq('stripe_subscription_id', subscription.id)

    // Update profiles table
    await supabase.from('profiles').update({
      subscription_status: status,
      subscription_tier: tier,
    }).eq('stripe_customer_id', customerId)
  }

  return NextResponse.json({ received: true })
}
