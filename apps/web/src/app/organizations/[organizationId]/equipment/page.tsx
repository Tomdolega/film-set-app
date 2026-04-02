import Link from "next/link";

import { ErrorNotice } from "@/components/error-notice";
import { CreateEquipmentItemForm } from "@/features/equipment/components/create-equipment-item-form";
import { EquipmentItemsList } from "@/features/equipment/components/equipment-items-list";
import { listEquipmentItems } from "@/features/equipment/api/list-equipment-items";
import { getOrganization } from "@/features/organizations/api/get-organization";

interface EquipmentPageProps {
  params: Promise<{
    organizationId: string;
  }>;
}

export default async function EquipmentPage(props: EquipmentPageProps) {
  const { organizationId } = await props.params;

  try {
    const [organization, equipmentItems] = await Promise.all([
      getOrganization(organizationId),
      listEquipmentItems(organizationId),
    ]);

    return (
      <div className="stack stack--large">
        <section className="panel">
          <p className="eyebrow">Equipment</p>
          <div className="panel__header">
            <div>
              <h2>{organization.name}</h2>
              <p>Organization equipment inventory</p>
            </div>
            <Link href={`/organizations/${organizationId}`} className="text-link">
              Back to organization
            </Link>
          </div>
        </section>

        <div className="two-column">
          <CreateEquipmentItemForm organizationId={organizationId} />

          <section className="panel">
            <div className="panel__header">
              <div>
                <p className="eyebrow">Equipment items</p>
                <h2>Organization equipment</h2>
              </div>
            </div>
            <EquipmentItemsList organizationId={organizationId} equipmentItems={equipmentItems} />
          </section>
        </div>
      </div>
    );
  } catch (error) {
    return (
      <div className="stack stack--large">
        <ErrorNotice
          message={error instanceof Error ? error.message : "Unable to load equipment."}
        />
        <Link href={`/organizations/${organizationId}`} className="text-link">
          Return to organization
        </Link>
      </div>
    );
  }
}
