import styles from '../../styles/Layout.module.css'

export function Header() {
  return (
    <header className={styles.header}>
      <div className={styles.logo}>
        <h1 className={styles.title}>AI Code Review</h1>
        <span className={styles.badge}>Agent</span>
      </div>
      <div className={styles.subtitle}>基于 AI Agent 的多维度代码审查工具</div>
    </header>
  )
}
