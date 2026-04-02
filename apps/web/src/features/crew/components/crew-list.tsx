import { EmptyState } from "@/components/empty-state";
import type { CrewMemberDto } from "@/lib/api-types";

import { CrewMemberCard } from "./crew-member-card";

interface CrewListProps {
  organizationId: string;
  projectId: string;
  crew: CrewMemberDto[];
}

export function CrewList(props: CrewListProps) {
  if (props.crew.length === 0) {
    return (
      <EmptyState
        title="No crew members yet"
        description="Add the first contact or user to this project crew."
      />
    );
  }

  return (
    <div className="stack">
      {props.crew.map((member) => (
        <CrewMemberCard
          key={member.id}
          organizationId={props.organizationId}
          projectId={props.projectId}
          member={member}
        />
      ))}
    </div>
  );
}
