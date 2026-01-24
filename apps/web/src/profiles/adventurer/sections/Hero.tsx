'use client'

import { useEffect, useRef } from 'react'

export function AdventurerHero() {
  const videoContainerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const initializeVideoCarousel = () => {
      const container = videoContainerRef.current
      if (!container) return

      const videos = ['bb.mp4', 'suits.mp4']
      let currentIndex = 0

      videos.forEach((videoFile, index) => {
        const video = document.createElement('video')
        video.className = 'hero-video'
        video.src = `/assets/bg_videos/adventurer_profile/${videoFile}`
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

      const switchVideo = () => {
        const videos = container.querySelectorAll('.hero-video')
        if (videos.length === 0) return

        videos[currentIndex].classList.remove('active')
        currentIndex = (currentIndex + 1) % videos.length
        videos[currentIndex].classList.add('active')
      }

      setInterval(switchVideo, 10000)
    }

    initializeVideoCarousel()
  }, [])

  return (
    <section className="adventurer-hero" id="adventurer-hero">
      <div className="hero-background">
        <div id="hero-video-container" className="hero-video-container" ref={videoContainerRef}></div>
        <div className="hero-overlay"></div>
      </div>
      <div className="adventurer-hero-content">
        <h1 className="adventurer-hero-title">ShazQuest</h1>
        <h2 className="adventurer-hero-subtitle">AI Explorer & Engineer</h2>
        <p className="hero-description">
        Exploring AI by day, and curiosity, travel, space, and ideas by night — turning questions into journeys.
          - turning curiosity into code.
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
