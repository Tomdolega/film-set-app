import { deleteShootingDayAction } from "../actions";

interface DeleteShootingDayFormProps {
  organizationId: string;
  projectId: string;
  shootingDayId: string;
}

export function DeleteShootingDayForm(props: DeleteShootingDayFormProps) {
  const action = deleteShootingDayAction.bind(
    null,
    props.organizationId,
    props.projectId,
    props.shootingDayId,
  );

  return (
    <form action={action}>
      <button type="submit" className="button button--secondary">
        Delete shooting day
      </button>
    </form>
  );
}
