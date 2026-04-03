"use client";

import Link from "next/link";
import { useActionState } from "react";

import { SubmitButton } from "@/components/submit-button";
import { initialFormState } from "@/lib/form-state";

interface LoginFormProps {
  action: (
    previousState: { error: string | null },
    formData: FormData,
  ) => Promise<{ error: string | null }>;
}

export function LoginForm(props: LoginFormProps) {
  const [state, formAction] = useActionState(props.action, initialFormState);

  return (
    <form action={formAction} className="form-card auth-card">
      <div className="form-card__header">
        <h2>Log in</h2>
        <p>Use your account email and password to access the app.</p>
      </div>

      <label className="field">
        <span className="field__label">Email</span>
        <input className="input" type="email" name="email" autoComplete="email" required />
      </label>

      <label className="field">
        <span className="field__label">Password</span>
        <input
          className="input"
          type="password"
          name="password"
          autoComplete="current-password"
          minLength={8}
          required
        />
      </label>

      {state.error ? <p className="field-error">{state.error}</p> : null}

      <SubmitButton label="Log in" pendingLabel="Logging in..." />

      <p>
        Need an account?{" "}
        <Link href="/register" className="text-link">
          Create one
        </Link>
      </p>
    </form>
  );
}
