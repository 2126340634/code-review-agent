import type { ReviewDimension } from '../../types'
import { DIMENSION_CONFIG } from '../../types'
import styles from '../../styles/DimensionSelector.module.css'

interface Props {
  selected: ReviewDimension[]
  onChange: (dims: ReviewDimension[]) => void
  disabled?: boolean
}

const ALL_DIMS: ReviewDimension[] = ['security', 'performance', 'style', 'best_practice']

export function DimensionSelector({ selected, onChange, disabled }: Props) {
  const toggle = (dim: ReviewDimension) => {
    if (disabled) return
    if (selected.includes(dim)) {
      onChange(selected.filter((d) => d !== dim))
    } else {
      onChange([...selected, dim])
    }
  }

  return (
    <div className={styles.wrapper}>
      <span className={styles.label}>审查维度</span>
      <div className={styles.tags}>
        {ALL_DIMS.map((dim) => {
          const cfg = DIMENSION_CONFIG[dim]
          const active = selected.includes(dim)
          return (
            <button
              key={dim}
              className={`${styles.tag} ${active ? styles.active : ''}`}
              style={{
                borderColor: active ? cfg.color : '#e5e7eb',
                background: active ? `${cfg.color}10` : '#fff'
              }}
              onClick={() => toggle(dim)}
              disabled={disabled}
            >
              <span>{cfg.icon}</span>
              <span>{cfg.label}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
