"use client";
import * as React from "react";
import Image from "next/image";
import StepProgressPills from "@/components/ui/global/StepProgressPills";
import { formatUSD } from "@/utils/helpers";

// ---- Types ----
export type CancelReason =
  | "too_expensive"
  | "platform_not_helpful"
  | "not_enough_jobs"
  | "decided_not_to_move"
  | "other"
  | null;

export type CancellationReasonProps = {
  /** Controlled value for the selected reason */
  value: CancelReason;
  /** Controlled text for the "Other" explanation */
  otherText?: string;
  /** Called anytime the user changes the selection/text */
  onChange: (patch: { reason?: CancelReason; otherText?: string }) => void;

  /** Nav handlers */
  onBack: () => void;
  /** Called when user clicks "Complete cancellation" */
  onContinue: () => void;
  /** Optional: handle the green downsell CTA */
  onAcceptOffer?: () => void;

  /** Progress UI */
  currentStep?: number; // defaults to 3
  totalSteps?: number; // defaults to 3

  /** Optional pricing for CTA. Pass monthly price in USD. */
  monthlyPrice?: number | null;

  /** Optional image (from /public or remote) */
  imageSrc?: string;

  /** Show the close button in header */
  onClose?: () => void;
};

// ---- helpers ----

function RadioRow({
  id,
  name,
  checked,
  label,
  onChange,
}: {
  id: string;
  name: string;
  checked: boolean;
  label: string;
  onChange: () => void;
}) {
  return (
    <label
      htmlFor={id}
      className="flex items-start gap-3 py-2 cursor-pointer select-none"
    >
      <input
        id={id}
        name={name}
        type="radio"
        checked={checked}
        onChange={onChange}
        className="mt-1 h-4 w-4 accent-emerald-600"
      />
      <span className="text-sm text-neutral-800">{label}</span>
    </label>
  );
}

// Helper to get the display text for selected reason
function getReasonLabel(reason: CancelReason): string {
  switch (reason) {
    case "too_expensive":
      return "Too expensive";
    case "platform_not_helpful":
      return "Platform not helpful";
    case "not_enough_jobs":
      return "Not enough relevant jobs";
    case "decided_not_to_move":
      return "Decided not to move";
    case "other":
      return "Other";
    default:
      return "";
  }
}

// Helper to get relevant copy for the text input
function getInputCopy(reason: CancelReason): string {
  switch (reason) {
    case "too_expensive":
      return "Can you tell us more about the pricing?";
    case "platform_not_helpful":
      return "Can you tell us more what wasn't helpful?";
    case "not_enough_jobs":
      return "What kind of jobs were you looking for?";
    case "decided_not_to_move":
      return "What made you decide not to move?";
    case "other":
      return "Tell us a bit more:";
    default:
      return "Tell us a bit more:";
  }
}

// ---- Component ----
export default function CancellationReason({
  value,
  otherText = "",
  onChange,
  onBack,
  onContinue,
  onAcceptOffer,
  currentStep = 3,
  totalSteps = 3,
  monthlyPrice,
  imageSrc = "/skyline.jpg",
  onClose,
}: CancellationReasonProps) {
  const [touched, setTouched] = React.useState(false);

  const showError = touched && !value;

  const offerNow = React.useMemo(() => {
    if (!monthlyPrice || monthlyPrice <= 0) return null;
    const discounted = monthlyPrice / 2;
    return {
      now: `${formatUSD(discounted)} / mo`,
      was: `${formatUSD(monthlyPrice)}`,
    };
  }, [monthlyPrice]);

  // Reset otherText when switching away from a selected reason
  const handleReasonChange = (newReason: CancelReason) => {
    onChange({ reason: newReason, otherText: "" });
  };

  return (
    <section className="pt-4 antialiased">
      {/* Header */}
      <div className="px-4 sm:px-8">
        <div className="flex items-center justify-between">
          {/* Back */}
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
            <h2 className="text-xs font-medium text-neutral-600">
              Subscription Cancellation
            </h2>
            <StepProgressPills current={currentStep} total={totalSteps} />
            <span className="text-xs text-neutral-500">
              Step {currentStep} of {totalSteps}
            </span>
          </div>

          {onClose ? (
            <button
              type="button"
              onClick={onClose}
              className="hidden sm:inline-flex items-center justify-center h-6 w-6 rounded-md text-neutral-500 hover:text-neutral-800 hover:bg-neutral-100"
              aria-label="Close"
            >
              ×
            </button>
          ) : (
            <span className="w-6" />
          )}
        </div>
      </div>

      {/* Body */}
      <div className="mt-3 px-3 py-3 sm:px-6">
        <div className="grid md:grid-cols-2 gap-4 md:gap-6">
          {/* Left: form */}
          <div className="bg-white rounded-xl ring-1 ring-black/5 p-4 sm:p-5 md:min-h-[500px] flex flex-col">
            <h3 className="text-[23px] md:text-3xl font-semibold leading-[1.2] md:leading-[1.1] tracking-tight [text-wrap:balance] text-neutral-900">
              What's the main
              <br className="hidden sm:block" /> reason for cancelling?
            </h3>
            <p className="mt-1 text-[13px] text-neutral-500">
              Please take a minute to let us know why:
            </p>

            {showError && (
              <p className="mt-3 text-[12px] text-red-600" role="alert">
                To help us understand your experience, please select a reason
                for cancelling*
              </p>
            )}

            <fieldset className="mt-3">
              <legend className="sr-only">Select a reason</legend>

              {!value ? (
                // Show all radio options when nothing is selected
                <>
                  <RadioRow
                    id="r-expensive"
                    name="cancel-reason"
                    checked={false}
                    onChange={() => handleReasonChange("too_expensive")}
                    label="Too expensive"
                  />
                  <RadioRow
                    id="r-platform"
                    name="cancel-reason"
                    checked={false}
                    onChange={() => handleReasonChange("platform_not_helpful")}
                    label="Platform not helpful"
                  />
                  <RadioRow
                    id="r-jobs"
                    name="cancel-reason"
                    checked={false}
                    onChange={() => handleReasonChange("not_enough_jobs")}
                    label="Not enough relevant jobs"
                  />
                  <RadioRow
                    id="r-move"
                    name="cancel-reason"
                    checked={false}
                    onChange={() => handleReasonChange("decided_not_to_move")}
                    label="Decided not to move"
                  />
                  <RadioRow
                    id="r-other"
                    name="cancel-reason"
                    checked={false}
                    onChange={() => handleReasonChange("other")}
                    label="Other"
                  />
                </>
              ) : (
                // Show selected option + text input when something is selected
                <div className="space-y-4">
                  {/* Selected reason with radio checked */}
                  <RadioRow
                    id={`r-${value}`}
                    name="cancel-reason"
                    checked={true}
                    onChange={() => handleReasonChange(null)} // Allow deselection
                    label={getReasonLabel(value)}
                  />

                  {/* Text input for additional details */}
                  <div className="ml-7">
                    <p className="text-sm text-neutral-600 mb-2">
                      {getInputCopy(value)}
                    </p>
                    <div className="rounded-xl border border-neutral-300 px-3 py-2.5">
                      <input
                        type="text"
                        value={otherText}
                        onChange={(e) =>
                          onChange({ otherText: e.target.value })
                        }
                        placeholder="Tell us more..."
                        className="w-full bg-transparent text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => onChange({ reason: null, otherText: "" })}
                      className="mt-2 text-xs text-neutral-500 underline"
                    >
                      Change answer
                    </button>
                  </div>
                </div>
              )}
            </fieldset>

            {/* Actions */}
            <div className="mt-auto pt-4 flex flex-col gap-2">
              {onAcceptOffer && (
                <button
                  type="button"
                  onClick={onAcceptOffer}
                  className="inline-flex items-center justify-center h-9 rounded-lg bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 transition-colors"
                >
                  {offerNow ? (
                    <div className="flex items-center gap-2">
                      <span>Get 50% off</span>
                      <span className="opacity-90">| {offerNow.now}</span>
                      <span className="text-xs opacity-70 line-through">
                        {offerNow.was}
                      </span>
                    </div>
                  ) : (
                    <span>Get 50% off</span>
                  )}
                </button>
              )}

              <button
                type="button"
                onClick={() => {
                  if (!value) {
                    setTouched(true);
                    return;
                  }
                  onContinue();
                }}
                className={[
                  "inline-flex items-center justify-center h-9 rounded-lg border text-sm font-medium",
                  value
                    ? "bg-neutral-900 text-white border-neutral-900 hover:bg-neutral-800"
                    : "bg-neutral-100 text-neutral-400 border-neutral-200 cursor-not-allowed",
                ].join(" ")}
                aria-disabled={!value}
              >
                Complete cancellation
              </button>
            </div>
          </div>

          {/* Right: image (hidden on small screens) */}
          <div className="relative hidden md:block w-full h-full min-h-[500px] overflow-hidden rounded-xl shadow-sm ring-1 ring-black/5">
            <Image
              src={imageSrc}
              alt="City skyline"
              fill
              className="object-cover"
              priority
            />
          </div>
        </div>
      </div>
    </section>
  );
}
