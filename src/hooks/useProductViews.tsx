import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

// Generate or get session ID from localStorage
const getSessionId = () => {
  let sessionId = localStorage.getItem("session_id");
  if (!sessionId) {
    sessionId = `session_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    localStorage.setItem("session_id", sessionId);
  }
  return sessionId;
};

export const useProductViews = (productId: string) => {
  const [viewCount, setViewCount] = useState(0);

  useEffect(() => {
    if (!productId) return;

    // Fetch view count
    const fetchViewCount = async () => {
      const { count } = await supabase
        .from("product_views")
        .select("*", { count: "exact", head: true })
        .eq("product_id", productId);

      setViewCount(count || 0);
    };

    fetchViewCount();

    // Track this view
    const trackView = async () => {
      const sessionId = getSessionId();
      const { data: { user } } = await supabase.auth.getUser();

      // Check if this session already viewed this product (prevent duplicate counts)
      const { data: existingView } = await supabase
        .from("product_views")
        .select("id")
        .eq("product_id", productId)
        .eq("session_id", sessionId)
        .maybeSingle();

      if (!existingView) {
        await supabase.from("product_views").insert({
          product_id: productId,
          user_id: user?.id || null,
          session_id: sessionId,
        });

        // Update local count
        setViewCount((prev) => prev + 1);
      }
    };

    trackView();
  }, [productId]);

  return viewCount;
};
