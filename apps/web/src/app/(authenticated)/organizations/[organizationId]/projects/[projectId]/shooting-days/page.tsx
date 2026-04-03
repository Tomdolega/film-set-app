import Link from "next/link";

import { ErrorNotice } from "@/components/error-notice";
import { getOrganization } from "@/features/organizations/api/get-organization";
import { getProject } from "@/features/projects/api/get-project";
import { CreateShootingDayForm } from "@/features/scheduling/components/create-shooting-day-form";
import { ShootingDaysList } from "@/features/scheduling/components/shooting-days-list";
import { listShootingDays } from "@/features/scheduling/api/list-shooting-days";
import { assertOrganizationRouteMatch } from "@/lib/route-integrity";

interface ShootingDaysPageProps {
  params: Promise<{
    organizationId: string;
    projectId: string;
  }>;
}

export default async function ShootingDaysPage(props: ShootingDaysPageProps) {
  const { organizationId, projectId } = await props.params;

  try {
    const [organization, project, shootingDays] = await Promise.all([
      getOrganization(organizationId),
      getProject(projectId),
      listShootingDays(projectId),
    ]);
    assertOrganizationRouteMatch(organizationId, project.organizationId, "project");

    return (
      <div className="stack stack--large">
        <section className="panel">
          <p className="eyebrow">Scheduling</p>
          <div className="panel__header">
            <div>
              <h2>{project.name}</h2>
              <p>Organization: {organization.name}</p>
            </div>
            <Link href={`/organizations/${organizationId}/projects/${projectId}`} className="text-link">
              Back to project
            </Link>
          </div>
        </section>

        <div className="two-column">
          <CreateShootingDayForm organizationId={organizationId} projectId={projectId} />
          <section className="panel">
            <div className="panel__header">
              <div>
                <p className="eyebrow">Shooting days</p>
                <h2>Project schedule</h2>
              </div>
            </div>
            <ShootingDaysList
              organizationId={organizationId}
              projectId={projectId}
              shootingDays={shootingDays}
            />
          </section>
        </div>
      </div>
    );
  } catch (error) {
    return (
      <div className="stack stack--large">
        <ErrorNotice
          message={error instanceof Error ? error.message : "Unable to load the schedule."}
        />
        <Link href={`/organizations/${organizationId}/projects/${projectId}`} className="text-link">
          Return to project
        </Link>
      </div>
    );
  }
}
