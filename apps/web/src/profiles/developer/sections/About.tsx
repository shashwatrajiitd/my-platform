'use client'

import { CodeEditor } from '../components/CodeEditor'

export function DeveloperAbout() {
  return (
    <section id="developer-about" className="developer-section">
      <h2 className="section-title">About / Run Code</h2>
      <div className="section-divider"></div>
      <div className="code-editor-container">
        <CodeEditor />
      </div>
    </section>
  )
}
