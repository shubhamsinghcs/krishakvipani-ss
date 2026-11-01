import Link from "next/link";

const iconBgMap = {
  green: "bg-emerald-50 text-emerald-800 border border-emerald-100",
  yellow: "bg-amber-50 text-amber-800 border border-amber-100",
  blue: "bg-blue-50 text-blue-800 border border-blue-100",
  purple: "bg-purple-50 text-purple-800 border border-purple-100",
};

function CardInner({ title, subtitle, icon, color = "green", children, onClick, className = "" }) {
  return (
    <div
      onClick={onClick}
      className={`flex h-full min-h-0 flex-col bg-white border border-gray-200 rounded-2xl shadow-xs hover:border-emerald-300 hover:shadow-sm transition-all duration-200 p-4 md:p-6 ${className}`}
    >
      <div className="mb-3 flex items-start gap-3">
        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-sm font-bold ${
            iconBgMap[color] || iconBgMap.green
          }`}
        >
          {icon}
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="line-clamp-2 text-base font-bold text-gray-950">{title}</h3>
          {subtitle ? (
            <p className="mt-0.5 line-clamp-2 text-xs text-gray-600 font-medium">{subtitle}</p>
          ) : null}
        </div>
      </div>
      <div className="mt-auto min-h-0 flex-1">{children}</div>
    </div>
  );
}

export default function FeatureCard(props) {
  const { href } = props;

  if (href) {
    return (
      <Link href={href} className="block h-full min-h-0 focus:outline-none">
        <CardInner {...props} />
      </Link>
    );
  }

  return <CardInner {...props} />;
}
