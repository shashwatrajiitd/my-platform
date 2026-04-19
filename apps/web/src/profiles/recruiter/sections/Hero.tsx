'use client'

import { useEffect, useRef } from 'react'

export function RecruiterHero() {
  const videoContainerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = videoContainerRef.current
    if (!container) return

    const videoFiles = ['r1.mp4', 'r2.mp4', 'r3.mp4']
    let currentIndex = 0

    videoFiles.forEach((videoFile, index) => {
      const video = document.createElement('video')
      video.className = 'hero-video'
      video.src = `/assets/bg_videos/recruiter_profile/${videoFile}`
      video.autoplay = true
      video.muted = true
      video.loop = true
      video.playsInline = true
      video.preload = index === 0 ? 'auto' : 'none'
      if (index === 0) video.classList.add('active')
      container.appendChild(video)
    })

    const switchVideo = () => {
      const videoEls = container.querySelectorAll<HTMLVideoElement>('.hero-video')
      if (!videoEls.length) return
      videoEls[currentIndex].classList.remove('active')
      currentIndex = (currentIndex + 1) % videoEls.length
      videoEls[currentIndex].preload = 'auto'
      videoEls[currentIndex].classList.add('active')
    }

    const intervalId = setInterval(switchVideo, 10000)
    return () => {
      clearInterval(intervalId)
      container.querySelectorAll('.hero-video').forEach(v => v.remove())
    }
  }, [])

  const scrollToContact = () => {
    const el = document.getElementById('recruiter-contact')
    if (!el) return
    el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    window.scrollBy({ top: -80, left: 0 })
  }

  return (
    <section className="recruiter-hero" id="recruiter-hero">
      <div className="hero-background">
        <div id="hero-video-container" className="hero-video-container" ref={videoContainerRef}></div>
        <div className="hero-overlay"></div>
      </div>
      <div className="recruiter-hero-content">
        <h1 className="recruiter-hero-title">Shashwat Raj</h1>
        <p className="recruiter-hero-subtitle">
          Applied AI Engineer | IIT Delhi | Building Scalable AI Systems
        </p>
        <div className="hero-tags" aria-label="Quick stats">
          <span className="hero-tag">
            <strong></strong> Autonomous AI Systems
          </span>
          <span className="hero-tag">
            <strong></strong> Multi-Agent Orchestration
          </span>
          <span className="hero-tag">
            <strong></strong> Scalable AI Platforms
          </span>
        </div>
        <div className="hero-cta-buttons">
          <button
            className="btn btn-primary-cta"
            onClick={() => {
              const link = document.createElement('a')
              link.href = '/assets/resume/shashwat_resume.pdf'
              link.download = 'shashwat_resume.pdf'
              link.click()
            }}
          >
            <i className="fas fa-download"></i> Download Resume
          </button>
          <button
            className="btn btn-secondary-cta"
            onClick={() => window.open('mailto:shashwatrajiitd@gmail.com?subject=Interview Opportunity', '_blank')}
          >
            <i className="fas fa-envelope"></i> Schedule Interview
          </button>
        </div>
        <a
          className="hero-badge hero-badge--shimmer"
          href="#recruiter-contact"
          onClick={(e) => {
            e.preventDefault()
            scrollToContact()
          }}
          aria-label="Available for opportunities. Click to jump to contact section."
        >
          <span className="hero-badge-text">Available for Opportunities - Hire Me</span>
          <span className="hero-badge-chevron" aria-hidden="true">
            ›
          </span>
        </a>
      </div>
    </section>
  )
}
