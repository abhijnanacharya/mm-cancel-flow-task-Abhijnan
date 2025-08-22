import { NextResponse } from "next/server";
import { z } from "zod";
import { supabaseAdmin } from "@/lib/supabase-server";

const Body = z.object({
  cancellationId: z.string().uuid(),
  userId: z.string().uuid(),
  reason: z.string().optional(),
  acceptedDownsell: z.boolean(),
  foundWithMM: z.boolean().nullable(),
  applied: z.string().nullable(),
  emailed: z.string().nullable(), 
  interviewed: z.string().nullable(),
  hasCompanyLawyer: z.boolean().nullable(),
  visaName: z.string().optional(),
  cancelReason: z.string().nullable().optional(), 
  otherText: z.string().nullable().optional(), 
});

export async function POST(req: Request) {
  console.log("******************************************");
  const raw = await req.json().catch(() => ({}));
  const parse = Body.safeParse(raw);
  
  if (!parse.success) {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const {
    cancellationId,
    userId,
    reason,
    acceptedDownsell,
    foundWithMM,
    applied,
    emailed,
    interviewed,
    hasCompanyLawyer,
    visaName,
    cancelReason,
    otherText,
  } = parse.data;

  try {
    // Update the cancellation record with all collected data
    const { error: updateErr } = await supabaseAdmin
  .from("cancellations")
  .update({
    reason: reason || null,
    accepted_downsell: acceptedDownsell,
    found_with_mm: foundWithMM,
    applied_range: applied,        
    emailed_range: emailed,        
    interviewed_range: interviewed,
    has_company_lawyer: hasCompanyLawyer,
    visa_name: visaName || null,
    cancel_reason: cancelReason || null,
    other_reason_text: otherText || null,
    completed_at: new Date().toISOString(),
  })
  .eq("id", cancellationId)
  .eq("user_id", userId);
    if (updateErr) {
      console.error("Error updating cancellation:", updateErr);
      return NextResponse.json({ 
        error: "Failed to complete cancellation",
        details: updateErr.message 
      }, { status: 500 });
    }

    // If downsell was accepted, update subscription
   if (acceptedDownsell) {
  // First get the current subscription to calculate 50% off
    const { data: currentSub } = await supabaseAdmin
      .from("subscriptions")
      .select("monthly_price")
      .eq("user_id", userId)
      .single();

    const discountedPrice = Math.round(currentSub?.monthly_price * 0.5);

    const { error: subErr } = await supabaseAdmin
      .from("subscriptions")
      .update({ 
        status: "active",
        monthly_price: discountedPrice, // Apply 50% discount
        // Optionally track when discount was applied
        updated_at: new Date().toISOString()
      })
      .eq("user_id", userId);

  if (subErr) {
    console.error("Error updating subscription for downsell:", subErr);
    return NextResponse.json({ 
      error: "Failed to apply discount",
      details: subErr.message 
    }, { status: 500 });
  }
} else {
      // Complete cancellation
      const { error: subErr } = await supabaseAdmin
        .from("subscriptions")
        .update({ 
          status: "cancelled",
          cancelled_at: new Date().toISOString(),
        })
        .eq("user_id", userId);

      if (subErr) {
        console.error("Error cancelling subscription:", subErr);
      }
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json({ 
      error: "Internal server error" 
    }, { status: 500 });
  }
}