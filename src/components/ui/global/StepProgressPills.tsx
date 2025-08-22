"use client";
import * as React from "react";

export default function StepProgress({
  current,
  total,
  className = "",
}: {
  current: number;
  total: number;
  className?: string;
}) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="flex items-center gap-1">
        {Array.from({ length: total }).map((_, i) => (
          <span
            key={i}
            className={[
              "h-1.5 w-5 sm:w-6 rounded-full",
              i < current ? "bg-emerald-500" : "bg-neutral-200",
            ].join(" ")}
          />
        ))}
      </div>
      <span className="text-[11px] sm:text-xs text-neutral-500">
        {current === total ? (
          <>
            <span className="text-xs text-neutral-500">Completed</span>
          </>
        ) : (
          <>
            Step {current == 0 ? 1 : current} of {total}
          </>
        )}
      </span>
    </div>
  );
}
