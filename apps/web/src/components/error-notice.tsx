interface ErrorNoticeProps {
  title?: string;
  message: string;
}

export function ErrorNotice(props: ErrorNoticeProps) {
  return (
    <div className="notice notice--error">
      <strong>{props.title ?? "Something went wrong"}</strong>
      <p>{props.message}</p>
    </div>
  );
}

