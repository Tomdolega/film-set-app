import Link from "next/link";

import { EmptyState } from "@/components/empty-state";
import type { ContactDto } from "@/lib/api-types";

interface ContactsListProps {
  organizationId: string;
  contacts: ContactDto[];
}

export function ContactsList(props: ContactsListProps) {
  if (props.contacts.length === 0) {
    return (
      <EmptyState
        title="No contacts yet"
        description="Create the first contact in this organization to start building crew lists."
      />
    );
  }

  return (
    <div className="stack">
      {props.contacts.map((contact) => (
        <Link
          key={contact.id}
          href={`/organizations/${props.organizationId}/contacts/${contact.id}`}
          className="list-card"
        >
          <div>
            <strong>{contact.name}</strong>
            <p>
              {contact.company ?? "No company"} {contact.email ? `| ${contact.email}` : ""}
            </p>
          </div>

          <span className="pill">{contact.type}</span>
        </Link>
      ))}
    </div>
  );
}
