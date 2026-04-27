import Link from "next/link";

const iconBgMap = {
  green: "bg-green-100 text-green-700",
  yellow: "bg-yellow-100 text-yellow-700",
  blue: "bg-blue-100 text-blue-700",
  purple: "bg-purple-100 text-purple-700",
};

function CardInner({ title, subtitle, icon, color = "green", children, onClick, className = "" }) {
  return (
    <div
      onClick={onClick}
      className={`flex h-full min-h-0 flex-col bg-white/70 backdrop-blur-lg border border-white/40 rounded-2xl shadow-xl hover:scale-[1.02] transition-all duration-300 p-4 md:p-6 ${className}`}
    >
      <div className="mb-3 flex items-start gap-3">
        <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-sm font-bold ${iconBgMap[color] || iconBgMap.green}`}>
          {icon}
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="line-clamp-2 text-base font-semibold text-brand-textDark">{title}</h3>
          {subtitle ? <p className="mt-0.5 line-clamp-2 text-xs text-gray-500">{subtitle}</p> : null}
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
      <Link href={href} className="block h-full min-h-0">
        <CardInner {...props} />
      </Link>
    );
  }

  return <CardInner {...props} />;
}
