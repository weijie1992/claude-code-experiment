"use client";

import CreateHeistForm from "@/components/CreateHeistForm";
import HeistCard from "@/components/HeistCard";
import HeistCardSkeleton from "@/components/HeistCardSkeleton";
import { useHeists } from "@/hooks/useHeists";
import styles from "./heists.module.css";

const SKELETON_COUNT = 3;

function SkeletonGrid() {
  return (
    <div className={styles.grid}>
      {Array.from({ length: SKELETON_COUNT }).map((_, i) => (
        <HeistCardSkeleton key={i} />
      ))}
    </div>
  );
}

export default function HeistsPage() {
  const active = useHeists("active");
  const assigned = useHeists("assigned");

  return (
    <div className="page-content">
      <CreateHeistForm />

      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <svg
            className={styles.sectionIcon}
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
          >
            <circle
              cx="12"
              cy="12"
              r="3"
              stroke="currentColor"
              strokeWidth="1.5"
            />
            <circle
              cx="12"
              cy="12"
              r="9"
              stroke="currentColor"
              strokeWidth="1.5"
            />
            <path
              d="M12 3v2M12 19v2M3 12h2M19 12h2"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
          <h2 className={styles.sectionTitle}>Active Heists</h2>
        </div>

        {active.loading && <SkeletonGrid />}
        {active.error && <p className={styles.error}>{active.error}</p>}
        {!active.loading && !active.error && active.heists.length === 0 && (
          <p className={styles.empty}>No active heists.</p>
        )}
        {!active.loading && !active.error && active.heists.length > 0 && (
          <div className={styles.grid}>
            {active.heists.map((h) => (
              <HeistCard key={h.id} heist={h} />
            ))}
          </div>
        )}
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <svg
            className={styles.sectionIcon}
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
            <circle
              cx="9"
              cy="7"
              r="4"
              stroke="currentColor"
              strokeWidth="1.5"
            />
            <path
              d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
          <h2 className={styles.sectionTitle}>Heists You&apos;ve Assigned</h2>
        </div>

        {assigned.loading && <SkeletonGrid />}
        {assigned.error && <p className={styles.error}>{assigned.error}</p>}
        {!assigned.loading &&
          !assigned.error &&
          assigned.heists.length === 0 && (
            <p className={styles.empty}>No assigned heists.</p>
          )}
        {!assigned.loading && !assigned.error && assigned.heists.length > 0 && (
          <div className={styles.grid}>
            {assigned.heists.map((h) => (
              <HeistCard key={h.id} heist={h} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
