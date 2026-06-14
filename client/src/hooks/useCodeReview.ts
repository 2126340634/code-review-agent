import { useReducer, useCallback } from 'react'
import { useSSE } from './useSSE'
import type { ReviewState, ReviewDimension, ThinkingStep, ReviewIssue, ReviewSummary } from '../types'

interface ReviewStateData {
  state: ReviewState
  thinkingSteps: ThinkingStep[]
  issues: ReviewIssue[]
  summary: ReviewSummary | null
  errorMessage: string | null
}

type Action =
  | { type: 'START_LOADING' }
  | { type: 'START_REVIEWING' }
  | { type: 'ADD_THINKING'; step: ThinkingStep }
  | { type: 'ADD_ISSUE'; issue: ReviewIssue }
  | { type: 'SET_DONE'; summary: ReviewSummary }
  | { type: 'SET_ERROR'; message: string }
  | { type: 'RESET' }

const initialState: ReviewStateData = {
  state: 'idle',
  thinkingSteps: [],
  issues: [],
  summary: null,
  errorMessage: null
}

function reducer(state: ReviewStateData, action: Action): ReviewStateData {
  switch (action.type) {
    case 'START_LOADING':
      return { ...initialState, state: 'loading' }
    case 'START_REVIEWING':
      return { ...state, state: 'reviewing' }
    case 'ADD_THINKING':
      return { ...state, thinkingSteps: [...state.thinkingSteps, action.step] }
    case 'ADD_ISSUE':
      if (state.issues.some((i) => i.id === action.issue.id)) return state
      return { ...state, issues: [...state.issues, action.issue] }
    case 'SET_DONE':
      return { ...state, state: 'done', summary: action.summary }
    case 'SET_ERROR':
      return { ...state, state: 'error', errorMessage: action.message }
    case 'RESET':
      return initialState
    default:
      return state
  }
}

export function useCodeReview() {
  const [data, dispatch] = useReducer(reducer, initialState)
  const { isConnected, connect, disconnect, onEvent } = useSSE()

  const startReview = useCallback(
    (code: string, language: string, dimensions: ReviewDimension[]) => {
      dispatch({ type: 'START_LOADING' })

      onEvent((event) => {
        switch (event.type) {
          case 'thinking':
            dispatch({ type: 'START_REVIEWING' })
            dispatch({ type: 'ADD_THINKING', step: event as ThinkingStep })
            break
          case 'issue':
            dispatch({ type: 'ADD_ISSUE', issue: event as ReviewIssue })
            break
          case 'done':
            dispatch({ type: 'SET_DONE', summary: event as ReviewSummary })
            disconnect()
            break
          case 'error':
            dispatch({ type: 'SET_ERROR', message: (event as any).message || '未知错误' })
            disconnect()
            break
        }
      })

      connect(`/api/review`, { code, language, dimensions })
    },
    [connect, disconnect, onEvent]
  )

  const reset = useCallback(() => {
    disconnect()
    dispatch({ type: 'RESET' })
  }, [disconnect])

  return {
    ...data,
    isConnected,
    startReview,
    reset
  }
}
