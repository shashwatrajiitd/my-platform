import { describe, it, expect, vi } from 'vitest'
import { ragClient, type RAGStreamEvent } from './rag-client'

function sseChunk(obj: any): string {
  return `data: ${JSON.stringify(obj)}\n\n`
}

describe('ragClient.streamChat', () => {
  it('emits token events then a final done+sources event', async () => {
    const events: RAGStreamEvent[] = []

    const encoder = new TextEncoder()
    const body = new ReadableStream<Uint8Array>({
      start(controller) {
        // Simulate chunk boundaries mid-event too.
        const a = sseChunk({ token: 'Hel', done: false })
        const b = sseChunk({ token: 'lo', done: false })
        const c = sseChunk({ sources: [{ id: 'c1', title: 'T', snippet: 'S' }], done: true })

        controller.enqueue(encoder.encode(a.slice(0, 10)))
        controller.enqueue(encoder.encode(a.slice(10)))
        controller.enqueue(encoder.encode(b))
        controller.enqueue(encoder.encode(c))
        controller.close()
      },
    })

    vi.stubGlobal(
      'fetch',
      vi.fn(async () => {
        return new Response(body, {
          status: 200,
          headers: { 'Content-Type': 'text/event-stream' },
        })
      }) as any
    )

    await ragClient.streamChat({ message: 'hi', profile: 'recruiter' }, (e) => events.push(e))

    expect(events.some((e) => e.token === 'Hel')).toBe(true)
    expect(events.some((e) => e.token === 'lo')).toBe(true)

    const last = events[events.length - 1]
    expect(last.done).toBe(true)
    expect(Array.isArray(last.sources)).toBe(true)
    expect(last.sources?.[0]?.id).toBe('c1')
  })
})

