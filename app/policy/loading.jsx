export default function Loading() {
  return (
    <div className="mx-auto max-w-6xl space-y-4 animate-pulse">
      <div className="h-8 w-56 rounded bg-gray-200" />
      <div className="h-4 w-80 rounded bg-gray-200" />
      <div className="flex gap-2 overflow-hidden">
        <div className="h-10 w-16 rounded-full bg-gray-200" />
        <div className="h-10 w-20 rounded-full bg-gray-200" />
        <div className="h-10 w-24 rounded-full bg-gray-200" />
        <div className="h-10 w-20 rounded-full bg-gray-200" />
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="h-44 rounded-2xl bg-gray-200" />
        <div className="h-44 rounded-2xl bg-gray-200" />
        <div className="h-44 rounded-2xl bg-gray-200" />
        <div className="h-44 rounded-2xl bg-gray-200" />
      </div>
    </div>
  );
}
