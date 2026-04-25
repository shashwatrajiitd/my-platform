'use client'

import { ContinueWatchingPreview } from '@/components/netflix/ContinueWatchingPreview'

export function DeveloperProjectWork() {
  const items = [
    {
      id: 'population-sim',
      title: 'Population Dynamics Simulator',
      targetId: 'developer-project-population-sim',
      previewSrc: '/assets/project/PopulationSim.png',
      chips: ['C++', 'OpenGL', 'Eigen', 'Dear ImGui'],
      description:
        'A macOS desktop app that visualizes global population dynamics on a 3D OpenGL globe for 195 countries, featuring age-structured PDE solvers, socioeconomic stratification, and a shock injection system for pandemics and policy changes.',
      externalLink: 'https://github.com/shashwatrajiitd/PopulationSim',
    },
    {
      id: 'god-eye',
      title: "Pigeon's Eye — Geospatial Intel",
      targetId: 'developer-project-god-eye',
      previewSrc: '/assets/project/God-eye.webp',
      chips: ['React', 'Go', 'Rust', 'Kafka', 'Deck.gl'],
      description:
        'A unified geospatial intelligence platform aggregating 15+ real-time data feeds — flights, maritime AIS, weather, earthquakes, satellite imagery — into a single GPU-accelerated map interface with polyglot microservices.',
      externalLink: 'https://github.com/shashwatrajiitd/god-eye',
    },
    {
      id: 'content-creator-agent',
      title: 'Insta-Agent — Content Creator',
      targetId: 'developer-project-content-creator',
      previewSrc: '/assets/project/content-creator-agent.webp',
      chips: ['Python', 'Google ADK', 'SQLite', 'Agents'],
      description:
        'An autonomous Instagram content creation system using Google ADK for agent orchestration, handling the full lifecycle from research and generation through validation to publication queuing.',
      externalLink: 'https://github.com/shashwatrajiitd/content-creator-agent',
    },
    {
      id: 'ai-health-assistant',
      title: 'Be Healthy — WhatsApp Health Bot',
      targetId: 'developer-project-health-assistant',
      previewSrc: '/assets/project/Ai-health-assistant.jpg',
      chips: ['Python', 'Flask', 'Gemini API', 'WhatsApp'],
      description:
        'A WhatsApp-integrated health assistant that tracks food intake via natural conversation, calculates macro-nutrients with Gemini AI, syncs Apple HealthKit data, and provides personalized meal recommendations.',
      externalLink: 'https://github.com/shashwatrajiitd/AI-Health-Assistant',
    },
    {
      id: 'transformer-forecasting',
      title: 'Transformers for Forecasting',
      targetId: 'developer-project-transformer-forecasting',
      previewSrc: '/assets/project/transformer-time-series.webp',
      chips: ['Python', 'Transformers', 'Time Series'],
      description:
        'Applying transformer architectures to time-series forecasting problems, exploring attention-based models for temporal pattern recognition and prediction.',
      externalLink: 'https://github.com/shashwatrajiitd/Transformers-for-Forecasting',
    },
    {
      id: 'os-scheduling',
      title: 'OS Scheduling Algorithms',
      targetId: 'developer-project-os-scheduling',
      previewSrc: '/assets/project/OS-Scheduling-algorithms.jpeg',
      chips: ['C', 'OS Concepts', 'MLFQ', 'SRTF'],
      description:
        'Implementation of six CPU scheduling algorithms — FCFS, Round Robin, Multi-level Feedback Queue, Adaptive MLFQ, SJF, and SRTF — with detailed performance metrics and CSV-based comparative analysis.',
      externalLink: 'https://github.com/shashwatrajiitd/OS-Scheduling-Algorithms',
    },
    {
      id: 'memory-scheduling',
      title: 'TLB Replacement Strategies',
      targetId: 'developer-project-memory-scheduling',
      previewSrc: '/assets/project/memory-management.jpeg',
      chips: ['C++', 'Virtual Memory', 'TLB', 'OS'],
      description:
        'A virtual memory management simulator comparing four TLB replacement strategies — FIFO, LIFO, LRU, and Optimal — with configurable address spaces, page sizes, and TLB capacities.',
      externalLink: 'https://github.com/shashwatrajiitd/Memory-Scheduling-Algorithms',
    },
    {
      id: 'dynamic-memory-alloc',
      title: 'Custom Memory Allocator in C',
      targetId: 'developer-project-dynamic-memory',
      previewSrc: '/assets/project/dynamic-memory-allocation.jpg',
      chips: ['C', 'Systems Programming', 'sbrk/brk'],
      description:
        'A from-scratch implementation of malloc, free, calloc, and realloc using sbrk/brk system calls, with block splitting, adjacent-block merging, and memory-aligned allocation to reduce fragmentation.',
      externalLink: 'https://github.com/shashwatrajiitd/Dynamic-Memory-Allocation-in-C',
    },
  ]

  return (
    <section id="developer-projects" className="core-skills-section">
      <ContinueWatchingPreview
        title="Project Work"
        titleId="developer-projects-title"
        sectionClassName="core-skills-projects"
        showExpandButton={false}
        showHoverScrollArrows
        items={items}
      />
    </section>
  )
}
