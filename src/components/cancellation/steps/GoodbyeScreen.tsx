"use client";

import * as React from "react";
import Image from "next/image";
import StepProgressPills from "@/components/ui/global/StepProgressPills";

type Props = {
  endDate: string;
  onClose?: () => void;
  imageSrc?: string;
};

export default function GoodByeScreen({
  endDate,
  onClose,

  imageSrc = "/skyline.jpg",
}: Props) {
  return (
    <section className="pt-4 antialiased">
      {/* Header */}
      <div className="px-4 sm:px-8">
        <div className="flex items-center justify-between gap-3">
          <button
            type="button"
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

          <div className="flex-1 hidden sm:flex items-center justify-center gap-4">
            <h2 className="text-sm font-medium text-neutral-700">
              Subscription Cancelled
            </h2>
            <div className="flex items-center gap-2">
              <StepProgressPills current={3} total={3} />
            </div>
          </div>

          {onClose ? (
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="text-neutral-500 hover:text-neutral-700"
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                className="opacity-70"
              >
                <path
                  d="M6 6l12 12M18 6l-12 12"
                  stroke="currentColor"
                  strokeWidth="2"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          ) : (
            <span className="w-4" />
          )}
        </div>

        {/* Mobile title + pills */}
        <div className="sm:hidden mt-3 flex items-center justify-between">
          <h2 className="text-sm font-medium text-neutral-700">
            Subscription Cancelled
          </h2>
          <div className="flex items-center gap-2">
            <StepProgressPills current={3} total={3} />
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="mt-4 px-4 sm:px-8">
        <div className="grid md:grid-cols-2 gap-6 p-4 sm:p-8 md:items-stretch">
          {/* Left column: copy */}
          <div className="flex flex-col">
            <h3 className="text-[23px] md:text-3xl font-semibold leading-[1.2] md:leading-[1.1] tracking-tight text-neutral-900">
              Sorry to see you go, mate.
            </h3>

            <p className="mt-2 text-base md:text-lg text-neutral-900 font-semibold">
              Thanks for being with us, and you’re always welcome back.
            </p>

            <div className="mt-4 space-y-2 text-sm text-neutral-700">
              <p>
                Your subscription is set to end on{" "}
                <span className="font-medium">{endDate}</span>.
              </p>
              <p>
                You’ll still have full access until then. No further charges
                after that.
              </p>
            </div>

            <hr className="my-4 border-neutral-200" />

            <p className="text-sm text-neutral-600">
              Changed your mind? You can reactivate anytime before your end
              date.
            </p>

            <div className="mt-6">
              <button
                type="button"
                className="w-full sm:w-auto inline-flex items-center justify-center rounded-xl px-5 py-3 text-sm font-semibold text-white bg-violet-500 hover:bg-violet-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/30 shadow-sm"
              >
                Back to Jobs
              </button>
            </div>
          </div>

          {/* Right column: image */}
          <div
            className="relative hidden md:block rounded-xl overflow-hidden shadow-sm ring-1 ring-black/5 md:min-h-[360px]"
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
      </div>
    </section>
  );
}
