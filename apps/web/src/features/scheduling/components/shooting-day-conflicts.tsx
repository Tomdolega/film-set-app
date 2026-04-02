import Link from "next/link";

import { EmptyState } from "@/components/empty-state";
import type { ScheduleConflictDto } from "@/lib/api-types";

interface ShootingDayConflictsProps {
  organizationId: string;
  projectId: string;
  conflicts: ScheduleConflictDto[];
}

export function ShootingDayConflicts(props: ShootingDayConflictsProps) {
  if (props.conflicts.length === 0) {
    return (
      <EmptyState
        title="No conflicts detected"
        description="This shooting day currently has no overlapping resource conflicts."
      />
    );
  }

  return (
    <div className="stack">
      {props.conflicts.map((conflict, index) => (
        <div
          key={`${conflict.type}-${conflict.relatedEntityId}-${index}`}
          className={`notice ${conflict.severity === "conflict" ? "notice--error" : ""}`}
        >
          <strong>{conflict.type.replaceAll("_", " ")}</strong>
          <p>{conflict.message}</p>
          <Link
            href={`/organizations/${props.organizationId}/projects/${props.projectId}/shooting-days/${conflict.relatedShootingDayId}`}
            className="text-link"
          >
            Open related shooting day
          </Link>
        </div>
      ))}
    </div>
  );
}
