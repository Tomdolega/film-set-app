import Link from "next/link";

import { ErrorNotice } from "@/components/error-notice";
import { ImportCalendarEventForm } from "@/features/calendar/components/import-calendar-event-form";
import { listContacts } from "@/features/contacts/api/list-contacts";
import { listProjectDocuments } from "@/features/documents/api/list-project-documents";
import { DocumentsList } from "@/features/documents/components/documents-list";
import { UploadDocumentForm } from "@/features/documents/components/upload-document-form";
import { AddCrewMemberForm } from "@/features/crew/components/add-crew-member-form";
import { CrewList } from "@/features/crew/components/crew-list";
import { getOrganization } from "@/features/organizations/api/get-organization";
import { listProjectCrew } from "@/features/crew/api/list-project-crew";
import { getProject } from "@/features/projects/api/get-project";
import { UpdateProjectForm } from "@/features/projects/components/update-project-form";
import { assertOrganizationRouteMatch } from "@/lib/route-integrity";

interface ProjectDetailPageProps {
  params: Promise<{
    organizationId: string;
    projectId: string;
  }>;
}

export default async function ProjectDetailPage(props: ProjectDetailPageProps) {
  const { organizationId, projectId } = await props.params;

  try {
    const [organization, project, contacts, crew, documents] = await Promise.all([
      getOrganization(organizationId),
      getProject(projectId),
      listContacts(organizationId),
      listProjectCrew(projectId),
      listProjectDocuments(projectId),
    ]);
    assertOrganizationRouteMatch(organizationId, project.organizationId, "project");
    const availableContacts = contacts.filter(
      (contact) => !crew.some((member) => member.contactId === contact.id),
    );

    return (
      <div className="stack stack--large">
        <section className="panel">
          <p className="eyebrow">Project details</p>
          <div className="panel__header">
            <div>
              <h2>{project.name}</h2>
              <p>
                Organization: {organization.name} | Current role: {project.currentUserRole}
              </p>
            </div>

            <div className="stack stack--tight">
              <Link href={`/organizations/${organizationId}`} className="text-link">
                Back to organization
              </Link>
              <Link href={`/organizations/${organizationId}/contacts`} className="text-link">
                Manage contacts
              </Link>
              <Link href={`/organizations/${organizationId}/equipment`} className="text-link">
                Manage equipment
              </Link>
              <Link
                href={`/organizations/${organizationId}/projects/${projectId}/shooting-days`}
                className="text-link"
              >
                Manage schedule
              </Link>
            </div>
          </div>
        </section>

        <div className="two-column">
          <UpdateProjectForm organizationId={organizationId} project={project} />
          <AddCrewMemberForm
            organizationId={organizationId}
            projectId={projectId}
            contacts={availableContacts}
          />
        </div>

        <section className="panel">
          <div className="panel__header">
            <div>
              <p className="eyebrow">Crew</p>
              <h2>Project crew</h2>
            </div>
          </div>
          <CrewList organizationId={organizationId} projectId={projectId} crew={crew} />
        </section>

        <section className="panel">
          <div className="panel__header">
            <div>
              <p className="eyebrow">Documents</p>
              <h2>Project documents</h2>
            </div>
          </div>

          <div className="two-column">
            <UploadDocumentForm organizationId={organizationId} projectId={projectId} />
            <DocumentsList
              organizationId={organizationId}
              projectId={projectId}
              documents={documents}
            />
          </div>
        </section>

        <section className="panel">
          <div className="panel__header">
            <div>
              <p className="eyebrow">Calendar</p>
              <h2>Manual calendar import</h2>
            </div>
          </div>

          <ImportCalendarEventForm organizationId={organizationId} projectId={projectId} />
        </section>
      </div>
    );
  } catch (error) {
    return (
      <div className="stack stack--large">
        <ErrorNotice
          message={error instanceof Error ? error.message : "Unable to load the project."}
        />
        <Link href={`/organizations/${organizationId}`} className="text-link">
          Return to organization
        </Link>
      </div>
    );
  }
}
