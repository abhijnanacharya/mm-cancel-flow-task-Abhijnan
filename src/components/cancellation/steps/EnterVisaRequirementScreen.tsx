"use client";
import * as React from "react";
import Image from "next/image";
import StepProgressPills from "@/components/ui/global/StepProgressPills";

export type VisaRequirementData = {
  hasCompanyLawyer: "Yes" | "No" | null;
  visaName: string;
};

export default function EnterVisaRequirementScreen({
  jobThroughMM, // "Yes" | "No" | null
  data,
  onChange,
  onBack,
  onContinue,
}: {
  jobThroughMM: "Yes" | "No" | null;
  data: VisaRequirementData;
  onChange: (patch: Partial<VisaRequirementData>) => void;
  onBack: () => void;
  onContinue: () => void;
}) {
  const canContinue =
    data.hasCompanyLawyer !== null && data.visaName.trim().length > 0;

  const title =
    jobThroughMM === "No" ? (
      <>
        You landed the job!{" "}
        <span className="italic">That’s what we live for.</span>
      </>
    ) : (
      "We helped you land the job, now let’s help you secure your visa."
    );

  const subtitle =
    jobThroughMM === "No"
      ? "Even if it wasn’t through MigrateMate, let us help get your visa sorted."
      : "";

  return (
    <section className="pt-4 antialiased">
      {/* Header */}
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

          {/* Desktop/Tablet inline title + pills */}
          <div className="hidden sm:flex items-center gap-3">
            <h2 className="text-sm font-medium text-neutral-700">
              Subscription Cancellation
            </h2>
            <StepProgressPills current={2} total={3} />
          </div>

          <div className="w-6" />
        </div>

        {/* Mobile stacked title + pills */}
        <div className="sm:hidden mt-2">
          <h2 className="text-sm font-medium text-neutral-700">
            Subscription Cancellation
          </h2>
          <StepProgressPills current={2} total={3} className="mt-1" />
        </div>
      </div>

      <hr className="mt-3 border-neutral-200" />

      {/* Content */}
      <div className="px-4 sm:px-8 py-6 grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-8 items-start">
        {/* Left: copy + radios */}
        <div>
          <h3 className="text-[22px] sm:text-3xl md:text-4xl font-semibold leading-[1.2] md:leading-[1.1] tracking-tight [text-wrap:balance] text-neutral-900">
            {title}
          </h3>

          {subtitle ? (
            <p className="mt-2 text-neutral-600">{subtitle}</p>
          ) : null}

          <div className="mt-5">
            <p className="text-sm font-medium text-neutral-900">
              Is your company providing an immigration lawyer to help with your
              visa?*
            </p>

            {/* No choice yet → show radios */}
            {data.hasCompanyLawyer === null && (
              <fieldset className="mt-3 space-y-2">
                <RadioItem
                  name="company-lawyer"
                  label="Yes"
                  checked={false}
                  onChange={() =>
                    onChange({ hasCompanyLawyer: "Yes", visaName: "" })
                  }
                />
                <RadioItem
                  name="company-lawyer"
                  label="No"
                  checked={false}
                  onChange={() =>
                    onChange({ hasCompanyLawyer: "No", visaName: "" })
                  }
                />
              </fieldset>
            )}

            {/* YES branch → only the follow-up question + input */}
            {data.hasCompanyLawyer === "Yes" && (
              <div className="mt-4">
                <p className="text-sm font-medium text-neutral-900">
                  What visa will you be applying for?*
                </p>
                <input
                  type="text"
                  value={data.visaName ?? ""}
                  onChange={(e) => onChange({ visaName: e.target.value })}
                  placeholder="Enter visa type"
                  className="mt-2 w-full rounded-xl border border-neutral-300 px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-neutral-400 text-neutral-900"
                />
                <button
                  type="button"
                  onClick={() =>
                    onChange({ hasCompanyLawyer: null, visaName: "" })
                  }
                  className="mt-2 text-xs text-neutral-500 underline"
                >
                  Change answer
                </button>
              </div>
            )}

            {/* NO branch*/}
            {data.hasCompanyLawyer === "No" && (
              <div className="mt-4">
                <p className="text-neutral-800 text-md">
                  We can connect you with one of our trusted partners.
                </p>
                <p className="mt-0.5 text-md font-medium text-neutral-800">
                  Which visa would you like to apply for?*
                </p>
                <input
                  type="text"
                  value={data.visaName ?? ""}
                  onChange={(e) => onChange({ visaName: e.target.value })}
                  placeholder="Enter visa type"
                  className="mt-2 w-full rounded-xl border border-neutral-300 px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-neutral-400 text-neutral-800"
                />
                <button
                  type="button"
                  onClick={() =>
                    onChange({ hasCompanyLawyer: null, visaName: "" })
                  }
                  className="mt-2 text-xs text-neutral-500 underline"
                >
                  Change answer
                </button>
              </div>
            )}
          </div>

          <hr className="mt-6 mb-4 border-neutral-200" />

          <button
            type="button"
            onClick={onContinue}
            disabled={
              !(
                (data.hasCompanyLawyer === "Yes" ||
                  data.hasCompanyLawyer === "No") &&
                (data.visaName?.trim().length ?? 0) > 0
              )
            }
            className={[
              "w-full rounded-xl px-4 py-2.5 md:py-3 text-sm md:text-base font-medium transition",
              data.hasCompanyLawyer !== null &&
              (data.visaName?.trim().length ?? 0) > 0
                ? "bg-[#8952fc] text-white hover:bg-[#7b40fc]"
                : "bg-neutral-100 text-neutral-400 border border-neutral-200 cursor-not-allowed",
            ].join(" ")}
          >
            Complete cancellation
          </button>
        </div>

        {/* Right: image (hidden on mobile) */}
        <div
          className="relative hidden md:block w-full overflow-hidden rounded-xl shadow-sm ring-1 ring-black/5 aspect-[4/3]"
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

/* ---------- Helpers ---------- */

function RadioItem({
  name,
  label,
  checked,
  onChange,
}: {
  name: string;
  label: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <label className="flex items-center gap-3 rounded-lg border border-transparent hover:bg-neutral-50 cursor-pointer">
      <input
        type="radio"
        name={name}
        className="h-4 w-4 accent-neutral-900"
        checked={checked}
        onChange={onChange}
      />
      <span className="text-sm text-neutral-900">{label}</span>
    </label>
  );
}
