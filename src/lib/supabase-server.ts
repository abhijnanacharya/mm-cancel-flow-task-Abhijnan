import "server-only";
import { createClient } from "@supabase/supabase-js";

export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,      // ok to reuse URL
  process.env.SUPABASE_SERVICE_ROLE_KEY!      // NEVER import in client code
);
