import styles from './Skeleton.module.css'

export default function Skeleton() {
  return (
    <div className={styles.card}>
      {/* Avatar + header lines */}
      <div className={styles.header}>
        <div
          className={`${styles.block} ${styles.circle}`}
          style={{ width: '3.5rem', height: '3.5rem', flexShrink: 0 }}
        />
        <div className={styles.headerLines}>
          <div className={styles.block} style={{ height: '0.875rem', width: '60%' }} />
          <div className={styles.block} style={{ height: '0.875rem', width: '45%' }} />
        </div>
      </div>

      {/* Content lines */}
      <div className={styles.lines}>
        <div className={styles.block} style={{ height: '0.75rem', width: '100%' }} />
        <div className={styles.block} style={{ height: '0.75rem', width: '100%' }} />
        <div className={styles.block} style={{ height: '0.75rem', width: '60%' }} />
      </div>
    </div>
  )
}
