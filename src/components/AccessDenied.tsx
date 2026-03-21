"use client";

import Image from "next/image";
import { createSupabaseBrowser } from "@/lib/supabase-browser";
import { useRouter } from "next/navigation";

export default function AccessDenied() {
  const supabase = createSupabaseBrowser();
  const router = useRouter();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-4">
      <Image
        src="/bvl-logo.png"
        alt="BlightVeil Logo"
        width={80}
        height={87}
        className="mb-6 opacity-50"
      />
      <h1 className="text-2xl font-bold text-foreground mb-2">Access Denied</h1>
      <p className="text-gray-400 mb-6 text-center max-w-md">
        You are not on the approved list. Contact a BlightVeil admin to request access.
      </p>
      <button
        onClick={handleLogout}
        className="px-4 py-2 border border-card-border text-gray-400 hover:text-white hover:border-purple rounded transition-colors cursor-pointer"
      >
        Sign Out
      </button>
    </div>
  );
}
