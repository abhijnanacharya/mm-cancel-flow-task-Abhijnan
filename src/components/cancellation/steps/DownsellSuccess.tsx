// components/cancellation/DownsellSuccess.tsx
"use client";

import Image from "next/image";
import { useMemo } from "react";

type Props = {
  /** CTA handler */
  onPrimary: () => void;
  /** Close (top-right X) */
  onClose?: () => void;

  /** Copy & data */
  headerTitle?: string; // defaults to "Subscription"
  headline?: string; // defaults to "Great choice, mate!"
  subheadlinePrefix?: string; // defaults to "You're still on the path to your dream role."
  subheadlineEmphasis?: string; // defaults to "Let's make it happen together!"
  daysLeft?: number | null; // shows "XX" if undefined
  nextBillingDate?: Date | string | null; // shows "XX date" if undefined
  monthlyPrice?: number | null; // shows "$12.50" demo if undefined
  currency?: string; // "USD" by default

  /** Visuals */
  imageSrc?: string; // defaults to "/skyline.jpg"
  buttonText?: string; // defaults to "Land your dream role"
  className?: string;
};

export default function DownsellSuccess({
  onPrimary,
  onClose,
  headerTitle = "Subscription",
  headline = "Great choice, mate!",
  subheadlinePrefix = "You're still on the path to your dream role.",
  subheadlineEmphasis = "Let's make it happen together!",
  daysLeft = null,
  nextBillingDate = null,
  monthlyPrice = null,
  currency = "USD",
  imageSrc = "/skyline.jpg",
  buttonText = "Land your dream role",
  className = "",
}: Props) {
  const formattedDate = useMemo(() => {
    if (!nextBillingDate) return "XX date";
    const d =
      typeof nextBillingDate === "string"
        ? new Date(nextBillingDate)
        : nextBillingDate;
    if (Number.isNaN(d.getTime())) return "XX date";
    return d.toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }, [nextBillingDate]);

  const formattedPrice = useMemo(() => {
    if (monthlyPrice == null) return "$12.50";
    try {
      return new Intl.NumberFormat(undefined, {
        style: "currency",
        currency,
      }).format(monthlyPrice);
    } catch {
      return `$${monthlyPrice.toFixed(2)}`;
    }
  }, [monthlyPrice, currency]);

  return (
    <section
      role="dialog"
      aria-labelledby="downsell-success-title"
      className={[
        "w-full max-w-5xl bg-white rounded-2xl shadow-xl ring-1 ring-black/10 overflow-hidden",
        className,
      ].join(" ")}
    >
      {/* Header */}
      <header className="px-5 sm:px-6 py-3 border-b border-neutral-200">
        {/* Center the title while keeping the close button on the right */}
        <div className="grid grid-cols-3 items-center">
          <div />
          <h3 className="text-center text-sm font-medium text-neutral-700">
            <span className="hidden md:inline">{headerTitle}</span>
            <span className="md:hidden">Subscription Continued</span>
          </h3>
        </div>

        {/* Mobile banner image */}
        <div className="md:hidden mt-3">
          <div className="relative w-full aspect-[16/9] overflow-hidden rounded-xl ring-1 ring-black/5">
            <Image
              src={imageSrc}
              alt="City skyline"
              fill
              className="object-cover"
              priority
            />
          </div>
        </div>
      </header>

      {/* Body */}
      <div className="grid md:grid-cols-2 gap-6 p-5 sm:p-8">
        {/* Left: copy */}
        <div className="flex flex-col">
          <h1
            id="downsell-success-title"
            className="text-3xl sm:text-4xl font-semibold tracking-tight text-neutral-900"
          >
            {headline}
          </h1>

          <p className="mt-3 text-xl sm:text-2xl leading-snug text-neutral-900">
            {subheadlinePrefix}{" "}
            <span className="text-violet-600">{subheadlineEmphasis}</span>
          </p>

          <div className="mt-6 space-y-1.5 text-sm text-neutral-700">
            <p>
              You&apos;ve got{" "}
              <strong>{daysLeft == null ? "XX" : daysLeft}</strong> days left on
              your current plan.
            </p>
            <p>
              Starting from <strong>{formattedDate}</strong>, your monthly
              payment will be <strong>{formattedPrice}</strong>.
            </p>
            <p className="text-xs italic text-neutral-500 mt-2">
              You can cancel anytime before then.
            </p>
          </div>

          <div className="mt-8 border-t border-neutral-200" />

          <div className="mt-4">
            <button
              type="button"
              onClick={onPrimary}
              className="w-full md:w-auto inline-flex items-center justify-center rounded-xl px-5 py-3 text-sm font-semibold text-white
                         bg-violet-600 hover:bg-violet-700 focus:outline-none focus:ring-2 focus:ring-violet-400/50 shadow-sm"
            >
              {buttonText}
            </button>
          </div>
        </div>

        {/* Right: image (desktop) — fills the column height */}
        <div
          className="relative hidden md:block w-full overflow-hidden rounded-xl shadow-sm ring-1 ring-black/5 h-full min-h-[300px]"
          aria-hidden
        >
          <Image
            src={imageSrc}
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
