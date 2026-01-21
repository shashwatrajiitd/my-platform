'use client'

export function StalkerAchievements() {
  const achievements = [
    {
      icon: 'fas fa-trophy',
      title: 'JEE Advanced & Mains 2021',
      description: 'Secured 99.89 percentile nationwide among 1M+ candidates',
    },
    {
      icon: 'fas fa-star',
      title: 'NTSE Scholar 2019',
      description: 'Awarded National Talent Scholarship among 1M+ students',
    },
    {
      icon: 'fas fa-shield-alt',
      title: 'Samsung SWC Test',
      description: "Qualified Samsung's Advanced Software Competency Test on first attempt",
    },
    {
      icon: 'fas fa-medal',
      title: 'Regional Mathematical Olympiad',
      description: 'Received certificate of merit twice for mathematical excellence',
    },
  ]

  return (
    <section id="stalker-achievements" className="stalker-section">
      <h2 className="section-title">ACHIEVEMENTS</h2>
      <div className="section-divider"></div>
      <div className="achievements-container">
        {achievements.map((achievement, index) => (
          <div key={index}>
            <div className="achievement-card">
              <div className="achievement-icon">
                <i className={achievement.icon}></i>
              </div>
              <div className="achievement-content">
                <h3 className="achievement-title">{achievement.title}</h3>
                <p className="achievement-description">{achievement.description}</p>
              </div>
            </div>
            {index < achievements.length - 1 && <div className="achievement-divider"></div>}
          </div>
        ))}
      </div>
    </section>
  )
}
