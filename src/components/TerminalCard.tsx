import { TerminalSquare } from "lucide-react";

export default function TerminalCard() {
  return (
    <div className="rounded-3xl border bg-white shadow-xl overflow-hidden">
      <div className="flex items-center gap-2 border-b px-4 py-2 text-xs text-slate-500">
        <div className="flex gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-rose-400" />
          <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
        </div>
        <span className="truncate">deploy@portfolio: ~</span>
      </div>
      <div className="p-5 sm:p-6">
        <div className="rounded-2xl bg-slate-950 text-slate-100 p-4 font-mono text-[13px] leading-relaxed">
          <div className="mb-2 opacity-70">$ whoami</div>
          <div className="mb-4">sage — full-stack dev</div>

          <div className="mb-2 opacity-70">$ stack</div>
          <div className="mb-4">nextjs react ts | node express | rust actix | docker | sql mongo redis</div>

          <div className="mb-2 opacity-70">$ highlight</div>
          <div className="mb-1">• built 3 full-stack apps end-to-end</div>
          <div className="mb-1">• auth, caching, and analytics</div>
          <div className="mb-1">• deploy with docker compose</div>

          <div className="mt-4 inline-flex items-center gap-2 rounded-xl bg-emerald-500/10 px-3 py-1 text-emerald-300">
            <TerminalSquare className="h-4 w-4" /> ready to ship
          </div>
        </div>
      </div>
    </div>
  );
}
