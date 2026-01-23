import { parseSSE } from '../profiles/developer/utils/parseSSE'

export type RAGProfile = 'recruiter' | 'developer' | 'adventurer' | 'stalker'

export type RAGChatRequest = {
  message: string
  profile: RAGProfile
  conversation_id?: string | null
}

export type RAGSource = {
  id: string
  title: string
  snippet: string
}

export type RAGStreamEvent = {
  token?: string | null
  sources?: RAGSource[] | null
  done?: boolean
}

function getApiBaseUrl(): string {
  // Prefer configured API base URL, but allow same-origin deployments.
  return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
}

function joinUrl(base: string, path: string): string {
  if (!base) return path
  return `${base.replace(/\/+$/, '')}${path.startsWith('/') ? '' : '/'}${path}`
}

export class RAGClient {
  async streamChat(
    request: RAGChatRequest,
    onEvent: (event: RAGStreamEvent) => void,
    opts?: { signal?: AbortSignal }
  ): Promise<void> {
    const endpoint = joinUrl(getApiBaseUrl(), '/api/rag/chat')

    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
      signal: opts?.signal,
    })

    if (!res.ok) {
      let detail = `Request failed (${res.status})`
      try {
        const body = await res.json()
        if (typeof (body as any)?.detail === 'string') detail = (body as any).detail
      } catch {
        // ignore
      }
      throw new Error(detail)
    }

    if (!res.body) throw new Error('Streaming not supported by response')

    const reader = res.body.getReader()
    const decoder = new TextDecoder()
    let buffer = ''

    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      buffer += decoder.decode(value, { stream: true })
      const parsed = parseSSE(buffer)
      buffer = parsed.remainder

      for (const evt of parsed.events) {
        const data = (evt.data || '').trim()
        if (!data) continue
        try {
          const parsedEvent = JSON.parse(data) as RAGStreamEvent
          onEvent(parsedEvent)
        } catch {
          // ignore invalid chunks
        }
      }
    }
  }
}

export const ragClient = new RAGClient()
