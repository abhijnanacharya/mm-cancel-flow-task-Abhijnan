"use client";

import { useEffect, useMemo, useRef, useState } from "react";
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
import ReasonNoScreen from "./steps/ReasonNoScreen";
import { priceForVariant } from "@/utils/pricing";
import DownsellSuccess from "./steps/DownsellSuccess";
import CancellationReason, { CancelReason } from "./steps/CancellingReason";
import GoodByeScreen from "./steps/GoodbyeScreen";

type Step =
  | "intro"
  | "reasonYes"
  | "reasonNo"
  | "enterDetails"
  | "secureVisa"
  | "downsellSuccess"
  | "cancelReason"
  | "cancellationSuccess"
  | "goodbye"
  | "done";

type Variant = "A" | "B";

function getOrCreateLocalSeed() {
  if (typeof window === "undefined") return "ssr";
  const KEY = "mm_bucket_seed_v1";
  let s = localStorage.getItem(KEY);
  if (!s) {
    s = crypto?.randomUUID?.() ?? Math.random().toString(36).slice(2);
    localStorage.setItem(KEY, s);
  }
  return s;
}

function variantFromSeed(seed: string): Variant {
  let h = 5381;
  for (let i = 0; i < seed.length; i++) h = (h * 33) ^ seed.charCodeAt(i);
  return (h & 1) === 0 ? "A" : "B";
}

export default function SubscriptionCancellationFlowContent({
  onRequestClose,
  subscriptionId,
  monthlyPrice,
  mockUserId,
  currentPeriodEnd,
  daysLeft,
}: {
  onRequestClose: () => void;
  subscriptionId: string;
  monthlyPrice: number;
  mockUserId: string;
  currentPeriodEnd?: Date | string;
  daysLeft?: number;
}) {
  const [step, setStep] = useState<Step>("intro");

  // server flow state
  const [starting, setStarting] = useState(false);
  const [cancellationId, setCancellationId] = useState<string | null>(null);
  const [variant, setVariant] = useState<Variant | null>(null);
  const [serverMonthlyPrice, setServerMonthlyPrice] = useState<number | null>(
    null
  );

  // UI state
  const [acceptedDownsell, setAcceptedDownsell] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [fromDownsell, setFromDownsell] = useState(false);

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
  const [cancelReason, setCancelReason] = useState<CancelReason>(null);
  const [otherText, setOtherText] = useState("");
  const updateReasonYes = (patch: Partial<ReasonYesData>) =>
    setData((d) => ({ ...d, reasonYes: { ...d.reasonYes, ...patch } }));
  const updateEnterDetails = (patch: Partial<EnterDetailsData>) =>
    setData((d) => ({ ...d, enterDetails: { ...d.enterDetails, ...patch } }));
  const updateVisa = (patch: Partial<VisaRequirementData>) =>
    setData((d) => ({ ...d, secureVisa: { ...d.secureVisa, ...patch } }));

  const startedRef = useRef(false);
  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;

    let alive = true;
    (async () => {
      try {
        setStarting(true);
        setErrorMsg(null);

        const res = await fetch("/api/cancellations/start", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ subscriptionId, userId: mockUserId }),
        });

        const j = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(j?.error || "Failed to start flow");

        if (!alive) return;
        setCancellationId(j.cancellationId);
        setVariant(j.variant as Variant);
        setServerMonthlyPrice(j.monthlyPrice as number);
      } catch (e: any) {
        console.error(e);
        if (alive) {
          setErrorMsg(e?.message || "Unable to start cancellation.");
          setVariant(variantFromSeed(subscriptionId || getOrCreateLocalSeed()));
          setServerMonthlyPrice(monthlyPrice);
        }
      } finally {
        if (alive) setStarting(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [subscriptionId, mockUserId]);

  const seed = useMemo(
    () => cancellationId ?? subscriptionId ?? getOrCreateLocalSeed(),
    [cancellationId, subscriptionId]
  );

  const effectiveMonthly = serverMonthlyPrice ?? monthlyPrice;

  // Use server variant if present; otherwise deterministic local
  const effectiveVariant: Variant = useMemo(
    () => variant ?? variantFromSeed(seed),
    [variant, seed]
  );

  // What we'll *offer* (may be discounted for variant B)
  const offeredMonthly = priceForVariant(effectiveMonthly, effectiveVariant);

  // --- API: finalize ---
  async function handleDone() {
    if (!cancellationId) {
      onRequestClose();
      return;
    }
    try {
      setSaving(true);
      setErrorMsg(null);

      const res = await fetch("/api/cancellations/complete", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          cancellationId,
          userId: mockUserId,
          reason: data.enterDetails.details ?? "",
          acceptedDownsell: Boolean(acceptedDownsell),
          foundWithMM:
            data.reasonYes.foundWithMM === "Yes"
              ? true
              : data.reasonYes.foundWithMM === "No"
              ? false
              : null,
          applied: data.reasonYes.applied,
          emailed: data.reasonYes.emailed,
          interviewed: data.reasonYes.interviewed,
          hasCompanyLawyer:
            data.secureVisa.hasCompanyLawyer === "Yes"
              ? true
              : data.secureVisa.hasCompanyLawyer === "No"
              ? false
              : null,
          visaName: data.secureVisa.visaName ?? "",
        }),
      });

      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j?.error || "Request failed");
      }
      onRequestClose();
    } catch (e: any) {
      console.error(e);
      setErrorMsg(
        e?.message ||
          "We couldn’t complete your cancellation. Please try again."
      );
    } finally {
      setSaving(false);
    }
  }

  // Helper used for both places where an offer can be accepted
  async function applyDownsellAndRoute() {
    try {
      setStarting(true);
      setErrorMsg(null);

      const applied = true;
      if (applied) {
        setAcceptedDownsell(true);
        setStep("downsellSuccess");
      } else {
        // not successful -> enter usage flow with offer still available
        setAcceptedDownsell(false);
        setFromDownsell(true);
        setStep("reasonYes");
      }
    } catch {
      setAcceptedDownsell(false);
      setFromDownsell(true);
      setStep("reasonYes");
    } finally {
      setStarting(false);
    }
  }

  // ---- Steps ----
  if (step === "intro") {
    return (
      <SubscriptionCancellationIntro
        onYes={() => {
          // ✅ make sure we are NOT in downsell mode anymore
          setFromDownsell(false);
          setAcceptedDownsell(false);

          // (optional) clear prior answers so the first question shows normally
          setData((d) => ({
            ...d,
            gotJob: true,
            reasonYes: {
              foundWithMM: null,
              applied: null,
              emailed: null,
              interviewed: null,
            },
          }));

          setStep("reasonYes");
        }}
        onNo={() => {
          // Fresh “No” path also shouldn’t inherit downsell state
          setFromDownsell(false);
          setAcceptedDownsell(false);
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
        onBack={() => setStep(fromDownsell ? "reasonNo" : "intro")}
        onContinue={() =>
          setStep(fromDownsell ? "cancelReason" : "enterDetails")
        }
        fromDownsell={fromDownsell}
        offerPrice={fromDownsell ? offeredMonthly : undefined}
        compareAtPrice={fromDownsell ? effectiveMonthly : undefined}
        onAcceptOffer={fromDownsell ? applyDownsellAndRoute : undefined}
      />
    );
  }
  if (step == "cancelReason") {
    return (
      <CancellationReason
        value={cancelReason}
        otherText={otherText}
        onChange={({ reason, otherText: newOtherText }) => {
          if (reason !== undefined) setCancelReason(reason);
          if (newOtherText !== undefined) setOtherText(newOtherText);
        }}
        onBack={() => setStep("reasonNo")} // Replace with your previous step
        onContinue={() => {
          // Handle cancellation completion logic here
          console.log("Cancellation reason:", cancelReason);
          if (cancelReason === "other") {
            console.log("Other text:", otherText);
          }
          // Navigate to next step or complete cancellation
          setStep("goodbye"); // Replace with your next step
        }}
        onAcceptOffer={() => {
          // Handle the 50% off offer acceptance
          console.log("User accepted 50% off offer");
          // Navigate to offer acceptance flow
        }}
        currentStep={3}
        totalSteps={3}
        monthlyPrice={12}
        imageSrc="/skyline.jpg"
      />
    );
  }

  if (step === "reasonNo") {
    return (
      <ReasonNoScreen
        seed={seed}
        monthlyPrice={offeredMonthly}
        onBack={() => setStep("intro")}
        onAcceptOffer={applyDownsellAndRoute}
        onDecline={() => {
          setAcceptedDownsell(false);
          setFromDownsell(true);
          setStep("reasonYes");
        }}
      />
    );
  }

  if (step === "enterDetails") {
    return (
      <EnterDetailsScreen
        data={data.enterDetails}
        onChange={updateEnterDetails}
        onBack={() =>
          fromDownsell
            ? setStep("reasonYes")
            : data.gotJob
            ? setStep("reasonYes")
            : setStep("reasonNo")
        }
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

  if (step === "downsellSuccess") {
    console.log(monthlyPrice);
    return (
      <DownsellSuccess
        onPrimary={handleDone}
        onClose={onRequestClose}
        daysLeft={daysLeft ?? null}
        nextBillingDate={currentPeriodEnd ?? null}
        monthlyPrice={monthlyPrice * 0.5}
        imageSrc="/skyline.jpg"
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

  if (step === "goodbye") {
    return (
      <GoodByeScreen
        endDate={new Date().toLocaleDateString("en-US", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
        })}
      />
    );
  }

  // done
  return (
    <section className="px-5 sm:px-8 pt-5 sm:pt-6 pb-6 sm:pb-8 text-center">
      <h3 className="text-2xl font-semibold">You’re all set ✨</h3>
      <p className="mt-2 text-neutral-600">
        {starting ? "Starting your cancellation…" : "Thanks for the feedback."}
      </p>

      {errorMsg ? (
        <p className="mt-3 text-sm text-red-600">{errorMsg}</p>
      ) : null}

      <button
        className="mt-6 rounded-lg bg-black text-white px-4 py-2 disabled:opacity-60"
        onClick={handleDone}
        disabled={saving || starting}
      >
        {saving ? "Saving..." : "Close"}
      </button>
    </section>
  );
}
