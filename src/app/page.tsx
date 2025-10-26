'use client'
import HeroSection from '../components/HeroSection'
import TerminalCard from '../components/TerminalCard'
import FooterContact from '../components/FooterContact'
import { motion } from 'framer-motion'

export default function HomePage() {
  const email = 'sage@example.com'
  const githubUrl = 'https://github.com/sucsage'
  const linkedinUrl = 'https://www.linkedin.com/in/chalongpat-naksaingpat-811753387/'
  const skills = [
    'Next.js','React','TypeScript','Node.js','Express',
    'Rust','Actix-Web','Docker','SQL / SQLite','MongoDB','Redis','Tailwind CSS'
  ]

  return (
    <main className="mx-auto max-w-6xl px-4 sm:px-6 py-14 sm:py-24 grid md:grid-cols-2 gap-10">
      <HeroSection
        email={email}
        githubUrl={githubUrl}
        linkedinUrl={linkedinUrl}
        skills={skills}
      />
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.1 }}
        className="relative"
      >
        <div className="absolute -inset-6 -z-10 bg-gradient-to-tr from-emerald-200/40 to-cyan-200/40 blur-2xl rounded-[3rem]" />
        <TerminalCard />
      </motion.section>

      <FooterContact />
    </main>
  )
}
