import Link from "next/link";

import { CreateOrganizationForm } from "@/features/organizations/components/create-organization-form";

export default function OrganizationsPage() {
  return (
    <div className="stack stack--large">
      <section className="panel">
        <p className="eyebrow">Organizations</p>
        <h2>Start with one organization</h2>
        <p>
          Batch 1 does not include organization listing yet. Create an organization first, then
          use it to manage projects.
        </p>
      </section>

      <CreateOrganizationForm />

      <section className="panel">
        <h3>How this first web batch works</h3>
        <p>
          After you create an organization, the app redirects you to its detail page where you can
          create and manage projects.
        </p>
        <Link href="/" className="text-link">
          Back to app root
        </Link>
      </section>
    </div>
  );
}

