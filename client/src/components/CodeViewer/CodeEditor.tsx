import { useRef, useCallback, useEffect } from 'react'
import Editor, { type OnMount } from '@monaco-editor/react'
import type { ReviewIssue } from '../../types'
import styles from '../../styles/CodeViewer.module.css'

interface Props {
  code: string
  language: string
  issues: ReviewIssue[]
  onIssueClick?: (line: number) => void
}

const SEVERITY_COLORS: Record<string, string> = {
  error: '#fca5a5',
  warning: '#fcd34d',
  info: '#93c5fd'
}

export function CodeEditor({ code, language, issues }: Props) {
  const editorRef = useRef<any>(null)
  const monacoRef = useRef<any>(null)
  const decorationsRef = useRef<string[]>([])

  const handleMount: OnMount = useCallback((editorInstance, monaco) => {
    editorRef.current = editorInstance
    monacoRef.current = monaco

    editorInstance.addCommand(monaco.KeyMod.Shift | monaco.KeyMod.Alt | monaco.KeyCode.KeyF, () => {
      editorInstance.getAction('editor.action.formatDocument')?.run()
    })
  }, [])

  // 更新问题行标记
  useEffect(() => {
    const monaco = monacoRef.current
    if (!editorRef.current || !monaco) return

    const decorations = issues
      .filter((i) => i.line_start > 0)
      .map((issue) => ({
        range: new monaco.Range(Math.max(1, issue.line_start), 1, Math.max(1, issue.line_end), 1),
        options: {
          isWholeLine: true,
          className: `review-highlight-${issue.severity}`,
          glyphMarginClassName: `review-glyph-${issue.severity}`,
          hoverMessage: { value: `[${issue.severity.toUpperCase()}] ${issue.title}` },
          overviewRuler: {
            color: SEVERITY_COLORS[issue.severity] || '#93c5fd',
            position: monaco.editor.OverviewRulerLane.Right
          },
          minimap: {
            color: SEVERITY_COLORS[issue.severity] || '#93c5fd',
            position: monaco.editor.MinimapPosition.Inline
          }
        }
      }))

    decorationsRef.current = editorRef.current.deltaDecorations(decorationsRef.current, decorations)
  }, [issues])

  const langMap: Record<string, string> = {
    javascript: 'javascript',
    typescript: 'typescript',
    python: 'python',
    java: 'java',
    go: 'go',
    rust: 'rust',
    cpp: 'cpp',
    c: 'c',
    html: 'html',
    css: 'css',
    scss: 'scss',
    json: 'json',
    sql: 'sql',
    markdown: 'markdown',
    xml: 'xml'
  }

  if (!code) {
    return (
      <div className={styles.empty}>
        <p>在左侧粘贴代码开始审查</p>
      </div>
    )
  }

  return (
    <div className={styles.editorWrapper}>
      <div className={styles.editorHeader}>
        <span>{language}</span>
        {issues.length > 0 && <span className={styles.issueIndicator}>{issues.length} 个问题</span>}
      </div>
      <Editor
        height="100%"
        language={langMap[language]}
        value={code}
        theme="vs-dark"
        onMount={handleMount}
        options={{
          readOnly: true,
          minimap: { enabled: true },
          glyphMargin: true,
          lineNumbers: 'on',
          scrollBeyondLastLine: true,
          fontSize: 14,
          fontFamily: "'Cascadia Code', 'Fira Code', 'JetBrains Mono', Consolas, monospace",
          lineHeight: 1.6,
          padding: { top: 8 }
        }}
      />
    </div>
  )
}
