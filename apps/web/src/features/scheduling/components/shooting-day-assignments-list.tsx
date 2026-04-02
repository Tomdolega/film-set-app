import { EmptyState } from "@/components/empty-state";
import type { ShootingDayAssignmentDto } from "@/lib/api-types";

import { removeShootingDayAssignmentAction } from "../actions";

interface ShootingDayAssignmentsListProps {
  organizationId: string;
  projectId: string;
  shootingDayId: string;
  assignments: ShootingDayAssignmentDto[];
}

export function ShootingDayAssignmentsList(props: ShootingDayAssignmentsListProps) {
  if (props.assignments.length === 0) {
    return (
      <EmptyState
        title="No assignments yet"
        description="Add crew members to the shooting day to start conflict checks and call sheet output."
      />
    );
  }

  return (
    <div className="stack">
      {props.assignments.map((assignment) => {
        const action = removeShootingDayAssignmentAction.bind(
          null,
          props.organizationId,
          props.projectId,
          props.shootingDayId,
          assignment.id,
        );

        return (
          <div key={assignment.id} className="panel crew-card">
            <div>
              <strong>{assignment.resourceName ?? assignment.label ?? assignment.referenceId}</strong>
              <p>
                {assignment.type}
                {assignment.crewProjectRole ? ` | ${assignment.crewProjectRole}` : ""}
                {assignment.equipmentCategory ? ` | ${assignment.equipmentCategory}` : ""}
                {assignment.equipmentStatus ? ` | ${assignment.equipmentStatus}` : ""}
                {assignment.callTime ? ` | call ${assignment.callTime}` : ""}
              </p>
            </div>

            <div className="crew-card__remove">
              <form action={action}>
                <button type="submit" className="button button--secondary">
                  Remove
                </button>
              </form>
            </div>
          </div>
        );
      })}
    </div>
  );
}
