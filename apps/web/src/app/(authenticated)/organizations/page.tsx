import Link from "next/link";

import { ErrorNotice } from "@/components/error-notice";
import { listOrganizations } from "@/features/organizations/api/list-organizations";
import { CreateOrganizationForm } from "@/features/organizations/components/create-organization-form";
import { OrganizationsList } from "@/features/organizations/components/organizations-list";

export default async function OrganizationsPage() {
  try {
    const organizations = await listOrganizations();

    return (
      <div className="stack stack--large">
        <section className="panel">
          <p className="eyebrow">Organizations</p>
          <h2>Your organizations</h2>
          <p>
            Reopen an existing organization or create a new one for testing. This is the main entry
            point after sign-in.
          </p>
        </section>

        <div className="two-column">
          <CreateOrganizationForm />

          <section className="panel">
            <div className="panel__header">
              <div>
                <p className="eyebrow">Workspace list</p>
                <h2>Available organizations</h2>
              </div>
            </div>
            <OrganizationsList organizations={organizations} />
          </section>
        </div>

        <section className="panel">
          <h3>Tester flow</h3>
          <p>
            Open an organization to create projects, manage contacts and equipment, upload documents,
            and continue scheduling work.
          </p>
          <Link href="/" className="text-link">
            Back to app root
          </Link>
        </section>
      </div>
    );
  } catch (error) {
    return (
      <div className="stack stack--large">
        <ErrorNotice
          message={error instanceof Error ? error.message : "Unable to load organizations."}
        />
        <CreateOrganizationForm />
      </div>
    );
  }
}
