export default function Loading() {
  return (
    <div className="mx-auto max-w-6xl space-y-4 animate-pulse">
      <div className="h-8 w-52 rounded bg-gray-200" />
      <div className="rounded-2xl bg-white p-4 shadow-sm">
        <div className="grid gap-3 md:grid-cols-3">
          <div className="h-11 rounded-xl bg-gray-200" />
          <div className="h-11 rounded-xl bg-gray-200" />
          <div className="h-11 rounded-xl bg-gray-200" />
        </div>
      </div>
      <div className="space-y-3">
        <div className="h-24 rounded-2xl bg-gray-200" />
        <div className="h-24 rounded-2xl bg-gray-200" />
        <div className="h-24 rounded-2xl bg-gray-200" />
      </div>
    </div>
  );
}
