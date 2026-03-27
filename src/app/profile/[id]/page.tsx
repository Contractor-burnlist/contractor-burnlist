import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'

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

export default async function ProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  // Check auth + subscription
  const { data: { user } } = await supabase.auth.getUser()
  let hasActiveSubscription = false
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('subscription_status')
      .eq('id', user.id)
      .single()
    hasActiveSubscription = profile?.subscription_status === 'active'
  }

  // Fetch customer
  const { data: customer, error } = await supabase
    .from('customers')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !customer) {
    notFound()
  }

  // Fetch entries
  const { data: entries } = await supabase
    .from('entries')
    .select('*')
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

      {/* Header */}
      <div className="mb-8 rounded-lg border border-[#e5e7eb] bg-white p-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-black text-[#111111]">{customer.display_name}</h1>
            <p className="mt-1 text-sm text-[#6b7280]">
              {customer.city}, {customer.state}
            </p>
          </div>
          <span
            className={`rounded-full border px-4 py-1.5 text-sm font-semibold ${riskColors[customer.risk_level] || riskColors.unknown}`}
          >
            {riskLabels[customer.risk_level] || 'Unknown'}
          </span>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div>
            <div className="text-xs text-[#6b7280]">Reports</div>
            <div className="text-2xl font-black text-[#111111]">{customer.flag_count || entryList.length}</div>
            <div className="text-xs text-[#9ca3af]">from verified contractors</div>
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
          <div>
            <div className="text-xs text-[#6b7280]">Risk Level</div>
            <div className="text-sm font-semibold capitalize text-[#111111]">{customer.risk_level || 'unknown'}</div>
          </div>
        </div>

        {/* Contact info — locked for non-subscribers */}
        <div className="mt-6 border-t border-[#e5e7eb] pt-5">
          {hasActiveSubscription ? (
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
                <p className="text-sm font-semibold text-[#111111]">Subscribe to view contact details</p>
                <Link
                  href="/auth/login"
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
        Reports from Contractors ({entryList.length})
      </h2>

      {entryList.length > 0 ? (
        <div className="space-y-4">
          {entryList.map((entry) => (
            <div key={entry.id} className="rounded-lg border border-[#e5e7eb] bg-white p-5">
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
                  {entry.is_verified_submission && (
                    <span className="rounded border border-green-300 bg-green-50 px-2.5 py-0.5 text-xs font-medium text-green-600">
                      Verified
                    </span>
                  )}
                </div>
                <span className="text-xs text-[#9ca3af]">
                  {entry.incident_date
                    ? new Date(entry.incident_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                    : new Date(entry.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </span>
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
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-lg border border-[#e5e7eb] bg-[#f9fafb] px-8 py-12 text-center">
          <p className="text-[#6b7280]">No reports have been submitted yet.</p>
        </div>
      )}

      {/* CTA */}
      <div className="mt-10 rounded-lg border border-[#e5e7eb] bg-[#f9fafb] p-6 text-center">
        <p className="mb-1 text-sm font-semibold text-[#111111]">Had an experience with this customer?</p>
        <p className="mb-4 text-xs text-[#6b7280]">Help other contractors by sharing your report.</p>
        <Link
          href="/submit"
          className="inline-block rounded bg-[#DC2626] px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-red-700"
        >
          Submit a Report
        </Link>
      </div>
    </div>
  )
}
