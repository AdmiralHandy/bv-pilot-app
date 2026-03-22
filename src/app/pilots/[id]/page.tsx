"use client";

import { useState, useEffect, useCallback, use } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowser } from "@/lib/supabase-browser";
import { useAccess } from "@/lib/useAccess";
import Navbar from "@/components/Navbar";
import AccessDenied from "@/components/AccessDenied";
import SkullRating from "@/components/SkullRating";
import GoalList from "@/components/GoalList";
import TagBadge, { ALL_TAGS, getTagConfig } from "@/components/TagBadge";

interface Pilot {
  id: string;
  name: string;
  team_fighting: number;
  duelling: number;
  leadership: number;
  tags: string[];
  notes: string;
  notes_updated_at: string | null;
  updated_by: string | null;
}

interface Goal {
  id: string;
  title: string;
  completed: boolean;
  created_at: string;
}

export default function PilotDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { allowed, isAdmin, username } = useAccess();
  const supabase = createSupabaseBrowser();
  const [pilot, setPilot] = useState<Pilot | null>(null);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const [notes, setNotes] = useState("");
  const [notesSaved, setNotesSaved] = useState(true);
  const [notesSaving, setNotesSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchPilot = useCallback(async () => {
    const { data } = await supabase
      .from("pilots")
      .select("*")
      .eq("id", id)
      .single();
    if (data) {
      setPilot({ ...data, tags: data.tags || [], notes: data.notes || "" });
      setEditName(data.name);
      setNotes(data.notes || "");
    }
  }, [id, supabase]);

  const fetchGoals = useCallback(async () => {
    const { data } = await supabase
      .from("goals")
      .select("*")
      .eq("pilot_id", id)
      .order("created_at", { ascending: true });
    setGoals(data || []);
  }, [id, supabase]);

  useEffect(() => {
    const init = async () => {
      await Promise.all([fetchPilot(), fetchGoals()]);
      setLoading(false);
    };
    if (allowed) init();
  }, [fetchPilot, fetchGoals, allowed]);

  const updateSkill = async (
    skill: "team_fighting" | "duelling" | "leadership",
    value: number
  ) => {
    if (!pilot) return;
    const { error } = await supabase
      .from("pilots")
      .update({ [skill]: value, updated_by: username })
      .eq("id", id);
    if (!error) {
      setPilot({ ...pilot, [skill]: value, updated_by: username });
    }
  };

  const saveName = async () => {
    if (!editName.trim() || !pilot) return;
    const { error } = await supabase
      .from("pilots")
      .update({ name: editName.trim(), updated_by: username })
      .eq("id", id);
    if (!error) {
      setPilot({ ...pilot, name: editName.trim() });
      setEditing(false);
    }
  };

  const toggleTag = async (tag: string) => {
    if (!pilot) return;
    const newTags = pilot.tags.includes(tag)
      ? pilot.tags.filter((t) => t !== tag)
      : [...pilot.tags, tag];
    const { error } = await supabase
      .from("pilots")
      .update({ tags: newTags, updated_by: username })
      .eq("id", id);
    if (!error) {
      setPilot({ ...pilot, tags: newTags, updated_by: username });
    }
  };

  const saveNotes = async () => {
    if (!pilot) return;
    setNotesSaving(true);
    const now = new Date().toISOString();
    const { error } = await supabase
      .from("pilots")
      .update({ notes, notes_updated_at: now, updated_by: username })
      .eq("id", id);
    if (!error) {
      setPilot({ ...pilot, notes, notes_updated_at: now, updated_by: username });
      setNotesSaved(true);
    }
    setNotesSaving(false);
  };

  if (allowed === null || loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-gray-500">
          {allowed === null ? "Checking access..." : "Loading pilot..."}
        </p>
      </div>
    );
  }

  if (!allowed) {
    return <AccessDenied />;
  }

  if (!pilot) {
    return (
      <>
        <Navbar isAdmin={isAdmin} />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-gray-500 mb-4">Pilot not found.</p>
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

        {/* Pilot Name */}
        <div className="bg-card-bg border border-card-border rounded-lg p-6 mb-6">
          <div className="flex items-center gap-3 mb-1">
            {editing ? (
              <div className="flex items-center gap-2 flex-1">
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") saveName();
                    if (e.key === "Escape") setEditing(false);
                  }}
                  autoFocus
                  className="text-2xl font-bold bg-input-bg border border-card-border rounded px-2 py-1 text-foreground focus:outline-none focus:border-purple flex-1"
                />
                <button
                  onClick={saveName}
                  className="text-sm px-3 py-1 bg-purple text-white rounded cursor-pointer"
                >
                  Save
                </button>
                <button
                  onClick={() => {
                    setEditing(false);
                    setEditName(pilot.name);
                  }}
                  className="text-sm text-gray-500 hover:text-gray-300 cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <>
                <h1 className="text-2xl font-bold text-foreground">
                  {pilot.name}
                </h1>
                <button
                  onClick={() => setEditing(true)}
                  className="text-gray-600 hover:text-purple-light text-sm cursor-pointer"
                >
                  Edit
                </button>
              </>
            )}
          </div>
          {pilot.updated_by && (
            <p className="text-xs text-gray-600">
              Last updated by {pilot.updated_by}
            </p>
          )}
        </div>

        {/* Tags */}
        <div className="bg-card-bg border border-card-border rounded-lg p-6 mb-6">
          <h2 className="text-lg font-semibold text-purple-light mb-3">
            Tags
          </h2>

          {/* Current tags */}
          {pilot.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {pilot.tags.map((tag) => (
                <TagBadge
                  key={tag}
                  tag={tag}
                  size="md"
                  removable
                  onRemove={() => toggleTag(tag)}
                />
              ))}
            </div>
          )}

          {/* Add tags */}
          <div className="flex flex-wrap gap-2">
            {ALL_TAGS.filter((t) => !pilot.tags.includes(t)).map((tag) => {
              const config = getTagConfig(tag);
              return (
                <button
                  key={tag}
                  onClick={() => toggleTag(tag)}
                  className={`inline-flex items-center gap-1 border border-card-border rounded-full px-2.5 py-1 text-xs text-gray-500 hover:${config.color} hover:border-current transition-colors cursor-pointer`}
                >
                  {config.icon}
                  + {config.label}
                </button>
              );
            })}
          </div>
          {pilot.tags.length === 0 && (
            <p className="text-xs text-gray-600 mt-2">
              Click a tag above to add it.
            </p>
          )}
        </div>

        {/* Skills */}
        <div className="bg-card-bg border border-card-border rounded-lg p-6 mb-6">
          <h2 className="text-lg font-semibold text-purple-light mb-4">
            Skills
          </h2>
          <div className="space-y-3">
            <SkullRating
              label="Team Fighting"
              rating={pilot.team_fighting}
              onRate={(v) => updateSkill("team_fighting", v)}
            />
            <SkullRating
              label="Duelling"
              rating={pilot.duelling}
              onRate={(v) => updateSkill("duelling", v)}
            />
            <SkullRating
              label="Leadership"
              rating={pilot.leadership}
              onRate={(v) => updateSkill("leadership", v)}
            />
          </div>
        </div>

        {/* General Notes */}
        <div className="bg-card-bg border border-card-border rounded-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-purple-light">
              General Notes
            </h2>
            <div className="flex items-center gap-3">
              {pilot.notes_updated_at && (
                <p className="text-xs text-gray-600">
                  Last edited{" "}
                  {new Date(pilot.notes_updated_at).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                    hour: "numeric",
                    minute: "2-digit",
                  })}
                </p>
              )}
              {!notesSaved && (
                <button
                  onClick={saveNotes}
                  disabled={notesSaving}
                  className="text-sm px-3 py-1 bg-purple text-white rounded hover:bg-purple/80 transition-colors cursor-pointer disabled:opacity-50"
                >
                  {notesSaving ? "Saving..." : "Save"}
                </button>
              )}
            </div>
          </div>
          <textarea
            value={notes}
            onChange={(e) => {
              setNotes(e.target.value);
              setNotesSaved(false);
            }}
            placeholder="Add general notes about this pilot..."
            rows={5}
            className="w-full bg-input-bg border border-card-border rounded-lg px-3 py-2 text-sm text-foreground placeholder-gray-600 focus:outline-none focus:border-purple resize-y"
          />
          {notesSaved && notes.length > 0 && (
            <p className="text-xs text-green-600 mt-1">✓ Saved</p>
          )}
        </div>

        {/* Goals */}
        <div className="bg-card-bg border border-card-border rounded-lg p-6">
          <GoalList pilotId={id} initialGoals={goals} username={username} />
        </div>
      </main>
    </>
  );
}
