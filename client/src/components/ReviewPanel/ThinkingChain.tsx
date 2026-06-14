import { useEffect, useRef } from 'react'
import type { ThinkingStep } from '../../types'
import styles from '../../styles/ReviewPanel.module.css'

interface Props {
  steps: ThinkingStep[]
  isActive: boolean
}

export function ThinkingChain({ steps, isActive }: Props) {
  const endRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [steps])

  if (steps.length === 0 && !isActive) return null

  return (
    <div className={styles.thinkingChain}>
      <h3 className={styles.sectionTitle}>Agent 思考过程</h3>
      <div className={styles.steps}>
        {steps.map((s, i) => (
          <div key={i} className={`${styles.step} ${styles.stepDone}`}>
            <div className={styles.stepContent}>
              <span className={styles.stepText}>{s.step}</span>
              {s.detail && <span className={styles.stepDetail}>{s.detail}</span>}
            </div>
            <span className={styles.stepProgress}>{Math.round(s.progress * 100)}%</span>
          </div>
        ))}
        {isActive && (
          <div className={`${styles.step} ${styles.stepActive}`}>
            <span className={styles.spinner} />
            <span className={styles.stepText}>审查中...</span>
          </div>
        )}
        <div ref={endRef} />
      </div>

      {isActive && steps.length > 0 && (
        <div className={styles.progressBar}>
          <div className={styles.progressFill} style={{ width: `${(steps[steps.length - 1]?.progress || 0) * 100}%` }} />
        </div>
      )}
    </div>
  )
}
