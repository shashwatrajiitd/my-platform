'use client'

import { useEffect, useRef, useState } from 'react'
import { ContinueWatchingPreview } from '@/components/netflix/ContinueWatchingPreview'

interface SkillCard {
  skill: string
  icon: string
  label: string
  gradient: string
  tags: string[]
  lines: string[]
  primary?: boolean
  previewSrc?: string
}

interface SkillRow {
  title: string
  cards: SkillCard[]
}

export function StalkerSkills() {
  const [expandedCard, setExpandedCard] = useState<string | null>(null)
  const cardRefs = useRef<Map<string, HTMLDivElement>>(new Map())

  const skillRows: SkillRow[] = [
    {
      title: 'Programming & engineering',
      cards: [
        {
          skill: 'Python',
          icon: 'fab fa-python',
          label: 'Python',
          gradient: '135deg, #667eea 0%, #764ba2 100%',
          previewSrc: '/assets/profiles/Recruiter/Core_Skills/Programming/Python.mp4',
          tags: ['Autonomous Creative Generation', 'AI Applications'],
          lines: ['Prod-grade Python for AI systems', 'Performance-aware, maintainable code'],
          primary: true,
        },
        {
          skill: 'Backend Development',
          icon: 'fas fa-server',
          label: 'Backend Development',
          gradient: '135deg, #4facfe 0%, #00f2fe 100%',
          previewSrc: '/assets/profiles/Recruiter/Core_Skills/Programming/Frontend_Backend.mp4',
          tags: ['Creative Automation System', 'Model Serving APIs'],
          lines: ['REST APIs, services, system integration'],
        },
        {
          skill: 'Data Structures & Algorithms',
          icon: 'fas fa-code',
          label: 'Data Structures & Algorithms',
          gradient: '135deg, #f093fb 0%, #f5576c 100%',
          previewSrc: '/assets/profiles/Recruiter/Core_Skills/Programming/DSA.mp4',
          tags: ['Creative Pipeline', 'Real-time Processing'],
          lines: ['Algorithmic thinking for system performance'],
        },
        {
          skill: 'Clean Architecture',
          icon: 'fas fa-sitemap',
          label: 'Clean Architecture',
          gradient: '135deg, #fa709a 0%, #fee140 100%',
          previewSrc: '/assets/profiles/Recruiter/Core_Skills/Programming/System_Architecture.mp4',
          tags: ['Autonomous AI Systems', 'Internal Platforms'],
          lines: ['Modular, testable system design', 'Clear separation of concerns'],
        },
        {
          skill: 'Debugging & Optimization',
          icon: 'fas fa-bug',
          label: 'Debugging & Optimization',
          gradient: '135deg, #30cfd0 0%, #330867 100%',
          previewSrc: '/assets/profiles/Recruiter/Core_Skills/Programming/debug.mp4',
          tags: ['Production AI Systems', 'Model Inference Pipelines'],
          lines: ['RCA in live systems', 'Latency, memory & compute'],
        },
        {
          skill: 'Git & Code Reviews',
          icon: 'fab fa-git-alt',
          label: 'Git & Code Reviews',
          gradient: '135deg, #a8edea 0%, #fed6e3 100%',
          previewSrc: '/assets/profiles/Recruiter/Core_Skills/Programming/git.mp4',
          tags: ['Team-based Development', 'Production Releases'],
          lines: ['Collaborative workflows & version control', 'Clean PRs & iterative improvement'],
        },
      ],
    },
    {
      title: 'Core AI & machine learning',
      cards: [
        {
          skill: 'LLMs & Generative AI',
          icon: 'fas fa-brain',
          label: 'LLMs & GenAI',
          gradient: '135deg, #667eea 0%, #764ba2 100%',
          previewSrc: '/assets/profiles/Recruiter/Core_Skills/Core_AI/LLM.mp4',
          tags: ['Autonomous Creative Generation', 'AI Ideation Engine'],
          lines: ['Prompting, RAG, agents, fine-tuning', 'Task-specific control GenAI'],
          primary: true,
        },
        {
          skill: 'Machine Learning',
          icon: 'fas fa-robot',
          label: 'Machine Learning',
          gradient: '135deg, #f093fb 0%, #f5576c 100%',
          previewSrc: '/assets/profiles/Recruiter/Core_Skills/Core_AI/ML.mp4',
          tags: ['Forecasting System', 'Recommendation Experiments'],
          lines: ['Supervised & unsupervised learning', 'Feature engineering and evaluation'],
        },
        {
          skill: 'Deep Learning',
          icon: 'fas fa-network-wired',
          label: 'Deep Learning',
          gradient: '135deg, #4facfe 0%, #00f2fe 100%',
          previewSrc: '/assets/profiles/Recruiter/Core_Skills/Core_AI/DeepLearning.mp4',
          tags: ['Vision Pipelines', 'Generative Models'],
          lines: ['CNNs & transformer-based architectures', 'Semantic Learning'],
        },
        {
          skill: 'Computer Vision',
          icon: 'fas fa-eye',
          label: 'Computer Vision',
          gradient: '135deg, #fa709a 0%, #fee140 100%',
          previewSrc: '/assets/profiles/Recruiter/Core_Skills/Core_AI/CV.mp4',
          tags: ['Creative Automation', 'Image Inpainting System'],
          lines: ['Image generation and manipulation', 'Visual understanding in production'],
        },
        {
          skill: 'Embeddings & Retrieval',
          icon: 'fas fa-search',
          label: 'Embeddings & Retrieval',
          gradient: '135deg, #30cfd0 0%, #330867 100%',
          previewSrc: '/assets/profiles/Recruiter/Core_Skills/Core_AI/Embeddings.mp4',
          tags: ['RAG Pipelines', 'Semantic Search'],
          lines: ['RAG-driven AI systems'],
        },
        {
          skill: 'Model Evaluation & Metrics',
          icon: 'fas fa-chart-line',
          label: 'Model Evaluation & Metrics',
          gradient: '135deg, #a8edea 0%, #fed6e3 100%',
          previewSrc: '/assets/profiles/Recruiter/Core_Skills/Core_AI/MLEval.mp4',
          tags: ['AI Quality Framework', 'Experimentation Pipelines'],
          lines: ['Accuracy, quality, reliability tracking'],
        },
      ],
    },
    {
      title: 'Systems, scale & production',
      cards: [
        {
          skill: 'Data Pipelines',
          icon: 'fas fa-stream',
          label: 'Data Pipelines',
          gradient: '135deg, #667eea 0%, #764ba2 100%',
          previewSrc: '/assets/profiles/Recruiter/Core_Skills/System/Datafiles.mp4',
          tags: ['Creative Generation Platform', 'AI systems'],
          lines: ['Batch and streaming workflows', 'Scalable data ingestion and processing'],
        },
        {
          skill: 'MLOps',
          icon: 'fas fa-cogs',
          label: 'MLOps',
          gradient: '135deg, #f093fb 0%, #f5576c 100%',
          previewSrc: '/assets/profiles/Recruiter/Core_Skills/System/MLOps.mp4',
          tags: ['Production AI Systems', 'Model Lifecycle Management'],
          lines: ['Training to deployment automation', 'Monitoring and iteration loops'],
        },
        {
          skill: 'Model Serving',
          icon: 'fas fa-rocket',
          label: 'Model Serving',
          gradient: '135deg, #4facfe 0%, #00f2fe 100%',
          previewSrc: '/assets/profiles/Recruiter/Core_Skills/System/ModelServing.mp4',
          tags: ['Real-time Inference APIs', 'Creative Generation System'],
          lines: ['Scalable, low-latency inference', 'Reliability under production load'],
        },
        {
          skill: 'Cloud Infrastructure',
          icon: 'fab fa-aws',
          label: 'Cloud Infrastructure (AWS)',
          gradient: '135deg, #fa709a 0%, #fee140 100%',
          previewSrc: '/assets/profiles/Recruiter/Core_Skills/System/Cloud.mp4',
          tags: ['AWS-based ML Systems', 'Scalable AI Platforms'],
          lines: ['Compute, storage, orchestration', 'Production cloud architecture'],
        },
        {
          skill: 'Docker & Containers',
          icon: 'fab fa-docker',
          label: 'Docker & Containers',
          gradient: '135deg, #30cfd0 0%, #330867 100%',
          previewSrc: '/assets/profiles/Recruiter/Core_Skills/System/Docker.mp4',
          tags: ['Model Deployment', 'CI/CD Pipelines'],
          lines: ['Reproducible deployment environments', 'Consistent runtime'],
        },
        {
          skill: 'Performance & Cost Optimization',
          icon: 'fas fa-tachometer-alt',
          label: 'Performance & Cost Optimization',
          gradient: '135deg, #a8edea 0%, #fed6e3 100%',
          previewSrc: '/assets/profiles/Recruiter/Core_Skills/System/Optimisation.mp4',
          tags: ['scaled AI Systems', 'Inference Optimization'],
          lines: ['Latency optimization', 'Cost-aware system design'],
        },
      ],
    },
  ]

  const handleCardClick = (skillId: string) => {
    if (expandedCard === skillId) {
      setExpandedCard(null)
    } else {
      setExpandedCard(skillId)

      const card = cardRefs.current.get(skillId)
      if (card) {
        const row = card.closest('.skills-cards')
        if (row) {
          const cards = Array.from(row.querySelectorAll('.skill-card'))
          const index = cards.indexOf(card)
          const total = cards.length
          const cardRect = card.getBoundingClientRect()
          const cardWidth = cardRect.width
          const expandedWidth = Math.round(cardWidth * 1.35)
          const expansionOffset = (expandedWidth - cardWidth) / 2

          let leftOffset = 0
          if (index === 0) {
            leftOffset = 0
          } else if (index === total - 1) {
            leftOffset = -expansionOffset * 2
          } else {
            leftOffset = -expansionOffset
          }

          card.style.setProperty('--expansion-left', `${leftOffset}px`)
        }
      }
    }
  }

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (expandedCard) {
        const card = cardRefs.current.get(expandedCard)
        if (card && !card.contains(e.target as Node)) {
          setExpandedCard(null)
        }
      }
    }

    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [expandedCard])

  const programmingRow = skillRows[0]
  const coreAiRow = skillRows[1]
  const systemsRow = skillRows[2]
  const otherRows = skillRows.slice(3)

  const programmingItems = programmingRow.cards.map((card, cardIndex) => {
    const slug = card.skill.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
    return {
      id: `stalker-programming-${cardIndex}-${slug}`,
      title: card.label,
      targetId: `stalker-programming-${cardIndex}-${slug}`,
      previewSrc: card.previewSrc ?? '',
      chips: card.tags,
      description: card.lines.join(' • '),
    }
  })

  const coreAiItems = coreAiRow.cards.map((card, cardIndex) => {
    const slug = card.skill.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
    return {
      id: `stalker-core-ai-${cardIndex}-${slug}`,
      title: card.label,
      targetId: `stalker-core-ai-${cardIndex}-${slug}`,
      previewSrc: card.previewSrc ?? '',
      chips: card.tags,
      description: card.lines.join(' • '),
    }
  })

  const systemsItems = systemsRow.cards.map((card, cardIndex) => {
    const slug = card.skill.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
    return {
      id: `stalker-systems-${cardIndex}-${slug}`,
      title: card.label,
      targetId: `stalker-systems-${cardIndex}-${slug}`,
      previewSrc: card.previewSrc ?? '',
      chips: card.tags,
      description: card.lines.join(' • '),
    }
  })

  return (
    <section id="stalker-skills" className="core-skills-section">
      <h2 className="section-title">Core technical skills</h2>
      <div className="section-divider"></div>

      <div className="skills-row">
        <ContinueWatchingPreview
          title={programmingRow.title}
          titleId="stalker-programming-title"
          sectionClassName="core-skills-programming"
          showExpandButton={false}
          showHoverScrollArrows
          items={programmingItems}
        />
      </div>

      <div className="skills-row">
        <ContinueWatchingPreview
          title={coreAiRow.title}
          titleId="stalker-core-ai-title"
          sectionClassName="core-skills-core-ai"
          showExpandButton={false}
          showHoverScrollArrows
          items={coreAiItems}
        />
      </div>

      <div className="skills-row">
        <ContinueWatchingPreview
          title={systemsRow.title}
          titleId="stalker-systems-title"
          sectionClassName="core-skills-system"
          showExpandButton={false}
          showHoverScrollArrows
          items={systemsItems}
        />
      </div>

      {otherRows.map((row, rowIndex) => (
        <div key={rowIndex} className="skills-row">
          <h2 className="section-title">{row.title}</h2>
          <div className="skills-cards">
            {row.cards.map((card, cardIndex) => {
              const skillId = `${rowIndex + 1}-${cardIndex}`
              const isExpanded = expandedCard === skillId

              return (
                <div
                  key={cardIndex}
                  ref={(el) => {
                    if (el) cardRefs.current.set(skillId, el)
                  }}
                  className={`skill-card ${card.primary ? 'primary' : ''} ${isExpanded ? 'expanded' : ''}`}
                  onClick={() => handleCardClick(skillId)}
                >
                  <div className="card-image" style={{ background: `linear-gradient(${card.gradient})` }}>
                    <i className={card.icon}></i>
                  </div>
                  <div className="card-label">{card.label}</div>
                  <div className="skill-expanded">
                    <div className="expanded-image" style={{ background: `linear-gradient(${card.gradient})` }}>
                      <div className="expanded-overlay"></div>
                    </div>
                    <div className="expanded-content">
                      <h3 className="expanded-title">{card.skill}</h3>
                      <div className="expanded-tags">
                        {card.tags.map((tag, tagIndex) => (
                          <span key={tagIndex} className="expanded-tag">
                            {tag}
                </span>
              ))}
                      </div>
                      <div className="expanded-lines">
                        {card.lines.map((line, lineIndex) => (
                          <p key={lineIndex} className="expanded-line">
                            {line}
                          </p>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
            </div>
          </div>
        ))}
    </section>
  )
}
