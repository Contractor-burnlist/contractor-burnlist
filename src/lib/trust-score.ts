export type TrustProfile = {
  business_name?: string | null
  business_phone?: string | null
  trade?: string | null
  is_verified?: boolean | null
  subscription_status?: string | null
}

type CompletedStep = string
type IncompleteStep = { label: string; action: string; href: string }

export function calculateTrustScore(profile: TrustProfile, hasSubmissions: boolean) {
  const completedSteps: CompletedStep[] = []
  const incompleteSteps: IncompleteStep[] = []

  // 1. Account created — always true
  completedSteps.push('Create your account')

  // 2. Business profile completed
  if (profile.business_name && profile.business_phone && profile.trade) {
    completedSteps.push('Complete your business profile')
  } else {
    incompleteSteps.push({ label: 'Complete your business profile', action: 'Fill out below', href: '/my-profile' })
  }

  // 3. First report submitted
  if (hasSubmissions) {
    completedSteps.push('Submit your first feedback')
  } else {
    incompleteSteps.push({ label: 'Submit your first feedback', action: 'Submit Feedback', href: '/submit' })
  }

  // 4. GBP verified
  if (profile.is_verified) {
    completedSteps.push('Link your Google Business Profile')
  } else {
    incompleteSteps.push({ label: 'Link your Google Business Profile', action: 'Get Verified', href: '/verify' })
  }

  // 5. Active subscription
  if (profile.subscription_status === 'active') {
    completedSteps.push('Subscribe to a plan')
  } else {
    incompleteSteps.push({ label: 'Subscribe to a plan', action: 'View Plans', href: '/pricing' })
  }

  return {
    score: completedSteps.length,
    maxScore: 5 as const,
    completedSteps,
    incompleteSteps,
  }
}
