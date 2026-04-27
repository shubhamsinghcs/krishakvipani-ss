export default function Loading() {
  return (
    <div className="mx-auto max-w-5xl space-y-4 animate-pulse">
      <div className="h-8 w-44 rounded bg-gray-200" />
      <div className="flex gap-2">
        <div className="h-11 flex-1 rounded-xl bg-gray-200" />
        <div className="h-11 w-24 rounded-xl bg-gray-200" />
      </div>
      <div className="h-56 rounded-2xl bg-gray-200" />
      <div className="h-20 rounded-2xl bg-gray-200" />
      <div className="h-16 rounded-2xl bg-gray-200" />
      <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
        <div className="h-24 rounded-xl bg-gray-200" />
        <div className="h-24 rounded-xl bg-gray-200" />
        <div className="h-24 rounded-xl bg-gray-200" />
        <div className="h-24 rounded-xl bg-gray-200" />
        <div className="h-24 rounded-xl bg-gray-200" />
      </div>
    </div>
  );
}
