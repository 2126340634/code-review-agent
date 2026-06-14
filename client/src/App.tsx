import { useState, useRef, useCallback, useEffect, type MouseEvent } from 'react'
import { useCodeReview } from './hooks/useCodeReview'
import { Header } from './components/Layout/Header'
import { SplitPane } from './components/Layout/SplitPane'
import { CodeInput } from './components/CodeInput/CodeInput'
import { ThinkingChain } from './components/ReviewPanel/ThinkingChain'
import { ReviewSummaryCard } from './components/ReviewPanel/ReviewSummary'
import { IssueList } from './components/ReviewPanel/IssueList'
import { CodeEditor } from './components/CodeViewer/CodeEditor'
import type { ReviewDimension } from './types'
import './styles/App.css'

export default function App() {
  const { state, thinkingSteps, issues, summary, errorMessage, startReview, reset } = useCodeReview()

  const [code, setCode] = useState('')
  const [language, setLanguage] = useState('')

  const handleSubmit = useCallback(
    (codeText: string, lang: string, dims: ReviewDimension[]) => {
      setCode(codeText)
      setLanguage(lang)
      startReview(codeText, lang, dims)
    },
    [startReview]
  )

  const isLoading = state === 'loading' || state === 'reviewing'
  const isDone = state === 'done'
  const isError = state === 'error'

  const leftContent = <CodeInput onSubmit={handleSubmit} loading={isLoading} disabled={isLoading} />

  const rightContent = (
    <div className="review-panel">
      <ThinkingChain steps={thinkingSteps} isActive={state === 'reviewing'} />

      {isError && (
        <div className="error-state">
          <p>{errorMessage || '审查过程出错'}</p>
          <button onClick={reset}>重试</button>
        </div>
      )}

      {isDone && summary && <ReviewSummaryCard summary={summary} />}

      {issues.length > 0 && <IssueList issues={issues} />}

      {state === 'idle' && (
        <div className="empty-state">
          <p>粘贴代码并点击审查，AI Agent 将为您分析</p>
          <p className="empty-hint">支持安全、性能、风格、最佳实践四个维度</p>
        </div>
      )}

      {isDone && issues.length === 0 && (
        <div className="empty-state">
          <p>未发现代码问题！</p>
        </div>
      )}
    </div>
  )

  const bottomContent = <CodeEditor code={code} language={language} issues={issues} />

  // 垂直拖拽分割
  const [topRatio, setTopRatio] = useState(0.65)
  const draggingV = useRef(false)
  const bodyRef = useRef<HTMLDivElement>(null)

  const handleVDown = useCallback((e: MouseEvent) => {
    e.preventDefault()
    draggingV.current = true
    document.body.style.cursor = 'row-resize'
    document.body.style.userSelect = 'none'
  }, [])

  const handleVMove = useCallback((e: globalThis.MouseEvent) => {
    if (!draggingV.current || !bodyRef.current) return
    const rect = bodyRef.current.getBoundingClientRect()
    const pct = (e.clientY - rect.top) / rect.height
    setTopRatio(Math.max(0.3, Math.min(0.85, pct)))
  }, [])

  const handleVUp = useCallback(() => {
    if (!draggingV.current) return
    draggingV.current = false
    document.body.style.cursor = ''
    document.body.style.userSelect = ''
  }, [])

  useEffect(() => {
    window.addEventListener('mousemove', handleVMove)
    window.addEventListener('mouseup', handleVUp)
    return () => {
      window.removeEventListener('mousemove', handleVMove)
      window.removeEventListener('mouseup', handleVUp)
    }
  }, [handleVMove, handleVUp])

  return (
    <div className="app">
      <Header />
      <div className="app-body" ref={bodyRef}>
        <div className="app-top" style={{ flex: topRatio }}>
          <SplitPane left={leftContent} right={rightContent} />
        </div>
        <div className="splitterV" onMouseDown={handleVDown} />
        <div className="app-bottom" style={{ flex: 1 - topRatio }}>
          {bottomContent}
        </div>
      </div>
    </div>
  )
}
