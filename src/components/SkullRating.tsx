"use client";

interface SkullRatingProps {
  rating: number;
  onRate?: (rating: number) => void;
  label: string;
  readonly?: boolean;
  size?: "sm" | "md";
}

function SkullIcon({ filled, size }: { filled: boolean; size: "sm" | "md" }) {
  const px = size === "sm" ? "w-5 h-5" : "w-7 h-7";
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      className={`${px} transition-colors ${
        filled ? "text-purple" : "text-gray-600"
      }`}
    >
      <path d="M12 2C7.03 2 3 5.58 3 10c0 2.13 1.07 4.06 2.77 5.43L5 18.5C5 19.33 5.67 20 6.5 20H8v1.5c0 .28.22.5.5.5h7c.28 0 .5-.22.5-.5V20h1.5c.83 0 1.5-.67 1.5-1.5l-.77-3.07C19.93 14.06 21 12.13 21 10c0-4.42-4.03-8-9-8zM9 13c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm6 0c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z" />
    </svg>
  );
}

export default function SkullRating({
  rating,
  onRate,
  label,
  readonly = false,
  size = "md",
}: SkullRatingProps) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-gray-400 min-w-[110px]">{label}</span>
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((i) => (
          <button
            key={i}
            type="button"
            disabled={readonly}
            onClick={() => onRate?.(i)}
            className={`${
              readonly ? "cursor-default" : "cursor-pointer hover:scale-110"
            } transition-transform`}
          >
            <SkullIcon filled={i <= rating} size={size} />
          </button>
        ))}
      </div>
    </div>
  );
}
