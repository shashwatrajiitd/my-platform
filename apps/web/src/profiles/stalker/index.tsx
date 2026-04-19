'use client'

import { ProfileNavbar } from '@/components/shared/ProfileNavbar'
import { ContinueWatchingPreview } from '@/components/netflix/ContinueWatchingPreview'
import { StalkerHero } from './sections/Hero'
import { StalkerAbout } from './sections/About'
import { StalkerExperience } from './sections/Experience'
import { StalkerSkills } from './sections/Skills'
import { StalkerEducation } from './sections/Education'
import { StalkerAchievements } from './sections/Achievements'
import { StalkerContact } from './sections/Contact'
import { AIFloatingAssistant } from '@/components/shared/AIFloatingAssistant'

export function StalkerProfile() {
  return (
    <>
      <ProfileNavbar
        profileId="stalker"
        links={[
          { label: 'About', targetId: 'stalker-about' },
          { label: 'Professional', targetId: 'stalker-experience' },
          { label: 'Skills', targetId: 'stalker-skills' },
          { label: 'Education', targetId: 'stalker-education' },
          { label: 'Achievements', targetId: 'stalker-achievements' },
          { label: 'Hire Me', targetId: 'stalker-contact' },
        ]}
      />
      <div className="instagram-layout">
        <main className="instagram-main">
          <StalkerHero />
          <StalkerAbout />
          <ContinueWatchingPreview
            title="Continue Watching for Recruiter"
            showHoverScrollArrows
            items={[
              {
                id: 'stalker-experience',
                title: 'Experience',
                targetId: 'stalker-experience',
                previewSrc: '/assets/profiles/Recruiter/Continue_watching/Experience.mp4',
                chips: ['Software Development', 'AI Systems', 'System Design', 'Scalability'],
              },
              {
                id: 'stalker-skills',
                title: 'Core Skills',
                targetId: 'stalker-skills',
                previewSrc: '/assets/profiles/Recruiter/Continue_watching/Skills.mp4',
                chips: ['Programming & Engineering', 'Core AI & machine learning', 'Systems, scale & production'],
              },
              {
                id: 'stalker-education',
                title: 'Education',
                targetId: 'stalker-education',
                previewSrc: '/assets/profiles/Recruiter/Continue_watching/Education.mp4',
                chips: ['Academic', 'Credential', 'Pedigree'],
              },
              {
                id: 'stalker-achievements',
                title: 'Achievements',
                targetId: 'stalker-achievements',
                previewSrc: '/assets/profiles/Recruiter/Continue_watching/Achievement.mp4',
                chips: ['Scholastic', 'Technical', 'Olympiads'],
              },
              {
                id: 'stalker-contact',
                title: 'Contact',
                targetId: 'stalker-contact',
                previewSrc: '/assets/profiles/Recruiter/Continue_watching/Contact.mp4',
                chips: ['Email', 'Availability', 'Resume'],
              },
            ]}
          />
          <StalkerExperience />
          <StalkerSkills />
          <StalkerEducation />
          <StalkerAchievements />
          <StalkerContact />
        </main>
      </div>
      <AIFloatingAssistant profile="stalker" />
    </>
  )
}

