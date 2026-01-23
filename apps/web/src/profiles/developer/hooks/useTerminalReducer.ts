import type { ExecutionState, TerminalLine } from '../types/execution'

export type TerminalReducerState = {
  lines: TerminalLine[]
  state: ExecutionState
}

export type TerminalReducerAction =
  | { type: 'RESET' }
  | { type: 'APPEND'; payload: TerminalLine }
  | { type: 'SET_STATE'; payload: ExecutionState }

export function terminalReducer(
  state: TerminalReducerState,
  action: TerminalReducerAction
): TerminalReducerState {
  switch (action.type) {
    case 'RESET':
      return { lines: [], state: 'idle' }
    case 'APPEND':
      return { ...state, lines: [...state.lines, action.payload] }
    case 'SET_STATE':
      return { ...state, state: action.payload }
    default:
      return state
  }
}

