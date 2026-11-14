"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useActionState, useId } from "react";
import {
  requestPasswordReset,
  signIn,
  signInWithGoogle,
  signUp,
  updatePassword,
  type AuthState,
} from "@/app/account/actions";

const initial: AuthState = {};

const linkErrors: Record<string, string> = {
  link: "That link has expired or was already used. Please try again.",
  google: "We could not reach Google just now. Please try again.",
};

/** Only same-site paths are passed along; the server checks again. */
function useNext(): string {
  const next = useSearchParams().get("next") ?? "";
  return next.startsWith("/") && !next.startsWith("//") ? next : "";
}

function Field({
  label,
  hint,
  ...input
}: { label: string; hint?: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  const id = useId();
  return (
    <div>
      <label htmlFor={id} className="label mb-2 block">
        {label}
      </label>
      <input id={id} aria-describedby={hint ? `${id}-hint` : undefined} className="field" {...input} />
      {hint && (
        <p id={`${id}-hint`} className="mt-2 text-base text-ink-soft">
          {hint}
        </p>
      )}
    </div>
  );
}

function Notice({ state, extraError }: { state: AuthState; extraError?: string }) {
  const error = state.error ?? extraError;
  return (
    <div aria-live="polite">
      {error && (
        <p role="alert" className="border-l-2 border-crimson bg-white px-4 py-3 text-crimson">
          {error}
        </p>
      )}
      {state.message && <p className="border-l-2 border-emerald bg-white px-4 py-3">{state.message}</p>}
    </div>
  );
}

function GoogleButton({ next }: { next: string }) {
  return (
    <form action={signInWithGoogle}>
      <input type="hidden" name="next" value={next} />
      <button type="submit" className="btn btn-outline w-full">
        Continue with Google
      </button>
    </form>
  );
}

function Divider() {
  return (
    <div className="flex items-center gap-4" role="separator">
      <span className="h-px flex-1 bg-ink/15" />
      <span className="label text-ink-soft">or</span>
      <span className="h-px flex-1 bg-ink/15" />
    </div>
  );
}

export function SignInForm() {
  const [state, action, pending] = useActionState(signIn, initial);
  const params = useSearchParams();
  const next = useNext();
  const query = next ? `?next=${encodeURIComponent(next)}` : "";

  return (
    <div className="space-y-6">
      <Notice state={state} extraError={linkErrors[params.get("error") ?? ""]} />
      <form action={action} className="space-y-5" noValidate>
        <input type="hidden" name="next" value={next} />
        <Field label="Email" name="email" type="email" autoComplete="email" required defaultValue={state.email} />
        <Field label="Password" name="password" type="password" autoComplete="current-password" required />
        <button type="submit" className="btn w-full" disabled={pending}>
          {pending ? "Signing in…" : "Sign in"}
        </button>
      </form>
      <p className="text-center">
        <Link href="/account/forgot-password" className="text-link">
          Forgot your password?
        </Link>
      </p>
      <Divider />
      <GoogleButton next={next} />
      <p className="text-center">
        New here?{" "}
        <Link href={`/account/create${query}`} className="text-link">
          Create an account
        </Link>
      </p>
    </div>
  );
}

export function SignUpForm() {
  const [state, action, pending] = useActionState(signUp, initial);
  const next = useNext();
  const query = next ? `?next=${encodeURIComponent(next)}` : "";

  return (
    <div className="space-y-6">
      <Notice state={state} />
      {!state.message && (
        <>
          <form action={action} className="space-y-5" noValidate>
            <input type="hidden" name="next" value={next} />
            <Field label="Full name" name="fullName" autoComplete="name" required defaultValue={state.fullName} />
            <Field label="Email" name="email" type="email" autoComplete="email" required defaultValue={state.email} />
            <Field
              label="Password"
              name="password"
              type="password"
              autoComplete="new-password"
              required
              minLength={8}
              hint="At least 8 characters."
            />
            <button type="submit" className="btn w-full" disabled={pending}>
              {pending ? "Creating your account…" : "Create account"}
            </button>
          </form>
          <Divider />
          <GoogleButton next={next} />
        </>
      )}
      <p className="text-center">
        Already with us?{" "}
        <Link href={`/account/sign-in${query}`} className="text-link">
          Sign in
        </Link>
      </p>
    </div>
  );
}

export function ForgotPasswordForm() {
  const [state, action, pending] = useActionState(requestPasswordReset, initial);
  return (
    <div className="space-y-6">
      <Notice state={state} />
      {!state.message && (
        <form action={action} className="space-y-5" noValidate>
          <Field label="Email" name="email" type="email" autoComplete="email" required defaultValue={state.email} />
          <button type="submit" className="btn w-full" disabled={pending}>
            {pending ? "Sending…" : "Send reset link"}
          </button>
        </form>
      )}
      <p className="text-center">
        <Link href="/account/sign-in" className="text-link">
          Back to sign in
        </Link>
      </p>
    </div>
  );
}

export function UpdatePasswordForm() {
  const [state, action, pending] = useActionState(updatePassword, initial);
  return (
    <div className="space-y-6">
      <Notice state={state} />
      <form action={action} className="space-y-5" noValidate>
        <Field
          label="New password"
          name="password"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
          hint="At least 8 characters."
        />
        <button type="submit" className="btn w-full" disabled={pending}>
          {pending ? "Saving…" : "Save new password"}
        </button>
      </form>
    </div>
  );
}
