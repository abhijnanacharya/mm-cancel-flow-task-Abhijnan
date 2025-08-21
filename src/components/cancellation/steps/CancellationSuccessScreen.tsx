"use client";
import * as React from "react";
import Image from "next/image";
import StepProgressPills from "@/components/ui/global/StepProgressPills";

export default function CancellationSuccessScreen({
  hasCompanyLawyer,
  requireVisaAssistance,
  onBack,
  onContinue,
  contactName = "Mihailo Bozic",
  contactEmail = "mihailo@migratemate.co",
  contactAvatarSrc = "/profile.jpeg",
}: {
  hasCompanyLawyer: "Yes" | "No" | null;
  requireVisaAssistance?: string;
  onBack: () => void;
  onContinue: () => void;
  contactName?: string;
  contactEmail?: string;
  contactAvatarSrc?: string;
}) {
  const showVisaHelpVariant = hasCompanyLawyer === "No";
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
            <h2 className="text-[16px] font-bold text-neutral-600">
              Subscription Cancelled
            </h2>
            <StepProgressPills current={3} total={3} />
          </div>

          <div className="w-6" />
        </div>

        {/* Mobile stacked title + pills */}
        <div className="sm:hidden mt-2">
          <h2 className="text-sm font-medium text-neutral-700">
            Subscription Cancelled
          </h2>
          <div className="mt-1 flex items-center gap-2">
            <StepProgressPills current={3} total={3} />
          </div>
        </div>
      </div>

      <hr className="mt-3 border-neutral-200" />

      {/* Content */}
      <div className="px-4 sm:px-8 py-6 grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-8 items-stretch">
        {/* Left column: copy */}
        <div className="flex flex-col h-full">
          {showVisaHelpVariant ? (
            <>
              <h3 className="text-[22px] md:text-3xl font-semibold leading-[1.2] md:leading-[1.1] tracking-tight [text-wrap:balance] text-neutral-900">
                Your cancellation’s all sorted, mate, no more charges.
              </h3>

              {/* Helper contact card */}
              <div className="mt-4 rounded-xl border border-neutral-200 bg-gray-100 p-4 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="relative h-10 w-10 overflow-hidden rounded-full ring-1 ring-black/5">
                    <Image
                      src={contactAvatarSrc}
                      alt={contactName}
                      fill
                      className="object-cover"
                      sizes="40px"
                    />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-neutral-900">
                      {contactName}
                    </p>
                    <p className="text-xs text-neutral-600">
                      {"<" + contactEmail + ">"}
                    </p>
                  </div>
                </div>

                <p className="mt-3 text-sm text-neutral-700">
                  I’ll be reaching out soon to help with the visa side of
                  things.
                </p>
                <p className="mt-2 text-sm text-neutral-700">
                  We’ve got your back, whether it’s questions, paperwork, or
                  just figuring out your options.
                </p>
                <p className="mt-2 text-sm text-neutral-700">
                  Keep an eye on your inbox, I’ll be in touch{" "}
                  <span className="underline">shortly</span>.
                </p>
              </div>
            </>
          ) : (
            <>
              <h3 className="text-[22px] sm:text-3xl md:text-4xl font-semibold leading-[1.2] md:leading-[1.1] tracking-tight [text-wrap:balance] text-neutral-900">
                All done, your cancellation’s been processed.
              </h3>

              <p className="mt-3 sm:mt-4 max-w-[52ch] text-neutral-700 text-[15px] sm:text-base md:text-[17px] leading-[1.6]">
                We’re stoked to hear you’ve landed a job and sorted your visa.
                Big congrats from the team. 🙌
              </p>
            </>
          )}

          {/* Spacer to push footer to bottom */}
          <div className="flex-grow" />

          {/* Footer pinned to bottom */}
          <div>
            <hr className="mt-6 mb-4 border-neutral-200" />
            <button
              type="button"
              onClick={onContinue}
              className="w-full rounded-xl px-4 py-2.5 md:py-3 text-sm md:text-base font-medium transition bg-[#8952fc] text-white hover:bg-[#7b40fc]"
            >
              Finish
            </button>
          </div>
        </div>

        {/* Right column: image (hidden on mobile) */}
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
