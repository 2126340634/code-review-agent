import { useState } from 'react'
import { SeverityBadge } from './SeverityBadge'
import { DIMENSION_CONFIG } from '../../types'
import type { ReviewIssue } from '../../types'
import styles from '../../styles/ReviewPanel.module.css'

interface Props {
  issue: ReviewIssue
  onLocate?: (line: number) => void
}

export function IssueCard({ issue, onLocate }: Props) {
  const [expanded, setExpanded] = useState(false)
  const dimCfg = DIMENSION_CONFIG[issue.category] || DIMENSION_CONFIG.style

  return (
    <div className={styles.issueCard}>
      <div className={styles.issueHeader} onClick={() => setExpanded(!expanded)}>
        <span className={styles.categoryIcon} style={{ color: dimCfg.color }}>
          {dimCfg.icon}
        </span>
        <SeverityBadge severity={issue.severity} />
        <span className={styles.issueTitle}>
          {issue.title} {expanded ? '[收起]' : '[展开]'}
        </span>
        <span
          className={styles.lineTag}
          onClick={(e) => {
            e.stopPropagation()
            onLocate?.(issue.line_start)
          }}
        >
          L{issue.line_start}
          {issue.line_end > issue.line_start ? `-${issue.line_end}` : ''}
        </span>
      </div>

      <p className={styles.issueDesc}>{issue.description}</p>

      {expanded && (
        <div className={styles.issueDetail}>
          {issue.code_snippet && (
            <div className={styles.codeBlock}>
              <div className={styles.codeBlockLabel}>问题代码</div>
              <pre>
                <code>{issue.code_snippet}</code>
              </pre>
            </div>
          )}

          <div className={styles.suggestion}>
            <strong>修复建议：</strong>
            {issue.suggestion}
          </div>

          {issue.fixed_code && (
            <div className={styles.codeBlock}>
              <div className={styles.codeBlockLabel}>建议修改</div>
              <pre>
                <code>{issue.fixed_code}</code>
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
