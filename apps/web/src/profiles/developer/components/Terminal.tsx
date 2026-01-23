'use client'

import type { ExecutionState, TerminalLine } from '../types/execution'

export function Terminal({
  lines,
  state,
  onClear,
}: {
  lines: TerminalLine[]
  state: ExecutionState
  onClear?: () => void
}) {
  const statusLabel =
    state === 'running'
      ? 'Running...'
      : state === 'completed'
        ? 'Completed'
        : state === 'timeout'
          ? 'Timed out'
          : state === 'failed'
            ? 'Failed'
            : 'Idle'

  return (
    <div className="terminal-output">
      <div className="terminal-header">
        <span className="terminal-title">Terminal</span>
        <div className="terminal-header-right">
          <span className={`terminal-status ${state === 'running' ? 'running' : ''}`}>{statusLabel}</span>
          {onClear && (
            <button
              type="button"
              className="terminal-clear-btn"
              onClick={onClear}
              title="Clear terminal"
              aria-label="Clear terminal"
              disabled={state === 'running'}
            >
              <i className="fas fa-trash-alt" />
            </button>
          )}
        </div>
      </div>
      <div className="terminal-content">
        {lines.length === 0 ? (
          <div className="terminal-line stdout">{state === 'running' ? 'Starting...' : ''}</div>
        ) : (
          lines.map((line, i) => (
            <div key={i} className={`terminal-line ${line.type}`}>
              {line.text}
            </div>
          ))
        )}
      </div>
    </div>
  )
}

