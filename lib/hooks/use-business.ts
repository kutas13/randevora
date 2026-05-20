"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export function useBusinessId() {
  const [businessId, setBusinessId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetch() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }

      const { data } = await supabase
        .from("users")
        .select("business_id")
        .eq("id", user.id)
        .single();

      setBusinessId(data?.business_id || null);
      setLoading(false);
    }
    fetch();
  }, []);

  return { businessId, loading };
}
