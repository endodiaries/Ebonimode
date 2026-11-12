/**
 * Currency switcher shell. Only NGN is enabled at launch; Phase 5 wires this to
 * the `currencies` table (display_enabled rows) and remembers the choice.
 */
const enabledCurrencies = [{ code: "NGN", symbol: "₦" }];

export function CurrencySwitcher({ id = "currency" }: { id?: string }) {
  return (
    <div className="relative flex items-center">
      <label htmlFor={id} className="sr-only">
        Currency
      </label>
      <select
        id={id}
        name="currency"
        defaultValue="NGN"
        className="label h-11 cursor-pointer appearance-none bg-transparent pr-1 pl-2 text-ink"
      >
        {enabledCurrencies.map((c) => (
          <option key={c.code} value={c.code}>
            {c.symbol} {c.code}
          </option>
        ))}
      </select>
    </div>
  );
}
