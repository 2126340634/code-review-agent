import { useState, useCallback, useRef } from 'react'
import Editor, { type OnMount } from '@monaco-editor/react'
import type { editor } from 'monaco-editor'
import { DimensionSelector } from '../DimensionSelector/DimensionSelector'
import { LANGUAGE_OPTIONS } from '../../types'
import type { ReviewDimension } from '../../types'
import styles from '../../styles/CodeInput.module.css'

interface Props {
  onSubmit: (code: string, language: string, dimensions: ReviewDimension[]) => void
  loading: boolean
  disabled: boolean
}

export function CodeInput({ onSubmit, loading, disabled }: Props) {
  const [code, setCode] = useState('')
  const [language, setLanguage] = useState('')
  const [dimensions, setDimensions] = useState<ReviewDimension[]>(['security', 'performance', 'style', 'best_practice'])
  const [inputMode, setInputMode] = useState<'paste' | 'upload'>('paste')
  const [filename, setFilename] = useState('')
  const [dragOver, setDragOver] = useState(false)
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null)

  const handleMount: OnMount = (editorInstance) => {
    editorRef.current = editorInstance
  }

  const handleSubmit = useCallback(() => {
    if (!code.trim() || disabled) return
    onSubmit(code, language, dimensions)
  }, [code, language, dimensions, disabled, onSubmit])

  const handleFormat = useCallback(() => {
    if (editorRef.current) {
      editorRef.current.getAction('editor.action.formatDocument')?.run()
    }
  }, [])

  const handleFile = useCallback((file: File) => {
    setFilename(file.name)
    const ext = file.name.split('.').pop()?.toLowerCase()
    const langMap: Record<string, string> = {
      js: 'javascript',
      jsx: 'javascript',
      mjs: 'javascript',
      ts: 'typescript',
      tsx: 'typescript',
      py: 'python',
      java: 'java',
      go: 'go',
      rs: 'rust',
      cpp: 'cpp',
      c: 'c',
      h: 'cpp',
      rb: 'ruby',
      php: 'php',
      vue: 'html',
      html: 'html',
      css: 'css',
      scss: 'css',
      json: 'json',
      sql: 'sql',
      md: 'markdown'
    }
    if (ext && langMap[ext]) setLanguage(langMap[ext])

    const reader = new FileReader()
    reader.onload = (e) => setCode(e.target?.result as string)
    reader.readAsText(file)
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setDragOver(false)
      const file = e.dataTransfer.files[0]
      if (file) handleFile(file)
    },
    [handleFile]
  )

  return (
    <div className={styles.container}>
      <div className={styles.tabs}>
        <button className={`${styles.tab} ${inputMode === 'paste' ? styles.tabActive : ''}`} onClick={() => setInputMode('paste')}>
          粘贴代码
        </button>
        <button className={`${styles.tab} ${inputMode === 'upload' ? styles.tabActive : ''}`} onClick={() => setInputMode('upload')}>
          上传文件
        </button>
      </div>

      <div className={styles.toolbar}>
        <select className={styles.langSelect} value={language} onChange={(e) => setLanguage(e.target.value)} disabled={disabled}>
          {LANGUAGE_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {filename && <span className={styles.filename}>{filename}</span>}
        <button className={styles.formatBtn} onClick={handleFormat} disabled={!code.trim()} title="按 Alt+Shift+F 格式化代码">
          格式化
        </button>
      </div>

      {inputMode === 'paste' ? (
        <div className={styles.editorContainer}>
          <Editor
            height="100%"
            language={language || undefined}
            value={code}
            onChange={(val) => setCode(val ?? '')}
            theme="vs-dark"
            onMount={handleMount}
            options={{
              minimap: { enabled: false },
              lineNumbers: 'on',
              scrollBeyondLastLine: false,
              fontSize: 13,
              fontFamily: "'Cascadia Code', 'Fira Code', 'JetBrains Mono', Consolas, monospace",
              padding: { top: 8 },
              tabSize: 2,
              insertSpaces: true,
              automaticLayout: true,
              wordWrap: 'on',
              readOnly: disabled
            }}
          />
        </div>
      ) : (
        <div
          className={`${styles.dropZone} ${dragOver ? styles.dropActive : ''}`}
          onDragOver={(e) => {
            e.preventDefault()
            setDragOver(true)
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
        >
          {filename ? (
            <div className={styles.uploaded}>
              <span>{filename}</span>
              <button
                className={styles.clearBtn}
                onClick={() => {
                  setFilename('')
                  setCode('')
                }}
              >
                重新选择
              </button>
            </div>
          ) : (
            <>
              <p className={styles.dropText}>拖拽代码文件到此处</p>
              <p className={styles.dropHint}>或</p>
              <label className={styles.fileBtn}>
                选择文件
                <input
                  type="file"
                  hidden
                  accept=".js,.jsx,.ts,.tsx,.py,.java,.go,.rs,.cpp,.c,.html,.css,.vue,.json,.sql"
                  onChange={(e) => {
                    const f = e.target.files?.[0]
                    if (f) handleFile(f)
                  }}
                />
              </label>
            </>
          )}
        </div>
      )}

      <DimensionSelector selected={dimensions} onChange={setDimensions} disabled={disabled} />

      <button className={styles.submitBtn} onClick={handleSubmit} disabled={disabled || !code.trim()}>
        {loading ? '审查中...' : '开始审查'}
      </button>
    </div>
  )
}
