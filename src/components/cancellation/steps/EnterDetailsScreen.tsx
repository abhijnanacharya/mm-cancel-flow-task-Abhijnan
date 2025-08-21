"use client";
import * as React from "react";
import Image from "next/image";
import StepProgressPills from "@/components/ui/global/StepProgressPills";

/** Answers this screen collects */
export type EnterDetailsData = {
  details: string;
};

export default function EnterDetailsScreen({
  data,
  onChange,
  onBack,
  onContinue,
  minChars = 25,
}: {
  data: EnterDetailsData;
  onChange: (patch: Partial<EnterDetailsData>) => void;
  onBack: () => void;
  onContinue: () => void;
  minChars?: number;
}) {
  const value = data.details ?? "";
  const count = value.trim().length;
  const canContinue = count >= minChars;

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
            <StepProgressPills current={1} total={3} />
          </div>

          <div className="w-6" />
        </div>

        {/* Mobile stacked title + pills */}
        <div className="sm:hidden mt-2">
          <h2 className="text-sm font-medium text-neutral-700">
            Subscription Cancellation
          </h2>
          <StepProgressPills current={1} total={3} className="mt-1" />
        </div>
      </div>

      <hr className="mt-3 border-neutral-200" />

      {/* Content */}
      <div className="px-4 sm:px-8 py-6 grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-8 items-start">
        {/* Left: copy + textarea */}
        <div>
          <h3 className="text-[22px] sm:text-3xl md:text-4xl font-semibold leading-[1.2] md:leading-[1.1] tracking-tight [text-wrap:balance] text-neutral-900">
            What’s one thing you wish we could’ve helped you with?
          </h3>

          <p className="mt-3 text-neutral-600">
            We’re always looking to improve, your thoughts can help us make
            Migrate Mate more useful for others.
            <span className="align-top">*</span>
          </p>

          <div className="mt-4">
            <div className="rounded-xl border border-neutral-300 focus-within:ring-2 focus-within:ring-black/5 focus-within:border-neutral-400 overflow-hidden">
              <textarea
                value={value}
                onChange={(e) => onChange({ details: e.target.value })}
                rows={6}
                className="w-full p-3 sm:p-4 outline-none resize-y
             text-neutral-900 placeholder:text-neutral-400
             caret-neutral-700"
                placeholder="Tell us a bit more..."
              />
            </div>

            <div className="mt-2 flex justify-end">
              <span className="text-xs text-neutral-500">
                Min {minChars} characters ({count}/{minChars})
              </span>
            </div>
          </div>

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

        {/* Image */}
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
