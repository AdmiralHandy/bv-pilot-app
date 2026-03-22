"use client";

import { useState } from "react";
import TagBadge, { ALL_TAGS, getTagConfig } from "./TagBadge";

export interface Filters {
  tags: string[];
  teamFightingMax: number | null;
  duellingMax: number | null;
  leadershipMax: number | null;
  noOpenGoal: boolean;
  dateFrom: string;
  dateTo: string;
}

export const DEFAULT_FILTERS: Filters = {
  tags: [],
  teamFightingMax: null,
  duellingMax: null,
  leadershipMax: null,
  noOpenGoal: false,
  dateFrom: "",
  dateTo: "",
};

export function hasActiveFilters(filters: Filters): boolean {
  return (
    filters.tags.length > 0 ||
    filters.teamFightingMax !== null ||
    filters.duellingMax !== null ||
    filters.leadershipMax !== null ||
    filters.noOpenGoal ||
    filters.dateFrom !== "" ||
    filters.dateTo !== ""
  );
}

export default function FilterPanel({
  filters,
  onChange,
}: {
  filters: Filters;
  onChange: (f: Filters) => void;
}) {
  const [open, setOpen] = useState(false);

  const toggleTag = (tag: string) => {
    const tags = filters.tags.includes(tag)
      ? filters.tags.filter((t) => t !== tag)
      : [...filters.tags, tag];
    onChange({ ...filters, tags });
  };

  const setSkillFilter = (
    skill: "teamFightingMax" | "duellingMax" | "leadershipMax",
    value: string
  ) => {
    const num = value === "" ? null : parseInt(value);
    onChange({ ...filters, [skill]: num });
  };

  const active = hasActiveFilters(filters);

  return (
    <div className="mb-4">
      <button
        onClick={() => setOpen(!open)}
        className={`flex items-center gap-2 px-3 py-1.5 text-sm rounded-lg border transition-colors cursor-pointer ${
          active
            ? "border-purple bg-purple/10 text-purple-light"
            : "border-card-border text-gray-400 hover:border-purple/50"
        }`}
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
        </svg>
        Filters{active ? ` (active)` : ""}
        {active && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onChange(DEFAULT_FILTERS);
            }}
            className="text-xs text-gray-500 hover:text-red-400 ml-1 cursor-pointer"
          >
            Clear
          </button>
        )}
      </button>

      {open && (
        <div className="mt-2 bg-card-bg border border-card-border rounded-lg p-4 space-y-4">
          {/* Tags */}
          <div>
            <p className="text-xs text-gray-500 mb-2 font-medium uppercase tracking-wider">Tags</p>
            <div className="flex flex-wrap gap-2">
              {ALL_TAGS.map((tag) => {
                const config = getTagConfig(tag);
                const selected = filters.tags.includes(tag);
                return (
                  <button
                    key={tag}
                    onClick={() => toggleTag(tag)}
                    className={`inline-flex items-center gap-1 border rounded-full px-2.5 py-1 text-xs cursor-pointer transition-all ${
                      selected
                        ? `${config.color} ${config.bg} ring-1 ring-current`
                        : `text-gray-500 border-card-border hover:border-gray-500`
                    }`}
                  >
                    {config.icon}
                    {config.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Skill Filters */}
          <div>
            <p className="text-xs text-gray-500 mb-2 font-medium uppercase tracking-wider">
              Skill Rating (at or below)
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {([
                ["teamFightingMax", "Team Fighting"],
                ["duellingMax", "Duelling"],
                ["leadershipMax", "Leadership"],
              ] as const).map(([key, label]) => (
                <div key={key}>
                  <label className="text-xs text-gray-400 block mb-1">{label}</label>
                  <select
                    value={filters[key] ?? ""}
                    onChange={(e) => setSkillFilter(key, e.target.value)}
                    className="w-full bg-input-bg border border-card-border rounded px-2 py-1.5 text-sm text-foreground focus:outline-none focus:border-purple cursor-pointer"
                  >
                    <option value="">Any</option>
                    <option value="1">☠ 1 or less</option>
                    <option value="2">☠ 2 or less</option>
                    <option value="3">☠ 3 or less</option>
                    <option value="4">☠ 4 or less</option>
                    <option value="5">☠ 5 or less</option>
                  </select>
                </div>
              ))}
            </div>
          </div>

          {/* Goal filter */}
          <div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={filters.noOpenGoal}
                onChange={(e) =>
                  onChange({ ...filters, noOpenGoal: e.target.checked })
                }
                className="accent-purple-600"
              />
              <span className="text-sm text-gray-300">No open goal</span>
            </label>
          </div>

          {/* Date filter */}
          <div>
            <p className="text-xs text-gray-500 mb-2 font-medium uppercase tracking-wider">Date Added</p>
            <div className="flex items-center gap-2">
              <input
                type="date"
                value={filters.dateFrom}
                onChange={(e) => onChange({ ...filters, dateFrom: e.target.value })}
                className="bg-input-bg border border-card-border rounded px-2 py-1.5 text-sm text-foreground focus:outline-none focus:border-purple"
              />
              <span className="text-gray-500 text-sm">to</span>
              <input
                type="date"
                value={filters.dateTo}
                onChange={(e) => onChange({ ...filters, dateTo: e.target.value })}
                className="bg-input-bg border border-card-border rounded px-2 py-1.5 text-sm text-foreground focus:outline-none focus:border-purple"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
