'use client'

import { useState } from 'react'

export function StalkerExperience() {
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
      role: 'Applied AI Engineer',
      company: 'Purplle (Manash Lifestyle Pvt. Ltd.)',
      date: 'April 2025 - Present',
      location: 'Mumbai, India',
      projectTitle: 'Multi-Agent Creative Generation System',
      summary: 'Architecting an autonomous Multi-Agent Creative Generation System for UGC, Meta & Google paid channels. Built a microservice pipeline (AI Agents Orchestration) producing 1,000+ pixel-perfect variants from single PSD.',
      details: {
        description: 'Architected an autonomous Multi-Agent Creative Generation System for UGC, Meta & Google paid channels.',
        phases: [
          {
            title: 'System Architecture & Pipeline:',
            features: [
              { label: 'Microservice Pipeline:', text: 'AI Agents Orchestration producing 1,000+ pixel-perfect variants from single PSD.' },
              { label: 'Inference Optimization:', text: 'Prompt compression, caching & batch API; reduced per-creative GenAI spend by 60%.' },
              { label: 'Creative Bank:', text: 'Centralised Master Content Bank (MCB) for Marketing, Product, Central Design, & Brand Teams.' },
            ],
          },
          {
            title: 'Expanding:',
            features: [
              { label: '', text: 'Phase-I targets Agentic-personalisation across user journeys with built-in business objectives & KPIs.' },
            ],
          },
        ],
        impact: [
          'Generating 3,000+ ideas and 1,500+ creatives/month across 7 brands',
          'Turnaround 10–15× faster, cost reduced by ~95%',
          'Replacing Rocketium (SaaS), saving INR 60L+/year in subscription costs',
        ],
        techStack: [
          { name: 'Gemini', icon: null },
          { name: 'Diffusion', icon: null },
          { name: 'LangChain', icon: null },
          { name: 'ADK', icon: null },
          { name: 'FastAPI', icon: null },
          { name: 'Redis', icon: null },
          { name: 'Kafka', icon: null },
          { name: 'MySQL', icon: null },
          { name: 'Qdrant', icon: null },
          { name: 'Skia', icon: null },
          { name: 'Docker', icon: null },
          { name: 'GCP', icon: null },
        ],
      },
    },
    {
      featured: false,
      role: 'Software Developer',
      company: 'Samsung R&D Institute, Bangalore',
      date: 'May 2024 - July 2024',
      location: 'Bangalore, India',
      projectTitle: 'Revenue Forecasting & Anomaly Detection Pipeline',
      summary: 'Built a Revenue forecasting & Anomaly Detection event-based Pipeline for Ad-PF team. Improved system observability & increased forecast accuracy by 15% across high-volume revenue data streams.',
      details: {
        features: [
          'Built a Revenue forecasting & Anomaly Detection event-based Pipeline for Ad-PF team with anomaly detection',
          'Improved system observability & increased forecast accuracy by 15% across high-volume revenue data streams',
          'Deployed Transformer-based forecasting models (TFT) with LSTM/GRU ensembles for multivariate prediction',
        ],
        impact: [
          'Increased forecast accuracy by 15% across high-volume revenue data streams',
          'Improved system observability for downstream business systems',
          'Deployed Transformer-based forecasting models for multivariate prediction',
        ],
        techStack: [
          { name: 'Python', icon: null },
          { name: 'R', icon: null },
          { name: 'MySQL', icon: null },
          { name: 'Forecasting Models (Linear & Transformer)', icon: null },
          { name: 'AWS', icon: null },
          { name: 'Data Processing', icon: null },
          { name: 'Apache Kafka', icon: null },
        ],
      },
    },
  ]

  return (
    <section id="stalker-experience" className="recruiter-section">
      <h2 className="section-title">Work experience</h2>
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
                    <h5>Tech & Systems:</h5>
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
