'use client'

export function AdventurerEducation() {
  const education = [
    {
      degree: 'Bachelor of Technology (B.Tech.) in Mathematics & Computing',
      institution: "Indian Institute of Technology, Delhi",
      date: "June 2021 - May 2025",
      grade: "New Delhi, India",
    },
    {
      degree: "High School (12th Grade) with Mathematics and Computer Science",
      institution: "Stephens International Public School",
      date: "March 2019 - May 2021",
      grade: "Jammu, India",
    },
  ]

  return (
    <section id="adventurer-education" className="recruiter-section">
      <h2 className="section-title">Education</h2>
      <div className="section-divider"></div>
      <div className="education-container">
        {education.map((edu, index) => (
          <div key={index}>
            <div className="education-card">
              <div className="education-header">
                <h3 className="education-degree">{edu.degree}</h3>
                <h4 className="education-institution">{edu.institution}</h4>
              </div>
              <div className="education-meta">
                <span className="education-date">
                  <i className="far fa-calendar"></i> {edu.date}
                </span>
                <span className="education-grade">{edu.grade}</span>
              </div>
            </div>
            {index < education.length - 1 && <div className="education-divider"></div>}
          </div>
        ))}
      </div>
    </section>
  )
}
