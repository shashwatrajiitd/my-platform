'use client'

import { useState } from 'react'

export function AdventurerExperience() {
  const [expandedCards, setExpandedCards] = useState<Set<number>>(new Set())

  const handleCardClick = (index: number) => {
    const newExpanded = new Set(expandedCards)
    if (newExpanded.has(index)) {
      newExpanded.delete(index)
    } else {
      newExpanded.add(index)
    }
    setExpandedCards(newExpanded)
  }

  const experiences = [
    {
      featured: true,
      role: 'Software Developer (AI Infra)',
      company: 'Purplle.com (Manash Lifestyle Pvt. Ltd.)',
      date: 'May 2025 - Present',
      location: 'Mumbai, India',
      projectTitle: 'GenAI Creative Automation Platform',
      summary: 'Built and deployed an autonomous multi-agent GenAI system for large-scale creative generation across paid marketing channels (Meta, Google Ads). Achieved 10-15x faster production and ~95% cost reduction.',
      details: {
        description: 'Built and deployed an autonomous multi-agent GenAI system for large-scale creative generation across paid marketing channels (Meta, Google Ads).',
        phases: [
          {
            title: 'Phase 0 - Delivered system architecture:',
            features: [
              { label: 'Ideation Agents:', text: 'Generate high-volume campaign directions and ad concepts.' },
              { label: 'Generation Agents:', text: 'Produce high-fidelity static creatives via orchestrated LLM/VLM and diffusion pipelines.' },
              { label: 'Moderation Agents:', text: 'Rank and filter outputs for brand compliance using vision-based evaluators.' },
            ],
          },
        ],
        impact: [
          '10-15x faster creative production (1-2 weeks → < 3 hours)',
          '~95% cost reduction (INR 1500-2000 → < INR 50 per asset)',
          'Enabled 10-15x more creative variants per campaign',
        ],
        techStack: [
          { name: 'Gemini', icon: '/assets/icons/Tools/vertexai.png' },
          { name: 'OpenAI', icon: '/assets/icons/Tools/openai.png' },
          { name: 'Stable Diffusion (LoRA fine-tuning)', icon: null },
          { name: 'LLMs/VLMs', icon: null },
          { name: 'Vision Systems', icon: null },
          { name: 'Microservices', icon: null },
          { name: 'Orchestration', icon: null },
          { name: 'MLOps', icon: null },
        ],
      },
    },
    {
      featured: false,
      role: 'Software Developer Intern',
      company: 'Samsung R&D',
      date: 'May 2024 - July 2024',
      location: 'Bangalore, India',
      projectTitle: 'Real-Time Revenue Forecasting and Anomaly Detection Platform',
      summary: 'Developed a real-time revenue forecasting and anomaly detection pipeline for Samsung Ads, integrating classical regression models with transformer-based time-series architectures. Improved revenue prediction accuracy by 5%.',
      details: {
        features: [
          'Developed a real-time revenue forecasting and anomaly detection pipeline for Samsung Ads, integrating classical regression models with transformer-based time-series architectures',
          'Implemented anomaly detection logic on forecast residuals to flag revenue deviations in near real time, improving observability for downstream business systems',
        ],
        impact: [
          'Improved revenue prediction accuracy by 5%',
          'Reduced anomaly detection latency',
          'Supported reliable inference under high-throughput data loads',
        ],
        techStack: [
          { name: 'Python', icon: '/assets/icons/languages/python.png' },
          { name: 'PyTorch', icon: '/assets/icons/Frameworks/pytorch.png' },
          { name: 'Time-series ML models (Linear, Transformer)', icon: null },
          { name: 'Apache Kafka', icon: '/assets/icons/Platforms/Kafka.png' },
          { name: 'AWS (compute, storage)', icon: '/assets/icons/Tools/aws.png' },
          { name: 'Distributed data processing frameworks', icon: null },
        ],
      },
    },
  ]

  return (
    <section id="adventurer-experience" className="adventurer-section">
      <h2 className="section-title">WORK EXPERIENCE</h2>
      <div className="section-divider"></div>
      
      {experiences.map((exp, index) => (
        <div
          key={index}
          className={`experience-card ${exp.featured ? 'featured' : ''} ${expandedCards.has(index) ? 'expanded' : ''}`}
          onClick={() => handleCardClick(index)}
        >
          <div className="experience-header">
            <div className="experience-title-group">
              <h3 className="experience-role">{exp.role}</h3>
              <h4 className="experience-company">{exp.company}</h4>
            </div>
            <div className="experience-meta">
              <span className="experience-date">
                <i className="far fa-calendar"></i> {exp.date}
              </span>
              <span className="experience-location">
                <i className="fas fa-map-marker-alt"></i> {exp.location}
              </span>
            </div>
            <button
              className="expand-toggle"
              aria-label="Expand card"
              onClick={(e) => {
                e.stopPropagation()
                handleCardClick(index)
              }}
            >
              <i className={`fas ${expandedCards.has(index) ? 'fa-chevron-up' : 'fa-chevron-down'}`}></i>
            </button>
          </div>
          <div className="experience-summary">
            <h4 className="project-title">{exp.projectTitle}</h4>
            <p className="summary-text">{exp.summary}</p>
          </div>
          {expandedCards.has(index) && exp.details && (
            <div className="experience-details">
              <div className="experience-project">
                <h4 className="project-title">{exp.projectTitle}</h4>
                <div className="project-description">
                  {exp.details.description && <p><strong>{exp.details.description}</strong></p>}
                  
                  {exp.details.phases?.map((phase, phaseIndex) => (
                    <div key={phaseIndex} className="project-phase">
                      <h5>{phase.title}</h5>
                      <ul className="project-features">
                        {phase.features.map((feature, featureIndex) => (
                          <li key={featureIndex}>
                            {feature.label && <strong>{feature.label}</strong>} {feature.text}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                  
                  {exp.details.features && (
                    <ul className="project-features">
                      {exp.details.features.map((feature, featureIndex) => (
                        <li key={featureIndex}>{feature}</li>
                      ))}
                    </ul>
                  )}
                  
                  {exp.details.impact && (
                    <div className="project-impact">
                      <h5>Impact:</h5>
                      <ul className="impact-list">
                        {exp.details.impact.map((impact, impactIndex) => (
                          <li key={impactIndex}>{impact}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
                {exp.details.techStack && (
                  <div className="tech-stack">
                    <h5>Tech Stack:</h5>
                    <div className="tech-tags">
                      {exp.details.techStack.map((tech, techIndex) => (
                        <span key={techIndex} className="tech-tag">
                          {tech.icon && <img src={tech.icon} alt={tech.name} />} {tech.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      ))}
    </section>
  )
}
