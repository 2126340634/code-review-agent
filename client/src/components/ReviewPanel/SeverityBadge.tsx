import { SEVERITY_CONFIG } from '../../types'
import styles from '../../styles/ReviewPanel.module.css'

interface Props {
  severity: 'error' | 'warning' | 'info'
}

export function SeverityBadge({ severity }: Props) {
  const cfg = SEVERITY_CONFIG[severity] || SEVERITY_CONFIG.info
  return (
    <span className={styles.severityBadge} style={{ background: cfg.bg, color: cfg.color }}>
      {cfg.label}
    </span>
  )
}
