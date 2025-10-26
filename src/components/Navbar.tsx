'use client'
import { ArrowRight, Rocket } from "lucide-react";
import Link from "next/link";

export default function Navbar({ resumeUrl }: { resumeUrl: string }) {
  return (
    <header className="sticky top-0 z-20 backdrop-blur supports-[backdrop-filter]:bg-white/60 border-b border-black/5">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-4 flex items-center justify-between">
        <Link href="/">
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
              <Rocket className="h-5 w-5" />
            </div>
            <span className="font-bold tracking-tight text-lg">SAGE</span>
          </div>
        </Link>
        <nav className="hidden sm:flex items-center gap-5 text-sm text-slate-600">
          <Link href="projects" className="hover:text-slate-900">Projects</Link>
          <Link href="package" className="hover:text-slate-900">Package</Link>
          <Link href="contact" className="hover:text-slate-900">Contact</Link>
          <Link href={resumeUrl} target="_blank" className="inline-flex items-center gap-2 rounded-2xl px-3 py-1.5 bg-slate-900 text-white text-xs shadow-sm hover:opacity-90">
            Resume <ArrowRight className="h-4 w-4" />
          </Link>
        </nav>
      </div>
    </header>
  )
}
