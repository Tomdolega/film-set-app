import Link from "next/link";

import { EmptyState } from "@/components/empty-state";
import type { ProjectDto } from "@/lib/api-types";

interface ProjectListProps {
  organizationId: string;
  projects: ProjectDto[];
}

export function ProjectList(props: ProjectListProps) {
  if (props.projects.length === 0) {
    return (
      <EmptyState
        title="No projects yet"
        description="Create the first project in this organization to validate the project flow."
      />
    );
  }

  return (
    <div className="stack">
      {props.projects.map((project) => (
        <Link
          key={project.id}
          href={`/organizations/${props.organizationId}/projects/${project.id}`}
          className="list-card"
        >
          <div>
            <strong>{project.name}</strong>
            <p>{project.description ?? "No description yet."}</p>
          </div>

          <span className="pill">{project.status}</span>
        </Link>
      ))}
    </div>
  );
}

