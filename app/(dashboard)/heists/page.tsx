"use client";

import CreateHeistForm from "@/components/CreateHeistForm";
import { useHeists } from "@/hooks/useHeists";

export default function HeistsPage() {
  const active = useHeists("active");
  const assigned = useHeists("assigned");
  const expired = useHeists("expired");

  return (
    <div className="page-content">
      <CreateHeistForm />

      <div className="active-heists">
        <h2>Your Active Heists</h2>
        {active.loading && <p>Loading...</p>}
        {active.error && <p>{active.error}</p>}
        {!active.loading && !active.error && active.heists.length === 0 && (
          <p>No active heists.</p>
        )}
        <ul>
          {active.heists.map((h) => (
            <li key={h.id}>{h.title}</li>
          ))}
        </ul>
      </div>

      <div className="assigned-heists">
        <h2>Heists You&apos;ve Assigned</h2>
        {assigned.loading && <p>Loading...</p>}
        {assigned.error && <p>{assigned.error}</p>}
        {!assigned.loading &&
          !assigned.error &&
          assigned.heists.length === 0 && <p>No assigned heists.</p>}
        <ul>
          {assigned.heists.map((h) => (
            <li key={h.id}>{h.title}</li>
          ))}
        </ul>
      </div>

      <div className="expired-heists">
        <h2>All Expired Heists</h2>
        {expired.loading && <p>Loading...</p>}
        {expired.error && <p>{expired.error}</p>}
        {!expired.loading && !expired.error && expired.heists.length === 0 && (
          <p>No expired heists.</p>
        )}
        <ul>
          {expired.heists.map((h) => (
            <li key={h.id}>{h.title}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
