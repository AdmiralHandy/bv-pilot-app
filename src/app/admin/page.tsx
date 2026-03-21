"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowser } from "@/lib/supabase-browser";
import { useAccess } from "@/lib/useAccess";
import Navbar from "@/components/Navbar";
import AccessDenied from "@/components/AccessDenied";

interface AllowedUser {
  id: string;
  discord_id: string;
  display_name: string | null;
  is_admin: boolean;
  created_at: string;
}

export default function AdminPage() {
  const { allowed, isAdmin } = useAccess();
  const router = useRouter();
  const supabase = createSupabaseBrowser();
  const [users, setUsers] = useState<AllowedUser[]>([]);
  const [discordId, setDiscordId] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchUsers = useCallback(async () => {
    const { data } = await supabase
      .from("allowed_users")
      .select("*")
      .order("created_at", { ascending: true });
    setUsers(data || []);
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    if (isAdmin) fetchUsers();
  }, [isAdmin, fetchUsers]);

  const addUser = async () => {
    if (!discordId.trim()) return;
    const { error } = await supabase.from("allowed_users").insert({
      discord_id: discordId.trim(),
      display_name: displayName.trim() || null,
    });
    if (!error) {
      setDiscordId("");
      setDisplayName("");
      fetchUsers();
    }
  };

  const removeUser = async (user: AllowedUser) => {
    if (user.is_admin) {
      alert("Cannot remove an admin. Remove admin status first.");
      return;
    }
    if (!confirm(`Remove access for ${user.display_name || user.discord_id}?`))
      return;
    const { error } = await supabase
      .from("allowed_users")
      .delete()
      .eq("id", user.id);
    if (!error) {
      setUsers(users.filter((u) => u.id !== user.id));
    }
  };

  const toggleAdmin = async (user: AllowedUser) => {
    const action = user.is_admin ? "remove admin from" : "make admin";
    if (!confirm(`${action} ${user.display_name || user.discord_id}?`)) return;
    const { error } = await supabase
      .from("allowed_users")
      .update({ is_admin: !user.is_admin })
      .eq("id", user.id);
    if (!error) {
      setUsers(
        users.map((u) =>
          u.id === user.id ? { ...u, is_admin: !u.is_admin } : u
        )
      );
    }
  };

  if (allowed === null) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-gray-500">Checking access...</p>
      </div>
    );
  }

  if (!allowed) return <AccessDenied />;

  if (!isAdmin) {
    return (
      <>
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-gray-500 mb-4">Admin access required.</p>
            <button
              onClick={() => router.push("/dashboard")}
              className="text-purple-light hover:text-purple cursor-pointer"
            >
              ← Back to Roster
            </button>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Navbar isAdmin={isAdmin} />
      <main className="flex-1 max-w-3xl mx-auto w-full px-6 py-8">
        <button
          onClick={() => router.push("/dashboard")}
          className="text-gray-500 hover:text-purple-light transition-colors mb-6 block cursor-pointer"
        >
          ← Back to Roster
        </button>

        <h1 className="text-2xl font-bold text-foreground mb-6">
          Manage Access
        </h1>

        {/* Add user form */}
        <div className="bg-card-bg border border-card-border rounded-lg p-4 mb-6">
          <h2 className="text-sm font-semibold text-purple-light mb-3">
            Add User
          </h2>
          <div className="flex gap-3 flex-wrap">
            <input
              type="text"
              value={discordId}
              onChange={(e) => setDiscordId(e.target.value)}
              placeholder="Discord User ID"
              className="flex-1 min-w-[200px] bg-input-bg border border-card-border rounded px-3 py-2 text-foreground placeholder:text-gray-600 focus:outline-none focus:border-purple"
            />
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Display name (optional)"
              className="flex-1 min-w-[150px] bg-input-bg border border-card-border rounded px-3 py-2 text-foreground placeholder:text-gray-600 focus:outline-none focus:border-purple"
            />
            <button
              onClick={addUser}
              className="px-6 py-2 bg-purple hover:bg-purple-dark text-white rounded transition-colors cursor-pointer"
            >
              Add
            </button>
          </div>
          <p className="text-xs text-gray-600 mt-2">
            To get a Discord User ID: enable Developer Mode in Discord settings,
            then right-click a username and select &quot;Copy User ID&quot;.
          </p>
        </div>

        {/* User list */}
        <div className="bg-card-bg border border-card-border rounded-lg overflow-hidden">
          <div className="px-4 py-3 border-b border-card-border">
            <h2 className="text-sm font-semibold text-purple-light">
              Approved Users ({users.length})
            </h2>
          </div>
          {loading ? (
            <div className="p-4 text-gray-500 text-sm">Loading...</div>
          ) : users.length === 0 ? (
            <div className="p-4 text-gray-500 text-sm">No users added yet.</div>
          ) : (
            <div className="divide-y divide-card-border">
              {users.map((user) => (
                <div
                  key={user.id}
                  className="px-4 py-3 flex items-center justify-between"
                >
                  <div>
                    <span className="text-foreground text-sm">
                      {user.display_name || "No name"}
                    </span>
                    <span className="text-gray-600 text-xs ml-2">
                      {user.discord_id}
                    </span>
                    {user.is_admin && (
                      <span className="ml-2 text-xs bg-purple/20 text-purple-light px-2 py-0.5 rounded">
                        Admin
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggleAdmin(user)}
                      className="text-xs text-gray-500 hover:text-purple-light transition-colors cursor-pointer"
                    >
                      {user.is_admin ? "Remove Admin" : "Make Admin"}
                    </button>
                    <button
                      onClick={() => removeUser(user)}
                      className="text-xs text-gray-600 hover:text-red-400 transition-colors cursor-pointer"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </>
  );
}
