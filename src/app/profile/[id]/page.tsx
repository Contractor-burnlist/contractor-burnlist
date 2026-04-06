import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import PlatformDisclaimer from '@/components/PlatformDisclaimer'
import { riskScoreLabel } from '@/lib/risk-score'
import CommentSection from '@/components/CommentSection'
import FlagButton from '@/components/FlagButton'
import DisputeForm from '@/components/DisputeForm'

const riskColors: Record<string, string> = {
  high: 'text-[#DC2626] bg-[#DC2626]/10 border-[#DC2626]/30',
  medium: 'text-yellow-600 bg-yellow-50 border-yellow-300',
  low: 'text-green-600 bg-green-50 border-green-300',
  unknown: 'text-[#6b7280] bg-gray-50 border-gray-300',
}

const riskLabels: Record<string, string> = {
  high: 'High Risk',
  medium: 'Medium Risk',
  low: 'Low Risk',
  unknown: 'Unknown',
}

export default async function ProfilePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const { id } = await params
  const { type } = await searchParams
  const profileType = type === 'worker' ? 'worker' : 'customer'

  const supabase = await createClient()

  // Check auth + subscription
  const { data: { user } } = await supabase.auth.getUser()
  let subTier: string | null = null
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('subscription_status, subscription_tier')
      .eq('id', user.id)
      .single()
    if (profile?.subscription_status === 'active') subTier = profile.subscription_tier
  }

  const isFortress = subTier === 'fortress'
  const hasActiveSubscription = subTier !== null

  if (profileType === 'worker') {
    if (!isFortress) {
      return (
        <div className="mx-auto max-w-3xl px-4 py-24 text-center sm:px-6 lg:px-8">
          <div className="rounded-lg border border-[#e5e7eb] bg-white p-10">
            <div className="mb-4 text-4xl">🔒</div>
            <h2 className="mb-2 text-2xl font-black text-[#111111]">Worker Feedback — Fortress Only</h2>
            <p className="mb-6 text-[#6b7280]">Worker and laborer feedback is available exclusively to Fortress subscribers.</p>
            <Link href="/pricing" className="inline-block rounded bg-[#DC2626] px-8 py-3 text-sm font-semibold text-white transition-colors hover:bg-red-700">Upgrade to Fortress</Link>
          </div>
        </div>
      )
    }
    return renderWorkerProfile(supabase, id, isFortress)
  }

  return renderCustomerProfile(supabase, id, hasActiveSubscription, isFortress)
}

async function renderCustomerProfile(
  supabase: Awaited<ReturnType<typeof createClient>>,
  id: string,
  hasActiveSubscription: boolean,
  isFortress: boolean,
) {
  const { data: customer, error } = await supabase
    .from('customers')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !customer) {
    notFound()
  }

  const { data: entries } = await supabase
    .from('entries')
    .select('id, customer_id, category_tags, description, amount_owed, incident_date, submitter_profile_complete, created_at')
    .eq('customer_id', id)
    .order('created_at', { ascending: false })

  const entryList = entries || []
  const totalOwed = entryList.reduce((sum, e) => sum + (e.amount_owed || 0), 0)
  const firstReported = entryList.length > 0
    ? new Date(entryList[entryList.length - 1].created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    : null

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <Link href="/search" className="mb-8 inline-flex items-center gap-2 text-sm text-[#6b7280] hover:text-[#111111]">
        ← Back to Search
      </Link>

      {/* Dispute Banner */}
      <DisputeForm contentType="customer" contentId={id} variant="banner" />

      {/* Header */}
      <div className="mb-8 rounded-lg border border-[#e5e7eb] bg-white p-6">
        <div className="flex items-start justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2">
              <span className="rounded-full bg-[#DC2626]/10 px-2.5 py-0.5 text-xs font-semibold text-[#DC2626]">Customer</span>
            </div>
            <h1 className="text-3xl font-black text-[#111111]">{customer.display_name}</h1>
            <p className="mt-1 text-sm text-[#6b7280]">
              {customer.city}, {customer.state}
            </p>
          </div>
          {(() => { const r = riskScoreLabel(Number(customer.risk_score) || 0); return (
            <div className="text-right">
              <div className={`text-2xl font-black ${r.color}`}>{(Number(customer.risk_score) || 0).toFixed(1)}<span className="text-sm font-normal text-[#9ca3af]">/10</span></div>
              <div className={`text-xs font-semibold ${r.color}`}>{r.label}</div>
            </div>
          )})()}
        </div>

        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div>
            <div className="text-xs text-[#6b7280]">Reports</div>
            <div className="text-2xl font-black text-[#111111]">{customer.flag_count || entryList.length}</div>
            <div className="text-xs text-[#9ca3af]">from contractors</div>
          </div>
          <div>
            <div className="text-xs text-[#6b7280]">Total Owed</div>
            <div className="text-2xl font-black text-[#DC2626]">
              ${totalOwed.toLocaleString()}
            </div>
          </div>
          {firstReported && (
            <div>
              <div className="text-xs text-[#6b7280]">First Reported</div>
              <div className="text-sm font-semibold text-[#111111]">{firstReported}</div>
            </div>
          )}
          {customer.risk_factors && customer.risk_factors.length > 0 && (
            <div className="sm:col-span-2">
              <div className="text-xs text-[#6b7280]">Risk Factors</div>
              <ul className="mt-1 space-y-0.5 text-xs text-[#6b7280]">
                {customer.risk_factors.map((f: string, i: number) => <li key={i}>· {f}</li>)}
              </ul>
            </div>
          )}
        </div>

        {/* Contact info — Fortress only */}
        <div className="mt-6 border-t border-[#e5e7eb] pt-5">
          {/* Contact info — Fortress only */}
          {isFortress ? (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {customer.phone && (
                <div>
                  <div className="text-xs text-[#6b7280]">Phone</div>
                  <div className="text-sm font-medium text-[#111111]">{customer.phone}</div>
                </div>
              )}
              {customer.address && (
                <div>
                  <div className="text-xs text-[#6b7280]">Address</div>
                  <div className="text-sm font-medium text-[#111111]">{customer.address}</div>
                </div>
              )}
              {customer.email && (
                <div>
                  <div className="text-xs text-[#6b7280]">Email</div>
                  <div className="text-sm font-medium text-[#111111]">{customer.email}</div>
                </div>
              )}
              {!customer.phone && !customer.address && !customer.email && (
                <p className="text-sm text-[#9ca3af]">No contact information on file.</p>
              )}
            </div>
          ) : (
            <div className="relative">
              <div className="pointer-events-none select-none blur-sm">
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div>
                    <div className="text-xs text-[#6b7280]">Phone</div>
                    <div className="text-sm font-medium text-[#111111]">(555) 123-4567</div>
                  </div>
                  <div>
                    <div className="text-xs text-[#6b7280]">Address</div>
                    <div className="text-sm font-medium text-[#111111]">123 Main St, Austin, TX</div>
                  </div>
                </div>
              </div>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mb-2">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                  <path d="M7 11V7a5 5 0 0110 0v4"/>
                </svg>
                <p className="text-sm font-semibold text-[#111111]">Upgrade to Fortress to view contact details</p>
                <Link
                  href="/pricing"
                  className="mt-2 rounded bg-[#DC2626] px-4 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-red-700"
                >
                  Get Access
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Entries */}
      <h2 className="mb-4 text-lg font-bold text-[#111111]">
        Contractor Feedback ({entryList.length})
      </h2>

      {entryList.length > 0 ? (
        <div className="space-y-4">
          {entryList.map((entry) => (
            <div key={entry.id} className={`rounded-lg border bg-white p-5 ${entry.submitter_profile_complete ? 'border-l-4 border-l-blue-400 border-[#e5e7eb]' : 'border-[#e5e7eb]'}`}>
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <div className="flex flex-wrap gap-2">
                  {entry.category_tags?.map((tag: string) => (
                    <span
                      key={tag}
                      className="rounded border border-[#DC2626]/20 bg-[#DC2626]/5 px-2.5 py-0.5 text-xs font-medium text-[#DC2626]"
                    >
                      {tag}
                    </span>
                  ))}
                  {entry.submitter_profile_complete && (
                    <span className="inline-flex items-center gap-1 rounded border border-blue-300 bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-600" title="This contractor has completed their business profile.">
                      <svg width="12" height="12" viewBox="0 0 16 16" fill="none"><path d="M3 8l3 3 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                      Profile Complete
                    </span>
                  )}
                </div>
                <div className="relative flex items-center gap-2">
                  <span className="text-xs text-[#9ca3af]">
                    {entry.incident_date
                      ? new Date(entry.incident_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                      : new Date(entry.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                  <FlagButton contentType="entry" contentId={entry.id} />
                </div>
              </div>
              <p className="mb-3 text-sm leading-relaxed text-[#4b5563]">{entry.description}</p>
              {entry.amount_owed > 0 && (
                <div className="flex items-center gap-1.5 text-sm font-semibold text-[#DC2626]">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="12" y1="1" x2="12" y2="23"/>
                    <path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/>
                  </svg>
                  Amount owed: ${Number(entry.amount_owed).toLocaleString()}
                </div>
              )}
              <CommentSection entryId={entry.id} />
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-lg border border-[#e5e7eb] bg-[#f9fafb] px-8 py-12 text-center">
          <p className="text-[#6b7280]">No feedback has been submitted yet.</p>
        </div>
      )}

      {/* CTA */}
      <div className="mt-10 rounded-lg border border-[#e5e7eb] bg-[#f9fafb] p-6 text-center">
        <p className="mb-1 text-sm font-semibold text-[#111111]">Had an experience with this customer?</p>
        <p className="mb-4 text-xs text-[#6b7280]">Help other contractors by sharing your experience.</p>
        <Link
          href="/submit"
          className="inline-block rounded bg-[#DC2626] px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-red-700"
        >
          Submit Feedback
        </Link>
      </div>

      <div className="mt-8">
        <PlatformDisclaimer variant="full" />
      </div>

      <p className="mt-4 text-[10px] leading-relaxed text-[#9ca3af]">
        The information on this page was submitted by individual contractors and represents their personal experiences and opinions.
        Contractor Burnlist does not verify the accuracy of any feedback. All content reflects the subjective opinions and personal experiences of individual contractors. This platform is not intended to be used for employment, insurance, or housing decisions. If you believe information about you is false or inaccurate,
        you may submit a dispute using the banner above. See our <Link href="/terms" className="underline hover:text-[#6b7280]">Terms &amp; Conditions</Link> and <Link href="/privacy" className="underline hover:text-[#6b7280]">Privacy Policy</Link> for more information.
      </p>
    </div>
  )
}

async function renderWorkerProfile(
  supabase: Awaited<ReturnType<typeof createClient>>,
  id: string,
  isFortress: boolean,
) {
  const { data: worker, error } = await supabase
    .from('workers')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !worker) {
    notFound()
  }

  const { data: entries } = await supabase
    .from('worker_entries')
    .select('id, worker_id, category_tags, description, incident_date, submitter_profile_complete, created_at')
    .eq('worker_id', id)
    .order('created_at', { ascending: false })

  const entryList = entries || []
  const firstReported = entryList.length > 0
    ? new Date(entryList[entryList.length - 1].created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    : null

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <Link href="/search" className="mb-8 inline-flex items-center gap-2 text-sm text-[#6b7280] hover:text-[#111111]">
        ← Back to Search
      </Link>

      {/* Dispute Banner */}
      <DisputeForm contentType="worker" contentId={id} variant="banner" />

      {/* Header */}
      <div className="mb-8 rounded-lg border border-[#e5e7eb] bg-white p-6">
        <div className="flex items-start justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2">
              <span className="rounded-full bg-orange-100 px-2.5 py-0.5 text-xs font-semibold text-orange-600">Worker</span>
            </div>
            <h1 className="text-3xl font-black text-[#111111]">{worker.display_name}</h1>
            <p className="mt-1 text-sm text-[#6b7280]">
              {worker.city}, {worker.state}
              {worker.trade_specialty && (
                <span> · {worker.trade_specialty}</span>
              )}
            </p>
          </div>
          {(() => { const r = riskScoreLabel(Number(worker.risk_score) || 0); return (
            <div className="text-right">
              <div className={`text-2xl font-black ${r.color}`}>{(Number(worker.risk_score) || 0).toFixed(1)}<span className="text-sm font-normal text-[#9ca3af]">/10</span></div>
              <div className={`text-xs font-semibold ${r.color}`}>{r.label}</div>
            </div>
          )})()}
        </div>

        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div>
            <div className="text-xs text-[#6b7280]">Reports</div>
            <div className="text-2xl font-black text-[#111111]">{worker.flag_count || entryList.length}</div>
            <div className="text-xs text-[#9ca3af]">from contractors</div>
          </div>
          {firstReported && (
            <div>
              <div className="text-xs text-[#6b7280]">First Reported</div>
              <div className="text-sm font-semibold text-[#111111]">{firstReported}</div>
            </div>
          )}
          {worker.risk_factors && worker.risk_factors.length > 0 && (
            <div className="sm:col-span-2">
              <div className="text-xs text-[#6b7280]">Risk Factors</div>
              <ul className="mt-1 space-y-0.5 text-xs text-[#6b7280]">
                {worker.risk_factors.map((f: string, i: number) => <li key={i}>· {f}</li>)}
              </ul>
            </div>
          )}
          {worker.trade_specialty && (
            <div>
              <div className="text-xs text-[#6b7280]">Trade</div>
              <div className="text-sm font-semibold text-[#111111]">{worker.trade_specialty}</div>
            </div>
          )}
        </div>

        {/* Contact info — Fortress only */}
        <div className="mt-6 border-t border-[#e5e7eb] pt-5">
          {isFortress ? (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {worker.phone && (
                <div>
                  <div className="text-xs text-[#6b7280]">Phone</div>
                  <div className="text-sm font-medium text-[#111111]">{worker.phone}</div>
                </div>
              )}
              {!worker.phone && (
                <p className="text-sm text-[#9ca3af]">No contact information on file.</p>
              )}
            </div>
          ) : (
            <div className="relative">
              <div className="pointer-events-none select-none blur-sm">
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div>
                    <div className="text-xs text-[#6b7280]">Phone</div>
                    <div className="text-sm font-medium text-[#111111]">(555) 987-6543</div>
                  </div>
                </div>
              </div>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mb-2">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                  <path d="M7 11V7a5 5 0 0110 0v4"/>
                </svg>
                <p className="text-sm font-semibold text-[#111111]">Upgrade to Fortress to view contact details</p>
                <Link
                  href="/pricing"
                  className="mt-2 rounded bg-[#DC2626] px-4 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-red-700"
                >
                  Get Access
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Entries */}
      <h2 className="mb-4 text-lg font-bold text-[#111111]">
        Contractor Feedback ({entryList.length})
      </h2>

      {entryList.length > 0 ? (
        <div className="space-y-4">
          {entryList.map((entry) => (
            <div key={entry.id} className={`rounded-lg border bg-white p-5 ${entry.submitter_profile_complete ? 'border-l-4 border-l-blue-400 border-[#e5e7eb]' : 'border-[#e5e7eb]'}`}>
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <div className="flex flex-wrap gap-2">
                  {entry.category_tags?.map((tag: string) => (
                    <span
                      key={tag}
                      className="rounded border border-[#DC2626]/20 bg-[#DC2626]/5 px-2.5 py-0.5 text-xs font-medium text-[#DC2626]"
                    >
                      {tag}
                    </span>
                  ))}
                  {entry.submitter_profile_complete && (
                    <span className="inline-flex items-center gap-1 rounded border border-blue-300 bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-600" title="This contractor has completed their business profile.">
                      <svg width="12" height="12" viewBox="0 0 16 16" fill="none"><path d="M3 8l3 3 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                      Profile Complete
                    </span>
                  )}
                </div>
                <div className="relative flex items-center gap-2">
                  <span className="text-xs text-[#9ca3af]">
                    {entry.incident_date
                      ? new Date(entry.incident_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                      : new Date(entry.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                  <FlagButton contentType="worker_entry" contentId={entry.id} />
                </div>
              </div>
              <p className="text-sm leading-relaxed text-[#4b5563]">{entry.description}</p>
              <CommentSection workerEntryId={entry.id} />
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-lg border border-[#e5e7eb] bg-[#f9fafb] px-8 py-12 text-center">
          <p className="text-[#6b7280]">No feedback has been submitted yet.</p>
        </div>
      )}

      {/* CTA */}
      <div className="mt-10 rounded-lg border border-[#e5e7eb] bg-[#f9fafb] p-6 text-center">
        <p className="mb-1 text-sm font-semibold text-[#111111]">Had an experience with this worker?</p>
        <p className="mb-4 text-xs text-[#6b7280]">Help other contractors by sharing your experience.</p>
        <Link
          href="/submit"
          className="inline-block rounded bg-[#DC2626] px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-red-700"
        >
          Submit Feedback
        </Link>
      </div>

      <div className="mt-8">
        <PlatformDisclaimer variant="full" />
      </div>

      <p className="mt-4 text-[10px] leading-relaxed text-[#9ca3af]">
        The information on this page was submitted by individual contractors and represents their personal experiences and opinions.
        Contractor Burnlist does not verify the accuracy of any feedback. All content reflects the subjective opinions and personal experiences of individual contractors. This platform is not intended to be used for employment, insurance, or housing decisions. If you believe information about you is false or inaccurate,
        you may submit a dispute using the banner above. See our <Link href="/terms" className="underline hover:text-[#6b7280]">Terms &amp; Conditions</Link> and <Link href="/privacy" className="underline hover:text-[#6b7280]">Privacy Policy</Link> for more information.
      </p>
    </div>
  )
}
