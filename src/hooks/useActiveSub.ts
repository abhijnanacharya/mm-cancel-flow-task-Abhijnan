"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase-browser";

type SubRow = {
  id: string;
  status: string;
  monthly_price: number | null;
  created_at?: string;
  user_id?: string;

};

export function useActiveSubscription(userIdFromProps?: string) {
  const [loading, setLoading] = useState(true);
  const [subscriptionId, setSubscriptionId] = useState<string | null>(null);
  const [monthlyPrice, setMonthlyPrice] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let aborted = false;

    (async () => {
      setLoading(true);
      setError(null);
      try {
        // If you have auth, prefer the signed-in user:
        const { data: auth } = await supabase.auth.getUser();
        const userId = userIdFromProps ?? auth?.user?.id;

        if (!userId) {
          // Optional: if you’re still mocking, you can skip this branch
          if (!aborted) {
            setLoading(false);
            setError("Not signed in.");
          }
          return;
        }

        // ACTIVE first
        const { data: active, error: e1 } = await supabase
          .from("subscriptions")
          .select("id, status, monthly_price")
          .eq("user_id", userId)          
          .eq("status", "active")
          .limit(1)
          .maybeSingle<SubRow>();
        if (e1) throw e1;

        if (active && !aborted) {
          setSubscriptionId(active.id);
          setMonthlyPrice(active.monthly_price ?? null);
        } else {
          // Fallback: latest
          const { data: latest, error: e2 } = await supabase
            .from("subscriptions")
            .select("id, status, monthly_price, created_at")
            .eq("user_id", userId)         
            .order("created_at", { ascending: false })
            .limit(1)
            .maybeSingle<SubRow>();
          if (e2) throw e2;

          if (latest && !aborted) {
            setSubscriptionId(latest.id);
            setMonthlyPrice(latest.monthly_price ?? null);
          }
        }
      } catch (err) {
        if (!aborted) setError("Could not load subscription.");
        console.error(err);
      } finally {
        if (!aborted) setLoading(false);
      }
    })();

    // only depends on the (optional) user id you pass in
    return () => {
      aborted = true;
    };
  }, [userIdFromProps]);

  return { loading, error, subscriptionId, monthlyPrice };
}
