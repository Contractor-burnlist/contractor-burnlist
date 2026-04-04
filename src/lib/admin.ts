export const ADMIN_EMAILS = ['office@pipedreamplumbingco.com']

export async function requireAdmin(supabase: any) {
  // Try getUser first (validates with Supabase auth server)
  const { data: { user } } = await supabase.auth.getUser()
  if (user && ADMIN_EMAILS.includes(user.email ?? '')) return user

  // Fallback to getSession (reads from cookie without server round-trip)
  const { data: { session } } = await supabase.auth.getSession()
  if (session?.user && ADMIN_EMAILS.includes(session.user.email ?? '')) return session.user

  return null
}
