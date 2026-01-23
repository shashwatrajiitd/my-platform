'use client'

import { useEffect } from 'react'
import { ProfileNavbar } from '@/components/shared/ProfileNavbar'
import { ContinueWatchingPreview } from '@/components/netflix/ContinueWatchingPreview'
import { RecruiterHero } from './sections/Hero'
import { RecruiterAbout } from './sections/About'
import { RecruiterHighlights } from './sections/Highlights'
import { RecruiterExperience } from './sections/Experience'
import { RecruiterCoreSkills } from './sections/CoreSkills'
import { RecruiterEducation } from './sections/Education'
import { RecruiterAchievements } from './sections/Achievements'
import { RecruiterContact } from './sections/Contact'
import { RecruiterAIFloatingAssistant } from './components/AIFloatingAssistant'

export function RecruiterProfile() {
  useEffect(() => {
    const id = 'profile-css-recruiter'
    const href = '/styles/profiles/recruiter.css'
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
        profileId="recruiter"
        links={[
          { label: 'About', targetId: 'recruiter-about' },
          { label: 'Professional', targetId: 'recruiter-experience' },
          { label: 'Skills', targetId: 'recruiter-skills' },
          { label: 'Education', targetId: 'recruiter-education' },
          { label: 'Achievements', targetId: 'recruiter-achievements' },
          { label: 'Hire Me', targetId: 'recruiter-contact' },
        ]}
      />
      <div className="instagram-layout">
        <main className="instagram-main">
          <RecruiterHero />
          <RecruiterAbout />
          <ContinueWatchingPreview
            title="Continue Watching for Recruiter"
            showHoverScrollArrows
            items={[
              {
                id: 'experience',
                title: 'Experience',
                targetId: 'recruiter-experience',
                previewSrc: '/assets/profiles/Recruiter/Continue_watching/Experience.mp4',
                chips: ['Software Development', 'AI Systems', 'System Design', 'Scalability'],
              },
              {
                id: 'skills',
                title: 'Core Skills',
                targetId: 'recruiter-skills',
                previewSrc: '/assets/profiles/Recruiter/Continue_watching/Skills.mp4',
                chips: ['Programming & Engineering', 'Core AI & machine learning', 'Systems, scale & production'],
              },
              {
                id: 'education',
                title: 'Education',
                targetId: 'recruiter-education',
                previewSrc: '/assets/profiles/Recruiter/Continue_watching/Education.mp4',
                chips: ['Academic', 'Credential', 'Pedigree'],
              },
              {
                id: 'achievements',
                title: 'Achievements',
                targetId: 'recruiter-achievements',
                previewSrc: '/assets/profiles/Recruiter/Continue_watching/Achievement.mp4',
                chips: ['Scholastic', 'Technical', 'Olympiads'],
              },
              {
                id: 'contact',
                title: 'Contact',
                targetId: 'recruiter-contact',
                previewSrc: '/assets/profiles/Recruiter/Continue_watching/Contact.mp4',
                chips: ['Email', 'Availability', 'Resume'],
              },
            ]}
          />
          <RecruiterHighlights />
          <RecruiterExperience />
          <RecruiterCoreSkills />
          <RecruiterEducation />
          <RecruiterAchievements />
          <RecruiterContact />
        </main>
      </div>
      <RecruiterAIFloatingAssistant />
    </>
  )
}
