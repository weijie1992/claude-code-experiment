import styles from "./LoadingScreen.module.css";

export default function LoadingScreen() {
  return (
    <div className={styles.screen}>
      <div className={styles.spinner} role="status" aria-label="Loading" />
    </div>
  );
}
