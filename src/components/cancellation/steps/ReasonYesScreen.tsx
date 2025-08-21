"use client";
import * as React from "react";
import Image from "next/image";
import StepProgressPills from "@/components/ui/global/StepProgressPills";

/** Answers this screen collects */
export type ReasonYesData = {
  foundWithMM: "Yes" | "No" | null;
  applied: "0" | "1-5" | "6-20" | "20+" | null;
  emailed: "0" | "1-5" | "6-20" | "20+" | null;
  interviewed: "0" | "1-2" | "3-5" | "5+" | null;
};

export default function ReasonYesScreen({
  data,
  onChange,
  onBack,
  onContinue,
}: {
  data: ReasonYesData;
  onChange: (patch: Partial<ReasonYesData>) => void;
  onBack: () => void;
  onContinue: () => void;
}) {
  const canContinue =
    data.foundWithMM === "Yes"
      ? Boolean(data.applied && data.emailed && data.interviewed)
      : data.foundWithMM === "No";

  return (
    <section className="pt-4 antialiased">
      {/* Header (mobile-friendly title + pills) */}
      <div className="px-4 sm:px-8">
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-2 text-sm md:text-base text-neutral-700 hover:text-neutral-900"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              className="opacity-70"
            >
              <path
                d="M15 18l-6-6 6-6"
                stroke="currentColor"
                strokeWidth="2"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Back
          </button>

          <div className="hidden sm:flex items-center gap-3">
            <h2 className="text-sm font-medium text-neutral-700">
              Subscription Cancellation
            </h2>
            <StepProgressPills current={0} total={3} />
          </div>

          <div className="w-6" />
        </div>

        <div className="sm:hidden mt-2">
          <h2 className="text-sm font-medium text-neutral-700">
            Subscription Cancellation
          </h2>
          <StepProgressPills current={0} total={3} className="mt-1" />
        </div>
      </div>

      <hr className="mt-3 border-neutral-200" />

      {/* Content */}
      <div className="px-4 sm:px-8 py-6 grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-8 items-start">
        {/* Left: questions */}
        <div>
          <h3 className="text-[23px] md:text-3xl font-semibold leading-[1.2] md:leading-[1.1] tracking-tight [text-wrap:balance] text-neutral-900">
            Congrats on the new role! 🎉
          </h3>

          <OptionRow
            label="Did you find this job with MigrateMate?*"
            columns={2}
            mobileCols={2}
            options={["Yes", "No"]}
            value={data.foundWithMM}
            onChange={(v) => onChange({ foundWithMM: v as "Yes" | "No" })}
          />
          {data.foundWithMM === "Yes" && (
            <>
              <OptionRow
                className="mt-6"
                label="How many roles did you apply for through Migrate Mate?*"
                columns={4}
                mobileCols={4}
                options={["0", "1-5", "6-20", "20+"]}
                value={data.applied}
                onChange={(v) =>
                  onChange({ applied: v as ReasonYesData["applied"] })
                }
              />

              <OptionRow
                className="mt-6"
                label="How many companies did you email directly?*"
                columns={4}
                mobileCols={4}
                options={["0", "1-5", "6-20", "20+"]}
                value={data.emailed}
                onChange={(v) =>
                  onChange({ emailed: v as ReasonYesData["emailed"] })
                }
              />

              <OptionRow
                className="mt-6"
                label="How many different companies did you interview with?*"
                columns={4}
                mobileCols={4}
                options={["0", "1-2", "3-5", "5+"]}
                value={data.interviewed}
                onChange={(v) =>
                  onChange({ interviewed: v as ReasonYesData["interviewed"] })
                }
              />
            </>
          )}
          <hr className="mt-6 mb-4 border-neutral-200" />
          <button
            type="button"
            disabled={!canContinue}
            onClick={onContinue}
            className={[
              "w-full rounded-xl px-4 py-2.5 md:py-3 text-sm md:text-base font-medium transition",
              canContinue
                ? "bg-[#8952fc] text-white hover:bg-[#7b40fc]"
                : "bg-neutral-100 text-neutral-400 border border-neutral-200 cursor-not-allowed",
            ].join(" ")}
          >
            Continue
          </button>
        </div>

        {/* Right: image (hidden on mobile) */}
        <div
          className="relative hidden md:block w-full h-full overflow-hidden rounded-xl shadow-sm ring-1 ring-black/5 "
          aria-hidden
        >
          <Image
            src="/skyline.jpg"
            alt="City skyline"
            fill
            className="object-cover"
            priority
          />
        </div>
      </div>
    </section>
  );
}

function OptionRow({
  label,
  options,
  value,
  onChange,
  columns = 4,
  mobileCols = 4,
  className = "",
}: {
  label: string;
  options: string[];
  value: string | null;
  onChange: (v: string) => void;
  columns?: 2 | 3 | 4;
  mobileCols?: 2 | 4;
  className?: string;
}) {
  const mobileClass =
    mobileCols === 2
      ? "grid-cols-2"
      : mobileCols === 4
      ? "grid-cols-4"
      : "grid-cols-4";

  return (
    <div className={className}>
      <p className="text-xs sm:text-sm font-medium text-neutral-900">{label}</p>
      <div className={`mt-2 grid gap-2 sm:gap-3 ${mobileClass} `}>
        {options.map((opt) => {
          const active = value === opt;
          return (
            <button
              key={opt}
              type="button"
              aria-pressed={active}
              onClick={() => onChange(opt)}
              className={[
                "rounded-xl px-3 sm:px-4 py-2.5 md:py-3 text-sm md:text-base font-medium border transition",
                active
                  ? "bg-neutral-900 text-white border-neutral-900"
                  : "bg-white text-neutral-900 border-neutral-200 hover:bg-neutral-50",
              ].join(" ")}
            >
              {opt}
            </button>
          );
        })}
      </div>
    </div>
  );
}
