'use client'

import { useEffect, useMemo, useReducer, useRef, useState } from 'react'
import dynamic from 'next/dynamic'
import { conf as pythonConf, language as pythonLanguage } from 'monaco-editor/esm/vs/basic-languages/python/python'
import { Terminal } from './Terminal'
import { useCodeExecution } from '../hooks/useCodeExecution'
import { terminalReducer } from '../hooks/useTerminalReducer'

const MonacoEditor = dynamic<any>(() => import('@monaco-editor/react'), { ssr: false })

const DEFAULT_CODE = `class ShashwatRaj:
    """
    Applied AI Engineer
    Building autonomous, production-grade GenAI systems at scale.
    """

    def __init__(self):
        self.name = "Shashwat Raj"
        self.title = "Applied AI Engineer"
        self.location = "Mumbai, India"

        self.links = {
            "Email": "shashwatrajiitd@gmail.com",
            "GitHub": "github.com/shashwatrajiitd",
            "Linkedin": "linkedin.com/in/shashwatrajiitd"
        }

        self.education = {
            "degree": "B.Tech in Mathematics & Computing",
            "institute": "Indian Institute of Technology, Delhi",
            "period": "2021 – 2025",
            "specialisation": "Machine Learning & Applied AI"
        }

        self.focus = [
            "Autonomous multi-agent GenAI systems",
            "LLM / VLM orchestration + diffusion pipelines",
            "Creative automation at business scale",
            "Production MLOps & distributed systems"
        ]

        self.current_work = {
            "company": "Purplle.com",
            "mission": (
                "Architecting and deploying a GenAI Creative Automation Platform\\n"
                "powering large-scale marketing and app surfaces.\\n\\n"
                "• Ideation Agents      → campaign concepts & creative directions\\n"
                "• Generation Agents    → high-fidelity static creatives (LLM/VLM + diffusion)\\n"
                "• Moderation Agents    → vision-based brand compliance & ranking\\n\\n"
                "Impact:\\n"
                "• 10–15× faster creative production\\n"
                "• ~95% cost reduction per creative asset\\n"
                "• Scaled across ads, widgets, banners, and PDP automation"
            )
        }

    def _divider(self, char="─", width=72):
        return char * width

    def render_about(self) -> str:
        lines = []

        lines.append(self._divider("═"))
        lines.append(f"{self.name.upper()}")
        lines.append(f"{self.title}  |  {self.location}")
        lines.append(self._divider("═"))
        lines.append("")

        lines.append("ABOUT")
        lines.append(self._divider())
        lines.append(
            "Applied AI Engineer specializing in GenAI systems, with a strong\\n"
            "foundation in Mathematics & Computing from IIT Delhi.\\n"
            "Focused on translating business constraints into scalable,\\n"
            "production-grade AI systems that ship and perform in the real world."
        )
        lines.append("")

        lines.append("CURRENT FOCUS")
        lines.append(self._divider())
        for item in self.focus:
            lines.append(f"• {item}")
        lines.append("")

        lines.append("WORK")
        lines.append(self._divider())
        lines.append(f"{self.current_work['company']}")
        lines.append(self.current_work["mission"])
        lines.append("")

        lines.append("EDUCATION")
        lines.append(self._divider())
        lines.append(f"{self.education['degree']}")
        lines.append(f"{self.education['institute']} ({self.education['period']})")
        lines.append(f"Specialisation: {self.education['specialisation']}")
        lines.append("")

        lines.append("LINKS")
        lines.append(self._divider())
        for key, value in self.links.items():
            lines.append(f"{key:<10}: {value}")

        lines.append("")
        lines.append(self._divider("═"))

        return "\\n".join(lines)


if __name__ == "__main__":
    profile = ShashwatRaj()
    print(profile.render_about())
`

export function CodeEditor() {
  const [expanded, setExpanded] = useState(false)
  const [terminalVisible, setTerminalVisible] = useState(false)
  const [code, setCode] = useState(DEFAULT_CODE)
  const [isMobile, setIsMobile] = useState(false)
  const editorRef = useRef<any>(null)
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

  useEffect(() => {
    if (typeof window === 'undefined') return

    const mq = window.matchMedia('(max-width: 768px)')
    const update = () => setIsMobile(mq.matches)
    update()

    // Safari < 14 uses addListener/removeListener.
    if (typeof mq.addEventListener === 'function') {
      mq.addEventListener('change', update)
      return () => mq.removeEventListener('change', update)
    }

    mq.addListener(update)
    return () => mq.removeListener(update)
  }, [])

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
            <span className="code-editor-subtitle">
              {isMobile ? 'play ▶︎ button' : '# Run this code using play ▶︎ button or Re-write your own code'}
            </span>
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
        <div
          className="code-content-wrapper"
          onKeyDownCapture={(e) => {
            // Ensure Cmd/Ctrl+A selects within Monaco, not the whole page.
            const isMod = e.metaKey || e.ctrlKey
            if (!isMod) return
            if (e.key.toLowerCase() !== 'a') return

            const target = e.target as HTMLElement | null
            const insideMonaco = !!target?.closest?.('.monaco-editor')
            if (!insideMonaco) return

            const ed = editorRef.current
            if (!ed) return

            e.preventDefault()
            e.stopPropagation()
            try {
              ed.trigger('keyboard', 'editor.action.selectAll', null)
            } catch {
              // ignore
            }
          }}
        >
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
            onMount={(editor: any, monaco: any) => {
              editorRef.current = editor

              // Some global keyboard handlers (or browser defaults) can steal Cmd/Ctrl+A.
              // Register an explicit Monaco keybinding so "Select All" works reliably.
              try {
                const selectAll = (ed: any) => {
                  ed.trigger('keyboard', 'editor.action.selectAll', null)
                }

                // addCommand tends to be more reliable than addAction for keybindings.
                editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyA, () => selectAll(editor))

                // Keep an action too (shows up in Command Palette if enabled).
                editor.addAction({
                  id: 'portfolio.selectAll',
                  label: 'Select All',
                  keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyA],
                  run: (ed: any) => selectAll(ed),
                })
              } catch {
                // ignore: best-effort binding
              }
            }}
            options={{
              minimap: { enabled: false },
              fontSize: 14,
              wordWrap: 'on',
              scrollBeyondLastLine: false,
              automaticLayout: true,
              // Mobile: tighten gutter so line numbers (1/2/3...) don't waste horizontal space.
              ...(isMobile
                ? {
                    lineNumbersMinChars: 2,
                    lineDecorationsWidth: 6,
                    glyphMargin: false,
                    folding: false,
                    padding: { top: 8, bottom: 8, left: 4, right: 4 },
                  }
                : {}),
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
