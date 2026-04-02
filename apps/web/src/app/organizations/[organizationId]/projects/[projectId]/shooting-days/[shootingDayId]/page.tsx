import Link from "next/link";

import { ErrorNotice } from "@/components/error-notice";
import { listProjectCrew } from "@/features/crew/api/list-project-crew";
import { listEquipmentItems } from "@/features/equipment/api/list-equipment-items";
import { getOrganization } from "@/features/organizations/api/get-organization";
import { getProject } from "@/features/projects/api/get-project";
import { getShootingDay } from "@/features/scheduling/api/get-shooting-day";
import { listShootingDayAssignments } from "@/features/scheduling/api/list-shooting-day-assignments";
import { getShootingDayConflicts } from "@/features/scheduling/api/get-shooting-day-conflicts";
import { getShootingDayCallSheet } from "@/features/scheduling/api/get-shooting-day-call-sheet";
import { AddShootingDayCrewForm } from "@/features/scheduling/components/add-shooting-day-crew-form";
import { AddShootingDayEquipmentForm } from "@/features/scheduling/components/add-shooting-day-equipment-form";
import { CallSheetView } from "@/features/scheduling/components/call-sheet-view";
import { DeleteShootingDayForm } from "@/features/scheduling/components/delete-shooting-day-form";
import { ShootingDayAssignmentsList } from "@/features/scheduling/components/shooting-day-assignments-list";
import { ShootingDayConflicts } from "@/features/scheduling/components/shooting-day-conflicts";
import { UpdateShootingDayForm } from "@/features/scheduling/components/update-shooting-day-form";

interface ShootingDayDetailPageProps {
  params: Promise<{
    organizationId: string;
    projectId: string;
    shootingDayId: string;
  }>;
}

export default async function ShootingDayDetailPage(props: ShootingDayDetailPageProps) {
  const { organizationId, projectId, shootingDayId } = await props.params;

  try {
    const [organization, project, shootingDay, crew, equipmentItems, assignments, conflicts, callSheet] =
      await Promise.all([
        getOrganization(organizationId),
        getProject(projectId),
        getShootingDay(shootingDayId),
        listProjectCrew(projectId),
        listEquipmentItems(organizationId),
        listShootingDayAssignments(shootingDayId),
        getShootingDayConflicts(shootingDayId),
        getShootingDayCallSheet(shootingDayId),
      ]);
    const assignedCrewIds = new Set(
      assignments.filter((assignment) => assignment.type === "crew").map((assignment) => assignment.referenceId),
    );
    const assignedEquipmentIds = new Set(
      assignments
        .filter((assignment) => assignment.type === "equipment")
        .map((assignment) => assignment.referenceId),
    );
    const availableCrew = crew.filter((member) => !assignedCrewIds.has(member.id));
    const availableEquipment = equipmentItems.filter(
      (equipmentItem) => !assignedEquipmentIds.has(equipmentItem.id),
    );

    return (
      <div className="stack stack--large">
        <section className="panel">
          <p className="eyebrow">Shooting day</p>
          <div className="panel__header">
            <div>
              <h2>{shootingDay.date}</h2>
              <p>
                {project.name} | {organization.name} | {shootingDay.location}
              </p>
            </div>

            <div className="stack stack--tight">
              <Link
                href={`/organizations/${organizationId}/projects/${projectId}/shooting-days`}
                className="text-link"
              >
                Back to schedule
              </Link>
              <Link href={`/organizations/${organizationId}/projects/${projectId}`} className="text-link">
                Back to project
              </Link>
            </div>
          </div>
        </section>

        <div className="two-column">
          <UpdateShootingDayForm
            organizationId={organizationId}
            projectId={projectId}
            shootingDay={shootingDay}
          />

          <section className="panel">
            <div className="form-card__header">
              <h2>Delete shooting day</h2>
              <p>Deleting the shooting day also removes its assignments.</p>
            </div>
            <DeleteShootingDayForm
              organizationId={organizationId}
              projectId={projectId}
              shootingDayId={shootingDayId}
            />
          </section>
        </div>

        <div className="two-column schedule-forms-grid">
          <AddShootingDayCrewForm
            organizationId={organizationId}
            projectId={projectId}
            shootingDayId={shootingDayId}
            availableCrew={availableCrew}
          />

          <AddShootingDayEquipmentForm
            organizationId={organizationId}
            projectId={projectId}
            shootingDayId={shootingDayId}
            availableEquipment={availableEquipment}
          />

          <section className="panel">
            <div className="panel__header">
              <div>
                <p className="eyebrow">Assignments</p>
                <h2>Assigned resources</h2>
              </div>
            </div>
            <ShootingDayAssignmentsList
              organizationId={organizationId}
              projectId={projectId}
              shootingDayId={shootingDayId}
              assignments={assignments}
            />
          </section>
        </div>

        <section className="panel">
          <div className="panel__header">
            <div>
              <p className="eyebrow">Conflicts</p>
              <h2>Schedule impact</h2>
            </div>
          </div>
          <ShootingDayConflicts
            organizationId={organizationId}
            projectId={projectId}
            conflicts={conflicts}
          />
        </section>

        <CallSheetView callSheet={callSheet} />
      </div>
    );
  } catch (error) {
    return (
      <div className="stack stack--large">
        <ErrorNotice
          message={error instanceof Error ? error.message : "Unable to load the shooting day."}
        />
        <Link
          href={`/organizations/${organizationId}/projects/${projectId}/shooting-days`}
          className="text-link"
        >
          Return to schedule
        </Link>
      </div>
    );
  }
}
