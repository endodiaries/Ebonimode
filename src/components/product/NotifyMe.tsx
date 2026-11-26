"use client";

import { useActionState } from "react";
import { requestRestockAlert, type NotifyState } from "@/app/product/actions";

const initial: NotifyState = {};

/** Shown when a piece has sold out: leave an email and choose a size to hear when it is back. */
export function NotifyMe({ productId, sizes }: { productId: string; sizes: string[] }) {
  const [state, action, pending] = useActionState(requestRestockAlert, initial);
  if (state.ok) {
    return (
      <p role="status" className="mt-6 border border-ink/15 p-5">
        Thank you. We will email you when it is back in stock.
      </p>
    );
  }
  return (
    <form action={action} className="mt-6 border border-ink/15 p-5" noValidate>
      <p className="font-display text-lg">Notify me when it is back</p>
      <p className="mt-1 text-base text-ink-soft">This piece has sold out. Leave your email and we will let you know when it is restocked.</p>
      <input type="hidden" name="productId" value={productId} />
      <input type="text" name="company" tabIndex={-1} autoComplete="off" aria-hidden="true" className="hidden" />
      <div className="mt-4 grid gap-3 sm:grid-cols-[8rem_minmax(0,1fr)]">
        <div>
          <label htmlFor="notify-size" className="label mb-2 block">
            Size
          </label>
          <select id="notify-size" name="size" className="field" required defaultValue="">
            <option value="" disabled>
              Choose
            </option>
            {sizes.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="notify-email" className="label mb-2 block">
            Email
          </label>
          <input id="notify-email" name="email" type="email" autoComplete="email" required className="field" />
        </div>
      </div>
      <button type="submit" className="btn btn-outline mt-4 w-full" disabled={pending}>
        {pending ? "Saving…" : "Notify me"}
      </button>
      {state.error && (
        <p role="alert" className="mt-3 text-vermilion">
          {state.error}
        </p>
      )}
    </form>
  );
}
