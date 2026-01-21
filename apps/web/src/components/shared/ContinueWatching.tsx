'use client'

import type { MouseEvent } from 'react'

interface ContinueWatchingItem {
  label: string
  targetId: string
  iconClass?: string
  gradient?: string
  videoSrc?: string
}

export function ContinueWatching(props: { title: string; items: ContinueWatchingItem[] }) {
  const { title, items } = props

  const handleVideoStart = (event: MouseEvent<HTMLDivElement>) => {
    const video = event.currentTarget.querySelector('video')
    if (!video) return
    video.play().catch(() => {
      // Ignore autoplay failures for hover interactions.
    })
  }

  const handleVideoStop = (event: MouseEvent<HTMLDivElement>) => {
    const video = event.currentTarget.querySelector('video')
    if (!video) return
    video.pause()
    video.currentTime = 0
  }

  const goTo = (targetId: string) => {
    try {
      window.location.hash = targetId
    } catch {
      // ignore
    }
    const el = document.getElementById(targetId)
    if (!el) return
    el.scrollIntoView({ behavior: 'auto', block: 'start' })
    window.scrollBy({ top: -80, left: 0 })
  }

  return (
    <section className="continue-watching">
      <h2 className="section-title" id="continue-watching-title">
        {title}
      </h2>
      <div className="watching-cards">
        {items.map((item) => (
          <div
            key={item.targetId}
            className="watching-card"
            role="button"
            tabIndex={0}
            onClick={() => goTo(item.targetId)}
            onMouseEnter={item.videoSrc ? handleVideoStart : undefined}
            onMouseLeave={item.videoSrc ? handleVideoStop : undefined}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                goTo(item.targetId)
              }
            }}
          >
            <div
              className="card-image"
              style={item.gradient ? { background: `linear-gradient(${item.gradient})` } : undefined}
            >
              {item.videoSrc ? (
                <video
                  className="card-video"
                  muted
                  loop
                  playsInline
                  preload="auto"
                  src={item.videoSrc}
                  aria-hidden="true"
                  tabIndex={-1}
                  onLoadedData={(event) => {
                    event.currentTarget.currentTime = 0
                  }}
                />
              ) : item.iconClass ? (
                <i className={item.iconClass}></i>
              ) : null}
            </div>
            <div className="card-label">{item.label}</div>
          </div>
        ))}
      </div>
    </section>
  )
}

