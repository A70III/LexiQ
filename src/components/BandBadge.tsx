interface BandBadgeProps {
  band: number;
  size?: "sm" | "md" | "lg";
  highlight?: "green" | "red" | undefined;
}

const bandColor = (band: number, highlight?: "green" | "red") => {
  if (highlight === "green") return "from-green-400 to-green-500";
  if (highlight === "red") return "from-red-400 to-red-500";
  if (band >= 8) return "from-green-400 to-green-500";
  if (band >= 7) return "from-blue-400 to-blue-500";
  if (band >= 6) return "from-yellow-400 to-amber-500";
  if (band >= 5) return "from-orange-400 to-orange-500";
  return "from-red-400 to-red-500";
};

export default function BandBadge({ band, size = "md", highlight }: BandBadgeProps) {
  const sizeClass = size === "sm" ? "text-xs px-1.5 py-0.5" : size === "lg" ? "text-lg px-3 py-1.5" : "text-sm px-2 py-1";
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full font-bold bg-gradient-to-br ${bandColor(band, highlight)} ${sizeClass}`}
      style={{
        textShadow: "0 1px 1px rgba(0,0,0,0.15)",
        boxShadow: "0 1px 3px rgba(0,0,0,0.15)",
      }}
    >
      {band.toFixed(1)}
    </span>
  );
}
