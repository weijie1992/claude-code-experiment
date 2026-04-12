import styles from "./HeistCardSkeleton.module.css";

export default function HeistCardSkeleton() {
  return (
    <div className={styles.card}>
      <div className={styles.titleRow}>
        <div className={`${styles.block} ${styles.titleLine}`} />
        <div className={`${styles.block} ${styles.iconPlaceholder}`} />
      </div>
      <div className={styles.meta}>
        <div className={`${styles.block} ${styles.metaLine}`} />
        <div className={`${styles.block} ${styles.metaLine}`} />
        <div className={`${styles.block} ${styles.metaLineShort}`} />
      </div>
    </div>
  );
}
