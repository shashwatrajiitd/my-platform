import { useCallback, useRef } from 'react'
import type { ExecutionState, TerminalLine } from '../types/execution'
import { parseSSE, type ParsedSSEEvent } from '../utils/parseSSE'

type Dispatch = (action: { type: 'RESET' } | { type: 'APPEND'; payload: TerminalLine } | { type: 'SET_STATE'; payload: ExecutionState }) => void

function getApiBaseUrl(): string {
  // Prefer configured API base URL, but allow same-origin deployments.
  return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
}

function joinUrl(base: string, path: string): string {
  if (!base) return path
  return `${base.replace(/\/+$/, '')}${path.startsWith('/') ? '' : '/'}${path}`
}

function parseExitCode(data: string): number | null {
  const trimmed = (data || '').trim()
  if (!trimmed) return null
  try {
    const parsed = JSON.parse(trimmed) as { exit_code?: unknown }
    const n = Number((parsed as any)?.exit_code)
    return Number.isFinite(n) ? n : null
  } catch {
    const n = Number(trimmed)
    return Number.isFinite(n) ? n : null
  }
}

function mapExitCodeToState(exitCode: number | null): ExecutionState {
  if (exitCode === 0) return 'completed'
  if (exitCode === 124) return 'timeout'
  if (typeof exitCode === 'number') return 'failed'
  return 'failed'
}

export function useCodeExecution(dispatch: Dispatch) {
  // Kept for Phase 3 (cancellation), but not exposed/used yet.
  const controllerRef = useRef<AbortController | null>(null)

  const handleEvent = useCallback(
    (evt: ParsedSSEEvent) => {
      if (evt.event === 'stdout' || evt.event === 'stderr') {
        const lines = (evt.data ?? '').split('\n')
        for (const line of lines) {
          dispatch({ type: 'APPEND', payload: { type: evt.event, text: line } })
        }
        return
      }

      if (evt.event === 'exit') {
        const exitCode = parseExitCode(evt.data)
        dispatch({ type: 'SET_STATE', payload: mapExitCodeToState(exitCode) })
        return
      }

      if (evt.event === 'error') {
        const msg = (evt.data || 'Execution engine error').trim() || 'Execution engine error'
        dispatch({ type: 'APPEND', payload: { type: 'stderr', text: msg } })
        dispatch({ type: 'SET_STATE', payload: 'failed' })
      }
    },
    [dispatch]
  )

  const run = useCallback(
    async (code: string) => {
      dispatch({ type: 'RESET' })
      dispatch({ type: 'SET_STATE', payload: 'running' })

      const controller = new AbortController()
      controllerRef.current = controller

      const endpoint = joinUrl(getApiBaseUrl(), '/api/code/run/stream')

      let res: Response
      try {
        res = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ language: 'python', code }),
          signal: controller.signal,
        })
      } catch (e) {
        dispatch({
          type: 'APPEND',
          payload: { type: 'stderr', text: e instanceof Error ? e.message : 'Network error' },
        })
        dispatch({ type: 'SET_STATE', payload: 'failed' })
        return
      }

      if (!res.ok) {
        let detail = `Request failed (${res.status})`
        try {
          const body = await res.json()
          if (typeof body?.detail === 'string') detail = body.detail
        } catch {
          // ignore
        }
        dispatch({ type: 'APPEND', payload: { type: 'stderr', text: detail } })
        dispatch({ type: 'SET_STATE', payload: 'failed' })
        return
      }

      if (!res.body) {
        dispatch({ type: 'APPEND', payload: { type: 'stderr', text: 'Streaming not supported by response' } })
        dispatch({ type: 'SET_STATE', payload: 'failed' })
        return
      }

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''
      let sawExit = false

      try {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          buffer += decoder.decode(value, { stream: true })
          const parsed = parseSSE(buffer)
          buffer = parsed.remainder

          for (const evt of parsed.events) {
            if (evt.event === 'exit') sawExit = true
            handleEvent(evt)
          }
        }
      } catch (e) {
        dispatch({
          type: 'APPEND',
          payload: { type: 'stderr', text: e instanceof Error ? e.message : 'Stream read error' },
        })
        dispatch({ type: 'SET_STATE', payload: 'failed' })
        return
      }

      // If the connection ended without an `exit` event, treat as failure (backend semantics expect exit).
      if (!sawExit) dispatch({ type: 'SET_STATE', payload: 'failed' })
    },
    [dispatch, handleEvent]
  )

  return { run }
}

