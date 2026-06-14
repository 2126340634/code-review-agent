import { useState, useRef, useCallback, useEffect, type ReactNode, type MouseEvent } from 'react'
import styles from '../../styles/Layout.module.css'

interface Props {
  left: ReactNode
  right: ReactNode
}

export function SplitPane({ left, right }: Props) {
  const [leftRatio, setLeftRatio] = useState(0.5)
  const dragging = useRef(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const handleMouseDown = useCallback((e: MouseEvent) => {
    e.preventDefault()
    dragging.current = true
    document.body.style.cursor = 'col-resize'
    document.body.style.userSelect = 'none'
  }, [])

  const handleMouseMove = useCallback((e: globalThis.MouseEvent) => {
    if (!dragging.current || !containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    const pct = (e.clientX - rect.left) / rect.width
    setLeftRatio(Math.max(0.2, Math.min(0.8, pct)))
  }, [])

  const handleMouseUp = useCallback(() => {
    if (!dragging.current) return
    dragging.current = false
    document.body.style.cursor = ''
    document.body.style.userSelect = ''
  }, [])

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }
  }, [handleMouseMove, handleMouseUp])

  return (
    <div className={styles.splitPane} ref={containerRef}>
      <div className={styles.leftPane} style={{ flex: leftRatio }}>
        {left}
      </div>
      <div className={styles.splitterH} onMouseDown={handleMouseDown} />
      <div className={styles.rightPane} style={{ flex: 1 - leftRatio }}>
        {right}
      </div>
    </div>
  )
}
