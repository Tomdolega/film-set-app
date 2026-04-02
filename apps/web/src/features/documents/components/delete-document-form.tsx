import { deleteDocumentAction } from "../actions";

interface DeleteDocumentFormProps {
  organizationId: string;
  projectId: string;
  documentId: string;
}

export function DeleteDocumentForm(props: DeleteDocumentFormProps) {
  const action = deleteDocumentAction.bind(
    null,
    props.organizationId,
    props.projectId,
    props.documentId,
  );

  return (
    <form action={action}>
      <button type="submit" className="button button--secondary">
        Delete document
      </button>
    </form>
  );
}
