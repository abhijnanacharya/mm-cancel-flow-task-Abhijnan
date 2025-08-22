"use client";
import * as React from "react";
import Image from "next/image";
import StepProgressPills from "@/components/ui/global/StepProgressPills";

/** Deterministic 50/50 bucketing using FNV-1a (stable across renders) */
function fnv1a32(str: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    // 32-bit FNV prime: 16777619
    h = (h + ((h << 1) + (h << 4) + (h << 7) + (h << 8) + (h << 24))) >>> 0;
  }
  return h >>> 0;
}
function bucket50(seed: string) {
  return (fnv1a32(seed) & 1) === 0; // true for exactly half the seeds
}

type Props = {
  /** Any stable string — subscriptionId, userId, or email */
  seed: string;
  /** Full monthly price in dollars (e.g., 25) */
  monthlyPrice: number;
  onBack: () => void;
  /** User accepts the downsell */
  onAcceptOffer: () => void;
  /** User declines (continue cancellation) */
  onDecline: () => void;
};

export default function ReasonNoScreen({
  seed,
  monthlyPrice,
  onBack,
  onAcceptOffer,
  onDecline,
}: Props) {
  const showOffer = React.useMemo(() => bucket50(seed), [seed]);

  const formatter = React.useMemo(
    () =>
      new Intl.NumberFormat(undefined, { style: "currency", currency: "USD" }),
    []
  );
  const full = formatter.format(monthlyPrice);
  const half = formatter.format(Math.round(monthlyPrice * 50) / 100); // 2-decimals

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
        {/* Left */}
        <div>
          <h3 className="text-[23px] md:text-3xl font-semibold leading-[1.2] md:leading-[1.1] tracking-tight [text-wrap:balance] text-neutral-900">
            We built this to help you land the job, this makes it a little
            easier.
          </h3>
          <p className="mt-3 text-[15px] md:text-base text-neutral-700">
            We’ve been there and we’re here to help you.
          </p>

          {showOffer ? (
            <OfferCard
              halfPrice={half}
              fullPrice={full}
              onAccept={onAcceptOffer}
            />
          ) : null}

          <button
            type="button"
            onClick={onDecline}
            className="mt-4 w-full rounded-xl border border-neutral-300 bg-white text-neutral-900 px-4 py-2.5 md:py-3 text-sm md:text-base font-medium hover:bg-neutral-50"
          >
            No thanks
          </button>
        </div>

        {/* Right image */}
        <div
          className="relative hidden md:block w-full h-full min-h-[260px] overflow-hidden rounded-xl shadow-sm ring-1 ring-black/5"
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

function OfferCard({
  halfPrice,
  fullPrice,
  onAccept,
}: {
  halfPrice: string;
  fullPrice: string;
  onAccept: () => void;
}) {
  return (
    <div className="mt-5 rounded-xl border border-violet-300 bg-violet-50/90 px-4 py-4 sm:px-6 sm:py-5">
      <p className="text-[20px] sm:text-[22px] font-semibold leading-snug text-neutral-900">
        Here’s <span className="underline">50% off</span> until you find a job.
      </p>

      <div className="mt-2 flex items-baseline gap-3">
        <span className="text-[20px] sm:text-[22px] font-semibold text-violet-700">
          {halfPrice}
          <span className="text-[15px] sm:text-base font-medium text-neutral-700">
            /month
          </span>
        </span>
        <span className="text-sm sm:text-[15px] text-neutral-500 line-through">
          {fullPrice}
          <span className="font-normal"> /month</span>
        </span>
      </div>

      <button
        type="button"
        onClick={onAccept}
        className="mt-3 w-full rounded-xl bg-emerald-500 text-white px-4 py-2.5 md:py-3 text-sm md:text-base font-medium hover:bg-emerald-600"
      >
        Get 50% off
      </button>

      <p className="mt-2 text-[11px] sm:text-xs text-neutral-500 text-center italic">
        You won’t be charged until your next billing date.
      </p>
    </div>
  );
}
