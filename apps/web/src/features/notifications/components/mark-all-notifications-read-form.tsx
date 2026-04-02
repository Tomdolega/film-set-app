import { markAllNotificationsAsReadAction } from "../actions";

interface MarkAllNotificationsReadFormProps {
  disabled: boolean;
}

export function MarkAllNotificationsReadForm(props: MarkAllNotificationsReadFormProps) {
  if (props.disabled) {
    return null;
  }

  return (
    <form action={markAllNotificationsAsReadAction}>
      <button type="submit" className="button button--secondary">
        Mark all as read
      </button>
    </form>
  );
}
