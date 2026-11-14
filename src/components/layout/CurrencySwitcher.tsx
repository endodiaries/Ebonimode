"use client";

import { setCurrency, useCurrencies, useCurrency } from "@/lib/currency";

/** Lists the currencies switched on in admin (naira first) and remembers the visitor's choice. */
export function CurrencySwitcher({ id = "currency" }: { id?: string }) {
  const currencies = useCurrencies();
  const current = useCurrency();
  return (
    <div className="relative flex items-center">
      <label htmlFor={id} className="sr-only">
        Currency
      </label>
      <select
        id={id}
        name="currency"
        value={current.code}
        onChange={(e) => setCurrency(e.target.value)}
        disabled={currencies.length < 2}
        className="label h-11 cursor-pointer appearance-none bg-transparent pr-1 pl-2 text-ink disabled:cursor-default disabled:opacity-100"
      >
        {currencies.map((c) => (
          <option key={c.code} value={c.code}>
            {c.symbol} {c.code}
          </option>
        ))}
      </select>
    </div>
  );
}
