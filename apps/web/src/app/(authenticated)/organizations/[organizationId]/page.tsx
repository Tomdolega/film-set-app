import Link from "next/link";

import { ErrorNotice } from "@/components/error-notice";
import { listContacts } from "@/features/contacts/api/list-contacts";
import { listEquipmentItems } from "@/features/equipment/api/list-equipment-items";
import { getOrganization } from "@/features/organizations/api/get-organization";
import { CreateOrganizationForm } from "@/features/organizations/components/create-organization-form";
import { listProjects } from "@/features/projects/api/list-projects";
import { CreateProjectForm } from "@/features/projects/components/create-project-form";
import { ProjectList } from "@/features/projects/components/project-list";

interface OrganizationDetailPageProps {
  params: Promise<{
    organizationId: string;
  }>;
}

export default async function OrganizationDetailPage(props: OrganizationDetailPageProps) {
  const { organizationId } = await props.params;

  try {
    const [organization, projects, contacts, equipmentItems] = await Promise.all([
      getOrganization(organizationId),
      listProjects(organizationId),
      listContacts(organizationId),
      listEquipmentItems(organizationId),
    ]);

    return (
      <div className="stack stack--large">
        <section className="panel">
          <p className="eyebrow">Organization</p>
          <div className="panel__header">
            <div>
              <h2>{organization.name}</h2>
              <p>Current role: {organization.currentUserRole}</p>
            </div>
            <Link href="/organizations" className="text-link">
              Create another organization
            </Link>
          </div>
          <p>
            Contacts: {contacts.length}.{" "}
            <Link href={`/organizations/${organizationId}/contacts`} className="text-link">
              Manage organization contacts
            </Link>
          </p>
          <p>
            Equipment: {equipmentItems.length}.{" "}
            <Link href={`/organizations/${organizationId}/equipment`} className="text-link">
              Manage organization equipment
            </Link>
          </p>
        </section>

        <div className="two-column">
          <CreateProjectForm organizationId={organizationId} />

          <section className="panel">
            <div className="panel__header">
              <div>
                <p className="eyebrow">Projects</p>
                <h2>Organization projects</h2>
              </div>
            </div>
            <ProjectList organizationId={organizationId} projects={projects} />
          </section>
        </div>
      </div>
    );
  } catch (error) {
    return (
      <div className="stack stack--large">
        <ErrorNotice
          message={error instanceof Error ? error.message : "Unable to load the organization."}
        />
        <CreateOrganizationForm />
      </div>
    );
  }
}
