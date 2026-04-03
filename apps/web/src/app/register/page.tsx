import { redirect } from "next/navigation";

import { registerAction } from "@/features/auth/actions";
import { RegisterForm } from "@/features/auth/components/register-form";
import { getCurrentSession } from "@/lib/session";

export default async function RegisterPage() {
  const session = await getCurrentSession();

  if (session) {
    redirect("/organizations");
  }

  return (
    <main className="auth-page">
      <RegisterForm action={registerAction} />
    </main>
  );
}
