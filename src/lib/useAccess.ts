"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowser } from "./supabase-browser";

export function useAccess() {
  const [allowed, setAllowed] = useState<boolean | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [username, setUsername] = useState("Unknown");
  const router = useRouter();
  const supabase = createSupabaseBrowser();

  useEffect(() => {
    const checkAccess = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/");
        return;
      }

      setUsername(
        user.user_metadata?.full_name ||
          user.user_metadata?.name ||
          user.email ||
          "Unknown"
      );

      const discordId = user.user_metadata?.sub;
      const { data } = await supabase
        .from("allowed_users")
        .select("is_admin")
        .eq("discord_id", discordId)
        .single();

      if (!data) {
        setAllowed(false);
        return;
      }

      setAllowed(true);
      setIsAdmin(data.is_admin);
    };

    checkAccess();
  }, [supabase, router]);

  return { allowed, isAdmin, username };
}
