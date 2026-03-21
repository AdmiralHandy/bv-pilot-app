"use client";

import Link from "next/link";
import SkullRating from "./SkullRating";

interface Pilot {
  id: string;
  name: string;
  team_fighting: number;
  duelling: number;
  leadership: number;
}

export default function PilotCard({
  pilot,
  openGoal,
  onDelete,
}: {
  pilot: Pilot;
  openGoal?: string;
  onDelete: (id: string) => void;
}) {
  return (
    <div className="bg-card-bg border border-card-border rounded-lg p-4 hover:border-purple/50 transition-colors">
      <div className="flex items-start justify-between mb-3">
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
          <p className="text-xs text-gray-500 mb-1">Current Goal</p>
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
