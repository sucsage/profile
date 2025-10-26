export default function SkillsChips({ skills }: { skills: string[] }) {
  return (
    <div className="flex flex-wrap gap-2">
      {skills.map((s) => (
        <span key={s} className="select-none rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-700 shadow-sm">
          {s}
        </span>
      ))}
    </div>
  );
}
