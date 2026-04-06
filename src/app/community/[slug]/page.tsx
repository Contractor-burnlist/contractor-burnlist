import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import CategoryPostList from './CategoryPostList'

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const supabase = await createClient()

  const { data: category } = await supabase.from('forum_categories').select('*').eq('slug', slug).single()
  if (!category) notFound()

  const { data: posts } = await supabase
    .from('forum_posts')
    .select('id, title, content, is_pinned, is_locked, is_deleted, upvote_count, reply_count, created_at, user_id, profiles(display_username, trade, reputation_points)')
    .eq('category_id', category.id)
    .eq('is_deleted', false)
    .order('is_pinned', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(50)

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <Link href="/community" className="mb-6 inline-flex items-center gap-2 text-sm text-[#6b7280] hover:text-[#111111]">← Back to Community</Link>

      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-[#111111]">{category.emoji} {category.name}</h1>
          <p className="mt-1 text-sm text-[#6b7280]">{category.description}</p>
          {slug === 'legal-contracts' && (
            <p className="mt-2 text-xs italic text-amber-700">Discussion here is for informational purposes only and does not constitute legal advice.</p>
          )}
        </div>
        {!category.is_locked && (
          <Link href={`/community/new?category=${slug}`} className="rounded-lg bg-[#DC2626] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-red-700">
            New Post
          </Link>
        )}
      </div>

      <CategoryPostList posts={posts ?? []} slug={slug} />
    </div>
  )
}
