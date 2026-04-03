import Link from "next/link";

import { ErrorNotice } from "@/components/error-notice";
import { ArchiveEquipmentItemForm } from "@/features/equipment/components/archive-equipment-item-form";
import { UpdateEquipmentItemForm } from "@/features/equipment/components/update-equipment-item-form";
import { getEquipmentItem } from "@/features/equipment/api/get-equipment-item";
import { getOrganization } from "@/features/organizations/api/get-organization";
import { assertOrganizationRouteMatch } from "@/lib/route-integrity";

interface EquipmentDetailPageProps {
  params: Promise<{
    organizationId: string;
    equipmentId: string;
  }>;
}

export default async function EquipmentDetailPage(props: EquipmentDetailPageProps) {
  const { organizationId, equipmentId } = await props.params;

  try {
    const [organization, equipmentItem] = await Promise.all([
      getOrganization(organizationId),
      getEquipmentItem(equipmentId),
    ]);
    assertOrganizationRouteMatch(organizationId, equipmentItem.organizationId, "equipment item");

    return (
      <div className="stack stack--large">
        <section className="panel">
          <p className="eyebrow">Equipment item</p>
          <div className="panel__header">
            <div>
              <h2>{equipmentItem.name}</h2>
              <p>
                {organization.name} | {equipmentItem.category} | {equipmentItem.status}
              </p>
            </div>
            <Link href={`/organizations/${organizationId}/equipment`} className="text-link">
              Back to equipment
            </Link>
          </div>
        </section>

        <div className="two-column">
          <UpdateEquipmentItemForm organizationId={organizationId} equipmentItem={equipmentItem} />

          <section className="panel">
            <div className="form-card__header">
              <h2>Archive equipment item</h2>
              <p>Archived equipment is hidden from lists and can no longer be assigned to schedules.</p>
            </div>
            <ArchiveEquipmentItemForm organizationId={organizationId} equipmentId={equipmentId} />
          </section>
        </div>
      </div>
    );
  } catch (error) {
    return (
      <div className="stack stack--large">
        <ErrorNotice
          message={error instanceof Error ? error.message : "Unable to load the equipment item."}
        />
        <Link href={`/organizations/${organizationId}/equipment`} className="text-link">
          Return to equipment
        </Link>
      </div>
    );
  }
}
