// "use client";
// import React from "react";

// type Props = {
//   onYes: () => void;
//   onNo: () => void;
//   imageSrc?: string;
// };

// export default function SubscriptionCancellationIntro({
//   onYes,
//   onNo,
//   imageSrc = "https://images.unsplash.com/photo-1474511320723-9a56873867b5?q=80&w=1600&auto=format&fit=crop", // placeholder
// }: Props) {
//   return (
//     <section>
//       {/* Heading + divider (centered) */}
//       <h2 className="text-center text-sm font-medium text-neutral-500">
//         Subscription Cancellation
//       </h2>
//       <hr className="mt-2 mb-6 border-neutral-200" />

//       {/* Content: image first on mobile, text left on desktop */}
//       <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
//         {/* Image (mobile first, desktop right) */}
//         <div className="order-1 md:order-2">
//           <div className="w-full overflow-hidden rounded-xl shadow-sm ring-1 ring-black/5 aspect-[16/9] md:aspect-[16/10]">
//             <img
//               src={imageSrc}
//               alt="City skyline"
//               className="h-full w-full object-cover"
//               loading="eager"
//               decoding="async"
//             />
//           </div>
//         </div>

//         {/* Copy + CTAs (mobile second, desktop left) */}
//         <div className="order-2 md:order-1">
//           <p className="text-3xl md:text-4xl font-semibold text-neutral-900 leading-tight">
//             Hey mate,
//             <br /> Quick one before you go.
//           </p>

//           <p className="mt-3 text-xl md:text-2xl italic font-semibold text-neutral-900">
//             Have you found a job yet?
//           </p>

//           <p className="mt-3 text-neutral-600">
//             Whatever your answer, we just want to help you take the next step.
//             With visa support, or by hearing how we can do better.
//           </p>

//           <div className="mt-6 space-y-3">
//             <button
//               onClick={onYes}
//               className="w-full rounded-xl px-4 py-3 font-medium bg-neutral-900 text-white hover:bg-neutral-800"
//             >
//               Yes, I’ve found a job
//             </button>
//             <button
//               onClick={onNo}
//               className="w-full rounded-xl px-4 py-3 font-medium border border-neutral-300 hover:bg-neutral-50"
//             >
//               Not yet – I’m still looking
//             </button>
//           </div>
//         </div>
//       </div>
//     </section>
//   );
// }

"use client";
import React from "react";

type Props = {
  onYes: () => void;
  onNo: () => void;
  imageSrc?: string;
};

export default function SubscriptionCancellationIntro({
  onYes,
  onNo,
  imageSrc = "/skyline.jpg",
}: Props) {
  return (
    <section className="px-5 sm:px-8 pt-5 sm:pt-6 pb-6 sm:pb-8">
      {/* Header + divider */}
      <h2 className="text-left sm:text-center text-sm font-medium text-neutral-600">
        Subscription Cancellation
      </h2>
      <hr className="mt-2 mb-6 border-neutral-200" />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 items-start">
        {/* Image */}
        <div className="order-1 md:order-2">
          <div className="w-full overflow-hidden rounded-xl shadow-sm ring-1 ring-black/5 aspect-[16/9] md:aspect-[4/3]">
            <img
              src={imageSrc}
              alt="Preview"
              className="h-full w-full object-cover"
              loading="eager"
              decoding="async"
            />
          </div>
        </div>

        {/* Copy + CTAs */}
        <div className="order-2 md:order-1">
          <h3 className="text-3xl sm:text-4xl font-semibold text-neutral-900 leading-tight">
            Hey mate,
            <br /> Quick one before you go.
          </h3>

          <p className="mt-3 text-lg sm:text-2xl italic font-semibold text-neutral-900">
            Have you found a job yet?
          </p>

          <p className="mt-3 ml-0.5 text-neutral-600">
            Whatever your answer, we just want to help you take the next step.
            With visa support, or by hearing how we can do better.
          </p>

          <div className="mt-6 space-y-3">
            <button
              onClick={onYes}
              className="w-full rounded-xl px-4 py-3 font-medium border border-neutral-300 text-neutral-900 hover:bg-neutral-50"
            >
              Yes, I’ve found a job
            </button>
            <button
              onClick={onNo}
              className="w-full rounded-xl px-4 py-3 font-medium border border-neutral-300 text-neutral-900 hover:bg-neutral-50"
            >
              Not yet – I’m still looking
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
