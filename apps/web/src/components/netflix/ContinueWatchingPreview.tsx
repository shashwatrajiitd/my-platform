'use client'

import { memo, useCallback, useEffect, useMemo, useRef, useState, WheelEvent } from 'react'
import { createPortal } from 'react-dom'

const HOVER_DELAY_MS = 400

type ContinueWatchingPreviewItem = {
  id: string
  title: string
  targetId: string
  previewSrc: string
  chips?: string[]
  description?: string
}

interface ContinueWatchingPreviewProps {
  title: string
  items: ContinueWatchingPreviewItem[]
  titleId?: string
  sectionClassName?: string
  showExpandButton?: boolean
  showDivider?: boolean
  /**
   * Netflix-style edge hover scroll arrows (left/right).
   * Scoped via CSS using the provided `sectionClassName`.
   */
  showHoverScrollArrows?: boolean
}

function useVideoPoster(videoSrc: string) {
  const [poster, setPoster] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    const video = document.createElement('video')
    video.src = videoSrc
    video.muted = true
    video.preload = 'metadata'
    video.playsInline = true

    const handleLoadedMetadata = () => {
      if (video.duration === Infinity) return
      try {
        video.currentTime = Math.min(0.1, Math.max(0, video.duration / 10))
      } catch {
        // Ignore seek errors.
      }
    }

    const handleSeeked = () => {
      if (cancelled || video.videoWidth === 0 || video.videoHeight === 0) return
      const canvas = document.createElement('canvas')
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      const ctx = canvas.getContext('2d')
      if (!ctx) return
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
      try {
        setPoster(canvas.toDataURL('image/jpeg', 0.82))
      } catch {
        // Ignore canvas errors.
      }
    }

    video.addEventListener('loadedmetadata', handleLoadedMetadata)
    video.addEventListener('seeked', handleSeeked)

    return () => {
      cancelled = true
      video.removeEventListener('loadedmetadata', handleLoadedMetadata)
      video.removeEventListener('seeked', handleSeeked)
      video.src = ''
    }
  }, [videoSrc])

  return poster
}

const MetadataChips = memo(function MetadataChips({ items }: { items?: string[] }) {
  if (!items || items.length === 0) {
    return null
  }

  return (
    <div className="metadata-chips" aria-hidden="true">
      {items.map((chip) => (
        <span key={chip} className="metadata-chip">
          {chip}
        </span>
      ))}
    </div>
  )
})

const HoverPreviewCard = memo(function HoverPreviewCard({
  title,
  previewSrc,
  chips,
  description,
  onExpand,
  onHoverStart,
  onHoverEnd,
  showExpandButton = true,
  onWheel,
}: {
  title: string
  previewSrc: string
  chips?: string[]
  description?: string
  onExpand?: () => void
  onHoverStart: () => void
  onHoverEnd: () => void
  showExpandButton?: boolean
  onWheel?: (event: WheelEvent<HTMLDivElement>) => void
}) {
  const videoRef = useRef<HTMLVideoElement | null>(null)

  useEffect(() => {
    const video = videoRef.current
    if (!video) return
    video.currentTime = 0
    video.play().catch(() => {
      // Ignore autoplay failures.
    })
    return () => {
      video.pause()
      video.currentTime = 0
    }
  }, [])

  return (
    <div
      className="hover-preview-content"
      aria-hidden="true"
      onMouseEnter={onHoverStart}
      onMouseLeave={onHoverEnd}
      onWheel={onWheel}
    >
      <div className="hover-preview-media">
        <video ref={videoRef} muted loop playsInline preload="auto" src={previewSrc} />
      </div>
      <div className="hover-preview-meta">
        <div className="hover-preview-header">
          <div className="hover-preview-title">{title}</div>
          {showExpandButton && onExpand ? (
            <button
              type="button"
              className="hover-preview-expand"
              aria-label={`Open ${title} section`}
              onClick={(event) => {
                event.stopPropagation()
                onExpand()
              }}
            >
              <span className="hover-preview-expand-icon" aria-hidden="true">
                <img src="/assets/icons/expand.webp" alt="" />
              </span>
            </button>
          ) : null}
        </div>
        {description ? <div className="hover-preview-description">{description}</div> : null}
        <MetadataChips items={chips} />
      </div>
    </div>
  )
})

const MovieTile = memo(function MovieTile({
  title,
  targetId,
  previewSrc,
  chips,
  isActive,
  onActivate,
  onDeactivate,
  onSelect,
  setTileRef,
}: ContinueWatchingPreviewItem & {
  isActive: boolean
  onActivate: (id: string, rect: DOMRect) => void
  onDeactivate: (id: string) => void
  onSelect: (id: string, rect: DOMRect) => void
  setTileRef: (id: string, node: HTMLDivElement | null) => void
}) {
  const poster = useVideoPoster(previewSrc)
  const hoverTimeoutRef = useRef<number | null>(null)
  const tileRef = useRef<HTMLDivElement | null>(null)

  const clearHoverTimeout = () => {
    if (hoverTimeoutRef.current) {
      window.clearTimeout(hoverTimeoutRef.current)
      hoverTimeoutRef.current = null
    }
  }

  useEffect(() => clearHoverTimeout, [])

  const handleHoverStart = () => {
    clearHoverTimeout()
    hoverTimeoutRef.current = window.setTimeout(() => {
      if (!tileRef.current) return
      onActivate(targetId, tileRef.current.getBoundingClientRect())
    }, HOVER_DELAY_MS)
  }

  const handleHoverEnd = () => {
    clearHoverTimeout()
    onDeactivate(targetId)
  }

  const handleSelect = useCallback(() => {
    if (!tileRef.current) return
    onSelect(targetId, tileRef.current.getBoundingClientRect())
  }, [onSelect, targetId])

  return (
    <div
      className={`movie-tile${isActive ? ' is-active' : ''}`}
      role="button"
      tabIndex={0}
      aria-label={`Open ${title}`}
      ref={(node) => {
        tileRef.current = node
        setTileRef(targetId, node)
      }}
      onMouseEnter={handleHoverStart}
      onMouseLeave={handleHoverEnd}
      onPointerEnter={handleHoverStart}
      onPointerLeave={handleHoverEnd}
      onFocus={handleHoverStart}
      onBlur={handleHoverEnd}
      onClick={handleSelect}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault()
          handleSelect()
        }
      }}
    >
      <div className="movie-tile-poster">
        {poster ? <img src={poster} alt="" /> : <div className="poster-skeleton" />}
      </div>
    </div>
  )
})

export function ContinueWatchingPreview({
  title,
  items,
  titleId = 'continue-watching-title',
  sectionClassName,
  showExpandButton = true,
  showDivider = false,
  showHoverScrollArrows = false,
}: ContinueWatchingPreviewProps) {
  const memoizedItems = useMemo(() => items, [items])
  const tileRefs = useRef<Record<string, HTMLDivElement | null>>({})
  const listRef = useRef<HTMLDivElement | null>(null)
  const [activeId, setActiveId] = useState<string | null>(null)
  const [activeRect, setActiveRect] = useState<{ top: number; left: number } | null>(null)
  const [pinnedId, setPinnedId] = useState<string | null>(null)
  const [isHoveringCard, setIsHoveringCard] = useState(false)
  const [scrollbar, setScrollbar] = useState<{ isScrollable: boolean; thumbWidthPct: number; thumbLeftPct: number }>({
    isScrollable: false,
    thumbWidthPct: 100,
    thumbLeftPct: 0,
  })
  const [scrollArrows, setScrollArrows] = useState<{ canScrollLeft: boolean; canScrollRight: boolean }>({
    canScrollLeft: false,
    canScrollRight: false,
  })
  const cardRef = useRef<HTMLDivElement | null>(null)
  const rafRef = useRef<number | null>(null)
  const deactivateTimeoutRef = useRef<number | null>(null)

  const itemById = useMemo(() => {
    const map = new Map<string, ContinueWatchingPreviewItem>()
    memoizedItems.forEach((item) => map.set(item.targetId, item))
    return map
  }, [memoizedItems])

  const setTileRef = useCallback((id: string, node: HTMLDivElement | null) => {
    tileRefs.current[id] = node
  }, [])

  const updateActiveRect = useCallback(() => {
    if (!activeId) return
    const node = tileRefs.current[activeId]
    if (!node) return
    const rect = node.getBoundingClientRect()
    setActiveRect({ top: rect.top, left: rect.left })
  }, [activeId])

  const scheduleRectUpdate = useCallback(() => {
    if (rafRef.current) return
    rafRef.current = window.requestAnimationFrame(() => {
      rafRef.current = null
      updateActiveRect()
    })
  }, [updateActiveRect])

  const clearDeactivateTimeout = useCallback(() => {
    if (deactivateTimeoutRef.current) {
      window.clearTimeout(deactivateTimeoutRef.current)
      deactivateTimeoutRef.current = null
    }
  }, [])

  const closeActive = useCallback(() => {
    setActiveId(null)
    setActiveRect(null)
    setPinnedId(null)
  }, [])

  const handleActivate = useCallback(
    (id: string, rect: DOMRect) => {
      clearDeactivateTimeout()
      setActiveId(id)
      setActiveRect({ top: rect.top, left: rect.left })
    },
    [clearDeactivateTimeout, setActiveId, setActiveRect],
  )

  const handleDeactivate = useCallback(
    (id: string) => {
      if (pinnedId === id || isHoveringCard) return
      if (activeId !== id) return
      clearDeactivateTimeout()
      deactivateTimeoutRef.current = window.setTimeout(() => {
        if (pinnedId === id || isHoveringCard) return
        setActiveId(null)
        setActiveRect(null)
      }, 120)
    },
    [activeId, pinnedId, isHoveringCard, clearDeactivateTimeout],
  )

  const handleSelect = useCallback(
    (id: string, rect: DOMRect) => {
      clearDeactivateTimeout()
      setPinnedId(id)
      setActiveId(id)
      setActiveRect({ top: rect.top, left: rect.left })
    },
    [clearDeactivateTimeout, setPinnedId, setActiveId, setActiveRect],
  )

  const handleExpand = useCallback(
    (id: string) => {
      const el = document.getElementById(id)
      if (!el) return
      el.scrollIntoView({ behavior: 'smooth', block: 'start' })
      window.scrollBy({ top: -80, left: 0, behavior: 'smooth' })
      closeActive()
    },
    [closeActive],
  )

  const handleOverlayWheel = useCallback((event: WheelEvent<HTMLDivElement>) => {
    event.preventDefault()
    window.scrollBy({ top: event.deltaY, left: event.deltaX, behavior: 'auto' })
  }, [])

  const updateScrollbar = useCallback(() => {
    const node = listRef.current
    if (!node) return

    const scrollWidth = node.scrollWidth
    const clientWidth = node.clientWidth
    const maxScrollLeft = Math.max(0, scrollWidth - clientWidth)
    const isScrollable = maxScrollLeft > 2

    if (showHoverScrollArrows) {
      setScrollArrows({
        canScrollLeft: node.scrollLeft > 2,
        canScrollRight: node.scrollLeft < maxScrollLeft - 2,
      })
    }

    if (!isScrollable) {
      setScrollbar({ isScrollable: false, thumbWidthPct: 100, thumbLeftPct: 0 })
      return
    }

    const thumbWidthPct = Math.max(12, (clientWidth / scrollWidth) * 100)
    const clampedThumbWidth = Math.min(100, thumbWidthPct)
    const leftPct =
      maxScrollLeft === 0 ? 0 : (node.scrollLeft / maxScrollLeft) * (100 - Math.min(100, clampedThumbWidth))

    setScrollbar({
      isScrollable: true,
      thumbWidthPct: clampedThumbWidth,
      thumbLeftPct: Math.max(0, leftPct),
    })
  }, [showHoverScrollArrows])

  useEffect(() => {
    if (!activeId) return
    const handleScroll = () => scheduleRectUpdate()
    const handleResize = () => scheduleRectUpdate()
    window.addEventListener('scroll', handleScroll, true)
    window.addEventListener('resize', handleResize)
    return () => {
      window.removeEventListener('scroll', handleScroll, true)
      window.removeEventListener('resize', handleResize)
    }
  }, [activeId, scheduleRectUpdate])

  useEffect(() => {
    if (!activeId) return
    updateActiveRect()
  }, [activeId, updateActiveRect])

  useEffect(() => {
    updateScrollbar()
    const node = listRef.current
    if (!node) return

    const handleScroll = () => updateScrollbar()
    node.addEventListener('scroll', handleScroll, { passive: true })

    const ro = new ResizeObserver(() => updateScrollbar())
    ro.observe(node)

    return () => {
      node.removeEventListener('scroll', handleScroll)
      ro.disconnect()
    }
  }, [updateScrollbar, memoizedItems])

  const handleArrowScroll = useCallback((direction: 'left' | 'right') => {
    const node = listRef.current
    if (!node) return
    const distance = Math.max(240, Math.floor(node.clientWidth * 0.9))
    node.scrollBy({ left: direction === 'left' ? -distance : distance, behavior: 'smooth' })
  }, [])

  useEffect(() => {
    if (!pinnedId) return
    const handleClickAway = (event: MouseEvent) => {
      const target = event.target as Node | null
      if (!target) return
      const cardNode = cardRef.current
      if (cardNode && cardNode.contains(target)) return
      const tileNode = tileRefs.current[pinnedId]
      if (tileNode && tileNode.contains(target)) return
      closeActive()
    }
    document.addEventListener('mousedown', handleClickAway)
    return () => {
      document.removeEventListener('mousedown', handleClickAway)
    }
  }, [pinnedId, closeActive])

  const scrollbarTrackRef = useRef<HTMLDivElement | null>(null)
  const isDraggingRef = useRef(false)

  const handleScrollbarTrackClick = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      const node = listRef.current
      const track = scrollbarTrackRef.current
      if (!node || !track || !scrollbar.isScrollable) return

      // Don't scroll if clicking directly on the thumb
      const thumb = event.currentTarget.querySelector('.carousel-scrollbar-thumb') as HTMLElement
      if (thumb && thumb.contains(event.target as Node)) return

      const trackRect = track.getBoundingClientRect()
      const clickX = event.clientX - trackRect.left
      const trackWidth = trackRect.width
      const clickPercent = Math.max(0, Math.min(1, clickX / trackWidth))

      const scrollWidth = node.scrollWidth
      const clientWidth = node.clientWidth
      const maxScrollLeft = Math.max(0, scrollWidth - clientWidth)
      
      // Calculate scroll position: account for thumb width in the calculation
      const thumbWidthPct = scrollbar.thumbWidthPct / 100
      const scrollableArea = 1 - thumbWidthPct
      const targetScrollLeft = (clickPercent / scrollableArea) * maxScrollLeft

      node.scrollTo({ left: Math.max(0, Math.min(maxScrollLeft, targetScrollLeft)), behavior: 'smooth' })
    },
    [scrollbar.isScrollable, scrollbar.thumbWidthPct],
  )

  const handleScrollbarThumbMouseDown = useCallback((event: React.MouseEvent<HTMLDivElement>) => {
    event.preventDefault()
    event.stopPropagation()
    isDraggingRef.current = true

    const node = listRef.current
    const track = scrollbarTrackRef.current
    if (!node || !track) return

    const startX = event.clientX
    const startScrollLeft = node.scrollLeft
    const trackRect = track.getBoundingClientRect()
    const trackWidth = trackRect.width
    const scrollWidth = node.scrollWidth
    const clientWidth = node.clientWidth
    const maxScrollLeft = Math.max(0, scrollWidth - clientWidth)
    const thumbWidthPct = scrollbar.thumbWidthPct / 100
    const scrollableArea = 1 - thumbWidthPct

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDraggingRef.current) return
      const deltaX = e.clientX - startX
      const deltaPercent = deltaX / trackWidth
      // Account for thumb width in scroll calculation
      const deltaScroll = (deltaPercent / scrollableArea) * maxScrollLeft
      const newScrollLeft = Math.max(0, Math.min(maxScrollLeft, startScrollLeft + deltaScroll))
      node.scrollLeft = newScrollLeft
    }

    const handleMouseUp = () => {
      isDraggingRef.current = false
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
  }, [scrollbar.thumbWidthPct])

  const overlay = useMemo(() => {
    if (!activeId || !activeRect) return null
    const item = itemById.get(activeId)
    if (!item) return null
    const style = {
      top: `${activeRect.top - 18}px`,
      left: `${activeRect.left - 18}px`,
      width: '320px',
    }
    return (
      <div className="hover-preview-overlay">
        <div
          className="hover-preview-card is-visible"
          style={style}
          ref={cardRef}
          onWheel={handleOverlayWheel}
          onMouseEnter={() => {
            clearDeactivateTimeout()
            setIsHoveringCard(true)
          }}
          onMouseLeave={() => {
            setIsHoveringCard(false)
            if (!pinnedId) {
              clearDeactivateTimeout()
              deactivateTimeoutRef.current = window.setTimeout(() => {
                if (!pinnedId) {
                  setActiveId(null)
                  setActiveRect(null)
                }
              }, 120)
            }
          }}
        >
          <HoverPreviewCard
            title={item.title}
            previewSrc={item.previewSrc}
            chips={item.chips}
            description={item.description}
            showExpandButton={showExpandButton}
            onExpand={showExpandButton ? () => handleExpand(item.targetId) : undefined}
            onWheel={handleOverlayWheel}
            onHoverStart={() => {
              clearDeactivateTimeout()
              setIsHoveringCard(true)
            }}
            onHoverEnd={() => {
              setIsHoveringCard(false)
              if (!pinnedId) {
                clearDeactivateTimeout()
                deactivateTimeoutRef.current = window.setTimeout(() => {
                  if (!pinnedId) {
                    setActiveId(null)
                    setActiveRect(null)
                  }
                }, 120)
              }
            }}
          />
        </div>
      </div>
    )
  }, [
    activeId,
    activeRect,
    handleExpand,
    itemById,
    pinnedId,
    clearDeactivateTimeout,
    showExpandButton,
    handleOverlayWheel,
  ])

  return (
    <section
      className={`continue-watching recruiter-continue-watching${sectionClassName ? ` ${sectionClassName}` : ''}`}
    >
      <h2 className="section-title" id={titleId}>
        {title}
      </h2>
      {showDivider ? <div className="section-divider"></div> : null}
      <div className="carousel-wrapper">
        <div className="watching-cards" ref={listRef}>
          {memoizedItems.map((item) => (
            <MovieTile
              key={item.id}
              {...item}
              isActive={activeId === item.targetId}
              onActivate={handleActivate}
              onDeactivate={handleDeactivate}
              onSelect={handleSelect}
              setTileRef={setTileRef}
            />
          ))}
        </div>

        {showHoverScrollArrows && scrollbar.isScrollable ? (
          <>
            <button
              type="button"
              className={`carousel-edge carousel-edge-left${scrollArrows.canScrollLeft ? ' is-active' : ''}`}
              aria-label="Scroll left"
              onClick={(event) => {
                event.preventDefault()
                event.stopPropagation()
                handleArrowScroll('left')
              }}
            >
              <span className="carousel-edge-icon" aria-hidden="true">
                ‹
              </span>
            </button>
            <button
              type="button"
              className={`carousel-edge carousel-edge-right${scrollArrows.canScrollRight ? ' is-active' : ''}`}
              aria-label="Scroll right"
              onClick={(event) => {
                event.preventDefault()
                event.stopPropagation()
                handleArrowScroll('right')
              }}
            >
              <span className="carousel-edge-icon" aria-hidden="true">
                ›
              </span>
            </button>
          </>
        ) : null}

        <div className={`carousel-scrollbar${scrollbar.isScrollable ? '' : ' is-hidden'}`} aria-hidden="true">
          <div
            ref={scrollbarTrackRef}
            className="carousel-scrollbar-track"
            onClick={handleScrollbarTrackClick}
            role="scrollbar"
            aria-label="Scroll horizontal content"
          >
            <div
              className="carousel-scrollbar-thumb"
              style={{ width: `${scrollbar.thumbWidthPct}%`, left: `${scrollbar.thumbLeftPct}%` }}
              onMouseDown={handleScrollbarThumbMouseDown}
              role="button"
              tabIndex={0}
              aria-label="Drag to scroll"
            />
          </div>
        </div>
      </div>
      {overlay && typeof document !== 'undefined' ? createPortal(overlay, document.body) : null}
    </section>
  )
}
