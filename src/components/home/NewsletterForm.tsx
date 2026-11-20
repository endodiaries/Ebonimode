"use client";

import Link from "next/link";
import { useActionState } from "react";
import { subscribeToNewsletter, type NewsletterState } from "@/app/actions";

const initial: NewsletterState = {};

export function NewsletterForm() {
  const [state, action, pending] = useActionState(subscribeToNewsletter, initial);

  if (state.ok) {
    return (
      <p role="status" className="font-editorial text-2xl italic">
        Thank you. You are on the list.
      </p>
    );
  }
  return (
    <form action={action} noValidate className="mx-auto max-w-xl">
      <div className="flex items-end gap-4 border-b border-ink shadow-[inset_0_-1px_0_transparent] transition-[border-color,box-shadow] duration-[var(--dur-ui)] focus-within:border-emerald focus-within:shadow-[inset_0_-2px_0_var(--color-emerald)]">
        <label htmlFor="newsletter-email" className="sr-only">
          Email address
        </label>
        <input
          id="newsletter-email"
          name="email"
          type="email"
          autoComplete="email"
          required
          placeholder="Your email address"
          aria-describedby="newsletter-consent newsletter-error"
          className="h-12 min-w-0 flex-1 bg-transparent text-base placeholder:text-ink-soft focus:outline-none"
        />
        {/* Honeypot for bots: hidden from people and assistive tech. */}
        <input type="text" name="company" tabIndex={-1} autoComplete="off" aria-hidden="true" className="hidden" />
        <button type="submit" disabled={pending} className="label h-12 cursor-pointer whitespace-nowrap hover:text-emerald disabled:opacity-60">
          {pending ? "Joining…" : "Join"}
        </button>
      </div>
      <p id="newsletter-error" role="alert" className="mt-3 min-h-5 text-base text-crimson">
        {state.error}
      </p>
      <p id="newsletter-consent" className="text-base text-ink-soft">
        By joining you agree to receive emails from Ebonímode. Unsubscribe at any time. See our{" "}
        <Link href="/privacy" className="text-link">
          privacy policy
        </Link>
        .
      </p>
    </form>
  );
}
