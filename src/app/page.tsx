import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/server'

const stats = [
  { label: 'Contractors Protected', value: '12,400+' },
  { label: 'Entries Submitted', value: '38,200+' },
  { label: 'Cities Covered', value: '850+' },
]

const steps = [
  {
    number: '01',
    title: 'Search the Registry',
    description: 'Enter a customer name, address, or phone number to check if they appear in our database.',
  },
  {
    number: '02',
    title: 'Review Their History',
    description: 'See verified reports from other contractors — unpaid invoices, fraud flags, and dispute patterns.',
  },
  {
    number: '03',
    title: 'Make an Informed Decision',
    description: "Decide whether to take the job with full visibility into the customer's track record.",
  },
]

async function getCtaHref(): Promise<string> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return '/auth/login?next=/pricing'

  const { data: profile } = await supabase
    .from('profiles')
    .select('subscription_status')
    .eq('id', user.id)
    .single()

  if (profile?.subscription_status === 'active') return '/dashboard'
  return '/pricing'
}

export default async function HomePage() {
  const ctaHref = await getCtaHref()

  return (
    <div>
      {/* Hero — stays dark */}
      <section className="relative border-b border-[#2a2a2a] bg-[#0a0a0a] px-4 py-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl flex items-center gap-12">
          {/* Text content */}
          <div className="flex-1 text-center lg:text-left">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#DC2626]/30 bg-[#DC2626]/10 px-4 py-1.5">
              <span className="h-2 w-2 rounded-full bg-[#DC2626]" />
              <span className="text-xs font-medium text-[#DC2626]">Contractor-Verified Reports</span>
            </div>
            <h1 className="mb-6 text-4xl font-black leading-tight text-white sm:text-5xl lg:text-6xl">
              Know Who You&apos;re Working For{' '}
              <span className="text-[#DC2626]">Before You Start</span>
            </h1>
            <p className="mx-auto mb-10 max-w-2xl text-lg text-[#a0a0a0] lg:mx-0">
              The contractor-only registry for flagging problem customers — unpaid invoices, fraudulent claims,
              and repeat offenders. Protect your business before the first nail goes in.
            </p>
            <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center lg:justify-start">
              <Link
                href="/search"
                className="w-full rounded bg-[#DC2626] px-8 py-3 text-center text-sm font-semibold text-white transition-colors hover:bg-red-700 sm:w-auto"
              >
                Search the Registry
              </Link>
              <Link
                href={ctaHref}
                className="w-full rounded border border-[#2a2a2a] px-8 py-3 text-center text-sm font-semibold text-[#a0a0a0] transition-colors hover:border-white hover:text-white sm:w-auto"
              >
                Get Access →
              </Link>
            </div>
          </div>

          {/* Mascot */}
          <div className="hidden lg:flex flex-col items-center flex-shrink-0">
            {/* Speech bubble */}
            <div className="relative mb-3 rounded-2xl border-2 border-white/20 bg-white px-4 py-2.5 text-center shadow-lg">
              <span className="text-sm font-bold text-[#0a0a0a] whitespace-nowrap">Phew! Disaster avoided.</span>
              {/* Bubble tail */}
              <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 h-0 w-0 border-l-8 border-r-8 border-t-[12px] border-l-transparent border-r-transparent border-t-white" />
            </div>
            <Image
              src="/mascot-removebg-preview.png"
              alt="Contractor Burnlist mascot"
              width={280}
              height={280}
              className="object-contain"
              style={{ height: '280px', width: 'auto' }}
              priority
            />
          </div>
        </div>
      </section>

      {/* Stats — white */}
      <section className="border-b border-[#e5e7eb] bg-white px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-4xl font-black text-[#111111]">{stat.value}</div>
                <div className="mt-1 text-sm text-[#6b7280]">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works — light gray */}
      <section className="border-b border-[#e5e7eb] bg-[#f9fafb] px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-black text-[#111111]">How It Works</h2>
            <p className="mt-3 text-[#6b7280]">Three steps to protect yourself from problem customers</p>
          </div>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {steps.map((step) => (
              <div key={step.number} className="rounded-lg border border-[#e5e7eb] bg-white p-8">
                <div className="mb-4 text-4xl font-black text-[#DC2626]">{step.number}</div>
                <h3 className="mb-3 text-lg font-bold text-[#111111]">{step.title}</h3>
                <p className="text-sm leading-relaxed text-[#6b7280]">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA — red */}
      <section className="bg-[#DC2626] px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="mb-4 text-3xl font-black text-white">
            Ready to protect your business?
          </h2>
          <p className="mb-8 text-white/80">
            Join thousands of contractors who check before they commit.
          </p>
          <Link
            href={ctaHref}
            className="inline-block rounded bg-white px-10 py-3 text-sm font-semibold text-[#DC2626] transition-colors hover:bg-gray-100"
          >
            Get Access Today
          </Link>
        </div>
      </section>

      {/* Footer — dark */}
      <footer className="border-t border-[#2a2a2a] bg-[#111111] px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl flex flex-col items-center justify-between gap-4 sm:flex-row">
          <div className="flex items-center gap-2">
            <Image src="/logo-icon.png" alt="Contractor Burnlist" width={22} height={22} style={{ height: '22px', width: 'auto' }} />
            <span className="text-sm font-bold text-white">Contractor Burnlist</span>
          </div>
          <p className="text-xs text-[#6b7280]">© {new Date().getFullYear()} Contractor Burnlist. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
