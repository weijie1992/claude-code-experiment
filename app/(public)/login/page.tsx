import Link from "next/link";
import styles from "./login.module.css";

export default function LoginPage() {
  return (
    <div className="center-content">
      <div className="page-content">
        <h1 className="form-title">Log in to Your Account</h1>

        <div className={styles.card}>
          <form className={styles.form}>
            <div className={styles.field}>
              <label className={styles.label} htmlFor="email">
                Email
              </label>
              <input
                id="email"
                type="email"
                placeholder="you@example.com"
                className={styles.input}
                autoComplete="email"
              />
            </div>

            <div className={styles.field}>
              <label className={styles.label} htmlFor="password">
                Password
              </label>
              <input
                id="password"
                type="password"
                placeholder="••••••••"
                className={styles.input}
                autoComplete="current-password"
              />
            </div>

            <button type="submit" className={`btn ${styles.submit}`}>
              Log in
            </button>
          </form>

          <p className={styles.footer}>
            Don&apos;t have an account? <Link href="/signup">Sign up</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
