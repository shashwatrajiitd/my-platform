'use client'

import { ProfileNavbar } from '@/components/shared/ProfileNavbar'
import { ContinueWatchingPreview } from '@/components/netflix/ContinueWatchingPreview'
import { RecruiterHero } from './sections/Hero'
import { RecruiterAbout } from './sections/About'
import { RecruiterHighlights } from './sections/Highlights'
import { RecruiterExperience } from './sections/Experience'
import { RecruiterCoreSkills } from './sections/CoreSkills'
import { RecruiterEducation } from './sections/Education'
import { RecruiterAchievements } from './sections/Achievements'
import { RecruiterProjectWork } from './sections/ProjectWork'
import { RecruiterContact } from './sections/Contact'
import { AIFloatingAssistant } from '@/components/shared/AIFloatingAssistant'

export function RecruiterProfile() {
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
          { label: 'Projects', targetId: 'recruiter-projects' },
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
                id: 'projects',
                title: 'Project Work',
                targetId: 'recruiter-projects',
                previewSrc: '/assets/profiles/Recruiter/Continue_watching/Projects.mp4',
                chips: ['Open Source', 'Full-Stack', 'Systems'],
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
          <RecruiterProjectWork />
          <RecruiterCoreSkills />
          <RecruiterEducation />
          <RecruiterAchievements />
          <RecruiterContact />
        </main>
      </div>
      <AIFloatingAssistant profile="recruiter" />
    </>
  )
}
