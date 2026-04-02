import Link from "next/link";

import { EmptyState } from "@/components/empty-state";
import type { DocumentDto } from "@/lib/api-types";

interface DocumentsListProps {
  organizationId: string;
  projectId: string;
  documents: DocumentDto[];
}

export function DocumentsList(props: DocumentsListProps) {
  if (props.documents.length === 0) {
    return (
      <EmptyState
        title="No documents yet"
        description="Upload the first project document to validate the document flow."
      />
    );
  }

  return (
    <div className="stack">
      {props.documents.map((document) => (
        <Link
          key={document.id}
          href={`/organizations/${props.organizationId}/projects/${props.projectId}/documents/${document.id}`}
          className="list-card"
        >
          <div>
            <strong>{document.name}</strong>
            <p>
              {document.type} | {document.mimeType} | {formatFileSize(document.fileSize)}
            </p>
          </div>

          <span className="pill">{document.type.replaceAll("_", " ")}</span>
        </Link>
      ))}
    </div>
  );
}

function formatFileSize(fileSize: number): string {
  if (fileSize < 1024) {
    return `${fileSize} B`;
  }

  if (fileSize < 1024 * 1024) {
    return `${(fileSize / 1024).toFixed(1)} KB`;
  }

  return `${(fileSize / (1024 * 1024)).toFixed(1)} MB`;
}
