import Link from "next/link";

import { ErrorNotice } from "@/components/error-notice";
import { getContact } from "@/features/contacts/api/get-contact";
import { UpdateContactForm } from "@/features/contacts/components/update-contact-form";
import { getOrganization } from "@/features/organizations/api/get-organization";
import { assertOrganizationRouteMatch } from "@/lib/route-integrity";

interface ContactDetailPageProps {
  params: Promise<{
    organizationId: string;
    contactId: string;
  }>;
}

export default async function ContactDetailPage(props: ContactDetailPageProps) {
  const { organizationId, contactId } = await props.params;

  try {
    const [organization, contact] = await Promise.all([
      getOrganization(organizationId),
      getContact(contactId),
    ]);
    assertOrganizationRouteMatch(organizationId, contact.organizationId, "contact");

    return (
      <div className="stack stack--large">
        <section className="panel">
          <p className="eyebrow">Contact details</p>
          <div className="panel__header">
            <div>
              <h2>{contact.name}</h2>
              <p>
                Organization: {organization.name} | Type: {contact.type}
              </p>
            </div>
            <Link href={`/organizations/${organizationId}/contacts`} className="text-link">
              Back to contacts
            </Link>
          </div>
        </section>

        <UpdateContactForm organizationId={organizationId} contact={contact} />
      </div>
    );
  } catch (error) {
    return (
      <div className="stack stack--large">
        <ErrorNotice
          message={error instanceof Error ? error.message : "Unable to load the contact."}
        />
        <Link href={`/organizations/${organizationId}/contacts`} className="text-link">
          Return to contacts
        </Link>
      </div>
    );
  }
}
