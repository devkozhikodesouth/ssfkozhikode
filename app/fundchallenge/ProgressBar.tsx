import { progressTone } from "@/app/utils/fund";

/* Validated status palette: red < 40%, orange 40–79%, green 80%+.
   The % is always printed as text, so colour is never the only cue. */
export const STATUS_HEX = {
  red: "#B91C1C",
  orange: "#F59E0B",
  green: "#15803D",
} as const;

export default function ProgressBar({
  percent,
  showLabel = true,
  size = "md",
}: {
  percent: number;
  showLabel?: boolean;
  size?: "sm" | "md";
}) {
  const tone = progressTone(percent);
  const width = Math.min(Math.max(percent, 0), 100);

  return (
    <div className="flex items-center gap-2 min-w-0">
      <div
        className={`flex-1 rounded-full bg-slate-200 overflow-hidden ${size === "sm" ? "h-2" : "h-3"}`}
        role="progressbar"
        aria-valuenow={percent}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div
          className="h-full rounded-full"
          style={{ width: `${width}%`, backgroundColor: STATUS_HEX[tone] }}
        />
      </div>
      {showLabel && (
        <span className="w-11 shrink-0 text-right text-xs font-semibold tabular-nums text-slate-700">
          {percent}%
        </span>
      )}
    </div>
  );
}
