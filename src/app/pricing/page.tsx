'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

const plans = [
  {
    name: 'Shield',
    price: 19,
    priceId: process.env.NEXT_PUBLIC_SHIELD_PRICE_ID || '',
    tagline: 'Your first line of defense',
    features: [
      'Search the registry',
      'View initials + city on results',
      'Submit up to 3 entries/month',
      'Email alerts on new matches',
    ],
    recommended: false,
    cta: 'Get Shield Access',
  },
  {
    name: 'Fortress',
    price: 39,
    priceId: process.env.NEXT_PUBLIC_FORTRESS_PRICE_ID || '',
    tagline: 'Total protection for your business',
    features: [
      'Everything in Shield',
      'Full address + phone number visible',
      'Unlimited submissions',
      'Priority support',
      'Worker registry access',
      'Integration ready (coming soon)',
    ],
    recommended: true,
    cta: 'Get Fortress Access',
  },
]

export default function PricingPage() {
  const [loading, setLoading] = useState<string | null>(null)

  async function handleCheckout(priceId: string) {
    setLoading(priceId)

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      window.location.href = '/auth/login'
      return
    }

    const res = await fetch('/api/create-checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ priceId }),
    })

    const data = await res.json()

    if (data.url) {
      window.location.href = data.url
    } else {
      setLoading(null)
    }
  }

  return (
    <div className="px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl text-center">
        <h1 className="mb-3 text-4xl font-black text-[#111111]">Simple, Transparent Pricing</h1>
        <p className="mb-12 text-lg text-[#6b7280]">
          Protect your business. Choose the plan that fits your needs.
        </p>
      </div>

      <div className="mx-auto grid max-w-4xl grid-cols-1 gap-6 sm:grid-cols-2">
        {plans.map((plan) => (
          <div
            key={plan.name}
            className={`relative rounded-lg border-2 bg-white p-8 ${
              plan.recommended
                ? 'border-[#DC2626] shadow-lg'
                : 'border-[#e5e7eb]'
            }`}
          >
            {plan.recommended && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-[#DC2626] px-4 py-1 text-xs font-semibold text-white">
                Recommended
              </div>
            )}
            <h2 className="mb-1 text-xl font-black text-[#111111]">{plan.name}</h2>
            <p className="mb-4 text-sm text-[#6b7280]">{plan.tagline}</p>
            <div className="mb-6">
              <span className="text-4xl font-black text-[#111111]">${plan.price}</span>
              <span className="text-[#6b7280]">/month</span>
            </div>
            <ul className="mb-8 space-y-3">
              {plan.features.map((feature) => (
                <li key={feature} className="flex items-start gap-2 text-sm text-[#4b5563]">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="mt-0.5 shrink-0">
                    <path d="M3 8l3 3 7-7" stroke="#DC2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  {feature}
                </li>
              ))}
            </ul>
            <button
              onClick={() => handleCheckout(plan.priceId)}
              disabled={loading === plan.priceId}
              className={`w-full rounded py-3 text-sm font-semibold transition-colors disabled:opacity-50 ${
                plan.recommended
                  ? 'bg-[#DC2626] text-white hover:bg-red-700'
                  : 'border border-[#DC2626] text-[#DC2626] hover:bg-[#DC2626] hover:text-white'
              }`}
            >
              {loading === plan.priceId ? (
                <span className="inline-flex items-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-current/30 border-t-current" />
                  Redirecting...
                </span>
              ) : plan.cta}
            </button>
          </div>
        ))}
      </div>

      <div className="mx-auto mt-12 max-w-2xl text-center">
        <p className="text-sm text-[#9ca3af]">
          Cancel anytime. All plans include a 7-day money-back guarantee.
        </p>
      </div>
    </div>
  )
}
