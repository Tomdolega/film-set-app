interface EmptyStateProps {
  title: string;
  description: string;
}

export function EmptyState(props: EmptyStateProps) {
  return (
    <div className="empty-state">
      <strong>{props.title}</strong>
      <p>{props.description}</p>
    </div>
  );
}

