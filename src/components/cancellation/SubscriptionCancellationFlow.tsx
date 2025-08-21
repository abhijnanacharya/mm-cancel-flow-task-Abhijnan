"use client";
import { useEffect, useState } from "react";
import Modal from "@/components/ui/Modal";
import SubscriptionCancellationIntro from "@/components/cancellation/SubscriptionCancellationIntro";

export default function SubscriptionCancellationFlow({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const [step, setStep] = useState<
    "intro" | "reasonYes" | "reasonNo" | "visa" | "done"
  >("intro");

  // Optional: whenever the modal is newly opened, reset to the first step
  useEffect(() => {
    if (isOpen) setStep("intro");
  }, [isOpen]);

  const handleYes = () => {
    // console.log("HERE");
    setStep("reasonYes");
  };

  const handleNo = () => {
    setStep("reasonNo");
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Subscription Cancellation">
      {step === "intro" && (
        <SubscriptionCancellationIntro onYes={handleYes} onNo={handleNo} />
      )}

      {step === "reasonYes" && (
        <div className="p-6">
          <h3 className="text-xl font-semibold">Congrats on the new job! 🎉</h3>
          <p className="mt-2 text-neutral-600">
            Mind sharing why you’re cancelling?
          </p>
          <div className="mt-4 flex gap-3">
            <button
              className="rounded border px-3 py-2"
              onClick={() => setStep("intro")}
            >
              Back
            </button>
            <button
              className="rounded bg-black text-white px-4 py-2"
              onClick={() => setStep("done")}
            >
              Continue
            </button>
          </div>
        </div>
      )}

      {step === "reasonNo" && (
        <div className="p-6">
          <h3 className="text-xl font-semibold">
            Not yet — we’re rooting for you
          </h3>
          <p className="mt-2 text-neutral-600">Tell us what’s missing?</p>
          <div className="mt-4 flex gap-3">
            <button
              className="rounded border px-3 py-2"
              onClick={() => setStep("intro")}
            >
              Back
            </button>
            <button
              className="rounded bg-black text-white px-4 py-2"
              onClick={() => setStep("visa")}
            >
              Next
            </button>
          </div>
        </div>
      )}

      {step === "visa" && (
        <div className="p-6">
          <h3 className="text-xl font-semibold">Need help with visa?</h3>
          <div className="mt-4 flex gap-3">
            <button
              className="rounded border px-3 py-2"
              onClick={() => setStep("done")}
            >
              Yes — connect me
            </button>
            <button
              className="rounded border px-3 py-2"
              onClick={() => setStep("done")}
            >
              No thanks
            </button>
          </div>
        </div>
      )}

      {step === "done" && (
        <div className="p-6 text-center">
          <h3 className="text-xl font-semibold">You’re all set ✨</h3>
          <p className="mt-2 text-neutral-600">Thanks for the feedback.</p>
          <button
            className="mt-6 rounded bg-black text-white px-4 py-2"
            onClick={onClose}
          >
            Close
          </button>
        </div>
      )}
    </Modal>
  );
}
