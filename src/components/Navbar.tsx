"use client";

import { createSupabaseBrowser } from "@/lib/supabase-browser";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";

export default function Navbar({ isAdmin = false }: { isAdmin?: boolean }) {
  const router = useRouter();
  const supabase = createSupabaseBrowser();
  const [username, setUsername] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        setUsername(
          user.user_metadata?.full_name ||
            user.user_metadata?.name ||
            user.email ||
            "Pilot"
        );
      }
    });
  }, [supabase]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  return (
    <nav className="border-b border-card-border bg-card-bg px-6 py-3">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        <Link href="/dashboard" className="flex items-center gap-2">
          <Image
            src="/bvl-logo.png"
            alt="BlightVeil Logo"
            width={32}
            height={35}
          />
          <span className="text-lg font-bold text-purple-light">
            BlightVeil
          </span>
        </Link>
        <div className="flex items-center gap-4">
          {isAdmin && (
            <Link
              href="/admin"
              className="text-sm text-gray-400 hover:text-purple-light transition-colors"
            >
              Manage Access
            </Link>
          )}
          {username && (
            <span className="text-sm text-gray-400">{username}</span>
          )}
          <button
            onClick={handleLogout}
            className="text-sm px-3 py-1.5 rounded border border-card-border text-gray-400 hover:text-white hover:border-purple transition-colors cursor-pointer"
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}
