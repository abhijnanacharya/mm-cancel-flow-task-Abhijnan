import { NextResponse } from "next/server";
import { z } from "zod";
import { supabaseAdmin } from "@/lib/supabase-server";
import { randomBytes } from "crypto";

const Body = z.object({
  userId: z.string().uuid(),
  subscriptionId: z.string().uuid().optional(), // allow server to derive when omitted
});

function isAllowedOrigin(req: Request) {
  if (process.env.NODE_ENV !== "production") return true; // don't block dev
  const origin = req.headers.get("origin") ?? "";
  const expected = process.env.NEXT_PUBLIC_SITE_ORIGIN ?? "";
  try {
    return new URL(origin).origin === new URL(expected).origin;
  } catch {
    return false;
  }
}

export async function POST(req: Request) {
  console.log("🚀 Cancellation API called");

  if (!isAllowedOrigin(req)) {
    console.log("❌ Origin check failed");
    return NextResponse.json({ error: "Bad origin" }, { status: 403 });
  }

  const raw = await req.json().catch(() => ({}));
  console.log("📝 Request body:", raw);
  
  const parse = Body.safeParse(raw);
  if (!parse.success) {
    console.log("❌ Validation failed:", parse.error);
    return NextResponse.json({ error: "Invalid body", details: parse.error }, { status: 400 });
  }

  const { userId } = parse.data;
  let { subscriptionId } = parse.data;

  try {
    // 1) If no subscriptionId is provided, pick the user's most recent active sub
    if (!subscriptionId) {
      console.log("🔍 Looking for active subscription for user:", userId);
      
      const { data: subFound, error: subFindErr } = await supabaseAdmin
        .from("subscriptions")
        .select("id, user_id, monthly_price, status")
        .eq("user_id", userId)
        .eq("status", "active")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (subFindErr) {
        console.error("❌ Error finding subscription:", subFindErr);
        return NextResponse.json({ 
          error: "Database error finding subscription", 
          details: subFindErr.message 
        }, { status: 500 });
      }
      
      if (!subFound) {
        console.log("❌ No active subscription found for user:", userId);
        return NextResponse.json({ error: "Active subscription not found" }, { status: 404 });
      }
      
      subscriptionId = subFound.id;
      console.log("✅ Found subscription:", subscriptionId);
    }

    // 2) Load subscription, verify ownership, get price (cents)
    console.log("📋 Loading subscription details:", subscriptionId);
    
    const { data: sub, error: subErr } = await supabaseAdmin
      .from("subscriptions")
      .select("id, user_id, monthly_price, status, cancel_requested_at")
      .eq("user_id", userId)
      .single();

    if (subErr) {
      console.error("❌ Error loading subscription:", subErr);
      return NextResponse.json({ 
        error: "Database error loading subscription", 
        details: subErr.message 
      }, { status: 500 });
    }
    
    if (!sub) {
      console.log("❌ Subscription not found:", subscriptionId);
      return NextResponse.json({ error: "Subscription not found" }, { status: 404 });
    }
    
    if (sub.user_id !== userId) {
      console.log("❌ Subscription ownership mismatch. Expected:", userId, "Got:", sub.user_id);
      return NextResponse.json({ error: "Subscription does not belong to user" }, { status: 403 });
    }

    console.log("✅ Subscription loaded:", sub);

    // 3) Mark subscription pending_cancellation (idempotent)
    console.log("🔄 Updating subscription status to pending_cancellation");
    
    const { error: updErr } = await supabaseAdmin
      .from("subscriptions")
      .update({
        status: "pending_cancellation",
        cancel_requested_at: new Date().toISOString(),
      })
      .eq("user_id", userId);

    if (updErr) {
      console.error("❌ Error updating subscription:", updErr);
      return NextResponse.json({ 
        error: "Failed to mark pending cancellation", 
        details: updErr.message 
      }, { status: 500 });
    }

    console.log("✅ Subscription marked as pending_cancellation");

    // 4) Sticky A/B variant
    console.log("Checking for existing cancellation record");
    
    const { data: existing, error: exErr } = await supabaseAdmin
      .from("cancellations")
      .select("id, downsell_variant")
      .eq("subscription_id", subscriptionId)
      .maybeSingle();

    if (exErr) {
      console.error("❌ Error checking existing cancellation:", exErr);
      return NextResponse.json({ 
        error: "Failed to check existing cancellation", 
        details: exErr.message 
      }, { status: 500 });
    }

    let cancellationId = existing?.id as string | undefined;
    let variant = existing?.downsell_variant as "A" | "B" | undefined;

    if (!variant) {
      // secure 50/50 assignment (server-side, once)
      const byte = randomBytes(1)[0];
      variant = (byte & 1) === 0 ? "A" : "B";
      

      const { data: created, error: insErr } = await supabaseAdmin
        .from("cancellations")
        .insert({
          subscription_id: subscriptionId,
          user_id: userId,
          downsell_variant: variant,
          accepted_downsell: false,
        })
        .select("id, downsell_variant")
        .single();

      if (insErr) {
        console.error("❌ Error creating cancellation:", insErr);
        return NextResponse.json({ 
          error: "Failed to create cancellation", 
          details: insErr.message,
          code: insErr.code 
        }, { status: 500 });
      }
      
      if (!created) {
        console.error("❌ No data returned from cancellation insert");
        return NextResponse.json({ 
          error: "Failed to create cancellation - no data returned" 
        }, { status: 500 });
      }

      cancellationId = created.id;
      variant = created.downsell_variant as "A" | "B";
      console.log("✅ Created cancellation:", cancellationId);
      
    } else if (!cancellationId) {
      console.log("🔍 Loading existing cancellation ID");
      
      const { data: again, error: againErr } = await supabaseAdmin
        .from("cancellations")
        .select("id")
        .eq("subscription_id", subscriptionId)
        .single();
        
      if (againErr) {
        console.error("❌ Error loading cancellation ID:", againErr);
        return NextResponse.json({ 
          error: "Failed to load cancellation id", 
          details: againErr.message 
        }, { status: 500 });
      }
      
      if (!again) {
        console.error("❌ No cancellation record found");
        return NextResponse.json({ error: "Failed to load cancellation id" }, { status: 500 });
      }
      
      cancellationId = again.id;
      console.log("✅ Loaded existing cancellation:", cancellationId);
    }

    // Convert cents -> dollars for UI
    const monthlyPriceDollars =
      typeof sub.monthly_price === "number" ? Math.round(sub.monthly_price) / 100 : null;

    console.log("✅ API Success - returning:", {
      cancellationId,
      variant,
      monthlyPrice: monthlyPriceDollars,
      subscriptionId,
    });

    return NextResponse.json({
      cancellationId,
      variant,
      monthlyPrice: monthlyPriceDollars,
      subscriptionId,
    });

  } catch (error) {
    console.error("💥 Unexpected error in cancellation API:", error);
    return NextResponse.json({ 
      error: "Internal server error", 
      details: error instanceof Error ? error.message : "Unknown error" 
    }, { status: 500 });
  }
}