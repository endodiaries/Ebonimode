"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useActionState, useState } from "react";
import { submitReview, type ReviewState } from "@/app/actions";

/** Star rating plus a short review. Sent for approval; nothing is published automatically. */
export function ReviewForm({ productId, productName }: { productId: string; productName: string }) {
  const [state, action, pending] = useActionState<ReviewState, FormData>(submitReview, {});
  const [rating, setRating] = useState(0);
  const pathname = usePathname();

  if (state.ok) {
    return <p className="font-editorial text-xl italic">Thank you. Your review will appear once it has been checked.</p>;
  }
  return (
    <form action={action} className="max-w-xl space-y-5">
      <input type="hidden" name="productId" value={productId} />
      <input type="text" name="company" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />
      <fieldset>
        <legend className="label">Your rating for {productName}</legend>
        <div className="mt-2 flex gap-1">
          {[1, 2, 3, 4, 5].map((n) => (
            <label key={n} className="cursor-pointer text-3xl leading-none has-[:focus-visible]:outline-2">
              <input type="radio" name="rating" value={n} checked={rating === n} onChange={() => setRating(n)} className="sr-only" required />
              <span aria-hidden="true" className={n <= rating ? "text-gold" : "text-ink/25"}>
                ★
              </span>
              <span className="sr-only">
                {n} {n === 1 ? "star" : "stars"}
              </span>
            </label>
          ))}
        </div>
      </fieldset>
      <label className="block">
        <span className="label">Headline (optional)</span>
        <input name="title" maxLength={120} className="field mt-2 w-full" />
      </label>
      <label className="block">
        <span className="label">Your review</span>
        <textarea name="body" required minLength={10} maxLength={2000} rows={4} className="field mt-2 w-full" />
      </label>
      {state.error && (
        <p role="alert" className="text-vermilion">
          {state.error}{" "}
          {state.signIn && (
            <Link href={`/account/sign-in?next=${encodeURIComponent(pathname)}`} className="text-link">
              Sign in
            </Link>
          )}
        </p>
      )}
      <button type="submit" className="btn" disabled={pending}>
        {pending ? "Sending…" : "Send review"}
      </button>
    </form>
  );
}
