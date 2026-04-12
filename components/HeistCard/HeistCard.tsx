import Link from "next/link";
import styles from "./HeistCard.module.css";
import type { Heist } from "@/types/firestore";

interface Props {
  heist: Heist;
}

export function getDeadlineLabel(deadline: Date): {
  date: string;
  status: string;
} {
  const now = new Date();
  const month = deadline.toLocaleString("en-US", { month: "short" });
  const day = deadline.getDate();
  const hours = deadline.getHours();
  const minutes = deadline.getMinutes().toString().padStart(2, "0");
  const ampm = hours >= 12 ? "PM" : "AM";
  const hour12 = hours % 12 || 12;
  const date = `${month} ${day}, ${String(hour12).padStart(2, "0")}:${minutes} ${ampm}`;

  if (deadline <= now) {
    return { date, status: "Overdue" };
  }

  const diffMs = deadline.getTime() - now.getTime();
  const totalMinutes = Math.floor(diffMs / (1000 * 60));
  const totalHours = Math.floor(totalMinutes / 60);
  const days = Math.floor(totalHours / 24);
  const remainingHours = totalHours % 24;
  const remainingMinutes = totalMinutes % 60;
  const status =
    days > 0
      ? `${days}d ${remainingHours}h`
      : `${totalHours}h ${remainingMinutes}m`;

  return { date, status };
}

export default function HeistCard({ heist }: Props) {
  const { date, status } = getDeadlineLabel(heist.deadline);

  return (
    <div className={styles.card}>
      <div className={styles.titleRow}>
        <Link href={`/heists/${heist.id}`} className={styles.title}>
          {heist.title}
        </Link>
        <svg
          className={styles.linkIcon}
          viewBox="0 0 16 16"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M6 3H3a1 1 0 0 0-1 1v9a1 1 0 0 0 1 1h9a1 1 0 0 0 1-1v-3"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          <path
            d="M9 2h5v5M14 2 8 8"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      <div className={styles.meta}>
        <div className={styles.row}>
          <svg
            className={styles.icon}
            viewBox="0 0 12 12"
            fill="none"
            aria-hidden="true"
          >
            <circle
              cx="6"
              cy="4"
              r="2.5"
              stroke="currentColor"
              strokeWidth="1.2"
            />
            <path
              d="M1.5 10.5c0-2.485 2.015-4.5 4.5-4.5s4.5 2.015 4.5 4.5"
              stroke="currentColor"
              strokeWidth="1.2"
              strokeLinecap="round"
            />
          </svg>
          <span className={styles.label}>To:</span>
          <span className={styles.assignee}>@{heist.assignedToCodename}</span>
        </div>

        <div className={styles.row}>
          <svg
            className={styles.icon}
            viewBox="0 0 12 12"
            fill="none"
            aria-hidden="true"
          >
            <circle
              cx="6"
              cy="4"
              r="2.5"
              stroke="currentColor"
              strokeWidth="1.2"
            />
            <path
              d="M1.5 10.5c0-2.485 2.015-4.5 4.5-4.5s4.5 2.015 4.5 4.5"
              stroke="currentColor"
              strokeWidth="1.2"
              strokeLinecap="round"
            />
          </svg>
          <span className={styles.label}>By:</span>
          <span className={styles.creator}>@{heist.createdByCodename}</span>
        </div>

        <div className={styles.row}>
          <svg
            className={styles.icon}
            viewBox="0 0 12 12"
            fill="none"
            aria-hidden="true"
          >
            <rect
              x="1"
              y="2"
              width="10"
              height="9"
              rx="1.5"
              stroke="currentColor"
              strokeWidth="1.2"
            />
            <path
              d="M1 5h10M4 1v2M8 1v2"
              stroke="currentColor"
              strokeWidth="1.2"
              strokeLinecap="round"
            />
          </svg>
          <span className={styles.deadline}>
            {date} • <span className={styles.status}>{status}</span>
          </span>
        </div>
      </div>
    </div>
  );
}
