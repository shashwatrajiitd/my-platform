'use client'

import { useEffect, useRef } from 'react'

export function StalkerHero() {
  const videoContainerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const initializeVideoCarousel = () => {
      const container = videoContainerRef.current
      if (!container) return

      const videos = ['s0.mp4']
      let currentIndex = 0

      videos.forEach((videoFile, index) => {
        const video = document.createElement('video')
        video.className = 'hero-video'
        video.src = `/assets/bg_videos/stalker_profile/${videoFile}`
        video.autoplay = true
        video.muted = true
        video.loop = true
        video.playsInline = true
        video.preload = 'auto'

        if (index === 0) {
          video.classList.add('active')
        }

        container.appendChild(video)
      })
    }

    initializeVideoCarousel()
  }, [])

  return (
    <section className="stalker-hero" id="stalker-hero">
      <div className="hero-background">
        <div id="hero-video-container" className="hero-video-container" ref={videoContainerRef}></div>
        <div className="hero-overlay"></div>
      </div>
      <div className="stalker-hero-content">
        <h1 className="stalker-hero-title">Lowkey Shaz</h1>
        <h2 className="stalker-hero-subtitle">Sigma GenAI Slanger</h2>
        <p className="hero-description">
          Curious about AI, systems, and the human behind them — casually building cool things and overthinking the rest.
        </p>
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
            <i className="fas fa-play"></i> Resume
          </button>
          <button
            className="btn btn-secondary-cta"
            onClick={() => window.open('https://www.linkedin.com/in/shashwatrajiitd/', '_blank')}
          >
            <i className="fas fa-info-circle"></i> LinkedIn
          </button>
        </div>
      </div>
    </section>
  )
}
