'use client'

export function AdventurerSkills() {
  const skillCategories = [
    {
      title: 'Programming & Systems',
      skills: [
        { name: 'Python', icon: '/assets/icons/languages/python.png' },
        { name: 'SQL', icon: '/assets/icons/languages/SQL.png' },
        { name: 'C/C++', icon: '/assets/icons/languages/C++.png' },
        { name: 'AWS', icon: '/assets/icons/Tools/aws.png' },
        { name: 'JavaScript', icon: '/assets/icons/languages/JS.png' },
        { name: 'TypeScript', icon: '/assets/icons/languages/TS.png' },
        { name: 'DSA', icon: null },
        { name: 'GCP', icon: '/assets/icons/Platforms/GCP.png' },
        { name: 'Git', icon: '/assets/icons/Platforms/Github.png' },
        { name: 'API Design', icon: null },
        { name: 'Object-Oriented Design', icon: null },
        { name: 'Docker', icon: null },
        { name: 'Kafka', icon: '/assets/icons/Platforms/Kafka.png' },
      ],
    },
    {
      title: 'GenAI, ML & AI Models',
      skills: [
        { name: 'LLM/VLM', icon: null },
        { name: 'Diffusion Models', icon: null },
        { name: 'RAG', icon: null },
        { name: 'OpenAI', icon: '/assets/icons/Tools/openai.png' },
        { name: 'Agentic Systems', icon: null },
        { name: 'Google Gemini', icon: '/assets/icons/Tools/vertexai.png' },
        { name: 'LoRA Fine-Tuning', icon: null },
        { name: 'Forecasting Models', icon: null },
      ],
    },
  ]

  return (
    <section id="adventurer-skills" className="adventurer-section">
      <h2 className="section-title">TECHNICAL SKILLS</h2>
      <div className="section-divider"></div>
      <div className="skills-container">
        {skillCategories.map((category, categoryIndex) => (
          <div key={categoryIndex} className="skill-category-adventurer">
            <h3 className="skill-category-title">{category.title}</h3>
            <div className="skill-tags-adventurer">
              {category.skills.map((skill, skillIndex) => (
                <span key={skillIndex} className="skill-tag-adventurer">
                  {skill.icon && <img src={skill.icon} alt={skill.name} />} {skill.name}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
