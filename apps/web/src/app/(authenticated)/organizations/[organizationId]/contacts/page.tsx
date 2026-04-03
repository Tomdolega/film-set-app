import Link from "next/link";

import { ErrorNotice } from "@/components/error-notice";
import { listContacts } from "@/features/contacts/api/list-contacts";
import { CreateContactForm } from "@/features/contacts/components/create-contact-form";
import { ContactsList } from "@/features/contacts/components/contacts-list";
import { getOrganization } from "@/features/organizations/api/get-organization";

interface OrganizationContactsPageProps {
  params: Promise<{
    organizationId: string;
  }>;
}

export default async function OrganizationContactsPage(props: OrganizationContactsPageProps) {
  const { organizationId } = await props.params;

  try {
    const [organization, contacts] = await Promise.all([
      getOrganization(organizationId),
      listContacts(organizationId),
    ]);

    return (
      <div className="stack stack--large">
        <section className="panel">
          <p className="eyebrow">Contacts</p>
          <div className="panel__header">
            <div>
              <h2>{organization.name} contacts</h2>
              <p>Use contacts as reusable people and vendor records for project crew.</p>
            </div>
            <Link href={`/organizations/${organizationId}`} className="text-link">
              Back to organization
            </Link>
          </div>
        </section>

        <div className="two-column">
          <CreateContactForm organizationId={organizationId} />

          <section className="panel">
            <div className="panel__header">
              <div>
                <p className="eyebrow">Directory</p>
                <h2>Organization contacts</h2>
              </div>
            </div>
            <ContactsList organizationId={organizationId} contacts={contacts} />
          </section>
        </div>
      </div>
    );
  } catch (error) {
    return (
      <div className="stack stack--large">
        <ErrorNotice
          message={error instanceof Error ? error.message : "Unable to load contacts."}
        />
        <Link href={`/organizations/${organizationId}`} className="text-link">
          Return to organization
        </Link>
      </div>
    );
  }
}
