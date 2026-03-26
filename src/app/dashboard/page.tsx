import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  const { data: entries } = await supabase
    .from('entries')
    .select('*, customers(display_name, city, state)')
    .eq('submitted_by', user.id)
    .order('created_at', { ascending: false })

  const isActive = profile?.subscription_status === 'active'

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-white">Dashboard</h1>
          <p className="mt-1 text-sm text-[#a0a0a0]">{user.email}</p>
        </div>
        <Link
          href="/submit"
          className="rounded bg-[#DC2626] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-red-700"
        >
          + Submit Entry
        </Link>
      </div>

      {/* Subscription Status */}
      <div className="mb-8 rounded-lg border border-[#2a2a2a] bg-[#111111] p-5">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs text-[#a0a0a0]">Subscription</div>
            <div className="mt-0.5 font-semibold text-white capitalize">
              {profile?.subscription_tier || 'None'}{' '}
              <span className={isActive ? 'text-green-400' : 'text-[#DC2626]'}>
                ({profile?.subscription_status || 'inactive'})
              </span>
            </div>
          </div>
          {!isActive && (
            <Link
              href="/auth/login"
              className="rounded border border-[#DC2626] px-4 py-2 text-sm font-semibold text-[#DC2626] transition-colors hover:bg-[#DC2626] hover:text-white"
            >
              Upgrade Access
            </Link>
          )}
        </div>
      </div>

      {/* My Entries */}
      <div>
        <h2 className="mb-4 text-lg font-bold text-white">My Submitted Entries</h2>
        {entries && entries.length > 0 ? (
          <div className="space-y-3">
            {entries.map((entry: any) => (
              <div key={entry.id} className="rounded-lg border border-[#2a2a2a] bg-[#111111] p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="font-semibold text-white">
                      {entry.customers?.display_name ?? 'Unknown Customer'}
                    </div>
                    {entry.customers?.city && (
                      <div className="text-xs text-[#a0a0a0]">
                        {entry.customers.city}, {entry.customers.state}
                      </div>
                    )}
                    <p className="mt-2 text-sm text-[#a0a0a0] line-clamp-2">{entry.description}</p>
                  </div>
                  <div className="ml-4 shrink-0 text-right">
                    {entry.amount_owed > 0 && (
                      <div className="text-sm font-semibold text-[#DC2626]">
                        ${Number(entry.amount_owed).toLocaleString()}
                      </div>
                    )}
                    <div className="text-xs text-[#555]">
                      {new Date(entry.created_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-lg border border-[#2a2a2a] bg-[#111111] px-8 py-12 text-center">
            <p className="text-[#a0a0a0]">No entries submitted yet.</p>
            <Link
              href="/submit"
              className="mt-4 inline-block text-sm font-semibold text-[#DC2626] hover:underline"
            >
              Submit your first entry →
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
