import type { PayrollMonthSnapshot } from "./types";
import { getMonthLabel } from "./monthHistory";

type MonthHistoryControlsProps = {
  activeMonthKey: string;
  selectedMonthKey: string | null;
  history: PayrollMonthSnapshot[];
  onSelectMonth: (monthKey: string | null) => void;
};

export function MonthHistoryControls({
  activeMonthKey,
  selectedMonthKey,
  history,
  onSelectMonth,
}: MonthHistoryControlsProps) {
  const currentValue = selectedMonthKey ?? activeMonthKey;

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap", marginBottom: 16 }}>
      <label htmlFor="month-history" style={{ fontWeight: 600 }}>
        Месец:
      </label>

      <select
        id="month-history"
        value={currentValue}
        onChange={(event) => {
          const nextValue = event.target.value;
          onSelectMonth(nextValue === activeMonthKey ? null : nextValue);
        }}
        style={{
          padding: "8px 12px",
          borderRadius: 8,
          border: "1px solid #d9d9d9",
          minWidth: 180,
        }}
      >
        <option value={activeMonthKey}>{getMonthLabel(activeMonthKey)} (Активен)</option>
        {history
          .filter((entry) => entry.monthKey !== activeMonthKey)
          .map((entry) => (
            <option key={entry.monthKey} value={entry.monthKey}>
              {getMonthLabel(entry.monthKey)}
            </option>
          ))}
      </select>

      {selectedMonthKey && selectedMonthKey !== activeMonthKey && (
        <button onClick={() => onSelectMonth(null)} className="btn-save">
          ← Врати се на тековен месец
        </button>
      )}
    </div>
  );
}
