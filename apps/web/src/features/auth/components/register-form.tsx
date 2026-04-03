"use client";

import Link from "next/link";
import { useActionState } from "react";

import { SubmitButton } from "@/components/submit-button";
import { initialFormState } from "@/lib/form-state";

interface RegisterFormProps {
  action: (
    previousState: { error: string | null },
    formData: FormData,
  ) => Promise<{ error: string | null }>;
}

export function RegisterForm(props: RegisterFormProps) {
  const [state, formAction] = useActionState(props.action, initialFormState);

  return (
    <form action={formAction} className="form-card auth-card">
      <div className="form-card__header">
        <h2>Create account</h2>
        <p>Register with an email and password. You can create your first organization after sign-in.</p>
      </div>

      <label className="field">
        <span className="field__label">Name</span>
        <input className="input" type="text" name="name" autoComplete="name" />
      </label>

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
          autoComplete="new-password"
          minLength={8}
          required
        />
      </label>

      {state.error ? <p className="field-error">{state.error}</p> : null}

      <SubmitButton label="Create account" pendingLabel="Creating account..." />

      <p>
        Already have an account?{" "}
        <Link href="/login" className="text-link">
          Log in
        </Link>
      </p>
    </form>
  );
}
