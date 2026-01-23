export type StreamEventType = 'stdout' | 'stderr' | 'exit' | 'error'

export type TerminalLine = {
  type: 'stdout' | 'stderr'
  text: string
}

export type ExecutionState = 'idle' | 'running' | 'completed' | 'failed' | 'timeout'

