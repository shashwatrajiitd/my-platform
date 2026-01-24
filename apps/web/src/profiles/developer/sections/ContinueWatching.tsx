'use client'

import { ContinueWatchingPreview } from '@/components/netflix/ContinueWatchingPreview'

export function DeveloperContinueWatching() {
  return (
    <ContinueWatchingPreview
      title="Continue Watching for Recruiter"
      showHoverScrollArrows
      items={[
        {
          id: 'developer-experience',
          title: 'Experience',
          targetId: 'developer-experience',
          previewSrc: '/assets/profiles/Recruiter/Continue_watching/Experience.mp4',
          chips: ['Software Development', 'AI Systems', 'System Design', 'Scalability'],
        },
        {
          id: 'developer-skills',
          title: 'Core Skills',
          targetId: 'developer-skills',
          previewSrc: '/assets/profiles/Recruiter/Continue_watching/Skills.mp4',
          chips: ['Programming & Engineering', 'Core AI & machine learning', 'Systems, scale & production'],
        },
        {
          id: 'developer-education',
          title: 'Education',
          targetId: 'developer-education',
          previewSrc: '/assets/profiles/Recruiter/Continue_watching/Education.mp4',
          chips: ['Academic', 'Credential', 'Pedigree'],
        },
        {
          id: 'developer-achievements',
          title: 'Achievements',
          targetId: 'developer-achievements',
          previewSrc: '/assets/profiles/Recruiter/Continue_watching/Achievement.mp4',
          chips: ['Scholastic', 'Technical', 'Olympiads'],
        },
        {
          id: 'developer-contact',
          title: 'Contact',
          targetId: 'developer-contact',
          previewSrc: '/assets/profiles/Recruiter/Continue_watching/Contact.mp4',
          chips: ['Email', 'Availability', 'Resume'],
        },
      ]}
    />
  )
}

