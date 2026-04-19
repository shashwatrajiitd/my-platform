'use client'

import { useEffect, useRef } from 'react'

export function DeveloperHero() {
  const videoContainerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = videoContainerRef.current
    if (!container) return

    const videoFiles = ['v0.mp4', 'v1.mp4', 'v2.mp4']
    let currentIndex = 0

    videoFiles.forEach((videoFile, index) => {
      const video = document.createElement('video')
      video.className = 'hero-video'
      video.src = `/assets/bg_videos/developer_profile/${videoFile}`
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

  return (
    <section className="developer-hero" id="developer-hero">
      <div className="hero-background">
        <div id="hero-video-container" className="hero-video-container" ref={videoContainerRef}></div>
        <div className="hero-overlay"></div>
      </div>
      <div className="developer-hero-content">
        <h1 className="developer-hero-title">Shaz.dev</h1>
        <h2 className="developer-hero-subtitle">AI Software Developer</h2>
        <p className="hero-description">
        Designing and scaling autonomous multi-agent GenAI systems — from LLM and VLM orchestration to production-grade MLOps and high-throughput inference.
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
