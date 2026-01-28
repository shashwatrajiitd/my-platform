'use client'

import React, { useEffect, useMemo, useRef, useState } from 'react'
import { ragClient, type RAGProfile, type RAGSource } from '@/services/rag-client'
import { SafeMarkdown } from '@/components/shared/SafeMarkdown'

type ChatRole = 'user' | 'assistant'

interface ChatItem {
  id: string
  role: ChatRole
  content: string
  sources?: RAGSource[]
  done?: boolean
  isError?: boolean
}

function createId() {
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`
}

function TypingIndicator() {
  return (
    <span className="recruiter-ai-typing" aria-label="Assistant is typing">
      <span className="recruiter-ai-typing__dot" aria-hidden="true" />
      <span className="recruiter-ai-typing__dot" aria-hidden="true" />
      <span className="recruiter-ai-typing__dot" aria-hidden="true" />
    </span>
  )
}

function ChatBubbleContent({
  role,
  content,
  isStreamingPlaceholder,
}: {
  role: ChatRole
  content: string
  isStreamingPlaceholder: boolean
}) {
  if (!content && isStreamingPlaceholder) return <TypingIndicator />
  if (!content) return null

  if (role === 'assistant') return <SafeMarkdown text={content} />

  // User messages: preserve newlines as typed.
  return <span className="recruiter-ai-plaintext">{content}</span>
}

export function AIFloatingAssistant({ profile }: { profile: RAGProfile }) {
  const [isOpen, setIsOpen] = useState(false)
  const [isEnlarged, setIsEnlarged] = useState(false)
  const [inputValue, setInputValue] = useState('')
  const [isStreaming, setIsStreaming] = useState(false)
  const [openSourceByMessageId, setOpenSourceByMessageId] = useState<Record<string, string | null>>({})
  const [messages, setMessages] = useState<ChatItem[]>(() => [
    {
      id: createId(),
      role: 'assistant',
      content: `Ask me anything about Shashwat — I’ll answer using the ${profile} portfolio data.`,
    },
  ])

  const panelId = useMemo(() => `${profile}-ai-chat-panel`, [profile])
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const endRef = useRef<HTMLDivElement>(null)
  const fabRafRef = useRef<number | null>(null)
  const abortRef = useRef<AbortController | null>(null)

  useEffect(() => {
    if (!isOpen) return
    // Avoid scrolling the whole page when focusing the input.
    try {
      inputRef.current?.focus({ preventScroll: true })
    } catch {
      inputRef.current?.focus()
    }
  }, [isOpen])

  useEffect(() => {
    // IMPORTANT: Only auto-scroll when the panel is open.
    // Otherwise this can scroll the entire page on initial profile load.
    if (!isOpen) return
    endRef.current?.scrollIntoView({ behavior: 'auto' })
  }, [messages, isOpen])

  useEffect(() => {
    if (!isOpen) return

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [isOpen])

  const stopStreaming = () => {
    if (abortRef.current) abortRef.current.abort()
    abortRef.current = null
    setIsStreaming(false)
  }

  const submit = async () => {
    const value = inputValue.trim()
    if (!value || isStreaming) return

    // Cancel any previous in-flight request before sending a new one.
    stopStreaming()

    const userId = createId()
    const assistantId = createId()

    setMessages((prev) => [
      ...prev,
      { id: userId, role: 'user', content: value },
      {
        id: assistantId,
        role: 'assistant',
        content: '',
      },
    ])
    setInputValue('')

    const controller = new AbortController()
    abortRef.current = controller
    setIsStreaming(true)

    try {
      await ragClient.streamChat(
        { message: value, profile },
        (evt) => {
          if (evt.token) {
            setMessages((prev) =>
              prev.map((m) => (m.id === assistantId ? { ...m, content: (m.content || '') + evt.token } : m))
            )
          }

          if (evt.sources) {
            setMessages((prev) =>
              prev.map((m) => (m.id === assistantId ? { ...m, sources: evt.sources ?? [] } : m))
            )
          }

          if (evt.done) {
            setMessages((prev) => prev.map((m) => (m.id === assistantId ? { ...m, done: true } : m)))
            setIsStreaming(false)
            abortRef.current = null
          }
        },
        { signal: controller.signal }
      )
    } catch (e) {
      if (controller.signal.aborted) return
      const msg = e instanceof Error ? e.message : 'Chat request failed'
      setMessages((prev) =>
        prev.map((m) => (m.id === assistantId ? { ...m, content: msg, done: true, isError: true } : m))
      )
      setIsStreaming(false)
      abortRef.current = null
    }
  }

  return (
    <div className="recruiter-ai-fab-root" aria-label="AI assistant">
      <div
        id={panelId}
        className={`recruiter-ai-panel ${isOpen ? 'is-open' : ''} ${isEnlarged ? 'is-enlarged' : ''}`}
        role="dialog"
        aria-modal="false"
        aria-label="AI assistant chat"
        aria-hidden={!isOpen}
      >
        <div className="recruiter-ai-panel__header">
          <div className="recruiter-ai-panel__headerLeft">
            <button
              type="button"
              className="recruiter-ai-panel__enlarge"
              onClick={() => setIsEnlarged((v) => !v)}
              aria-label={isEnlarged ? 'Shrink chat' : 'Enlarge chat'}
              title={isEnlarged ? 'Shrink chat' : 'Enlarge chat'}
            >
              <i className={`fa-solid ${isEnlarged ? 'fa-compress' : 'fa-expand'}`} />
            </button>
            <div className="recruiter-ai-panel__title">What&apos;s in your mind today?</div>
          </div>
          <div className="recruiter-ai-panel__actions">
            <span className="recruiter-ai-panel__chip" aria-label="Powered by AI">
              Powered by AI
            </span>
            <button
              type="button"
              className="recruiter-ai-panel__close"
              onClick={() => {
                stopStreaming()
                setIsEnlarged(false)
                setIsOpen(false)
              }}
              aria-label="Close chat"
            >
              <i className="fa-solid fa-xmark" />
            </button>
          </div>
        </div>

        <div className="recruiter-ai-panel__body">
          <div className="recruiter-ai-messages" aria-live="polite">
            {messages.map((m) => (
              <div key={m.id} className={`recruiter-ai-message ${m.role === 'user' ? 'is-user' : 'is-assistant'}`}>
                <div className="recruiter-ai-message__bubble">
                  <ChatBubbleContent
                    role={m.role}
                    content={m.content}
                    isStreamingPlaceholder={m.role === 'assistant' && isStreaming && !m.done}
                  />
                  {!!m.sources?.length &&
                    (() => {
                      const sourcesPanelId = `recruiter-ai-sources-panel-${m.id}`
                      const selectedSourceId = openSourceByMessageId[m.id] || null
                      const selectedSource = m.sources?.find((s) => s.id === selectedSourceId) || null

                      return (
                        <div className="recruiter-ai-sources">
                          <div className="recruiter-ai-sources__header">
                            <div className="recruiter-ai-sources__title">Sources</div>
                            {!!selectedSource && (
                              <button
                                type="button"
                                className="recruiter-ai-sources__clear"
                                onClick={() => setOpenSourceByMessageId((prev) => ({ ...prev, [m.id]: null }))}
                                aria-label="Hide source details"
                              >
                                Hide
                              </button>
                            )}
                          </div>

                          <div className="recruiter-ai-sources__chips" role="list">
                            {m.sources.map((s) => {
                              const label = s.title || s.id
                              const isActive = selectedSourceId === s.id
                              return (
                                <button
                                  key={s.id}
                                  type="button"
                                  role="listitem"
                                  className={`recruiter-ai-source-chip ${isActive ? 'is-active' : ''}`}
                                  onClick={() =>
                                    setOpenSourceByMessageId((prev) => ({
                                      ...prev,
                                      [m.id]: prev[m.id] === s.id ? null : s.id,
                                    }))
                                  }
                                  aria-expanded={isActive}
                                  aria-controls={sourcesPanelId}
                                >
                                  <span className="recruiter-ai-source-chip__icon" aria-hidden="true">
                                    <i className="fa-solid fa-link" />
                                  </span>
                                  <span className="recruiter-ai-source-chip__label">{label}</span>
                                </button>
                              )
                            })}
                          </div>

                          {!!selectedSource && (
                            <div
                              id={sourcesPanelId}
                              className="recruiter-ai-sources__panel"
                              role="region"
                              aria-label={`Source details: ${selectedSource.title || selectedSource.id}`}
                            >
                              <div className="recruiter-ai-sources__panelHeader">
                                <div className="recruiter-ai-sources__panelTitle">
                                  {selectedSource.title || selectedSource.id}
                                </div>
                                <button
                                  type="button"
                                  className="recruiter-ai-sources__panelClose"
                                  onClick={() => setOpenSourceByMessageId((prev) => ({ ...prev, [m.id]: null }))}
                                  aria-label="Close source details"
                                >
                                  <i className="fa-solid fa-xmark" />
                                </button>
                              </div>
                              <div className="recruiter-ai-sources__panelBody">
                                {selectedSource.snippet || 'No snippet available.'}
                              </div>
                            </div>
                          )}
                        </div>
                      )
                    })()}
                </div>
              </div>
            ))}
            <div ref={endRef} />
          </div>
        </div>

        <div className="recruiter-ai-panel__composer">
          <div className="recruiter-ai-composer">
            <textarea
              ref={inputRef}
              className="recruiter-ai-composer__input"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Ask anything about Shashwat..."
              rows={1}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  submit()
                }
              }}
            />
            <button
              type="button"
              className="recruiter-ai-composer__send"
              onClick={submit}
              disabled={!inputValue.trim() || isStreaming}
              aria-label="Send message"
            >
              {isStreaming ? 'Streaming…' : 'Send'}
            </button>
          </div>
        </div>
      </div>

      <button
        type="button"
        className={`recruiter-ai-fab ${isOpen ? 'is-open' : ''}`}
        onClick={() => {
          setIsOpen((v) => {
            const next = !v
            if (!next) setIsEnlarged(false)
            return next
          })
        }}
        onMouseMove={(e) => {
          const el = e.currentTarget
          const rect = el.getBoundingClientRect()
          const px = (e.clientX - rect.left) / rect.width
          const py = (e.clientY - rect.top) / rect.height

          const x = Math.max(0, Math.min(1, px))
          const y = Math.max(0, Math.min(1, py))

          const dx = (x - 0.5) * 2
          const dy = (y - 0.5) * 2

          if (fabRafRef.current) cancelAnimationFrame(fabRafRef.current)
          fabRafRef.current = requestAnimationFrame(() => {
            el.style.setProperty('--mx', `${(x * 100).toFixed(2)}%`)
            el.style.setProperty('--my', `${(y * 100).toFixed(2)}%`)
            el.style.setProperty('--tilt-x', `${(-dy * 6).toFixed(2)}deg`)
            el.style.setProperty('--tilt-y', `${(dx * 10).toFixed(2)}deg`)
            el.style.setProperty('--press', `${Math.min(1, Math.sqrt(dx * dx + dy * dy)).toFixed(3)}`)
          })
        }}
        onMouseLeave={(e) => {
          if (fabRafRef.current) cancelAnimationFrame(fabRafRef.current)
          fabRafRef.current = null
          const el = e.currentTarget
          el.style.setProperty('--tilt-x', `0deg`)
          el.style.setProperty('--tilt-y', `0deg`)
          el.style.setProperty('--press', `0`)
        }}
        aria-haspopup="dialog"
        aria-controls={panelId}
        aria-expanded={isOpen}
      >
        <span className="recruiter-ai-fab__icon" aria-hidden="true">
          <i className="fa-solid fa-wand-magic-sparkles" />
        </span>
        <span className="recruiter-ai-fab__label">Ask AI</span>
      </button>
    </div>
  )
}

