import { FiSun, FiMoon } from "react-icons/fi";
import clsx from "clsx";
import { getCurrencySymbol } from "../../utils/getCurrencyCode";

export default function AppearanceSettings({
  theme,
  toggleTheme,
  currency,
  setCurrency,
  currencies,
}) {
  
  return (
    <section
      className="min-w-0 bg-surface border border-border rounded-xl py-5 [&_h2]:font-display [&_h2]:text-base [&_h2]:font-semibold"
      aria-labelledby="appearance-heading"
    >
      <header className="px-4 pb-5">
        <h2 id="appearance-heading" className="text-base">Appearance</h2>
        <p className="text-xs">Customize you application appearance.</p>
      </header>


      <div className="grid min-w-0 gap-5 border-t border-border p-5">
        <div className="flex justify-between items-center gap-5 [&>*]:min-w-0">
          <div>
            <label htmlFor="settings-theme" className="font-medium text-sm">
              Theme
            </label>

            <p className="text-xs">Set your interface color preference.</p>
          </div>

          <div className="flex items-center justify-end gap-2">
            <FiSun aria-hidden="true"/>

            <button
              id="settings-theme"
              type="button"
              role="switch"
              aria-checked={theme === "dark"}
              aria-label="Dark theme"
              onClick={toggleTheme}
              className={clsx(
                "inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full bg-border p-0.5 aria-checked:bg-primary",
                "[&>span]:size-5 [&>span]:rounded-full [&>span]:bg-white [&>span]:shadow-sm [&>span]:transition-transform",
                "aria-checked:[&>span]:translate-x-5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
              )}
            >
              <span />
            </button>

            <FiMoon aria-hidden="true" />
          </div>
        </div>

        <div className="flex justify-between items-center text-sm gap-5 [&>*]:min-w-0 border-t border-border pt-5">
          <div>
            <label htmlFor="settings-currency" className="font-medium text-sm">
            Currency
          </label>

          <p className="text-xs">Set your currency. Applied to all balances, charts and exports.</p>
          </div>

          <select
            id="settings-currency"
            className={clsx(
              "block h-11 min-w-0 w-fit rounded-xl border border-border bg-card px-4 py-2.5 text-base leading-6 text-foreground",
              "shadow-xs outline-none transition-colors placeholder:text-muted-foreground/70 focus-visible:border-primary",
              "focus-visible:ring-2 focus-visible:ring-ring/40 aria-invalid:border-danger disabled:cursor-not-allowed",
              "disabled:opacity-65 motion-reduce:transition-none md:text-sm",
            )}
            value={currency}
            onChange={(event) => setCurrency(event.target.value)}
          >
            {[...new Set([currency, ...currencies])].sort().map((code) => (
              <option key={code} value={code}>
                {code}({getCurrencySymbol(code)})
              </option>
            ))}
          </select>
        </div>
      </div>
    </section>
  );
}
