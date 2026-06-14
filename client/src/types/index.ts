export type SSEEventType = 'thinking' | 'issue' | 'done' | 'error'

export interface ThinkingStep {
  type: 'thinking'
  step: string
  progress: number
  detail?: string
}

export interface ReviewIssue {
  id: string
  severity: 'error' | 'warning' | 'info'
  category: 'security' | 'performance' | 'style' | 'best_practice'
  title: string
  description: string
  suggestion: string
  line_start: number
  line_end: number
  code_snippet: string
  fixed_code?: string
}

export interface ReviewSummary {
  type: 'done'
  total_issues: number
  summary: string
  score: number
}

export type SSEEvent = ThinkingStep | (ReviewIssue & { type: 'issue' }) | ReviewSummary | { type: 'error'; message: string }

export type ReviewState = 'idle' | 'loading' | 'reviewing' | 'done' | 'error'

export type ReviewDimension = 'security' | 'performance' | 'style' | 'best_practice'

export const DIMENSION_CONFIG: Record<ReviewDimension, { label: string; icon: string; color: string }> = {
  security: { label: '安全', icon: '', color: '#ef4444' },
  performance: { label: '性能', icon: '', color: '#f59e0b' },
  style: { label: '风格', icon: '', color: '#8b5cf6' },
  best_practice: { label: '最佳实践', icon: '', color: '#10b981' }
}

export const SEVERITY_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  error: { label: '错误', color: '#dc2626', bg: '#fef2f2' },
  warning: { label: '警告', color: '#d97706', bg: '#fffbeb' },
  info: { label: '建议', color: '#2563eb', bg: '#eff6ff' }
}

export const LANGUAGE_OPTIONS = [
  { value: '', label: '选择语言' },
  { value: 'javascript', label: 'JavaScript' },
  { value: 'typescript', label: 'TypeScript' },
  { value: 'python', label: 'Python' },
  { value: 'java', label: 'Java' },
  { value: 'go', label: 'Go' },
  { value: 'rust', label: 'Rust' },
  { value: 'cpp', label: 'C++' },
  { value: 'html', label: 'HTML' },
  { value: 'css', label: 'CSS' },
  { value: 'sql', label: 'SQL' },
  { value: 'json', label: 'JSON' }
]
