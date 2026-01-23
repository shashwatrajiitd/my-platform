import { describe, it, expect } from 'vitest'
import { parseSSE } from './parseSSE'

describe('parseSSE', () => {
  it('parses a single data event', () => {
    const buf = 'data: {"token":"Hello","done":false}\n\n'
    const out = parseSSE(buf)
    expect(out.remainder).toBe('')
    expect(out.events).toHaveLength(1)
    expect(out.events[0].data).toBe('{"token":"Hello","done":false}')
  })

  it('handles chunked/incomplete buffers', () => {
    const buf1 = 'data: {"token":"Hel'
    const out1 = parseSSE(buf1)
    expect(out1.events).toHaveLength(0)
    expect(out1.remainder).toBe(buf1)

    const buf2 = out1.remainder + 'lo","done":false}\n\n'
    const out2 = parseSSE(buf2)
    expect(out2.events).toHaveLength(1)
    expect(out2.remainder).toBe('')
  })

  it('joins multi-line data blocks with newline', () => {
    const buf = 'data: line1\ndata: line2\n\n'
    const out = parseSSE(buf)
    expect(out.events).toHaveLength(1)
    expect(out.events[0].data).toBe('line1\nline2')
  })
})

