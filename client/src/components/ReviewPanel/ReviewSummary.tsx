import type { ReviewSummary as SummaryType } from '../../types'
import styles from '../../styles/ReviewPanel.module.css'

interface Props {
  summary: SummaryType
}

export function ReviewSummaryCard({ summary }: Props) {
  const { score, total_issues, summary: text } = summary

  const gradeColor = score >= 80 ? '#10b981' : score >= 60 ? '#f59e0b' : '#ef4444'
  const gradeLabel = score >= 80 ? '优秀' : score >= 60 ? '一般' : '需改进'

  return (
    <div className={styles.summaryCard}>
      <div className={styles.scoreSection}>
        <div className={styles.scoreCircle} style={{ borderColor: gradeColor }}>
          <span className={styles.scoreValue} style={{ color: gradeColor }}>
            {score}
          </span>
          <span className={styles.scoreLabel}>{gradeLabel}</span>
        </div>
        <div className={styles.scoreMeta}>
          <span>
            共发现 <strong>{total_issues}</strong> 个问题
          </span>
          <span className={styles.summaryText}>{text}</span>
        </div>
      </div>
    </div>
  )
}
