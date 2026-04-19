import type { ReactNode } from 'react'
import { notFound } from 'next/navigation'
import { isValidProfileId } from '@/config/profiles'

const profileCss: Record<string, string> = {
  developer: '/styles/profiles/developer.css',
  recruiter: '/styles/profiles/recruiter.css',
  stalker: '/styles/profiles/stalker.css',
  adventurer: '/styles/profiles/adventurer.css',
}

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ profileId: string }>
}) {
  const { profileId } = await params
  const normalizedId = profileId.toLowerCase()

  if (!isValidProfileId(normalizedId)) {
    notFound()
  }

  let ProfileComponent: ReactNode
  switch (normalizedId) {
    case 'developer': {
      const { DeveloperProfile } = await import('@/profiles/developer')
      ProfileComponent = <DeveloperProfile />
      break
    }
    case 'recruiter': {
      const { RecruiterProfile } = await import('@/profiles/recruiter')
      ProfileComponent = <RecruiterProfile />
      break
    }
    case 'stalker': {
      const { StalkerProfile } = await import('@/profiles/stalker')
      ProfileComponent = <StalkerProfile />
      break
    }
    case 'adventurer': {
      const { AdventurerProfile } = await import('@/profiles/adventurer')
      ProfileComponent = <AdventurerProfile />
      break
    }
    default:
      notFound()
  }

  return (
    <>
      {/* eslint-disable-next-line @next/next/no-css-tags */}
      <link rel="stylesheet" href={profileCss[normalizedId]} precedence="high" />
      {/* eslint-disable-next-line @next/next/no-css-tags */}
      <link rel="stylesheet" href="/styles/profiles/ai-assistant.css" precedence="high" />
      {ProfileComponent}
    </>
  )
}
