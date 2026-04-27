export default function EmptyState({ icon = null, title, description, action = null }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-green-200 bg-white p-6 text-center shadow-sm">
      {icon ? <div className="mb-3 text-3xl">{icon}</div> : null}
      <h3 className="text-base font-semibold text-brand-textDark">{title}</h3>
      <p className="mt-1 text-sm text-gray-500">{description}</p>
      {action ? <div className="mt-4 w-full sm:w-auto">{action}</div> : null}
    </div>
  );
}
