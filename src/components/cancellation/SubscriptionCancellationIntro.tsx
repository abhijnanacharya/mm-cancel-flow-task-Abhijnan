"use client";
import React, { forwardRef } from "react";
import Image from "next/image";

type Props = {
  onYes: () => void;
  onNo: () => void;
  imageSrc?: string;
  imageAlt?: string;
  className?: string;
  // A/B copy overrides
  title?: string;
  headline?: string;
  question?: string;
  helperText?: string;
};

const SubscriptionCancellationIntro = forwardRef<HTMLButtonElement, Props>(
  (
    {
      onYes,
      onNo,
      imageSrc = "/skyline.jpg",
      imageAlt = "City skyline",
      className = "",
      title = "Subscription Cancellation",
      headline = "Hey mate,\nQuick one before you go.",
      question = "Have you found a job yet?",
      helperText = "Whatever your answer, we just want to help you take the next step. With visa support, or by hearing how we can do better.",
    },
    primaryCtaRef
  ) => {
    const [h1, h2] = headline.split("\n");

    return (
      <section
        className={["px-5 sm:px-8 pt-5 sm:pt-6 pb-6 sm:pb-8", className].join(
          " "
        )}
      >
        {/* Header + divider */}
        <h2 className="text-left sm:text-center text-sm font-medium text-neutral-600">
          {title}
        </h2>
        <hr className="mt-2 mb-6 border-neutral-200" />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 items-start">
          {/* Image */}
          <div className="order-1 md:order-2">
            <div className="relative w-full overflow-hidden rounded-xl shadow-sm ring-1 ring-black/5 aspect-[16/9] md:aspect-[4/3]">
              <Image
                src={imageSrc}
                alt={imageAlt}
                fill
                className="object-cover"
                priority
              />
            </div>
          </div>

          {/* Copy + CTAs */}
          <div className="order-2 md:order-1">
            <h3 className="text-3xl sm:text-4xl font-semibold text-neutral-900 leading-tight">
              {h1}
              {h2 ? (
                <>
                  <br />
                  {h2}
                </>
              ) : null}
            </h3>

            <p className="mt-3 text-lg sm:text-2xl italic font-semibold text-neutral-900">
              {question}
            </p>

            <p className="mt-3 ml-0.5 text-neutral-600">{helperText}</p>

            <div className="mt-6 space-y-3">
              <button
                ref={primaryCtaRef}
                type="button"
                onClick={onYes}
                className="w-full rounded-xl px-4 py-3 font-medium border border-neutral-300 text-neutral-900 hover:bg-neutral-50"
                data-testid="intro-yes"
              >
                Yes, I’ve found a job
              </button>
              <button
                type="button"
                onClick={onNo}
                className="w-full rounded-xl px-4 py-3 font-medium border border-neutral-300 text-neutral-900 hover:bg-neutral-50"
                data-testid="intro-no"
              >
                Not yet – I’m still looking
              </button>
            </div>
          </div>
        </div>
      </section>
    );
  }
);

SubscriptionCancellationIntro.displayName = "SubscriptionCancellationIntro";
export default SubscriptionCancellationIntro;
