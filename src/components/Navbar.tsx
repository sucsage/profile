'use client'

import { ArrowRight, Rocket, Menu, X } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export default function Navbar({ resumeUrl }: { resumeUrl: string }) {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-20 backdrop-blur supports-[backdrop-filter]:bg-white/60 border-b border-black/5">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-4 flex items-center justify-between">
        {/* 🔹 Logo */}
        <Link href="/" onClick={() => setMenuOpen(false)}>
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
              <Rocket className="h-5 w-5" />
            </div>
            <span className="font-bold tracking-tight text-lg">SAGE</span>
          </div>
        </Link>

        {/* 🔹 Desktop Menu */}
        <nav className="hidden sm:flex items-center gap-5 text-sm text-slate-600">
          <Link href="/projects" className="hover:text-slate-900">Projects</Link>
          <Link href="/package" className="hover:text-slate-900">Package</Link>
          <Link href="/contact" className="hover:text-slate-900">Contact</Link>
          <Link
            href={resumeUrl}
            target="_blank"
            className="inline-flex items-center gap-2 rounded-2xl px-3 py-1.5 bg-slate-900 text-white text-xs shadow-sm hover:opacity-90"
          >
            Resume <ArrowRight className="h-4 w-4" />
          </Link>
        </nav>

        {/* 🔹 Mobile Menu Button */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="sm:hidden inline-flex items-center justify-center p-2 rounded-md text-slate-700 hover:bg-slate-100"
          aria-label="Toggle Menu"
        >
          {menuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* 🔹 Mobile Dropdown */}
      <AnimatePresence>
        {menuOpen && (
          <motion.nav
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="sm:hidden border-t border-slate-200 bg-white/90 backdrop-blur-md shadow-md"
          >
            <div className="px-4 py-3 flex flex-col gap-3 text-slate-700 text-sm">
              <Link href="/projects" onClick={() => setMenuOpen(false)} className="hover:text-slate-900">Projects</Link>
              <Link href="/package" onClick={() => setMenuOpen(false)} className="hover:text-slate-900">Package</Link>
              <Link href="/contact" onClick={() => setMenuOpen(false)} className="hover:text-slate-900">Contact</Link>
              <Link
                href={resumeUrl}
                target="_blank"
                onClick={() => setMenuOpen(false)}
                className="inline-flex items-center justify-center gap-2 rounded-xl px-3 py-2 bg-slate-900 text-white text-xs shadow-sm hover:opacity-90"
              >
                Resume <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  )
}
