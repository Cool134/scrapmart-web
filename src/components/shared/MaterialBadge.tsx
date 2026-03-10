export function MaterialBadge({ material }: { material: string }) {
  const m = material?.toLowerCase() || 'unknown';
  const colors: Record<string, string> = {
    steel: "bg-blue-100 text-blue-800",
    aluminum: "bg-gray-100 text-gray-800",
    copper: "bg-orange-100 text-orange-800",
    iron: "bg-red-100 text-red-800",
    brass: "bg-yellow-100 text-yellow-800",
    unknown: "bg-purple-100 text-purple-800",
  };
  return (
    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${colors[m] || colors.unknown}`}>
      {material || 'Unknown'}
    </span>
  );
}
