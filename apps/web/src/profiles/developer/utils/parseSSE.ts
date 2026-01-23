export type ParsedSSEEvent = {
  event: string
  data: string
}

/**
 * Minimal SSE parser compatible with FastAPI's `text/event-stream` output.
 * - Works with chunked streams (buffer + remainder)
 * - Supports multi-line `data:` blocks (joined by '\n')
 */
export function parseSSE(buffer: string): { events: ParsedSSEEvent[]; remainder: string } {
  const events: ParsedSSEEvent[] = []
  const blocks = buffer.split('\n\n')

  // The last block may be incomplete; keep it as remainder.
  for (const block of blocks.slice(0, -1)) {
    const lines = block.split('\n')
    let event = ''
    const dataLines: string[] = []

    for (const line of lines) {
      if (line.startsWith('event:')) event = line.slice('event:'.length).trim()
      if (line.startsWith('data:')) dataLines.push(line.slice('data:'.length).trimStart())
    }

    // Ignore empty blocks
    if (!event && dataLines.length === 0) continue

    events.push({ event, data: dataLines.join('\n') })
  }

  return { events, remainder: blocks[blocks.length - 1] ?? '' }
}

