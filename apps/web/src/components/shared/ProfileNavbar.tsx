'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { PROFILES } from '@/config/profiles'
import { ROUTES } from '@/config/routes'

interface ProfileNavbarProps {
  profileId: string
  links: Array<{ label: string; targetId: string }>
}

export function ProfileNavbar({ profileId, links }: ProfileNavbarProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const router = useRouter()
  const currentProfile = PROFILES[profileId as keyof typeof PROFILES]

  const handleProfileSwitch = (newProfileId: string) => {
    setDropdownOpen(false)
    router.push(ROUTES.PROFILE(newProfileId))
  }

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleNavClick = (targetId: string) => {
    setMobileMenuOpen(false)
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

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      if (mobileMenuOpen && !target.closest('.mobile-menu-toggle') && !target.closest('.mobile-nav-dropdown')) {
        setMobileMenuOpen(false)
      }
    }

    if (mobileMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [mobileMenuOpen])

  useEffect(() => {
    const threshold = 20

    const computeScrolled = (scrollEventTarget?: EventTarget | null) => {
      // 1) Normal page scroll (window/document)
      const winScroll =
        window.scrollY ||
        document.documentElement.scrollTop ||
        (document.body ? document.body.scrollTop : 0) ||
        0
      if (winScroll > threshold) return true

      // 2) Scroll inside an overflow container (scroll event target)
      if (scrollEventTarget instanceof HTMLElement) {
        if (scrollEventTarget.scrollTop > threshold) return true
      }

      // 3) Fallback: check common containers used across profiles
      const candidates: Array<HTMLElement | null> = [
        document.querySelector('.instagram-main'),
        document.querySelector('.instagram-layout'),
        document.getElementById(`${profileId}-page`),
      ]
      for (const el of candidates) {
        if (el && el.scrollTop > threshold) return true
      }

      return false
    }

    const updateScrollState = (e?: Event) => {
      setIsScrolled(computeScrolled(e?.target))
    }

    // Initial state
    updateScrollState()

    // Listen to window scroll
    window.addEventListener('scroll', updateScrollState, { passive: true })

    // Capture scroll events from any scrollable container (scroll doesn't bubble, but it can be captured)
    document.addEventListener('scroll', updateScrollState, { passive: true, capture: true })

    return () => {
      window.removeEventListener('scroll', updateScrollState)
      document.removeEventListener('scroll', updateScrollState, { capture: true } as AddEventListenerOptions)
    }
  }, [profileId])

  const frostedInlineStyle = isScrolled
    ? {
        backgroundColor: 'rgba(0, 0, 0, 0.1)',
        backdropFilter: 'blur(4px) saturate(105%)',
        WebkitBackdropFilter: 'blur(4px) saturate(105%)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.02)',
        boxShadow: '0 1px 4px rgba(0, 0, 0, 0.1)',
      }
    : undefined

  return (
    <nav
      data-profile-navbar="true"
      className={`${profileId}-navbar ${mobileMenuOpen ? 'nav-open' : ''} ${isScrolled ? 'frosted' : ''}`}
      style={frostedInlineStyle}
    >
      <div className="logo" onClick={scrollToTop} style={{ cursor: 'pointer' }}>
        <Image
          src="/assets/logo.png"
          alt="Shashwat Raj"
          className="navbar-logo"
          width={202}
          height={33}
        />
      </div>
      <button 
        className="mobile-menu-toggle" 
        aria-label="Toggle menu"
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
      >
        <i className={mobileMenuOpen ? 'fas fa-times' : 'fas fa-bars'}></i>
      </button>
      <ul className="nav-links">
        {links.map((l) => (
          <li key={l.targetId}>
            <a
              href={`#${l.targetId}`}
              onClick={(e) => {
                e.preventDefault()
                handleNavClick(l.targetId)
              }}
            >
              {l.label}
            </a>
          </li>
        ))}
      </ul>
      {/* Mobile dropdown menu with frosted glass */}
      {mobileMenuOpen && (
        <div className="mobile-nav-dropdown">
          {links.map((l) => (
            <a
              key={l.targetId}
              href={`#${l.targetId}`}
              className="mobile-nav-item"
              onClick={(e) => {
                e.preventDefault()
                handleNavClick(l.targetId)
              }}
            >
              {l.label}
            </a>
          ))}
        </div>
      )}
      <div className="navbar-right">
        <div className="nav-cta">
          <button className="btn btn-resume" onClick={() => {
            // TODO: Implement download resume
            const link = document.createElement('a')
            link.href = '/assets/resume/shashwat_resume.pdf'
            link.download = 'shashwat_resume.pdf'
            link.click()
          }}>
            <i className="fas fa-download"></i>
            <span className="resume-text">Resume</span>
          </button>
        </div>
        <div className={`profile-selector-container ${dropdownOpen ? 'active' : ''}`}>
          <div
            className="profile-tile-wrapper"
            onClick={() => setDropdownOpen(!dropdownOpen)}
          >
            <div className="profile-tile">
              <Image
                src={currentProfile?.icon || '/assets/icons/developer.png'}
                alt={currentProfile?.displayName || 'Profile'}
                className="profile-tile-img"
                id="current-profile-img"
                width={32}
                height={32}
              />
            </div>
            <i className="fas fa-chevron-down profile-dropdown-icon"></i>
          </div>
          <div className="profile-dropdown">
            {Object.values(PROFILES).map((profile) => (
              <div
                key={profile.id}
                className="profile-dropdown-item"
                onClick={() => handleProfileSwitch(profile.id)}
              >
                <Image
                  src={profile.icon}
                  alt={profile.displayName}
                  className="profile-dropdown-img"
                  width={32}
                  height={32}
                />
                <span className="profile-dropdown-name">{profile.displayName}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </nav>
  )
}
