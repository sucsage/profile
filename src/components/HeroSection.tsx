'use client'
import { useState } from "react";
import { motion } from "framer-motion";
import { Github, Linkedin, Mail } from "lucide-react";
import SkillsChips from "./SkillsChips";

export default function HeroSection({ email, githubUrl, linkedinUrl, skills }: {
  email: string;
  githubUrl: string;
  linkedinUrl: string;
  skills: string[];
}) {
  const [emailCopied, setEmailCopied] = useState(false);

  function copyEmail() {
    navigator.clipboard.writeText(email).then(() => {
      setEmailCopied(true);
      setTimeout(() => setEmailCopied(false), 1400);
    });
  }

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="flex flex-col justify-center"
    >
      <p className="mb-3 inline-flex w-fit items-center gap-2 rounded-full border border-emerald-600/20 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-700">
        <span className="relative inline-flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
        </span>
        Open to opportunities
      </p>

      <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight leading-tight">
        Full-Stack Web Developer
      </h1>
      <p className="mt-4 text-lg text-slate-600">
        I build fast, modern web apps with <span className="font-semibold text-slate-800">Next.js</span>,
        <span className="font-semibold text-slate-800"> Node.js</span>, and <span className="font-semibold text-slate-800">Rust (Actix-Web)</span> —
        from clean UIs to robust APIs, containers, and databases.
      </p>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <a href={githubUrl} target="_blank" className="inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-4 py-2 text-white shadow hover:opacity-90">
          <Github className="h-5 w-5" /> GitHub
        </a>
        <a href={linkedinUrl} target="_blank" className="inline-flex items-center gap-2 rounded-2xl border px-4 py-2 text-slate-800 hover:bg-white shadow-sm">
          <Linkedin className="h-5 w-5" /> LinkedIn
        </a>
        <button onClick={copyEmail} className="inline-flex items-center gap-2 rounded-2xl border px-4 py-2 text-slate-800 hover:bg-white shadow-sm">
          <Mail className="h-5 w-5" /> {emailCopied ? "Copied!" : "Copy email"}
        </button>
      </div>

      <section className="mt-8">
        <SkillsChips skills={skills} />
      </section>
    </motion.section>
  );
}
