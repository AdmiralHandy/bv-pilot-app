"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { createSupabaseBrowser } from "@/lib/supabase-browser";
import { useAccess } from "@/lib/useAccess";
import Navbar from "@/components/Navbar";
import PilotCard from "@/components/PilotCard";
import AccessDenied from "@/components/AccessDenied";

interface Goal {
  id: string;
  title: string;
  completed: boolean;
}

interface Pilot {
  id: string;
  name: string;
  team_fighting: number;
  duelling: number;
  leadership: number;
  goals: Goal[];
}

export default function DashboardPage() {
  const { allowed, isAdmin } = useAccess();
  const [pilots, setPilots] = useState<Pilot[]>([]);
  const [newName, setNewName] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const supabase = createSupabaseBrowser();

  const fetchPilots = useCallback(async () => {
    const { data } = await supabase
      .from("pilots")
      .select("*, goals(*)")
      .order("name", { ascending: true });
    setPilots(data || []);
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    fetchPilots();
  }, [fetchPilots]);

  const addPilot = async () => {
    if (!newName.trim()) return;
    const { error } = await supabase
      .from("pilots")
      .insert({ name: newName.trim() });
    if (!error) {
      setNewName("");
      setShowForm(false);
      fetchPilots();
    }
  };

  const deletePilot = async (id: string) => {
    const { error } = await supabase.from("pilots").delete().eq("id", id);
    if (!error) {
      setPilots(pilots.filter((p) => p.id !== id));
    }
  };

  if (allowed === null) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-gray-500">Checking access...</p>
      </div>
    );
  }

  if (!allowed) {
    return <AccessDenied />;
  }

  return (
    <>
      <Navbar isAdmin={isAdmin} />
      <main className="flex-1 max-w-6xl mx-auto w-full px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-foreground">Pilot Roster</h1>
          <button
            onClick={() => setShowForm(!showForm)}
            className="px-4 py-2 bg-purple hover:bg-purple-dark text-white font-medium rounded-lg transition-colors cursor-pointer"
          >
            {showForm ? "Cancel" : "+ Add Pilot"}
          </button>
        </div>

        {showForm && (
          <div className="bg-card-bg border border-card-border rounded-lg p-4 mb-6">
            <div className="flex gap-3">
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addPilot()}
                placeholder="Pilot name..."
                autoFocus
                className="flex-1 bg-input-bg border border-card-border rounded px-3 py-2 text-foreground placeholder:text-gray-600 focus:outline-none focus:border-purple"
              />
              <button
                onClick={addPilot}
                className="px-6 py-2 bg-purple hover:bg-purple-dark text-white rounded transition-colors cursor-pointer"
              >
                Create
              </button>
            </div>
          </div>
        )}

        {loading ? (
          <div className="text-center text-gray-500 py-12">Loading roster...</div>
        ) : pilots.length === 0 ? (
          <div className="text-center py-12">
            <Image
              src="/bvl-logo.png"
              alt="BlightVeil Logo"
              width={64}
              height={70}
              className="mx-auto mb-4 opacity-30"
            />
            <p className="text-gray-500">No pilots yet. Add your first pilot to get started.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {pilots.map((pilot) => {
              const openGoal = pilot.goals?.find((g) => !g.completed);
              return (
                <PilotCard
                  key={pilot.id}
                  pilot={pilot}
                  openGoal={openGoal?.title}
                  onDelete={deletePilot}
                />
              );
            })}
          </div>
        )}
      </main>
    </>
  );
}
