import Link from 'next/link'
import Image from 'next/image'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import PlatformDisclaimer from '@/components/PlatformDisclaimer'
import AnimatedStat from '@/components/AnimatedStat'
import RiskCalculator from '@/components/RiskCalculator'

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


const customerStats = [
  { value: 39000, prefix: '$', suffix: '', label: 'Average annual cost to small businesses from late and unpaid invoices', source: 'Gateway Commercial Finance SMB Payment Survey, 2025' },
  { value: 56, prefix: '', suffix: '%', label: 'of small businesses are currently owed money from unpaid invoices', source: 'QuickBooks 2025 US Small Business Late Payments Report (2,487 businesses surveyed)' },
  { value: 53, prefix: '', suffix: '%', label: 'of contractors have turned down new business due to cash flow problems from unpaid invoices', source: 'Gateway Commercial Finance SMB Payment Survey, 2025' },
  { value: 32, prefix: '', suffix: '%', label: 'of businesses lose 5-30% of their annual revenue to bad debt', source: 'Creditsafe Business Risk Report' },
  { value: 64, prefix: '', suffix: '%', label: 'of businesses have invoices that are 90+ days overdue', source: 'Gateway Commercial Finance SMB Payment Survey, 2025' },
  { value: 3, prefix: '$', suffix: 'T', label: 'Total global cost of late payments to small and mid-sized businesses', source: 'Sage / Plum Consulting "The Domino Effect" Report' },
]

const workerStats = [
  { value: 75, prefix: '', suffix: '%', label: 'of employees have admitted to stealing from their employer at least once', source: 'California Restaurant Association / Statistic Brain' },
  { value: 150000, prefix: '$', suffix: '', label: 'Median loss for small businesses with fewer than 100 employees from employee fraud', source: 'Association of Certified Fraud Examiners (ACFE), 2024 Report to the Nations' },
  { value: 95, prefix: '', suffix: '%', label: 'of all businesses experience employee theft', source: 'California Restaurant Association' },
  { value: 5, prefix: '', suffix: '%', label: 'of revenue is lost to employee fraud each year for the typical organization', source: 'ACFE, 2024 Report to the Nations' },
]

const steps = [
  { number: '01', title: 'Sign Up Free', description: 'Create your account with Google in seconds. No credit card required to get started.' },
  { number: '02', title: 'Search Before You Commit', description: 'Check any customer or worker against the database before you take the job or make the hire.' },
  { number: '03', title: 'Report Bad Actors', description: 'Submit reports on non-payers, fraudsters, and problem workers to protect fellow contractors.' },
  { number: '04', title: 'Build Your Reputation', description: 'Earn trust badges, build your reputation rank, and become a valued voice in the community.' },
]

async function getLiveCounts() {
  const supabase = await createServiceClient()
  const [{ count: reports }, { count: users }] = await Promise.all([
    supabase.from('entries').select('id', { count: 'exact', head: true }),
    supabase.from('profiles').select('id', { count: 'exact', head: true }),
  ])
  const { count: workerReports } = await supabase.from('worker_entries').select('id', { count: 'exact', head: true })
  return { reports: (reports ?? 0) + (workerReports ?? 0), users: users ?? 0 }
}

export default async function HomePage() {
  const ctaHref = await getCtaHref()
  const liveCounts = await getLiveCounts()

  return (
    <div>
      {/* HERO */}
      <section className="relative border-b border-[#2a2a2a] bg-[#0a0a0a] px-4 py-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl flex items-center gap-12">
          <div className="flex-1 text-center lg:text-left">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#DC2626]/30 bg-[#DC2626]/10 px-4 py-1.5">
              <span className="h-2 w-2 rounded-full bg-[#DC2626]" />
              <span className="text-xs font-medium text-[#DC2626]">Contractor-Verified Reports</span>
            </div>
            <h1 className="mb-6 text-4xl font-black leading-tight text-white sm:text-5xl lg:text-6xl">
              Stop Working for Free.{' '}
              <span className="text-[#DC2626]">Start Protecting Your Business.</span>
            </h1>
            <p className="mx-auto mb-6 max-w-2xl text-lg text-[#a0a0a0] lg:mx-0">
              Contractors lose an average of $39,000/year to late payments, fraud, and theft.
              The database that helps you vet customers and workers before you commit.
            </p>
            {liveCounts.reports > 0 && (
              <div className="mb-10 flex items-center justify-center gap-6 lg:justify-start">
                <div className="text-center lg:text-left">
                  <div className="text-2xl font-black text-white">{liveCounts.reports.toLocaleString()}</div>
                  <div className="text-xs text-[#6b7280]">reports submitted</div>
                </div>
                <div className="h-8 w-px bg-[#2a2a2a]" />
                <div className="text-center lg:text-left">
                  <div className="text-2xl font-black text-white">{liveCounts.users.toLocaleString()}</div>
                  <div className="text-xs text-[#6b7280]">contractors</div>
                </div>
              </div>
            )}
            <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center lg:justify-start">
              <Link
                href="/search"
                className="w-full rounded bg-[#DC2626] px-8 py-3 text-center text-sm font-semibold text-white transition-colors hover:bg-red-700 sm:w-auto"
              >
                Search the Database
              </Link>
              <Link
                href={ctaHref}
                className="w-full rounded border border-[#2a2a2a] px-8 py-3 text-center text-sm font-semibold text-[#a0a0a0] transition-colors hover:border-white hover:text-white sm:w-auto"
              >
                Get Access →
              </Link>
            </div>
          </div>

          <div className="hidden lg:flex flex-col items-center flex-shrink-0">
            <div className="relative mb-3 rounded-2xl border-2 border-white/20 bg-white px-4 py-2.5 text-center shadow-lg">
              <span className="text-sm font-bold text-[#0a0a0a] whitespace-nowrap">Phew! Disaster avoided.</span>
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

      {/* RISK CALCULATOR */}
      <RiskCalculator />

      {/* THE WAKE-UP CALL — BAD CUSTOMERS */}
      <section className="border-b border-[#2a2a2a] bg-[#0a0a0a] px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="mb-14 text-center">
            <h2 className="mb-3 text-3xl font-black text-white sm:text-4xl">The Numbers Don&apos;t Lie</h2>
            <p className="text-[#a0a0a0]">The home services industry has a problem no one talks about. Here&apos;s what it&apos;s costing you.</p>
          </div>

          <h3 className="mb-6 text-center text-sm font-bold uppercase tracking-widest text-[#DC2626]">The Cost of Bad Customers</h3>
          <div className="mb-16 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {customerStats.map((s) => (
              <div key={s.label} className="rounded-lg border border-[#2a2a2a] bg-[#111111] p-6">
                <div className="mb-2 text-4xl font-black text-[#DC2626] sm:text-5xl">
                  <AnimatedStat value={s.value} prefix={s.prefix} suffix={s.suffix} />
                </div>
                <p className="mb-3 text-sm leading-relaxed text-[#a0a0a0]">{s.label}</p>
                <p className="text-[10px] text-[#4b5563]">Source: {s.source}</p>
              </div>
            ))}
          </div>

          <h3 className="mb-6 text-center text-sm font-bold uppercase tracking-widest text-orange-500">The Cost of Bad Workers &amp; Laborers</h3>
          <div className="mb-14 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {workerStats.map((s) => (
              <div key={s.label} className="rounded-lg border border-[#2a2a2a] bg-[#111111] p-6">
                <div className="mb-2 text-4xl font-black text-orange-500 sm:text-5xl">
                  <AnimatedStat value={s.value} prefix={s.prefix} suffix={s.suffix} />
                </div>
                <p className="mb-3 text-sm leading-relaxed text-[#a0a0a0]">{s.label}</p>
                <p className="text-[10px] text-[#4b5563]">Source: {s.source}</p>
              </div>
            ))}
          </div>

          <div className="text-center">
            <p className="mb-8 text-lg font-bold text-white">
              One bad customer can cost you thousands. One dishonest worker can sink your business.{' '}
              <span className="text-[#DC2626]">Knowledge is protection.</span>
            </p>
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link href="/search" className="w-full rounded bg-[#DC2626] px-8 py-3 text-center text-sm font-semibold text-white transition-colors hover:bg-red-700 sm:w-auto">
                Search the Database
              </Link>
              <Link href="/submit" className="w-full rounded border border-[#2a2a2a] px-8 py-3 text-center text-sm font-semibold text-[#a0a0a0] transition-colors hover:border-white hover:text-white sm:w-auto">
                Submit a Report
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="border-b border-[#e5e7eb] bg-[#f9fafb] px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-black text-[#111111]">How It Works</h2>
            <p className="mt-3 text-[#6b7280]">Four steps to protect yourself and your peers</p>
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
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

      {/* TWO-SIDED PROTECTION */}
      <section className="border-b border-[#e5e7eb] bg-white px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-black text-[#111111]">Two-Sided Protection</h2>
            <p className="mt-3 text-[#6b7280]">Vet the people you work for — and the people who work for you</p>
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div className="rounded-lg border-2 border-[#DC2626]/20 bg-[#DC2626]/5 p-8">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#DC2626]/10">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="8" r="4"/><path d="M6 20v-2a4 4 0 014-4h4a4 4 0 014 4v2"/><line x1="4" y1="4" x2="20" y2="20"/>
                </svg>
              </div>
              <h3 className="mb-2 text-xl font-bold text-[#111111]">Customer Database</h3>
              <ul className="space-y-2 text-sm text-[#6b7280]">
                <li className="flex items-start gap-2"><span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-[#DC2626]" />Search customers before you take the job</li>
                <li className="flex items-start gap-2"><span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-[#DC2626]" />See their flag count and reports from other contractors</li>
                <li className="flex items-start gap-2"><span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-[#DC2626]" />Know who doesn&apos;t pay, who commits fraud, who&apos;s hostile</li>
              </ul>
            </div>
            <div className="rounded-lg border-2 border-orange-300/30 bg-orange-50 p-8">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-orange-100">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ea580c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M2 18v1a1 1 0 001 1h18a1 1 0 001-1v-1"/><path d="M2 18l3-9h14l3 9"/><path d="M9 9V5a1 1 0 011-1h4a1 1 0 011 1v4"/>
                </svg>
              </div>
              <h3 className="mb-2 text-xl font-bold text-[#111111]">Worker Database</h3>
              <ul className="space-y-2 text-sm text-[#6b7280]">
                <li className="flex items-start gap-2"><span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-orange-500" />Vet workers and laborers before you hire</li>
                <li className="flex items-start gap-2"><span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-orange-500" />See reports on theft, no-shows, poor workmanship</li>
                <li className="flex items-start gap-2"><span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-orange-500" />Protect your business from the inside out</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* COMMUNITY */}
      <section className="border-b border-[#e5e7eb] bg-[#f9fafb] px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="mb-3 text-3xl font-black text-[#111111]">Join the Growing Community of Contractors</h2>
          <p className="mb-10 text-[#6b7280]">
            More than a database — it&apos;s a community. Discuss reports, earn reputation, and build trust with fellow contractors.
          </p>
          <div className="mb-10 grid grid-cols-1 gap-6 sm:grid-cols-3">
            <div className="rounded-lg border border-[#e5e7eb] bg-white p-6">
              <div className="mb-3 text-3xl">💬</div>
              <h3 className="mb-1 text-sm font-bold text-[#111111]">Discussions</h3>
              <p className="text-xs text-[#6b7280]">Comment on reports, share insights, and help the community make better decisions</p>
            </div>
            <div className="rounded-lg border border-[#e5e7eb] bg-white p-6">
              <div className="mb-3 text-3xl">⭐</div>
              <h3 className="mb-1 text-sm font-bold text-[#111111]">Reputation Ranks</h3>
              <p className="text-xs text-[#6b7280]">Earn points for contributing. Rise from Rookie to Legend and stand out in the community</p>
            </div>
            <div className="rounded-lg border border-[#e5e7eb] bg-white p-6">
              <div className="mb-3 text-3xl">🛡️</div>
              <h3 className="mb-1 text-sm font-bold text-[#111111]">Verified Badges</h3>
              <p className="text-xs text-[#6b7280]">Link your Google Business Profile to earn a verified badge and boost your trust score</p>
            </div>
          </div>

          <Link href={ctaHref} className="inline-block rounded bg-[#DC2626] px-10 py-3 text-sm font-semibold text-white transition-colors hover:bg-red-700">
            Get Started Free
          </Link>
        </div>
      </section>

      {/* PRICING TEASER */}
      <section className="border-b border-[#e5e7eb] bg-white px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="mb-3 text-3xl font-black text-[#111111]">Simple, Transparent Pricing</h2>
          <p className="mb-10 text-[#6b7280]">Free to sign up. Upgrade when you need full access.</p>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div className="rounded-lg border border-[#e5e7eb] p-6 text-left">
              <h3 className="text-lg font-bold text-[#111111]">Shield</h3>
              <div className="mt-1 mb-4"><span className="text-3xl font-black text-[#111111]">$19</span><span className="text-[#6b7280]">/mo</span></div>
              <ul className="space-y-2 text-sm text-[#6b7280]">
                <li>Unlimited report submissions</li>
                <li>Search the customer database</li>
                <li>View full report descriptions</li>
              </ul>
            </div>
            <div className="rounded-lg border-2 border-[#DC2626] p-6 text-left relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-[#DC2626] px-3 py-0.5 text-xs font-semibold text-white">Recommended</div>
              <h3 className="text-lg font-bold text-[#111111]">Fortress</h3>
              <div className="mt-1 mb-4"><span className="text-3xl font-black text-[#111111]">$39</span><span className="text-[#6b7280]">/mo</span></div>
              <ul className="space-y-2 text-sm text-[#6b7280]">
                <li>Everything in Shield</li>
                <li>Full address + phone visible</li>
                <li>Worker & laborer database</li>
                <li>Export results (CSV)</li>
              </ul>
            </div>
          </div>
          <Link href="/pricing" className="mt-8 inline-block rounded border border-[#DC2626] px-8 py-3 text-sm font-semibold text-[#DC2626] transition-colors hover:bg-[#DC2626] hover:text-white">
            View Plans →
          </Link>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-[#DC2626] px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="mb-4 text-3xl font-black text-white">Ready to protect your business?</h2>
          <p className="mb-8 text-white/80">Join contractors who check before they commit.</p>
          <Link href={ctaHref} className="inline-block rounded bg-white px-10 py-3 text-sm font-semibold text-[#DC2626] transition-colors hover:bg-gray-100">
            Get Access Today
          </Link>
        </div>
      </section>

      {/* DISCLAIMER */}
      <section className="bg-white px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <PlatformDisclaimer variant="full" />
        </div>
      </section>
    </div>
  )
}
