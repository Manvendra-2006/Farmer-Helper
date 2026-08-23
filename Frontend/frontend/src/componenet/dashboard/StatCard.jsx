export default function StatCard({ label, value, tone = "default", Icon, onClick }) {
  const tones = {
    default: "text-slate-800",
    danger: "text-red-600",
    warning: "text-amber-600",
    success: "text-emerald-600",
  };

  const clickable = typeof onClick === "function";
  const Wrapper = clickable ? "button" : "div";

  return (
    <Wrapper
      onClick={onClick}
      type={clickable ? "button" : undefined}
      className={`bg-white rounded-2xl p-5 shadow-sm border border-slate-100 flex items-start justify-between text-left w-full transition-all ${
        clickable ? "hover:shadow-md hover:border-emerald-200 cursor-pointer" : ""
      }`}
    >
      <div>
        <p className="text-xs font-medium text-slate-500 mb-1">{label}</p>
        <p className={`text-2xl font-bold ${tones[tone] || tones.default}`}>
          {value}
        </p>
      </div>
      {Icon && (
        <div className="w-9 h-9 rounded-lg bg-emerald-50 flex items-center justify-center">
          <Icon className="w-4.5 h-4.5 text-emerald-600" />
        </div>
      )}
    </Wrapper>
  );
}