import { redirect } from "next/navigation";

import { loginAction } from "@/features/auth/actions";
import { LoginForm } from "@/features/auth/components/login-form";
import { getCurrentSession } from "@/lib/session";

export default async function LoginPage() {
  const session = await getCurrentSession();

  if (session) {
    redirect("/organizations");
  }

  return (
    <main className="auth-page">
      <LoginForm action={loginAction} />
    </main>
  );
}
