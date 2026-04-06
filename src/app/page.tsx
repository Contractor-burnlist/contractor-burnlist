import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/server'
import PlatformDisclaimer from '@/components/PlatformDisclaimer'
import AnimatedStat from '@/components/AnimatedStat'
import RiskCalculator from '@/components/RiskCalculator'
import StickyCTA from '@/components/StickyCTA'

async function getCtaHref(): Promise<string> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return '/auth/login?next=/pricing'
  const { data: profile } = await supabase.from('profiles').select('subscription_status').eq('id', user.id).single()
  if (profile?.subscription_status === 'active') return '/dashboard'
  return '/pricing'
}

const customerStats = [
  { value: 39000, prefix: '$', suffix: '', label: 'Average annual cost to small businesses from late and unpaid invoices', source: 'Gateway Commercial Finance SMB Payment Survey, 2025', hero: true },
  { value: 56, prefix: '', suffix: '%', label: 'of small businesses are currently owed money from unpaid invoices', source: 'QuickBooks 2025 US Small Business Late Payments Report (2,487 businesses surveyed)', hero: false },
  { value: 53, prefix: '', suffix: '%', label: 'of contractors have turned down new business due to cash flow problems from unpaid invoices', source: 'Gateway Commercial Finance SMB Payment Survey, 2025', hero: false },
  { value: 32, prefix: '', suffix: '%', label: 'of businesses lose 5-30% of their annual revenue to bad debt', source: 'Creditsafe Business Risk Report', hero: false },
  { value: 64, prefix: '', suffix: '%', label: 'of businesses have invoices that are 90+ days overdue', source: 'Gateway Commercial Finance SMB Payment Survey, 2025', hero: false },
  { value: 3, prefix: '$', suffix: 'T', label: 'Total global cost of late payments to small and mid-sized businesses', source: 'Sage / Plum Consulting "The Domino Effect" Report', hero: false },
]

const workerStats = [
  { value: 75, prefix: '', suffix: '%', label: 'of employees have admitted to stealing from their employer at least once', source: 'California Restaurant Association / Statistic Brain' },
  { value: 150000, prefix: '$', suffix: '', label: 'Median loss for small businesses with fewer than 100 employees from employee fraud', source: 'Association of Certified Fraud Examiners (ACFE), 2024 Report to the Nations' },
  { value: 95, prefix: '', suffix: '%', label: 'of all businesses experience employee theft', source: 'California Restaurant Association' },
  { value: 5, prefix: '', suffix: '%', label: 'of revenue is lost to employee fraud each year for the typical organization', source: 'ACFE, 2024 Report to the Nations' },
]

const stepIcons = [
  <svg key="s" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L3 7v5c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-9-5z"/></svg>,
  <svg key="m" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
  <svg key="f" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" y1="22" x2="4" y2="15"/></svg>,
  <svg key="st" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/></svg>,
]

const steps = [
  { title: 'Sign Up Free', description: 'Create your account with Google in seconds. No credit card required.' },
  { title: 'Search Before You Commit', description: 'Check any customer or worker against the database before you take the job.' },
  { title: 'Share Your Experience', description: 'Submit feedback on non-payers, fraudsters, and problem workers to protect fellow contractors.' },
  { title: 'Build Your Reputation', description: 'Earn trust badges and become a valued voice in the community.' },
]

export default async function HomePage() {
  const ctaHref = await getCtaHref()

  return (
    <div>
      {/* HERO */}
      <section className="relative overflow-hidden border-b border-[#1a1a2e] bg-[#0d0d1a] px-4 py-28 sm:px-6 lg:px-8" style={{ background: 'linear-gradient(135deg, #0d0d1a 0%, #1a0a0a 50%, #0d0d1a 100%)' }}>
        <div className="pointer-events-none absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'40\' height=\'40\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M0 0h40v40H0z\' fill=\'none\'/%3E%3Cpath d=\'M0 0h1v1H0zM20 20h1v1h-1z\' fill=\'white\'/%3E%3C/svg%3E")', backgroundSize: '40px 40px' }} />
        <div className="relative mx-auto max-w-7xl flex items-center gap-16">
          <div className="flex-1 text-center lg:text-left">
            <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-[#DC2626]/30 bg-[#DC2626]/10 px-4 py-1.5">
              <span className="h-2 w-2 animate-pulse rounded-full bg-[#DC2626]" />
              <span className="text-xs font-medium text-[#DC2626]">Contractor Experiences &amp; Opinions</span>
            </div>
            <h1 className="mb-6 font-[var(--font-display)] text-5xl font-black uppercase leading-none tracking-tight text-white sm:text-6xl lg:text-7xl">
              Bad Customers Don&apos;t Warn You.{' '}
              <span className="text-[#DC2626]">Other Contractors Will.</span>
            </h1>
            <p className="mx-auto mb-8 max-w-2xl text-lg text-[#8a8a9a] lg:mx-0">
              Not every handshake is honest. Search the contractor-built database for vetting customers and workers before you commit.
            </p>

            <p className="mb-10 text-sm font-medium text-[#6b7280]">Built by contractors, for contractors. Free to sign up — no credit card required.</p>

            <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center lg:justify-start">
              <Link href="/search" className="w-full rounded-lg bg-[#DC2626] px-8 py-3.5 text-center text-sm font-bold text-white shadow-lg shadow-[#DC2626]/20 transition-all hover:scale-105 hover:bg-red-600 hover:shadow-xl hover:shadow-[#DC2626]/30 sm:w-auto">
                Search the Database
              </Link>
              <Link href={ctaHref} className="w-full rounded-lg border border-white/20 px-8 py-3.5 text-center text-sm font-semibold text-[#a0a0a0] transition-all hover:border-white/50 hover:text-white sm:w-auto">
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
              width={300}
              height={300}
              className="object-contain animate-[float_3s_ease-in-out_infinite]"
              style={{ height: '300px', width: 'auto' }}
              priority
            />
          </div>
        </div>
        <style>{`@keyframes float { 0%,100% { transform: translateY(0) } 50% { transform: translateY(-8px) } }`}</style>
      </section>

      {/* RISK CALCULATOR */}
      <RiskCalculator />

      {/* STATS — THE NUMBERS DON'T LIE */}
      <section className="border-b border-gray-200 bg-white px-4 py-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="mb-16 text-center">
            <h2 className="font-[var(--font-display)] text-4xl font-black uppercase tracking-tight text-gray-900 sm:text-5xl">The Numbers Don&apos;t Lie</h2>
            <p className="mt-3 text-gray-600">The home services industry has a problem no one talks about.</p>
          </div>

          <h3 className="mb-8 text-center text-xs font-bold uppercase tracking-[0.2em] text-[#DC2626]">The Cost of Bad Customers</h3>

          <div className="mb-6 rounded-xl border-l-4 border-l-[#DC2626] border border-gray-200 bg-white p-8 text-center shadow-sm sm:p-10">
            <div className="font-[var(--font-display)] text-6xl font-black text-[#DC2626] sm:text-7xl lg:text-8xl">
              <AnimatedStat value={customerStats[0].value} prefix={customerStats[0].prefix} suffix={customerStats[0].suffix} />
            </div>
            <p className="mt-3 text-base text-gray-700">{customerStats[0].label}</p>
            <p className="mt-1 text-[10px] italic text-gray-400">Source: {customerStats[0].source}</p>
          </div>

          <div className="mb-16 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {customerStats.slice(1).map((s) => (
              <div key={s.label} className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                <div className="font-[var(--font-display)] text-3xl font-black text-[#DC2626] sm:text-4xl">
                  <AnimatedStat value={s.value} prefix={s.prefix} suffix={s.suffix} />
                </div>
                <p className="mt-2 text-xs leading-relaxed text-gray-700">{s.label}</p>
                <p className="mt-2 text-[10px] italic text-gray-400">Source: {s.source}</p>
              </div>
            ))}
          </div>

          <h3 className="mb-8 text-center text-xs font-bold uppercase tracking-[0.2em] text-orange-500">The Cost of Bad Workers &amp; Laborers</h3>
          <div className="mb-16 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {workerStats.map((s) => (
              <div key={s.label} className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                <div className="font-[var(--font-display)] text-3xl font-black text-orange-500 sm:text-4xl">
                  <AnimatedStat value={s.value} prefix={s.prefix} suffix={s.suffix} />
                </div>
                <p className="mt-2 text-xs leading-relaxed text-gray-700">{s.label}</p>
                <p className="mt-2 text-[10px] italic text-gray-400">Source: {s.source}</p>
              </div>
            ))}
          </div>

          <div className="text-center">
            <p className="mb-8 font-[var(--font-display)] text-xl font-bold uppercase tracking-tight text-gray-900 sm:text-2xl">
              One bad customer can cost you thousands. One dishonest worker can sink your business.{' '}
              <span className="text-[#DC2626]">Knowledge is protection.</span>
            </p>
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link href="/search" className="w-full rounded-lg bg-[#DC2626] px-8 py-3.5 text-center text-sm font-bold text-white shadow-lg shadow-[#DC2626]/20 transition-all hover:scale-105 hover:bg-red-600 sm:w-auto">
                Search the Database
              </Link>
              <Link href="/submit" className="w-full rounded-lg border border-gray-300 px-8 py-3.5 text-center text-sm font-semibold text-gray-700 transition-all hover:border-gray-400 hover:text-gray-900 sm:w-auto">
                Submit Feedback
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="border-b border-[#e5e7eb] bg-[#fafafa] px-4 py-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <div className="mb-16 text-center">
            <h2 className="font-[var(--font-display)] text-4xl font-black uppercase tracking-tight text-[#111111]">How It Works</h2>
            <p className="mt-3 text-[#6b7280]">Four steps to protect yourself and your peers</p>
          </div>
          <div className="grid grid-cols-1 gap-0 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((step, i) => (
              <div key={step.title} className="relative p-8 text-center">
                {i < 3 && <div className="absolute right-0 top-1/2 hidden h-px w-8 bg-[#DC2626]/30 lg:block" />}
                <div className="pointer-events-none absolute inset-0 flex items-center justify-center font-[var(--font-display)] text-[120px] font-black leading-none text-[#f0f0f0]">
                  {String(i + 1).padStart(2, '0')}
                </div>
                <div className="relative">
                  <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#DC2626]/10 text-[#DC2626]">
                    {stepIcons[i]}
                  </div>
                  <h3 className="mb-2 text-base font-bold text-[#111111]">{step.title}</h3>
                  <p className="text-xs leading-relaxed text-[#6b7280]">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TWO-SIDED PROTECTION */}
      <section className="border-b border-[#e5e7eb] bg-white px-4 py-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <div className="mb-16 text-center">
            <h2 className="font-[var(--font-display)] text-4xl font-black uppercase tracking-tight text-[#111111]">Two-Sided Protection</h2>
            <p className="mt-3 text-[#6b7280]">Vet the people you work for — and the people who work for you</p>
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div className="rounded-2xl border border-gray-200 border-l-4 border-l-[#DC2626] bg-white p-8 shadow-sm transition-transform hover:-translate-y-1">
              <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-xl bg-red-50 text-[#DC2626]">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="8" r="4"/><path d="M6 20v-2a4 4 0 014-4h4a4 4 0 014 4v2"/><line x1="4" y1="4" x2="20" y2="20"/>
                </svg>
              </div>
              <h3 className="mb-3 font-[var(--font-display)] text-2xl font-bold uppercase text-gray-900">Customer Database</h3>
              <ul className="space-y-2.5 text-sm text-gray-700">
                <li className="flex items-start gap-2"><span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#DC2626]" />Search customers before you take the job</li>
                <li className="flex items-start gap-2"><span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#DC2626]" />See flag count and feedback from other contractors</li>
                <li className="flex items-start gap-2"><span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#DC2626]" />Know who doesn&apos;t pay, who commits fraud</li>
              </ul>
            </div>
            <div className="rounded-2xl border border-gray-200 border-l-4 border-l-amber-500 bg-white p-8 shadow-sm transition-transform hover:-translate-y-1">
              <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M2 18v1a1 1 0 001 1h18a1 1 0 001-1v-1"/><path d="M2 18l3-9h14l3 9"/><path d="M9 9V5a1 1 0 011-1h4a1 1 0 011 1v4"/>
                </svg>
              </div>
              <h3 className="mb-3 font-[var(--font-display)] text-2xl font-bold uppercase text-gray-900">Worker Database</h3>
              <ul className="space-y-2.5 text-sm text-gray-700">
                <li className="flex items-start gap-2"><span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500" />Vet workers and laborers before you hire</li>
                <li className="flex items-start gap-2"><span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500" />See feedback on theft, no-shows, poor workmanship</li>
                <li className="flex items-start gap-2"><span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500" />Protect your business from the inside out</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* COMMUNITY */}
      <section className="border-b border-gray-200 bg-gray-50 px-4 py-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <div className="mb-16 text-center">
            <h2 className="font-[var(--font-display)] text-4xl font-black uppercase tracking-tight text-gray-900">Join the Community</h2>
            <p className="mt-3 text-gray-600">More than a database — it&apos;s a community of contractors watching each other&apos;s backs.</p>
          </div>

          <div className="mb-12 grid grid-cols-1 gap-6 sm:grid-cols-3">
            <div className="rounded-xl border border-gray-200 bg-white p-6 text-center shadow-sm">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>
              </div>
              <h3 className="mb-1 text-sm font-bold text-gray-900">Discussions</h3>
              <p className="text-xs text-gray-600">Comment on feedback, share insights, and help the community make better decisions</p>
            </div>
            <div className="rounded-xl border border-gray-200 bg-white p-6 text-center shadow-sm">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-amber-50 text-amber-600">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/></svg>
              </div>
              <h3 className="mb-1 text-sm font-bold text-gray-900">Reputation Ranks</h3>
              <p className="text-xs text-gray-600">Earn points for contributing. Rise from Rookie to Legend and stand out</p>
            </div>
            <div className="rounded-xl border border-gray-200 bg-white p-6 text-center shadow-sm">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-green-50 text-green-600">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"><path d="M12 2L3 7v5c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-9-5z"/><path d="M9 12l2 2 4-4" strokeLinecap="round"/></svg>
              </div>
              <h3 className="mb-1 text-sm font-bold text-gray-900">Verified Badges</h3>
              <p className="text-xs text-gray-600">Link your Google Business Profile to earn a verified badge and boost trust</p>
            </div>
          </div>

          {/* Mock discussion preview */}
          <div className="mx-auto mb-12 max-w-lg rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <span className="font-semibold text-gray-900">PipeKing_SD</span>
              <span className="rounded-full border border-amber-300 bg-amber-50 px-1.5 py-0.5 text-[10px] font-semibold text-amber-700">Veteran</span>
              <span>2h ago</span>
            </div>
            <p className="mt-2 text-sm text-gray-700">Dealt with this customer last year. Same exact pattern — agreed to the quote, then disputed everything after the work was done. Glad someone finally reported them.</p>
            <div className="mt-3 flex items-center gap-4 text-xs text-gray-500">
              <span className="flex items-center gap-1 text-[#DC2626]">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>
                12
              </span>
              <span>3 replies</span>
            </div>
          </div>

          <div className="text-center">
            <Link href={ctaHref} className="inline-block rounded-lg bg-[#DC2626] px-10 py-3.5 text-sm font-bold text-white shadow-lg shadow-[#DC2626]/20 transition-all hover:scale-105 hover:bg-red-600">
              Get Started Free
            </Link>
          </div>
        </div>
      </section>

      {/* PRICING TEASER */}
      <section className="border-b border-[#e5e7eb] bg-[#fafafa] px-4 py-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="font-[var(--font-display)] text-4xl font-black uppercase tracking-tight text-[#111111]">Simple, Transparent Pricing</h2>
          <p className="mt-3 mb-12 text-[#6b7280]">Free to sign up. Upgrade when you need full access.</p>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div className="rounded-2xl border border-[#e5e7eb] bg-white p-8 text-left shadow-sm">
              <h3 className="font-[var(--font-display)] text-2xl font-bold uppercase text-[#111111]">Shield</h3>
              <div className="mt-2 mb-6"><span className="font-[var(--font-display)] text-5xl font-black text-[#111111]">$19</span><span className="text-[#6b7280]">/mo</span></div>
              <ul className="space-y-3 text-sm text-[#6b7280]">
                <li className="flex items-start gap-2"><svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="mt-0.5 shrink-0"><path d="M3 8l3 3 7-7" stroke="#DC2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>Unlimited feedback submissions</li>
                <li className="flex items-start gap-2"><svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="mt-0.5 shrink-0"><path d="M3 8l3 3 7-7" stroke="#DC2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>Search the customer database</li>
                <li className="flex items-start gap-2"><svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="mt-0.5 shrink-0"><path d="M3 8l3 3 7-7" stroke="#DC2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>View initials, city &amp; flag count</li>
                <li className="flex items-start gap-2"><svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="mt-0.5 shrink-0"><path d="M3 8l3 3 7-7" stroke="#DC2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>View full feedback descriptions</li>
                <li className="flex items-start gap-2"><svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="mt-0.5 shrink-0"><path d="M3 8l3 3 7-7" stroke="#DC2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>Community discussions</li>
                <li className="flex items-start gap-2"><svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="mt-0.5 shrink-0"><path d="M3 8l3 3 7-7" stroke="#DC2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>Email alerts (coming soon)</li>
              </ul>
            </div>
            <div className="relative rounded-2xl border-2 border-[#DC2626] bg-white p-8 text-left shadow-lg">
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full bg-[#DC2626] px-4 py-1 text-xs font-bold text-white shadow">Best Value</div>
              <h3 className="font-[var(--font-display)] text-2xl font-bold uppercase text-[#111111]">Fortress</h3>
              <div className="mt-2 mb-6"><span className="font-[var(--font-display)] text-5xl font-black text-[#111111]">$39</span><span className="text-[#6b7280]">/mo</span></div>
              <ul className="space-y-3 text-sm text-[#6b7280]">
                <li className="flex items-start gap-2"><svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="mt-0.5 shrink-0"><path d="M3 8l3 3 7-7" stroke="#DC2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>Everything in Shield, plus:</li>
                <li className="flex items-start gap-2"><svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="mt-0.5 shrink-0"><path d="M3 8l3 3 7-7" stroke="#DC2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>Full address &amp; phone on feedback</li>
                <li className="flex items-start gap-2"><svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="mt-0.5 shrink-0"><path d="M3 8l3 3 7-7" stroke="#DC2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>Worker &amp; laborer database access</li>
                <li className="flex items-start gap-2"><svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="mt-0.5 shrink-0"><path d="M3 8l3 3 7-7" stroke="#DC2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>Advanced search filters</li>
                <li className="flex items-start gap-2"><svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="mt-0.5 shrink-0"><path d="M3 8l3 3 7-7" stroke="#DC2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>Export results (CSV)</li>
                <li className="flex items-start gap-2"><svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="mt-0.5 shrink-0"><path d="M3 8l3 3 7-7" stroke="#DC2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>Priority support</li>
                <li className="flex items-start gap-2"><svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="mt-0.5 shrink-0"><path d="M3 8l3 3 7-7" stroke="#DC2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>Integrations (coming soon)</li>
              </ul>
            </div>
          </div>
          <Link href="/pricing" className="mt-10 inline-block rounded-lg border border-[#DC2626] px-8 py-3 text-sm font-bold text-[#DC2626] transition-all hover:bg-[#DC2626] hover:text-white">
            View Plans →
          </Link>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="relative overflow-hidden bg-[#DC2626] px-4 py-24 sm:px-6 lg:px-8">
        <div className="pointer-events-none absolute inset-0 opacity-10" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'40\' height=\'40\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M0 0h40v40H0z\' fill=\'none\'/%3E%3Cpath d=\'M0 0h1v1H0zM20 20h1v1h-1z\' fill=\'white\'/%3E%3C/svg%3E")', backgroundSize: '40px 40px' }} />
        <div className="relative mx-auto max-w-2xl text-center">
          <h2 className="mb-4 font-[var(--font-display)] text-4xl font-black uppercase tracking-tight text-white sm:text-5xl">Ready to Protect Your Business?</h2>
          <p className="mb-8 text-white/80">Join contractors who check before they commit.</p>
          <Link href={ctaHref} className="inline-block rounded-lg bg-white px-10 py-3.5 text-sm font-bold text-[#DC2626] shadow-lg transition-all hover:scale-105 hover:shadow-xl">
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

      <StickyCTA href={ctaHref} />
    </div>
  )
}
