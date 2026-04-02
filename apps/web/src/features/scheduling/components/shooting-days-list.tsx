import Link from "next/link";

import { EmptyState } from "@/components/empty-state";
import type { ShootingDayDto } from "@/lib/api-types";

interface ShootingDaysListProps {
  organizationId: string;
  projectId: string;
  shootingDays: ShootingDayDto[];
}

export function ShootingDaysList(props: ShootingDaysListProps) {
  if (props.shootingDays.length === 0) {
    return (
      <EmptyState
        title="No shooting days yet"
        description="Create the first shooting day to start coordinating crew and call times."
      />
    );
  }

  return (
    <div className="stack">
      {props.shootingDays.map((shootingDay) => (
        <Link
          key={shootingDay.id}
          href={`/organizations/${props.organizationId}/projects/${props.projectId}/shooting-days/${shootingDay.id}`}
          className="list-card"
        >
          <div>
            <strong>{shootingDay.date}</strong>
            <p>
              {shootingDay.location} | {shootingDay.startTime} - {shootingDay.endTime}
            </p>
          </div>

          <span className="pill">{shootingDay.status}</span>
        </Link>
      ))}
    </div>
  );
}
