const sizeClass = {
  sm: "h-5 w-5 border-2",
  md: "h-8 w-8 border-[3px]",
  lg: "h-12 w-12 border-4",
};

const colorClass = {
  green: "border-green-600 border-t-transparent",
  blue: "border-blue-600 border-t-transparent",
  yellow: "border-yellow-600 border-t-transparent",
};

export default function LoadingSpinner({ size = "md", color = "green" }) {
  return <div className={`animate-spin rounded-full ${sizeClass[size] || sizeClass.md} ${colorClass[color] || colorClass.green}`} />;
}

export function FullPageLoader({ text = "Loading..." }) {
  return (
    <div className="flex min-h-[240px] flex-col items-center justify-center gap-3">
      <LoadingSpinner size="lg" color="green" />
      <p className="text-sm text-gray-600">{text}</p>
    </div>
  );
}
