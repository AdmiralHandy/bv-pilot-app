"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect, useCallback, useMemo } from "react";
import Image from "next/image";
import { createSupabaseBrowser } from "@/lib/supabase-browser";
import { useAccess } from "@/lib/useAccess";
import Navbar from "@/components/Navbar";
import PilotCard from "@/components/PilotCard";
import AccessDenied from "@/components/AccessDenied";
import FilterPanel, {
  Filters,
  DEFAULT_FILTERS,
  hasActiveFilters,
} from "@/components/FilterPanel";

interface Goal {
  id: string;
  title: string;
  completed: boolean;
  created_at: string;
}

interface Pilot {
  id: string;
  name: string;
  team_fighting: number;
  duelling: number;
  leadership: number;
  tags: string[];
  created_at: string;
  goals: Goal[];
}

export default function DashboardPage() {
  const { allowed, isAdmin } = useAccess();
  const [pilots, setPilots] = useState<Pilot[]>([]);
  const [newName, setNewName] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);
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

  const filteredPilots = useMemo(() => {
    let result = pilots;

    // Search by name
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      result = result.filter((p) => p.name.toLowerCase().includes(q));
    }

    // Filter by tags
    if (filters.tags.length > 0) {
      result = result.filter((p) =>
        filters.tags.some((t) => p.tags?.includes(t))
      );
    }

    // Filter by skill ratings
    if (filters.teamFighting.value !== null) {
      const v = filters.teamFighting.value;
      result = result.filter((p) =>
        filters.teamFighting.direction === "lte"
          ? p.team_fighting <= v
          : p.team_fighting >= v
      );
    }
    if (filters.duelling.value !== null) {
      const v = filters.duelling.value;
      result = result.filter((p) =>
        filters.duelling.direction === "lte"
          ? p.duelling <= v
          : p.duelling >= v
      );
    }
    if (filters.leadership.value !== null) {
      const v = filters.leadership.value;
      result = result.filter((p) =>
        filters.leadership.direction === "lte"
          ? p.leadership <= v
          : p.leadership >= v
      );
    }

    // Filter by no open goal
    if (filters.noOpenGoal) {
      result = result.filter(
        (p) => !p.goals?.some((g) => !g.completed)
      );
    }

    // Filter by date added
    if (filters.dateFrom) {
      const from = new Date(filters.dateFrom);
      result = result.filter((p) => new Date(p.created_at) >= from);
    }
    if (filters.dateTo) {
      const to = new Date(filters.dateTo + "T23:59:59");
      result = result.filter((p) => new Date(p.created_at) <= to);
    }

    return result;
  }, [pilots, search, filters]);

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
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-foreground">Pilot Roster</h1>
          <button
            onClick={() => setShowForm(!showForm)}
            className="px-4 py-2 bg-purple hover:bg-purple-dark text-white font-medium rounded-lg transition-colors cursor-pointer"
          >
            {showForm ? "Cancel" : "+ Add Pilot"}
          </button>
        </div>

        {showForm && (
          <div className="bg-card-bg border border-card-border rounded-lg p-4 mb-4">
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

        {/* Search Bar */}
        <div className="mb-4">
          <div className="relative">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search pilots..."
              className="w-full bg-input-bg border border-card-border rounded-lg pl-10 pr-3 py-2 text-foreground placeholder:text-gray-600 focus:outline-none focus:border-purple"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 cursor-pointer"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Filters */}
        <FilterPanel filters={filters} onChange={setFilters} />

        {/* Results count when filtering */}
        {(search || hasActiveFilters(filters)) && (
          <p className="text-xs text-gray-500 mb-3">
            Showing {filteredPilots.length} of {pilots.length} pilots
          </p>
        )}

        {loading ? (
          <div className="text-center text-gray-500 py-12">
            Loading roster...
          </div>
        ) : pilots.length === 0 ? (
          <div className="text-center py-12">
            <Image
              src="/bvl-logo.png"
              alt="BlightVeil Logo"
              width={64}
              height={70}
              className="mx-auto mb-4 opacity-30"
            />
            <p className="text-gray-500">
              No pilots yet. Add your first pilot to get started.
            </p>
          </div>
        ) : filteredPilots.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No pilots match your filters.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredPilots.map((pilot) => {
              const openGoal = pilot.goals?.find((g) => !g.completed);
              return (
                <PilotCard
                  key={pilot.id}
                  pilot={pilot}
                  openGoal={openGoal?.title}
                  goalDate={openGoal?.created_at}
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
