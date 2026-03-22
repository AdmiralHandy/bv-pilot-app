"use client";

import React from "react";

const TAG_CONFIG: Record<string, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
  comp_team: {
    label: "Comp Team",
    color: "text-yellow-400",
    bg: "bg-yellow-400/10 border-yellow-400/30",
    icon: (
      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
        <path d="M5 3h14l-1.5 6H18a3 3 0 01-3 3h-1v3h2l-4 6-4-6h2v-3H9a3 3 0 01-3-3h-.5L5 3zm2.5 2l.75 3H8a1 1 0 001 1h6a1 1 0 001-1h-.25L16.5 5h-9z" />
      </svg>
    ),
  },
  knights: {
    label: "Knights",
    color: "text-red-400",
    bg: "bg-red-400/10 border-red-400/30",
    icon: (
      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2C9 2 7 4 7 7v3H5v4l2 1v2l-2 3v2h14v-2l-2-3v-2l2-1v-4h-2V7c0-3-2-5-5-5zm-2 5c0-1.7 1-3 2-3s2 1.3 2 3v3h-4V7zm-1 8.5l1-.5v2l-1.5 2.5H11V15.5zm4 4h1.5L13 17v-2l1 .5v4z" />
      </svg>
    ),
  },
  legion: {
    label: "Legion",
    color: "text-blue-400",
    bg: "bg-blue-400/10 border-blue-400/30",
    icon: (
      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2L4 5v6.09c0 5.05 3.41 9.76 8 10.91 4.59-1.15 8-5.86 8-10.91V5l-8-3zm0 2.18l6 2.25v4.66c0 4.15-2.76 7.94-6 8.83-3.24-.89-6-4.68-6-8.83V6.43l6-2.25z" />
      </svg>
    ),
  },
  aux: {
    label: "Aux",
    color: "text-gray-400",
    bg: "bg-gray-400/10 border-gray-400/30",
    icon: (
      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2C9.24 2 7 4.24 7 7c0 1.47.63 2.8 1.64 3.72C6.42 12.08 5 14.38 5 17v2a1 1 0 001 1h12a1 1 0 001-1v-2c0-2.62-1.42-4.92-3.64-6.28A4.99 4.99 0 0017 7c0-2.76-2.24-5-5-5zm0 2a3 3 0 013 3 3 3 0 01-3 3 3 3 0 01-3-3 3 3 0 013-3zm-1 7.9V14l-1.5 1.5L11 17h2l1.5-1.5L13 14v-2.1a5.4 5.4 0 00-2 0zM7.1 18c.26-2.06 1.5-3.78 3.3-4.68L11 14.5V17H7.1zm6.6-4.68c1.8.9 3.04 2.62 3.3 4.68H13v-2.5l.7-1.18z" />
      </svg>
    ),
  },
  trial: {
    label: "Trial",
    color: "text-green-400",
    bg: "bg-green-400/10 border-green-400/30",
    icon: (
      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
        <path d="M17 8C8 10 5.9 16.17 3.82 21.34l1.89.66.95-2.3c.48.17.98.3 1.34.3C19 20 22 3 22 3c-1 2-8 2.25-13 3.25S2 11.5 2 13.5s1.75 3.75 1.75 3.75C7 8 17 8 17 8z" />
      </svg>
    ),
  },
  inactive: {
    label: "Inactive",
    color: "text-teal-400",
    bg: "bg-teal-400/10 border-teal-400/30",
    icon: (
      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
        <path d="M2 4h3v1H2V4zm5 0h3v1H7V4zm-5 3h5v1H2V7zm7 0h3v1H9V7zm-3 3h5v1H6v-1zm7 0h3v1h-3v-1zM12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" />
      </svg>
    ),
  },
};

export const ALL_TAGS = Object.keys(TAG_CONFIG);

export function getTagConfig(tag: string) {
  return TAG_CONFIG[tag];
}

export default function TagBadge({
  tag,
  size = "sm",
  removable = false,
  onRemove,
}: {
  tag: string;
  size?: "sm" | "md";
  removable?: boolean;
  onRemove?: () => void;
}) {
  const config = TAG_CONFIG[tag];
  if (!config) return null;

  return (
    <span
      className={`inline-flex items-center gap-1 border rounded-full ${config.color} ${config.bg} ${
        size === "sm" ? "px-2 py-0.5 text-xs" : "px-3 py-1 text-sm"
      }`}
    >
      {config.icon}
      {config.label}
      {removable && onRemove && (
        <button
          onClick={onRemove}
          className="ml-0.5 hover:opacity-70 cursor-pointer"
        >
          ✕
        </button>
      )}
    </span>
  );
}
