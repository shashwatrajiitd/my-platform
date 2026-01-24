'use client'

import { useEffect } from 'react'
import { ProfileNavbar } from '@/components/shared/ProfileNavbar'
import { ContinueWatchingPreview } from '@/components/netflix/ContinueWatchingPreview'
import { AdventurerHero } from './sections/Hero'
import { AdventurerAbout } from './sections/About'
import { AdventurerExperience } from './sections/Experience'
import { AdventurerSkills } from './sections/Skills'
import { AdventurerEducation } from './sections/Education'
import { AdventurerAchievements } from './sections/Achievements'
import { AdventurerContact } from './sections/Contact'
import { AIFloatingAssistant } from '@/components/shared/AIFloatingAssistant'

export function AdventurerProfile() {
  useEffect(() => {
    const id = 'profile-css-adventurer'
    const href = '/styles/profiles/adventurer.css'
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
        profileId="adventurer"
        links={[
          { label: 'About', targetId: 'adventurer-about' },
          { label: 'Professional', targetId: 'adventurer-experience' },
          { label: 'Skills', targetId: 'adventurer-skills' },
          { label: 'Education', targetId: 'adventurer-education' },
          { label: 'Achievements', targetId: 'adventurer-achievements' },
          { label: 'Hire Me', targetId: 'adventurer-contact' },
        ]}
      />
      <div className="instagram-layout">
        <main className="instagram-main">
          <AdventurerHero />
          <AdventurerAbout />
          <ContinueWatchingPreview
            title="Continue Watching for Recruiter"
            showHoverScrollArrows
            items={[
              {
                id: 'adventurer-experience',
                title: 'Experience',
                targetId: 'adventurer-experience',
                previewSrc: '/assets/profiles/Recruiter/Continue_watching/Experience.mp4',
                chips: ['Software Development', 'AI Systems', 'System Design', 'Scalability'],
              },
              {
                id: 'adventurer-skills',
                title: 'Core Skills',
                targetId: 'adventurer-skills',
                previewSrc: '/assets/profiles/Recruiter/Continue_watching/Skills.mp4',
                chips: ['Programming & Engineering', 'Core AI & machine learning', 'Systems, scale & production'],
              },
              {
                id: 'adventurer-education',
                title: 'Education',
                targetId: 'adventurer-education',
                previewSrc: '/assets/profiles/Recruiter/Continue_watching/Education.mp4',
                chips: ['Academic', 'Credential', 'Pedigree'],
              },
              {
                id: 'adventurer-achievements',
                title: 'Achievements',
                targetId: 'adventurer-achievements',
                previewSrc: '/assets/profiles/Recruiter/Continue_watching/Achievement.mp4',
                chips: ['Scholastic', 'Technical', 'Olympiads'],
              },
              {
                id: 'adventurer-contact',
                title: 'Contact',
                targetId: 'adventurer-contact',
                previewSrc: '/assets/profiles/Recruiter/Continue_watching/Contact.mp4',
                chips: ['Email', 'Availability', 'Resume'],
              },
            ]}
          />
          <AdventurerExperience />
          <AdventurerSkills />
          <AdventurerEducation />
          <AdventurerAchievements />
          <AdventurerContact />
        </main>
      </div>
      <AIFloatingAssistant profile="adventurer" />
    </>
  )
}

