"use client";
import { useState } from "react";
import SubscriptionCancellationIntro from "@/components/cancellation/SubscriptionCancellationIntro";
import ReasonYesScreen, {
  ReasonYesData,
} from "@/components/cancellation/steps/ReasonYesScreen";
import EnterDetailsScreen, {
  EnterDetailsData,
} from "./steps/EnterDetailsScreen";
import EnterVisaRequirementScreen, {
  VisaRequirementData,
} from "./steps/EnterVisaRequirementScreen";
import CancellationSuccessScreen from "./steps/CancellationSuccessScreen";

type Step =
  | "intro"
  | "reasonYes"
  | "reasonNo"
  | "enterDetails"
  | "secureVisa"
  | "visa"
  | "downsell"
  | "cancellationSuccess"
  | "done";

export default function SubscriptionCancellationFlowContent({
  onRequestClose,
}: {
  onRequestClose: () => void;
}) {
  const [step, setStep] = useState<Step>("intro");

  // single source of truth for everything the user selects
  const [data, setData] = useState<{
    gotJob?: boolean | null;
    reasonYes: ReasonYesData;
    secureVisa: VisaRequirementData;
    enterDetails: EnterDetailsData;
  }>({
    gotJob: null,
    reasonYes: {
      foundWithMM: null,
      applied: null,
      emailed: null,
      interviewed: null,
    },
    secureVisa: { hasCompanyLawyer: null, visaName: "" },
    enterDetails: { details: "" } as EnterDetailsData,
  });

  const updateReasonYes = (patch: Partial<ReasonYesData>) =>
    setData((d) => ({ ...d, reasonYes: { ...d.reasonYes, ...patch } }));
  const updateEnterDetails = (patch: Partial<EnterDetailsData>) =>
    setData((d) => ({ ...d, enterDetails: { ...d.enterDetails, ...patch } }));
  const updateVisa = (patch: Partial<VisaRequirementData>) =>
    setData((d) => ({
      ...d,
      secureVisa: { ...d.secureVisa, ...patch },
    }));

  const goFromReasonYes = () => {
    // use answers to branch
    if (data.reasonYes.foundWithMM === "No") {
      setStep("visa");
    } else {
      setStep("cancellationSuccess");
    }
  };

  if (step === "intro") {
    return (
      <SubscriptionCancellationIntro
        onYes={() => {
          setData((d) => ({ ...d, gotJob: true }));
          setStep("reasonYes");
        }}
        onNo={() => {
          setData((d) => ({ ...d, gotJob: false }));
          setStep("reasonNo");
        }}
      />
    );
  }

  if (step === "reasonYes") {
    return (
      <ReasonYesScreen
        data={data.reasonYes}
        onChange={updateReasonYes}
        onBack={() => setStep("intro")}
        onContinue={() => setStep("enterDetails")}
      />
    );
  }
  if (step === "enterDetails") {
    return (
      <EnterDetailsScreen
        data={data.enterDetails}
        onChange={updateEnterDetails}
        onBack={() => setStep("reasonYes")}
        onContinue={() => setStep("secureVisa")}
      />
    );
  }

  if (step === "secureVisa") {
    return (
      <EnterVisaRequirementScreen
        jobThroughMM={data.reasonYes.foundWithMM}
        data={data.secureVisa}
        onChange={updateVisa}
        onBack={() => setStep("enterDetails")}
        onContinue={() => setStep("cancellationSuccess")}
      />
    );
  }
  if (step === "cancellationSuccess") {
    return (
      <CancellationSuccessScreen
        hasCompanyLawyer={data.secureVisa.hasCompanyLawyer}
        requireVisaAssistance={data.secureVisa.visaName}
        onBack={() => setStep("secureVisa")}
        onContinue={() => setStep("done")}
      />
    );
  }

  // done
  return (
    <section className="px-5 sm:px-8 pt-5 sm:pt-6 pb-6 sm:pb-8 text-center">
      <h3 className="text-2xl font-semibold">You’re all set ✨</h3>
      <p className="mt-2 text-neutral-600">Thanks for the feedback.</p>
      <button
        className="mt-6 rounded-lg bg-black text-white px-4 py-2"
        onClick={onRequestClose}
      >
        Close
      </button>
    </section>
  );
}
