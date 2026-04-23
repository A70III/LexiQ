interface ProgressBarProps {
  value: number; // 0-100
  color?: string;
  size?: "sm" | "md";
}

export default function ProgressBar({ value, color = "#007AFF", size = "md" }: ProgressBarProps) {
  const clamped = Math.min(100, Math.max(0, value));
  const height = size === "sm" ? "h-1.5" : "h-2.5";
  return (
    <div className={`w-full bg-gray-200/70 rounded-full ${height} overflow-hidden`}>
      <div
        className={`${height} rounded-full transition-all duration-500 ease-out`}
        style={{
          width: `${clamped}%`,
          backgroundColor: color,
          boxShadow: clamped > 0 ? `inset 0 1px 1px rgba(255,255,255,0.3)` : "none",
        }}
      />
    </div>
  );
}
