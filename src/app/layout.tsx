import './globals.css'
import Navbar from '../components/Navbar'

export const metadata = {
  title: 'Sage Portfolio',
  description: 'Full-Stack Web Developer Portfolio',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
        <meta charSet='utf8' />
      <body className="min-h-screen bg-gradient-to-b from-white via-slate-50 to-slate-100 text-slate-900">
        {/* Navbar อยู่ทุกหน้า */}
        <Navbar resumeUrl="/resume.pdf" />
        {children}
      </body>
    </html>
  )
}
