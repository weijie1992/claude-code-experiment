// this page should be used only as a splash page to decide where a user should be navigated to
// when logged in --> to /heists
// when not logged in --> to /login

import Link from "next/link";
import { Clock8, Crosshair, Users2, Trophy } from "lucide-react";
import styles from "./SplashPage.module.css";

export default function Home() {
  return (
    <div className={styles.page}>
      <div className={styles.gridBg} aria-hidden="true" />
      <div className={styles.glowTop} aria-hidden="true" />
      <div className={styles.glowBottom} aria-hidden="true" />

      <section className={styles.hero}>
        <div className={styles.badge}>Mission Briefing</div>

        <h1 className={styles.title}>
          <span className={styles.titleText}>P</span>
          <Clock8 className={styles.logoIcon} strokeWidth={2.75} />
          <span className={styles.titleText}>cket Heist</span>
        </h1>

        <p className={styles.tagline}>Tiny missions. Big office mischief.</p>

        <p className={styles.description}>
          Turn your office into a playground. Create covert missions, recruit
          colleagues as agents, and rack up points for every successful heist.
        </p>

        <div className={styles.actions}>
          <Link href="/signup" className={styles.registerBtn}>
            Join the Crew
          </Link>
          <Link href="/login" className={styles.loginLink}>
            Already an agent? Log in →
          </Link>
        </div>
      </section>

      <section className={styles.features}>
        <div className={styles.featureCard}>
          <div className={styles.featureIconWrap}>
            <Crosshair size={22} />
          </div>
          <h3 className={styles.featureTitle}>Design Missions</h3>
          <p className={styles.featureText}>
            Craft covert office challenges — from subtle chair theft to full
            desk reorganisations.
          </p>
        </div>

        <div className={styles.featureCard}>
          <div className={styles.featureIconWrap}>
            <Users2 size={22} />
          </div>
          <h3 className={styles.featureTitle}>Recruit Agents</h3>
          <p className={styles.featureText}>
            Assign missions to teammates and watch the chaos unfold across the
            office.
          </p>
        </div>

        <div className={styles.featureCard}>
          <div className={styles.featureIconWrap}>
            <Trophy size={22} />
          </div>
          <h3 className={styles.featureTitle}>Claim Victory</h3>
          <p className={styles.featureText}>
            Score points for completed heists and rise through the ranks of the
            leaderboard.
          </p>
        </div>
      </section>
    </div>
  );
}
