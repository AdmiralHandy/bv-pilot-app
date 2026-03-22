"use client";

import Link from "next/link";
import SkullRating from "./SkullRating";
import TagBadge from "./TagBadge";

interface Pilot {
  id: string;
  name: string;
  team_fighting: number;
  duelling: number;
  leadership: number;
  tags: string[];
}

export default function PilotCard({
  pilot,
  openGoal,
  goalDate,
  onDelete,
}: {
  pilot: Pilot;
  openGoal?: string;
  goalDate?: string;
  onDelete: (id: string) => void;
}) {
  const formattedDate = goalDate
    ? new Date(goalDate).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : null;

  return (
    <div className="bg-card-bg border border-card-border rounded-lg p-4 hover:border-purple/50 transition-colors">
      <div className="flex items-start justify-between mb-2">
        <Link
          href={`/pilots/${pilot.id}`}
          className="text-lg font-semibold text-purple-light hover:text-purple transition-colors"
        >
          {pilot.name}
        </Link>
        <button
          onClick={() => {
            if (confirm(`Delete pilot "${pilot.name}"?`)) {
              onDelete(pilot.id);
            }
          }}
          className="text-gray-600 hover:text-red-400 transition-colors cursor-pointer text-sm"
          title="Delete pilot"
        >
          ✕
        </button>
      </div>

      {/* Tags */}
      {pilot.tags && pilot.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-3">
          {pilot.tags.map((tag) => (
            <TagBadge key={tag} tag={tag} size="sm" />
          ))}
        </div>
      )}

      <div className="space-y-1">
        <SkullRating
          label="Team Fighting"
          rating={pilot.team_fighting}
          readonly
          size="sm"
        />
        <SkullRating
          label="Duelling"
          rating={pilot.duelling}
          readonly
          size="sm"
        />
        <SkullRating
          label="Leadership"
          rating={pilot.leadership}
          readonly
          size="sm"
        />
      </div>
      {openGoal && (
        <div className="mt-3 pt-3 border-t border-card-border">
          <div className="flex items-center justify-between mb-1">
            <p className="text-xs text-gray-500">Current Goal</p>
            {formattedDate && (
              <p className="text-xs text-gray-600">{formattedDate}</p>
            )}
          </div>
          <p className="text-sm text-purple-light truncate">{openGoal}</p>
        </div>
      )}
      <Link
        href={`/pilots/${pilot.id}`}
        className="mt-3 block text-center text-sm text-gray-500 hover:text-purple-light transition-colors"
      >
        View Details →
      </Link>
    </div>
  );
}
