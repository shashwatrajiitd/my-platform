'use client'

import { useState, useEffect, useRef } from 'react'

interface AchievementCard {
  skill: string
  icon: string
  label: string
  gradient: string
  tags: string[]
  lines: string[]
}

export function RecruiterAchievements() {
  const [expandedCard, setExpandedCard] = useState<string | null>(null)
  const cardRefs = useRef<Map<string, HTMLDivElement>>(new Map())

  const achievements: AchievementCard[] = [
    {
      skill: 'JEE Advanced & Mains 2021',
      icon: 'fas fa-trophy',
      label: 'JEE Advanced & Mains 2021',
      gradient: '135deg, #667eea 0%, #764ba2 100%',
      tags: ['Academic Excellence', 'Competitive Exam'],
      lines: ['Secured 99.89 percentile nationwide among 1M+ candidates'],
    },
    {
      skill: 'NTSE Scholar 2019',
      icon: 'fas fa-star',
      label: 'NTSE Scholar 2019',
      gradient: '135deg, #f093fb 0%, #f5576c 100%',
      tags: ['National Recognition', 'Scholarship'],
      lines: ['Awarded National Talent Scholarship among 1M+ students'],
    },
    {
      skill: 'Samsung SWC Test',
      icon: 'fas fa-shield-alt',
      label: 'Samsung SWC Test',
      gradient: '135deg, #4facfe 0%, #00f2fe 100%',
      tags: ['Technical Competency', 'Industry Recognition'],
      lines: ["Qualified Samsung's Advanced Software Competency Test on first attempt"],
    },
    {
      skill: 'Regional Mathematical Olympiad',
      icon: 'fas fa-medal',
      label: 'Regional Mathematical Olympiad',
      gradient: '135deg, #fa709a 0%, #fee140 100%',
      tags: ['Mathematical Excellence', 'Olympiad'],
      lines: ['Received certificate of merit twice for mathematical excellence'],
    },
  ]

  const handleCardClick = (achievementId: string) => {
    if (expandedCard === achievementId) {
      setExpandedCard(null)
    } else {
      setExpandedCard(achievementId)
      
      const card = cardRefs.current.get(achievementId)
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

  return (
    <section id="recruiter-achievements" className="core-skills-section">
      <h2 className="section-title">Achievements</h2>
      <div className="section-divider"></div>
      <div className="skills-cards">
        {achievements.map((achievement, index) => {
          const achievementId = `achievement-${index}`
          const isExpanded = expandedCard === achievementId
          
          return (
            <div
              key={index}
              ref={(el) => {
                if (el) cardRefs.current.set(achievementId, el)
              }}
              className={`skill-card primary ${isExpanded ? 'expanded' : ''}`}
              onClick={() => handleCardClick(achievementId)}
            >
              <div
                className="card-image"
                style={{ background: `linear-gradient(${achievement.gradient})` }}
              >
                <i className={achievement.icon}></i>
              </div>
              <div className="card-label">{achievement.label}</div>
              <div className="skill-expanded">
                <div
                  className="expanded-image"
                  style={{ background: `linear-gradient(${achievement.gradient})` }}
                >
                  <div className="expanded-overlay"></div>
                </div>
                <div className="expanded-content">
                  <h3 className="expanded-title">{achievement.skill}</h3>
                  <div className="expanded-tags">
                    {achievement.tags.map((tag, tagIndex) => (
                      <span key={tagIndex} className="expanded-tag">{tag}</span>
                    ))}
                  </div>
                  <div className="expanded-lines">
                    {achievement.lines.map((line, lineIndex) => (
                      <p key={lineIndex} className="expanded-line">{line}</p>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
