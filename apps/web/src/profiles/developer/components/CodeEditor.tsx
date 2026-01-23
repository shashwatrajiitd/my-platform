'use client'

import { useMemo, useReducer, useState } from 'react'
import dynamic from 'next/dynamic'
import { conf as pythonConf, language as pythonLanguage } from 'monaco-editor/esm/vs/basic-languages/python/python'
import { Terminal } from './Terminal'
import { useCodeExecution } from '../hooks/useCodeExecution'
import { terminalReducer } from '../hooks/useTerminalReducer'

const MonacoEditor = dynamic<any>(() => import('@monaco-editor/react'), { ssr: false })

const DEFAULT_CODE = `class ShashwatRaj:
    """
    Autonomous GenAI Systems Engineer & Multi-Agent Orchestrator
    Turning business constraints into scalable, production-grade AI magic.
    Currently running live at Purplle.com — Mumbai, IN
    """

    def __init__(self):
        self.handle          = "Shaz"                     # or Shashwat Raj
        self.role            = "Software Developer"
        self.email           = "shashwatrajiitd@gmail.com"
        self.github          = "shashwatrajiitd"
        self.portfolio       = "shashwatrajiitd.github.io"

        self.education = {
            "degree": "B.Tech Mathematics & Computing",
            "institute": "IIT Delhi",
            "period": "Oct 2021 – May 2025",
            "cgpa": "7.0 / 10"
        }

        self.current_stack = {
            "core":          ["Python", "SQL", "C/C++", "TypeScript"],
            "cloud":         ["AWS", "GCP"],
            "genai_ml":      [
                "LLMs / VLMs", "Stable Diffusion", "LoRA Fine-Tuning",
                "Google Gemini", "OpenAI", "RAG", "Agentic Systems"
            ],
            "ops_infra":     ["MLOps", "Microservices", "Docker", "Kafka", "Git"],
            "paradigms":     ["OOP", "API Design", "Distributed Systems"]
        }

    @property
    def current_mission(self) -> str:
        """Primary thread – GenAI Creative Automation Platform @ Purplle"""
        return (
            "Architect & deploy autonomous multi-agent swarm:\\n"
            "• Ideation Agents       → campaign concepts & directions\\n"
            "• Generation Agents     → high-fidelity statics via LLM/VLM + diffusion\\n"
            "• Moderation Agents     → vision-based brand compliance & ranking\\n"
            "Scaling to 11+ app surfaces • building Creative Generation Service\\n"
            "Roadmap: personalization, PDP automation, Master Content Bank (MCB)"
        )

    def previous_threads(self) -> list:
        """Notable commits / internships"""
        return [
            {
                "repo": "Samsung R&D – Ads Revenue Platform",
                "duration": "May – Jul 2024",
                "summary": (
                    "Real-time forecasting + anomaly detection pipeline\\n"
                    "Hybrid classical regression + PyTorch transformer time-series\\n"
                    "Residual-based anomaly flagging on Kafka streams\\n"
                    "Boosted observability under high-throughput loads"
                )
            }
        ]

    @property
    def unlocked_achievements(self) -> list[str]:
        return [
            "JEE Advanced & Mains 2021 – 99.89 percentile",
            "NTSE Scholar 2019 – National Talent Search",
            "Samsung SWC – Advanced Software Competency (1st attempt)",
            "Regional Mathematical Olympiad – Merit Certificate ×2"
        ]

    def greet(self) -> str:
        return (
            f"Hey fellow dev! I'm {self.handle}, a {self.role} from IIT Delhi.\\n"
            f"Currently orchestrating multi-agent GenAI pipelines in production.\\n"
            f"Stack: {', '.join(self.current_stack['genai_ml'][:6])} + MLOps & microservices.\\n"
            f"Previously debugged revenue anomalies with PyTorch transformers @ Samsung R&D.\\n"
            f"Always down to fork repos, review PRs, or pair on scalable AI infra."
        )


# Render introduction when the module is "run"
if __name__ == "__main__":
    me = ShashwatRaj()
    print(me.greet())`

export function CodeEditor() {
  const [expanded, setExpanded] = useState(false)
  const [terminalVisible, setTerminalVisible] = useState(false)
  const [code, setCode] = useState(DEFAULT_CODE)
  const lineCount = useMemo(() => Math.max(1, code.split('\n').length), [code])
  const previewLines = useMemo(() => Math.min(15, lineCount), [lineCount])
  const visibleLines = expanded ? lineCount : previewLines
  const editorHeight = useMemo(() => {
    // Approx Monaco line height for fontSize 14 with comfortable spacing.
    const lineHeightPx = 22
    const verticalPaddingPx = 24
    return `${Math.max(140, visibleLines * lineHeightPx + verticalPaddingPx)}px`
  }, [visibleLines])

  const initialTerminalState = useMemo(() => ({ lines: [], state: 'idle' as const }), [])
  const [terminal, dispatch] = useReducer(terminalReducer, initialTerminalState)
  const { run } = useCodeExecution(dispatch)
  const running = terminal.state === 'running'

  const handleRun = async () => {
    if (running) return
    setTerminalVisible(true)
    await run(code)
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(code).then(() => {
      // TODO: Show toast notification
    })
  }

  const handleReset = () => {
    setCode(DEFAULT_CODE)
  }

  const handleClearTerminal = () => {
    dispatch({ type: 'RESET' })
  }

  return (
    <>
      <div className={`code-editor ${expanded ? 'expanded' : ''}`}>
        <div className="code-editor-header">
          <div className="code-editor-title" aria-label="Python editor title">
            <img
              className="code-editor-lang-icon"
              src="/assets/icons/languages/Python1.png"
              alt="Python"
              loading="lazy"
            />
            <span className="code-editor-lang">Python</span>
            <span className="code-editor-sep"></span>
            <span className="code-editor-subtitle"># Run this code using play ▶︎ button or Re-write your own code</span>
          </div>
          <div className="code-editor-controls">
            <button
              className="code-control-btn expand-btn"
              onClick={() => setExpanded(!expanded)}
              title={expanded ? 'Collapse' : 'Expand'}
            >
              <i className={expanded ? 'fas fa-compress' : 'fas fa-bars'}></i>
            </button>
            <button
              className="code-control-btn reset-btn"
              onClick={handleReset}
              title="Reset to template"
              disabled={running}
            >
              <i className="fas fa-undo"></i>
              <span className="copy-text">Reset</span>
            </button>
            {!running && (
              <button
                className="code-control-btn play-btn"
                onClick={handleRun}
                title="Run Code"
              >
                <i className="fas fa-play"></i>
              </button>
            )}
            <button
              className="code-control-btn copy-btn"
              onClick={handleCopy}
              title="Copy Code"
            >
              <i className="far fa-copy"></i>
              <span className="copy-text">Copy</span>
            </button>
          </div>
        </div>
        <div className="code-content-wrapper">
          <MonacoEditor
            height={editorHeight}
            language="python"
            defaultLanguage="python"
            theme="vs-dark"
            value={code}
            onChange={(v: string | undefined) => setCode(v ?? '')}
            beforeMount={(monaco: any) => {
              const hasPython = monaco.languages.getLanguages().some((l: any) => l.id === 'python')
              if (!hasPython) monaco.languages.register({ id: 'python' })
              monaco.languages.setMonarchTokensProvider('python', pythonLanguage)
              monaco.languages.setLanguageConfiguration('python', pythonConf)
              monaco.editor.setTheme('vs-dark')
            }}
            options={{
              minimap: { enabled: false },
              fontSize: 14,
              wordWrap: 'on',
              scrollBeyondLastLine: false,
              automaticLayout: true,
            }}
          />
        </div>
      </div>
      {terminalVisible && (
        <Terminal lines={terminal.lines} state={terminal.state} onClear={handleClearTerminal} />
      )}
    </>
  )
}
