export default function EmptyState({ icon = null, title, description, action = null }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-300 bg-white p-8 text-center shadow-xs">
      {icon ? <div className="mb-3 text-3xl">{icon}</div> : null}
      <h3 className="text-base font-bold text-gray-950">{title}</h3>
      <p className="mt-1 text-xs sm:text-sm text-gray-600 max-w-sm leading-relaxed">{description}</p>
      {action ? <div className="mt-4 w-full sm:w-auto">{action}</div> : null}
    </div>
  );
}
