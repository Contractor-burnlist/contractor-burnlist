import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { calculateTrustScore } from '@/lib/trust-score'
import ReputationBadge from '@/components/ReputationBadge'
import ManageBillingButton from './ManageBillingButton'
import SuccessBanner from './SuccessBanner'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  const [{ data: profile }, { data: entries }, { data: workerEntries }] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', user.id).single(),
    supabase.from('entries').select('id, description, amount_owed, created_at, customers(display_name, city, state)').eq('submitted_by', user.id).order('created_at', { ascending: false }),
    supabase.from('worker_entries').select('id').eq('submitted_by', user.id).limit(1),
  ])

  const isActive = profile?.subscription_status === 'active'
  const hasSubmissions = (entries?.length ?? 0) > 0 || (workerEntries?.length ?? 0) > 0
  const trust = calculateTrustScore(profile ?? {}, hasSubmissions)

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
      <SuccessBanner />

      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-[#111111]">Dashboard</h1>
          <p className="mt-1 text-sm text-[#6b7280]">{user.email}</p>
        </div>
        <Link
          href="/submit"
          className="rounded bg-[#DC2626] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-red-700"
        >
          + Submit Report
        </Link>
      </div>

      {/* Trust Score + Verification */}
      <Link href="/my-profile" className="mb-8 block rounded-lg border border-[#e5e7eb] bg-white p-5 transition-colors hover:border-[#d1d5db]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {profile?.is_verified ? (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-green-600">
                <path d="M12 2L3 7v5c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-9-5z" fill="currentColor" opacity="0.15"/>
                <path d="M12 2L3 7v5c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-9-5z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
                <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            ) : (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-[#9ca3af]">
                <path d="M12 2L3 7v5c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-9-5z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
              </svg>
            )}
            <div>
              {profile?.is_verified ? (
                <>
                  <span className="rounded-full border border-green-300 bg-green-50 px-3 py-0.5 text-xs font-semibold text-green-600">Verified Business</span>
                  <div className="mt-1 text-sm text-[#6b7280]">{profile.business_name}{profile.trade ? ` · ${profile.trade}` : ''}</div>
                </>
              ) : (
                <>
                  <div className="text-sm font-semibold text-[#111111]">
                    {trust.score < 5 ? `You're at ${trust.score}/5 — complete your profile to build credibility` : 'Profile complete!'}
                  </div>
                  <p className="mt-0.5 text-xs text-[#6b7280]">Click to view your profile and increase your trust score</p>
                </>
              )}
            </div>
          </div>
          <div className="flex items-center gap-4">
            <ReputationBadge points={profile?.reputation_points ?? 0} />
            <div className="text-right">
              <div className="text-xs text-[#6b7280]">Trust Score</div>
              <div className="mt-0.5 flex gap-1">
                {[1, 2, 3, 4, 5].map((i) => (
                  <span key={i} className={`h-2 w-4 rounded-full ${i <= trust.score ? 'bg-green-500' : 'bg-[#e5e7eb]'}`} />
                ))}
              </div>
              <div className="mt-0.5 text-xs text-[#9ca3af]">{trust.score}/5</div>
            </div>
          </div>
        </div>
      </Link>

      {/* Subscription Status */}
      <div className="mb-8 rounded-lg border border-[#e5e7eb] bg-white p-5">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs text-[#6b7280]">Subscription</div>
            {isActive ? (
              <div className="mt-1 flex items-center gap-2">
                <span className="rounded-full bg-green-50 border border-green-300 px-3 py-0.5 text-xs font-semibold text-green-600">
                  Active — {profile?.subscription_tier?.charAt(0).toUpperCase()}{profile?.subscription_tier?.slice(1)}
                </span>
              </div>
            ) : (
              <div className="mt-0.5 font-semibold text-[#111111]">
                No active plan{' '}
                <span className="text-[#DC2626]">(inactive)</span>
              </div>
            )}
          </div>
          <div className="flex gap-2">
            {isActive && profile?.stripe_customer_id && (
              <ManageBillingButton />
            )}
            {!isActive && (
              <Link
                href="/pricing"
                className="rounded border border-[#DC2626] px-4 py-2 text-sm font-semibold text-[#DC2626] transition-colors hover:bg-[#DC2626] hover:text-white"
              >
                Upgrade Access
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* My Entries */}
      <div>
        <h2 className="mb-4 text-lg font-bold text-[#111111]">My Submitted Reports</h2>
        {entries && entries.length > 0 ? (
          <div className="space-y-3">
            {entries.map((entry: any) => (
              <div key={entry.id} className="rounded-lg border border-[#e5e7eb] bg-white p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="font-semibold text-[#111111]">
                      {entry.customers?.display_name ?? 'Unknown Customer'}
                    </div>
                    {entry.customers?.city && (
                      <div className="text-xs text-[#6b7280]">
                        {entry.customers.city}, {entry.customers.state}
                      </div>
                    )}
                    <p className="mt-2 text-sm text-[#6b7280] line-clamp-2">{entry.description}</p>
                  </div>
                  <div className="ml-4 shrink-0 text-right">
                    {entry.amount_owed > 0 && (
                      <div className="text-sm font-semibold text-[#DC2626]">
                        ${Number(entry.amount_owed).toLocaleString()}
                      </div>
                    )}
                    <div className="text-xs text-[#9ca3af]">
                      {new Date(entry.created_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-lg border border-[#e5e7eb] bg-[#f9fafb] px-8 py-12 text-center">
            <p className="text-[#6b7280]">No reports submitted yet.</p>
            <Link
              href="/submit"
              className="mt-4 inline-block text-sm font-semibold text-[#DC2626] hover:underline"
            >
              Submit your first report →
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
