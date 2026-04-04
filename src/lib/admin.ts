export const ADMIN_EMAILS = ['office@pipedreamplumbingco.com']

export async function requireAdmin(supabase: any) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || !ADMIN_EMAILS.includes(user.email ?? '')) return null
  return user
}
