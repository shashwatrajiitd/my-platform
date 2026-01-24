'use client'

import { useEffect } from 'react'
import { ProfileNavbar } from '@/components/shared/ProfileNavbar'
import { DeveloperHero } from './sections/Hero'
import { DeveloperAbout } from './sections/About'
import { DeveloperContinueWatching } from './sections/ContinueWatching'
import { DeveloperExperience } from './sections/Experience'
import { DeveloperSkills } from './sections/Skills'
import { DeveloperEducation } from './sections/Education'
import { DeveloperAchievements } from './sections/Achievements'
import { DeveloperContact } from './sections/Contact'
import { AIFloatingAssistant } from '@/components/shared/AIFloatingAssistant'

export function DeveloperProfile() {
  useEffect(() => {
    const id = 'profile-css-developer'
    const href = '/styles/profiles/developer.css'
    if (!document.getElementById(id)) {
      const link = document.createElement('link')
      link.id = id
      link.rel = 'stylesheet'
      link.href = href
      document.head.appendChild(link)
    }
  }, [])
  useEffect(() => {
    const id = 'profile-css-ai-assistant'
    const href = '/styles/profiles/ai-assistant.css'
    if (!document.getElementById(id)) {
      const link = document.createElement('link')
      link.id = id
      link.rel = 'stylesheet'
      link.href = href
      document.head.appendChild(link)
    }
  }, [])

  return (
    <>
      <ProfileNavbar
        profileId="developer"
        links={[
          { label: 'About', targetId: 'developer-about' },
          { label: 'Professional', targetId: 'developer-experience' },
          { label: 'Skills', targetId: 'developer-skills' },
          { label: 'Education', targetId: 'developer-education' },
          { label: 'Achievements', targetId: 'developer-achievements' },
          { label: 'Hire Me', targetId: 'developer-contact' },
        ]}
      />
      <div className="instagram-layout">
        <main className="instagram-main">
          <DeveloperHero />
          <DeveloperAbout />
          <DeveloperContinueWatching />
          <DeveloperExperience />
          <DeveloperSkills />
          <DeveloperEducation />
          <DeveloperAchievements />
          <DeveloperContact />
        </main>
      </div>
      <AIFloatingAssistant profile="developer" />
    </>
  )
}
