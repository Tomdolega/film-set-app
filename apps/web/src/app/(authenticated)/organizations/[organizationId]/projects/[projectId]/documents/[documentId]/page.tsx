import Link from "next/link";

import { ErrorNotice } from "@/components/error-notice";
import { getDocument } from "@/features/documents/api/get-document";
import { DeleteDocumentForm } from "@/features/documents/components/delete-document-form";
import { UpdateDocumentForm } from "@/features/documents/components/update-document-form";
import { getOrganization } from "@/features/organizations/api/get-organization";
import { getProject } from "@/features/projects/api/get-project";
import { assertOrganizationRouteMatch, assertProjectRouteMatch } from "@/lib/route-integrity";

interface DocumentDetailPageProps {
  params: Promise<{
    organizationId: string;
    projectId: string;
    documentId: string;
  }>;
}

export default async function DocumentDetailPage(props: DocumentDetailPageProps) {
  const { organizationId, projectId, documentId } = await props.params;

  try {
    const [organization, project, document] = await Promise.all([
      getOrganization(organizationId),
      getProject(projectId),
      getDocument(documentId),
    ]);
    assertOrganizationRouteMatch(organizationId, project.organizationId, "project");
    assertOrganizationRouteMatch(organizationId, document.organizationId, "document");
    assertProjectRouteMatch(projectId, document.projectId, "document");
    const downloadUrl = document.downloadPath;

    return (
      <div className="stack stack--large">
        <section className="panel">
          <p className="eyebrow">Document details</p>
          <div className="panel__header">
            <div>
              <h2>{document.name}</h2>
              <p>
                Organization: {organization.name} | Project: {project.name}
              </p>
            </div>
            <Link href={`/organizations/${organizationId}/projects/${projectId}`} className="text-link">
              Back to project
            </Link>
          </div>

          <div className="stack stack--tight">
            <a href={downloadUrl} className="button" target="_blank" rel="noreferrer">
              Open file
            </a>
            <p>Downloads are issued through a signed storage URL after project access is verified.</p>
          </div>

          <div className="meta-grid">
            <div>
              <strong>Type</strong>
              <p>{document.type}</p>
            </div>
            <div>
              <strong>Original filename</strong>
              <p>{document.originalFilename}</p>
            </div>
            <div>
              <strong>MIME type</strong>
              <p>{document.mimeType}</p>
            </div>
            <div>
              <strong>File size</strong>
              <p>{formatFileSize(document.fileSize)}</p>
            </div>
          </div>
        </section>

        <div className="two-column">
          <UpdateDocumentForm organizationId={organizationId} projectId={projectId} document={document} />

          <section className="panel">
            <div className="form-card__header">
              <h2>Delete document</h2>
              <p>Delete the metadata record and remove the stored file from object storage.</p>
            </div>
            <DeleteDocumentForm
              organizationId={organizationId}
              projectId={projectId}
              documentId={documentId}
            />
          </section>
        </div>
      </div>
    );
  } catch (error) {
    return (
      <div className="stack stack--large">
        <ErrorNotice
          message={error instanceof Error ? error.message : "Unable to load the document."}
        />
        <Link href={`/organizations/${organizationId}/projects/${projectId}`} className="text-link">
          Return to project
        </Link>
      </div>
    );
  }
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
