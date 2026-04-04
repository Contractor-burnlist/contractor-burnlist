'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'

function getEmployeeFactors(count: number): { timeCost: number; fraudRate: number } {
  if (count <= 0) return { timeCost: 6300, fraudRate: 0 }
  if (count <= 5) return { timeCost: 12600, fraudRate: 0.03 }
  if (count <= 10) return { timeCost: 18900, fraudRate: 0.04 }
  if (count <= 25) return { timeCost: 25200, fraudRate: 0.05 }
  if (count <= 50) return { timeCost: 37800, fraudRate: 0.05 }
  return { timeCost: 50400, fraudRate: 0.06 }
}

function formatCurrency(raw: string): string {
  const digits = raw.replace(/\D/g, '')
  if (!digits) return ''
  return Number(digits).toLocaleString()
}

function parseCurrency(formatted: string): number {
  return Number(formatted.replace(/\D/g, '')) || 0
}

const TRADES = [
  'Plumbing', 'Electrical', 'HVAC', 'Painting', 'Cleaning',
  'General Contractor', 'Roofing', 'Landscaping', 'Flooring',
  'Handyman', 'Demolition', 'Fencing', 'Concrete', 'Drywall',
  'Pest Control', 'Tree Service', 'Pressure Washing', 'Garage Door',
  'Locksmith', 'Appliance Repair', 'Other',
]

const TRADE_MULTIPLIER: Record<string, number> = {
  'Roofing': 1.3, 'General Contractor': 1.2, 'Painting': 1.15,
  'Concrete': 1.15, 'Plumbing': 1.1, 'Electrical': 1.1, 'HVAC': 1.1,
}

const HIGH_RISK_STATES = ['CA', 'TX', 'FL', 'NY', 'CO', 'IL']
const MED_RISK_STATES = ['AZ', 'GA', 'NC', 'OH', 'PA', 'NJ', 'NV', 'OR', 'WA']

const US_STATES = [
  'AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA','KS','KY','LA','ME','MD',
  'MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ','NM','NY','NC','ND','OH','OK','OR','PA','RI','SC',
  'SD','TN','TX','UT','VT','VA','WA','WV','WI','WY','DC',
]

type Results = {
  total: number
  badDebt: number
  timeCost: number
  workerFraud: number
  monthsEquiv: number
  riskLevel: string
  trade: string
  state: string
}

function AnimatedDollar({ value }: { value: number }) {
  const [display, setDisplay] = useState(0)
  const animated = useRef(false)

  useEffect(() => {
    if (animated.current) return
    animated.current = true
    const duration = 1500
    const start = performance.now()
    function tick(now: number) {
      const progress = Math.min((now - start) / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setDisplay(Math.round(eased * value))
      if (progress < 1) requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
  }, [value])

  return <>${display.toLocaleString()}</>
}

export default function RiskCalculator() {
  const [revenueDisplay, setRevenueDisplay] = useState('')
  const [employeesDisplay, setEmployeesDisplay] = useState('')
  const [trade, setTrade] = useState('')
  const [state, setState] = useState('')
  const [results, setResults] = useState<Results | null>(null)
  const [copied, setCopied] = useState(false)
  const resultsRef = useRef<HTMLDivElement>(null)

  function handleRevenueChange(e: React.ChangeEvent<HTMLInputElement>) {
    const raw = e.target.value.replace(/\D/g, '')
    setRevenueDisplay(formatCurrency(raw))
    setResults(null)
  }

  function handleEmployeesChange(e: React.ChangeEvent<HTMLInputElement>) {
    const raw = e.target.value.replace(/\D/g, '')
    setEmployeesDisplay(raw)
    setResults(null)
  }

  function calculate() {
    const annualRev = parseCurrency(revenueDisplay)
    const empCount = Number(employeesDisplay) || 0
    if (annualRev < 1 || !trade || !state) return

    const emp = getEmployeeFactors(empCount)
    const badDebt = annualRev * 0.11 * 0.10 + annualRev * 0.05
    const timeCost = emp.timeCost
    const workerFraud = annualRev * emp.fraudRate

    const tradeMult = TRADE_MULTIPLIER[trade] ?? 1.0
    const stateMult = HIGH_RISK_STATES.includes(state) ? 1.15 : MED_RISK_STATES.includes(state) ? 1.05 : 1.0

    const total = Math.round((badDebt + timeCost + workerFraud) * tradeMult * stateMult)
    const monthsEquiv = Math.round((total / (annualRev / 12)) * 10) / 10

    const riskLevel = stateMult > 1.1 ? 'higher than average' : stateMult > 1.0 ? 'slightly above average' : 'average'

    setResults({ total, badDebt: Math.round(badDebt * tradeMult * stateMult), timeCost: Math.round(timeCost * tradeMult * stateMult), workerFraud: Math.round(workerFraud * tradeMult * stateMult), monthsEquiv, riskLevel, trade, state })

    setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100)
  }

  function handleShare() {
    const text = `I just found out my ${results?.trade} business could be losing $${results?.total.toLocaleString()}/year to bad customers and worker fraud. Check your risk at contractorburnlist.com`
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const isValid = parseCurrency(revenueDisplay) >= 1 && employeesDisplay !== '' && trade && state

  const selectClass = 'w-full rounded border border-[#e5e7eb] bg-white px-4 py-3 text-sm text-[#111111] outline-none focus:border-[#DC2626] appearance-none'

  return (
    <section className="border-b border-[#e5e7eb] bg-gradient-to-b from-[#f9fafb] to-white px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-10 text-center">
          <h2 className="mb-3 text-3xl font-black text-[#111111]">How Much Are You Losing?</h2>
          <p className="text-[#6b7280]">Enter your business details to see what bad customers and dishonest workers could be costing you every year.</p>
        </div>

        <div className="rounded-xl border border-[#e5e7eb] bg-white p-6 shadow-sm sm:p-8">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-[#6b7280]">Annual Revenue</label>
              <div className="relative">
                <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm text-[#9ca3af]">$</span>
                <input
                  type="text"
                  inputMode="numeric"
                  value={revenueDisplay}
                  onChange={handleRevenueChange}
                  placeholder="0"
                  className="w-full rounded border border-[#e5e7eb] bg-white py-3 pl-8 pr-4 text-sm text-[#111111] outline-none focus:border-[#DC2626]"
                />
              </div>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-[#6b7280]">Number of Employees</label>
              <input
                type="text"
                inputMode="numeric"
                value={employeesDisplay}
                onChange={handleEmployeesChange}
                placeholder="0"
                className="w-full rounded border border-[#e5e7eb] bg-white px-4 py-3 text-sm text-[#111111] outline-none focus:border-[#DC2626]"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-[#6b7280]">Trade / Industry</label>
              <select value={trade} onChange={(e) => { setTrade(e.target.value); setResults(null) }} className={selectClass}>
                <option value="">Select trade</option>
                {TRADES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-[#6b7280]">State</label>
              <select value={state} onChange={(e) => { setState(e.target.value); setResults(null) }} className={selectClass}>
                <option value="">Select state</option>
                {US_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>

          <button
            onClick={calculate}
            disabled={!isValid}
            className="mt-6 w-full rounded bg-[#DC2626] py-3.5 text-sm font-semibold text-white transition-colors hover:bg-red-700 disabled:opacity-40"
          >
            Calculate My Risk
          </button>
        </div>

        {results && (
          <div ref={resultsRef} className="mt-8 space-y-6">
            {/* Total */}
            <div className="rounded-xl border border-[#DC2626]/20 bg-[#DC2626]/5 p-8 text-center">
              <p className="mb-2 text-sm font-medium text-[#6b7280]">Your estimated annual risk</p>
              <div className="text-5xl font-black text-[#DC2626] sm:text-6xl">
                <AnimatedDollar value={results.total} />
              </div>
              <p className="mt-3 text-sm text-[#6b7280]">
                This is what businesses like yours lose on average each year to bad customers and dishonest workers.
              </p>
              <p className="mt-2 text-sm font-semibold text-[#111111]">
                That&apos;s equivalent to <span className="text-[#DC2626]">{results.monthsEquiv} months</span> of revenue lost every year.
              </p>
            </div>

            {/* Breakdown */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="rounded-lg border border-[#e5e7eb] bg-white p-5">
                <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-full bg-[#DC2626]/10">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/>
                  </svg>
                </div>
                <div className="text-2xl font-black text-[#111111]">${results.badDebt.toLocaleString()}</div>
                <div className="mt-1 text-xs font-semibold text-[#6b7280]">Unpaid Invoices &amp; Bad Debt</div>
                <p className="mt-2 text-[10px] text-[#9ca3af]">Based on 11% of revenue tied up in overdue invoices and 10% becoming bad debt</p>
              </div>
              <div className="rounded-lg border border-[#e5e7eb] bg-white p-5">
                <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-full bg-amber-100">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                  </svg>
                </div>
                <div className="text-2xl font-black text-[#111111]">${results.timeCost.toLocaleString()}</div>
                <div className="mt-1 text-xs font-semibold text-[#6b7280]">Time Wasted Chasing Payments</div>
                <p className="mt-2 text-[10px] text-[#9ca3af]">Hours spent following up on unpaid invoices instead of doing billable work</p>
              </div>
              <div className="rounded-lg border border-[#e5e7eb] bg-white p-5">
                <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-full bg-orange-100">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ea580c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="8" r="4"/><path d="M6 20v-2a4 4 0 014-4h4a4 4 0 014 4v2"/><line x1="18" y1="8" x2="23" y2="8"/>
                  </svg>
                </div>
                <div className="text-2xl font-black text-[#111111]">
                  {results.workerFraud > 0 ? `$${results.workerFraud.toLocaleString()}` : '$0'}
                </div>
                <div className="mt-1 text-xs font-semibold text-[#6b7280]">Employee Theft &amp; Fraud</div>
                <p className="mt-2 text-[10px] text-[#9ca3af]">
                  {results.workerFraud > 0
                    ? 'The ACFE reports businesses lose 5% of revenue to occupational fraud'
                    : 'Solo operator — no employee fraud exposure'}
                </p>
              </div>
            </div>

            {/* Context */}
            <p className="text-center text-sm text-[#6b7280]">
              Contractors in <strong className="text-[#111111]">{results.state}</strong> working in <strong className="text-[#111111]">{results.trade}</strong> face{' '}
              <strong className="text-[#DC2626]">{results.riskLevel}</strong> risk compared to the national baseline.
            </p>

            {/* CTA */}
            <div className="rounded-xl border border-[#e5e7eb] bg-[#f9fafb] p-6 text-center">
              <p className="mb-1 text-sm font-bold text-[#111111]">Protect yourself for less than $1/day</p>
              <p className="mb-5 text-xs text-[#6b7280]">
                A Contractor Burnlist subscription costs $19/month — that&apos;s less than 1% of what you could lose.
              </p>
              <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
                <Link href="/search" className="w-full rounded bg-[#DC2626] px-6 py-2.5 text-center text-sm font-semibold text-white transition-colors hover:bg-red-700 sm:w-auto">
                  Search the Registry
                </Link>
                <Link href="/pricing" className="w-full rounded border border-[#DC2626] px-6 py-2.5 text-center text-sm font-semibold text-[#DC2626] transition-colors hover:bg-[#DC2626] hover:text-white sm:w-auto">
                  View Plans
                </Link>
              </div>
            </div>

            {/* Share */}
            <div className="text-center">
              <button onClick={handleShare} className="inline-flex items-center gap-2 rounded border border-[#e5e7eb] px-4 py-2 text-xs font-medium text-[#6b7280] transition-colors hover:border-[#d1d5db] hover:text-[#111111]">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
                  <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
                </svg>
                {copied ? 'Copied!' : 'Share Your Results'}
              </button>
            </div>

            {/* Fine print */}
            <p className="text-center text-[10px] leading-relaxed text-[#9ca3af]">
              These estimates are based on published industry research from the Association of Certified Fraud Examiners (ACFE),
              Gateway Commercial Finance, QuickBooks, Sage, and the Better Business Bureau.
              Individual results may vary. This calculator provides general estimates for educational purposes only
              and does not guarantee specific outcomes.
            </p>
          </div>
        )}
      </div>
    </section>
  )
}
