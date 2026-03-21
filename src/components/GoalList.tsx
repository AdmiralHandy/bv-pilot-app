"use client";

import { useState } from "react";
import { createSupabaseBrowser } from "@/lib/supabase-browser";
import GoalNotes from "./GoalNotes";

interface Goal {
  id: string;
  title: string;
  completed: boolean;
  created_at: string;
}

export default function GoalList({
  pilotId,
  initialGoals,
  username,
}: {
  pilotId: string;
  initialGoals: Goal[];
  username: string;
}) {
  const [goals, setGoals] = useState<Goal[]>(initialGoals);
  const [newGoal, setNewGoal] = useState("");
  const [expandedGoal, setExpandedGoal] = useState<string | null>(null);
  const supabase = createSupabaseBrowser();

  const hasOpenGoal = goals.some((g) => !g.completed);

  const addGoal = async () => {
    if (!newGoal.trim() || hasOpenGoal) return;
    const { data, error } = await supabase
      .from("goals")
      .insert({ pilot_id: pilotId, title: newGoal.trim() })
      .select()
      .single();
    if (!error && data) {
      setGoals([...goals, data]);
      setNewGoal("");
    }
  };

  const toggleComplete = async (goal: Goal) => {
    const { error } = await supabase
      .from("goals")
      .update({ completed: !goal.completed })
      .eq("id", goal.id);
    if (!error) {
      setGoals(
        goals.map((g) =>
          g.id === goal.id ? { ...g, completed: !g.completed } : g
        )
      );
    }
  };

  const deleteGoal = async (id: string) => {
    const { error } = await supabase.from("goals").delete().eq("id", id);
    if (!error) {
      setGoals(goals.filter((g) => g.id !== id));
      if (expandedGoal === id) setExpandedGoal(null);
    }
  };

  return (
    <div>
      <h2 className="text-lg font-semibold text-purple-light mb-3">Goals</h2>

      {hasOpenGoal ? (
        <p className="text-xs text-gray-500 mb-4">
          Complete the current goal before adding a new one.
        </p>
      ) : (
        <div className="flex gap-2 mb-4">
          <input
            type="text"
            value={newGoal}
            onChange={(e) => setNewGoal(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addGoal()}
            placeholder="Add a new goal..."
            className="flex-1 bg-input-bg border border-card-border rounded px-3 py-2 text-sm text-foreground placeholder:text-gray-600 focus:outline-none focus:border-purple"
          />
          <button
            onClick={addGoal}
            className="px-4 py-2 bg-purple hover:bg-purple-dark text-white text-sm rounded transition-colors cursor-pointer"
          >
            Add
          </button>
        </div>
      )}

      {goals.length === 0 ? (
        <p className="text-gray-600 text-sm">No goals yet.</p>
      ) : (
        <div className="space-y-2">
          {goals.map((goal) => (
            <div key={goal.id}>
              <div className="flex items-center gap-3 bg-input-bg border border-card-border rounded px-3 py-2">
                <button
                  onClick={() => toggleComplete(goal)}
                  className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors cursor-pointer ${
                    goal.completed
                      ? "bg-purple border-purple text-white"
                      : "border-gray-600 hover:border-purple"
                  }`}
                >
                  {goal.completed && (
                    <svg
                      className="w-3 h-3"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={3}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  )}
                </button>
                <span
                  className={`flex-1 text-sm ${
                    goal.completed
                      ? "line-through text-gray-600"
                      : "text-foreground"
                  }`}
                >
                  {goal.title}
                </span>
                <button
                  onClick={() =>
                    setExpandedGoal(expandedGoal === goal.id ? null : goal.id)
                  }
                  className="text-gray-500 hover:text-purple-light text-xs cursor-pointer"
                >
                  {expandedGoal === goal.id ? "Hide Notes" : "Notes"}
                </button>
                <button
                  onClick={() => {
                    if (confirm("Delete this goal?")) deleteGoal(goal.id);
                  }}
                  className="text-gray-600 hover:text-red-400 transition-colors cursor-pointer text-sm"
                >
                  ✕
                </button>
              </div>
              {expandedGoal === goal.id && (
                <GoalNotes goalId={goal.id} username={username} />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
