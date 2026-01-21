'use client'

export function AdventurerContact() {
  return (
    <section id="adventurer-contact" className="adventurer-section adventurer-contact-section">
      <h2 className="section-title">HIRE ME</h2>
      <div className="section-divider"></div>
      <div className="contact-content">
        <p className="contact-subtitle">Ready to build something amazing together?</p>
        <div className="contact-cta-buttons">
          <button
            className="btn btn-primary-cta"
            onClick={() => {
              window.open('https://calendar.google.com/calendar/render?action=TEMPLATE&text=Interview+with+Shashwat+Raj&add=shashwatrajiitd@gmail.com', '_blank')
            }}
          >
            <i className="fas fa-calendar-check"></i> Schedule Interview
          </button>
          <button
            className="btn btn-secondary-cta"
            onClick={() => {
              const link = document.createElement('a')
              link.href = '/assets/resume/shashwat_resume.pdf'
              link.download = 'shashwat_resume.pdf'
              link.click()
            }}
          >
            <i className="fas fa-file-pdf"></i> Download Resume
          </button>
          <a
            href="mailto:shashwatrajiitd@gmail.com"
            className="btn btn-info-cta"
          >
            <i className="fas fa-envelope"></i> Email Me
          </a>
        </div>
        <div className="contact-info">
          <div className="contact-item">
            <i className="fas fa-envelope"></i>
            <span>shashwatrajiitd@gmail.com</span>
          </div>
          <div className="contact-item">
            <i className="fas fa-map-marker-alt"></i>
            <span>Mumbai, Maharashtra</span>
          </div>
          <div className="contact-item">
            <i className="fab fa-linkedin"></i>
            <span>shashwatrajiitd</span>
          </div>
        </div>
      </div>
    </section>
  )
}
