'use client'

import { ProfileNavbar } from '@/components/shared/ProfileNavbar'
import { DeveloperHero } from './sections/Hero'
import { DeveloperAbout } from './sections/About'
import { DeveloperContinueWatching } from './sections/ContinueWatching'
import { DeveloperExperience } from './sections/Experience'
import { DeveloperSkills } from './sections/Skills'
import { DeveloperEducation } from './sections/Education'
import { DeveloperAchievements } from './sections/Achievements'
import { DeveloperProjectWork } from './sections/ProjectWork'
import { DeveloperContact } from './sections/Contact'
import { AIFloatingAssistant } from '@/components/shared/AIFloatingAssistant'

export function DeveloperProfile() {
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
          { label: 'Projects', targetId: 'developer-projects' },
          { label: 'Hire Me', targetId: 'developer-contact' },
        ]}
      />
      <div className="instagram-layout">
        <main className="instagram-main">
          <DeveloperHero />
          <DeveloperAbout />
          <DeveloperContinueWatching />
          <DeveloperExperience />
          <DeveloperProjectWork />
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
