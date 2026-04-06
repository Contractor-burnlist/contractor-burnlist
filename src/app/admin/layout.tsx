import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/admin'
import { redirect } from 'next/navigation'

const navItems = [
  { href: '/admin', label: 'Overview' },
  { href: '/admin/reports', label: 'Reports' },
  { href: '/admin/comments', label: 'Comments' },
  { href: '/admin/users', label: 'Users' },
  { href: '/admin/flagged', label: 'Flagged' },
  { href: '/admin/forum', label: 'Forum' },
]

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const admin = await requireAdmin(supabase)
  if (!admin) redirect('/dashboard')

  return (
    <div className="flex min-h-[calc(100vh-4rem)]">
      <aside className="hidden w-56 shrink-0 border-r border-[#2a2a2a] bg-[#111111] md:block">
        <div className="p-4">
          <div className="mb-1 text-xs font-bold uppercase tracking-widest text-[#DC2626]">Admin Panel</div>
          <div className="text-xs text-[#6b7280] truncate">{admin.email}</div>
        </div>
        <nav className="space-y-0.5 px-2">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href} className="block rounded px-3 py-2 text-sm text-[#a0a0a0] transition-colors hover:bg-[#1a1a1a] hover:text-white">
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>
      <div className="flex-1 bg-[#f9fafb]">
        <div className="border-b border-[#e5e7eb] bg-white px-4 py-3 md:hidden">
          <div className="flex items-center gap-3 overflow-x-auto">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href} className="shrink-0 rounded px-3 py-1 text-xs font-medium text-[#6b7280] hover:bg-[#f9fafb] hover:text-[#111111]">
                {item.label}
              </Link>
            ))}
          </div>
        </div>
        <div className="p-4 sm:p-6">{children}</div>
      </div>
    </div>
  )
}
