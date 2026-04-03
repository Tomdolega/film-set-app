import Link from "next/link";

import { EmptyState } from "@/components/empty-state";
import type { OrganizationDto } from "@/lib/api-types";

interface OrganizationsListProps {
  organizations: OrganizationDto[];
}

export function OrganizationsList(props: OrganizationsListProps) {
  if (props.organizations.length === 0) {
    return (
      <EmptyState
        title="No organizations yet"
        description="Create your first organization to start adding projects, contacts, crew, and documents."
      />
    );
  }

  return (
    <div className="stack">
      {props.organizations.map((organization) => (
        <Link
          key={organization.id}
          href={`/organizations/${organization.id}`}
          className="list-card"
        >
          <div>
            <strong>{organization.name}</strong>
            <p>Current role: {organization.currentUserRole}</p>
          </div>

          <span className="pill">{organization.currentUserRole}</span>
        </Link>
      ))}
    </div>
  );
}
