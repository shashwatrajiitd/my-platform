'use client'

import { ContinueWatchingPreview } from '@/components/netflix/ContinueWatchingPreview'

export function RecruiterHighlights() {
  return (
    <ContinueWatchingPreview
      title="Today's Top Picks for You"
      titleId="recruiter-top-picks-title"
      sectionClassName="highlights-section"
      showExpandButton={false}
      showHoverScrollArrows
      showDivider
      items={[
        {
          id: 'ai-systems',
          title: 'Production AI Systems',
          targetId: 'recruiter-top-picks-ai-systems',
          previewSrc: '/assets/profiles/Recruiter/top_picks/AI_systems.mp4',
          description: 'Architecting and deploying multi-agent GenAI System at scale for 8+ app surfaces (widgets, tiles, banners, category and theme-based recommendations etc)',
        },
        {
          id: 'revenue-impact',
          title: 'Production Impact',
          targetId: 'recruiter-top-picks-revenue',
          previewSrc: '/assets/profiles/Recruiter/top_picks/Revenue.mp4',
          description: 'Developed Autonomous Creative Generation System for Performance Marketing with 15x volume of assert creation and 95% cost reduction at scale',
        },
        {
          id: 'iit-delhi',
          title: 'IIT Delhi',
          targetId: 'recruiter-top-picks-iit-delhi',
          previewSrc: '/assets/profiles/Recruiter/top_picks/IITDelhi.mp4',
          description: "Completed B.Tech. in Mathematics & Computing from IIT Delhi - Country's one of the  most prestigious technical institute",
        },
        {
          id: 'top-achiever',
          title: 'Top Achiever',
          targetId: 'recruiter-top-picks-top-achiever',
          previewSrc: '/assets/profiles/Recruiter/top_picks/top_achiever.mp4',
          description: 'Ranked in top 0.2% nationwide with 99.89 percentile in JEE Advanced & Mains, NTSE Scholar, Samsung SWC Advanced Certification',
        },
      ]}
    />
  )
}
