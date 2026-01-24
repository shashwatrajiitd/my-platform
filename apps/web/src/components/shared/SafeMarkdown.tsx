import React from 'react'

function normalizeNewlines(text: string): string {
  return text.replace(/\r\n/g, '\n')
}

function isSafeHref(href: string): boolean {
  const trimmed = href.trim()
  return trimmed.startsWith('http://') || trimmed.startsWith('https://') || trimmed.startsWith('mailto:')
}

function normalizeLinkedInHref(raw: string): string {
  const s = raw.trim()
  if (s.startsWith('http://') || s.startsWith('https://')) return s
  return `https://${s.replace(/^\/+/, '')}`
}

function splitTrailingPunctuation(s: string): { main: string; trailing: string } {
  // Common punctuation that often follows a URL/email in prose.
  const m = s.match(/^(.*?)([)\].,;:!?]+)$/)
  if (!m) return { main: s, trailing: '' }
  return { main: m[1] || '', trailing: m[2] || '' }
}

function linkifyText(text: string, keyPrefix: string): React.ReactNode[] {
  // Match either:
  // - an email
  // - a LinkedIn "in" profile URL (with or without protocol)
  const re =
    /([A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,})|((?:https?:\/\/)?(?:www\.)?linkedin\.com\/in\/[^\s)]+\/?)/gi

  const out: React.ReactNode[] = []
  let last = 0
  let match: RegExpExecArray | null

  while ((match = re.exec(text))) {
    const start = match.index
    const end = start + match[0].length
    if (start > last) out.push(text.slice(last, start))

    const raw = match[0]
    const { main, trailing } = splitTrailingPunctuation(raw)

    if (match[1]) {
      // Email
      const email = main
      out.push(
        <a key={`${keyPrefix}-email-${start}`} href={`mailto:${email}`} className="recruiter-ai-link">
          {email}
        </a>
      )
    } else if (match[2]) {
      // LinkedIn URL
      const href = normalizeLinkedInHref(main)
      out.push(
        <a
          key={`${keyPrefix}-li-${start}`}
          href={href}
          className="recruiter-ai-link"
          target="_blank"
          rel="noreferrer noopener"
        >
          {main}
        </a>
      )
    } else {
      out.push(raw)
    }

    if (trailing) out.push(trailing)
    last = end
  }

  if (last < text.length) out.push(text.slice(last))
  return out
}

function parseEmphasis(text: string, keyPrefix: string): React.ReactNode[] {
  const nodes: React.ReactNode[] = []
  let i = 0

  const pushText = (chunk: string) => {
    if (!chunk) return
    nodes.push(...linkifyText(chunk, `${keyPrefix}-t-${i}`))
  }

  while (i < text.length) {
    const boldAt = text.indexOf('**', i)
    const italicAt = text.indexOf('*', i)

    let next = -1
    let kind: 'bold' | 'italic' | null = null

    if (boldAt !== -1 && (italicAt === -1 || boldAt <= italicAt)) {
      next = boldAt
      kind = 'bold'
    } else if (italicAt !== -1) {
      next = italicAt
      kind = 'italic'
    }

    if (next === -1 || !kind) {
      pushText(text.slice(i))
      break
    }

    // Emit text before marker
    if (next > i) pushText(text.slice(i, next))

    if (kind === 'bold') {
      const close = text.indexOf('**', next + 2)
      if (close === -1) {
        pushText('**')
        i = next + 2
        continue
      }
      const inner = text.slice(next + 2, close)
      nodes.push(
        <strong key={`${keyPrefix}-b-${next}`}>{parseEmphasis(inner, `${keyPrefix}-b-i-${next}`)}</strong>
      )
      i = close + 2
      continue
    }

    // Italic (avoid treating "**" as italic)
    if (text.startsWith('**', next)) {
      pushText('*')
      i = next + 1
      continue
    }

    const close = text.indexOf('*', next + 1)
    if (close === -1) {
      pushText('*')
      i = next + 1
      continue
    }

    const inner = text.slice(next + 1, close)
    nodes.push(<em key={`${keyPrefix}-i-${next}`}>{parseEmphasis(inner, `${keyPrefix}-i-i-${next}`)}</em>)
    i = close + 1
  }

  return nodes
}

function parseInline(text: string, keyPrefix: string): React.ReactNode[] {
  // First, handle markdown links: [label](href)
  const re = /\[([^\]]+)\]\(([^)]+)\)/g
  const nodes: React.ReactNode[] = []
  let last = 0
  let match: RegExpExecArray | null

  while ((match = re.exec(text))) {
    const start = match.index
    const end = start + match[0].length

    if (start > last) nodes.push(...parseEmphasis(text.slice(last, start), `${keyPrefix}-pre-${start}`))

    const label = match[1] || ''
    const rawHref = (match[2] || '').trim()
    const href = rawHref.startsWith('linkedin.com/in/') ? normalizeLinkedInHref(rawHref) : rawHref

    if (isSafeHref(href)) {
      nodes.push(
        <a
          key={`${keyPrefix}-a-${start}`}
          href={href}
          className="recruiter-ai-link"
          target={href.startsWith('mailto:') ? undefined : '_blank'}
          rel={href.startsWith('mailto:') ? undefined : 'noreferrer noopener'}
        >
          {label}
        </a>
      )
    } else {
      // If href isn't safe, fall back to label text.
      nodes.push(...parseEmphasis(label, `${keyPrefix}-a-t-${start}`))
    }

    last = end
  }

  if (last < text.length) nodes.push(...parseEmphasis(text.slice(last), `${keyPrefix}-post-${last}`))

  return nodes
}

function renderParagraph(text: string, key: string) {
  // Preserve explicit newlines inside a paragraph.
  const parts = text.split('\n')
  const out: React.ReactNode[] = []
  parts.forEach((p, idx) => {
    if (idx > 0) out.push(<br key={`${key}-br-${idx}`} />)
    out.push(...parseInline(p, `${key}-p-${idx}`))
  })
  return <p key={key}>{out}</p>
}

export function SafeMarkdown({ text }: { text: string }) {
  const input = normalizeNewlines(text || '')
  const lines = input.split('\n')

  const blocks: React.ReactNode[] = []
  let i = 0
  let blockIdx = 0

  const isUl = (line: string) => /^\s*[*+-]\s+/.test(line)
  const isOl = (line: string) => /^\s*\d+\.\s+/.test(line)

  while (i < lines.length) {
    const line = lines[i] ?? ''

    if (!line.trim()) {
      i += 1
      continue
    }

    // Unordered list block
    if (isUl(line)) {
      const items: string[] = []
      while (i < lines.length && isUl(lines[i] || '')) {
        const raw = lines[i] || ''
        items.push(raw.replace(/^\s*[*+-]\s+/, ''))
        i += 1
      }

      blocks.push(
        <ul key={`b-ul-${blockIdx++}`}>
          {items.map((it, idx) => (
            <li key={`b-ul-${blockIdx}-li-${idx}`}>{parseInline(it, `ul-${blockIdx}-li-${idx}`)}</li>
          ))}
        </ul>
      )
      continue
    }

    // Ordered list block
    if (isOl(line)) {
      const items: string[] = []
      while (i < lines.length && isOl(lines[i] || '')) {
        const raw = lines[i] || ''
        items.push(raw.replace(/^\s*\d+\.\s+/, ''))
        i += 1
      }

      blocks.push(
        <ol key={`b-ol-${blockIdx++}`}>
          {items.map((it, idx) => (
            <li key={`b-ol-${blockIdx}-li-${idx}`}>{parseInline(it, `ol-${blockIdx}-li-${idx}`)}</li>
          ))}
        </ol>
      )
      continue
    }

    // Paragraph block: consume until blank or list start
    const paraLines: string[] = []
    while (i < lines.length) {
      const l = lines[i] ?? ''
      if (!l.trim()) break
      if (isUl(l) || isOl(l)) break
      paraLines.push(l)
      i += 1
    }

    const paraText = paraLines.join('\n')
    blocks.push(renderParagraph(paraText, `b-p-${blockIdx++}`))
  }

  return <div className="recruiter-ai-markdown">{blocks}</div>
}

