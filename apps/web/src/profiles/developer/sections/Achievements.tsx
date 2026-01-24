'use client'

import { ContinueWatchingPreview } from '@/components/netflix/ContinueWatchingPreview'

export function DeveloperAchievements() {
  const items = [
    {
      id: 'jee',
      title: 'JEE Advanced & Mains 2021',
      targetId: 'developer-achievement-jee',
      previewSrc: '/assets/profiles/Recruiter/Achievements/JEE.png',
      chips: ['Academic excellence', 'Competitive exam'],
      description: 'Secured 99.89 percentile nationwide among 1M+ candidates',
    },
    {
      id: 'ntse',
      title: 'NTSE Scholar 2019',
      targetId: 'developer-achievement-ntse',
      previewSrc: '/assets/profiles/Recruiter/Achievements/NTSE.png',
      chips: ['National recognition', 'Scholarship'],
      description: 'Awarded National Talent Scholarship among 1M+ students',
    },
    {
      id: 'samsung-swc',
      title: 'Samsung SWC Test',
      targetId: 'developer-achievement-swc',
      previewSrc: '/assets/profiles/Recruiter/Achievements/SWC.png',
      chips: ['Technical competency', 'Industry recognition'],
      description: "Qualified Samsung's Advanced Software Competency Test on first attempt",
    },
    {
      id: 'rmo',
      title: 'Regional Mathematical Olympiad',
      targetId: 'developer-achievement-rmo',
      previewSrc: '/assets/profiles/Recruiter/Achievements/RMO.png',
      chips: ['Mathematical excellence', 'Olympiad'],
      description: 'Received certificate of merit twice for mathematical excellence',
    },
  ]

  return (
    <section id="developer-achievements" className="core-skills-section">
      <ContinueWatchingPreview
        title="Achievements"
        titleId="developer-achievements-title"
        sectionClassName="core-skills-achievements"
        showExpandButton={false}
        showHoverScrollArrows
        items={items}
      />
    </section>
  )
}
