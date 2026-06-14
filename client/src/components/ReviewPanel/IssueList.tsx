import { IssueCard } from './IssueCard'
import type { ReviewIssue } from '../../types'
import styles from '../../styles/ReviewPanel.module.css'

interface Props {
  issues: ReviewIssue[]
  onLocate?: (line: number) => void
}

export function IssueList({ issues, onLocate }: Props) {
  if (issues.length === 0) return null

  const errors = issues.filter((i) => i.severity === 'error')
  const warnings = issues.filter((i) => i.severity === 'warning')
  const infos = issues.filter((i) => i.severity === 'info')

  return (
    <div className={styles.issueList}>
      <h3 className={styles.sectionTitle}>
        审查结果
        <span className={styles.issueCount}>
          {issues.length} 个问题
          {errors.length > 0 && ` · ${errors.length} 错误`}
          {warnings.length > 0 && ` · ${warnings.length} 警告`}
        </span>
      </h3>

      {errors.map((i) => (
        <IssueCard key={i.id} issue={i} onLocate={onLocate} />
      ))}
      {warnings.map((i) => (
        <IssueCard key={i.id} issue={i} onLocate={onLocate} />
      ))}
      {infos.map((i) => (
        <IssueCard key={i.id} issue={i} onLocate={onLocate} />
      ))}
    </div>
  )
}
