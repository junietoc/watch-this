"use client";

/*
  🏠 PAGE.TSX - The Landing Page (Home)
  
  In Next.js App Router:
  - src/app/page.tsx → renders at "/"
  - src/app/algorithms/page.tsx → renders at "/algorithms"
  - src/app/algorithms/mpnext/page.tsx → renders at "/algorithms/mpnext"
  
  "use client" at the top means this is a CLIENT COMPONENT:
  - Can use React hooks (useState, useEffect)
  - Can handle user interactions
  - Runs in the browser
  
  Without "use client", it would be a SERVER COMPONENT:
  - Renders on the server
  - Can't use hooks or browser APIs
  - Better for static content
*/

import Link from "next/link";
import { useState, useEffect } from "react";

// Algorithm data - we'll expand this as we add more algorithms
const algorithms = [
  {
    id: "mpnext",
    name: "MPNext",
    category: "String Matching",
    description: "Compute the failure function for Morris-Pratt pattern matching",
    icon: "🔤",
    color: "from-cyan-500 to-blue-600",
  },
  // Future algorithms will go here!
  // {
  //   id: "kmp",
  //   name: "KMP",
  //   category: "String Matching",
  //   description: "Knuth-Morris-Pratt pattern matching algorithm",
  //   icon: "🎯",
  //   color: "from-purple-500 to-pink-600",
  // },
];

export default function Home() {
  // State for animation triggers
  const [mounted, setMounted] = useState(false);
  
  // This runs once when the component mounts (appears on screen)
  useEffect(() => {
    setMounted(true);
  }, []); // Empty array = run only once

  return (
    <div className="min-h-screen bg-[var(--bg-primary)]">
      {/* Background decoration - geometric shapes */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-cyan-500/10 to-purple-500/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 -left-40 w-96 h-96 bg-gradient-to-br from-pink-500/10 to-orange-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-20 right-1/3 w-72 h-72 bg-gradient-to-br from-green-500/10 to-cyan-500/10 rounded-full blur-3xl" />
      </div>

      {/* Navigation Header */}
      <header className="relative z-10 border-b border-[var(--border-color)] bg-[var(--bg-secondary)]/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Logo */}
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center text-lg font-bold text-white shadow-lg shadow-cyan-500/25">
              λ
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
              Watch This
            </span>
          </div>
          
          <nav className="flex items-center gap-6">
            <Link 
              href="/algorithms"
              className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
            >
              Algorithms
            </Link>
            <a 
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
            >
              GitHub
            </a>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <main className="relative z-10">
        <section className="max-w-7xl mx-auto px-6 pt-20 pb-16">
          <div 
            className={`text-center max-w-3xl mx-auto transition-all duration-700 ${
              mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            }`}
          >
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--bg-tertiary)] border border-[var(--border-color)] text-sm text-[var(--text-secondary)] mb-8">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              Interactive Algorithm Visualizer
            </div>
            
            {/* Main Headline */}
            <h1 className="text-5xl md:text-7xl font-bold mb-6">
              <span className="bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent animate-gradient">
                Watch This
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-[var(--text-secondary)] mb-4">
              See algorithms come to life, step by step.
            </p>
            
            <p className="text-lg text-[var(--text-muted)] max-w-2xl mx-auto mb-10">
              An interactive learning tool that helps you understand how algorithms work 
              by watching them execute in real-time with beautiful visualizations.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/algorithms"
                className="group px-8 py-4 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-xl font-semibold text-white shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 hover:scale-105 transition-all duration-300 flex items-center gap-2"
              >
                Explore Algorithms
                <span className="group-hover:translate-x-1 transition-transform">→</span>
              </Link>
              
              <Link
                href="/algorithms/mpnext"
                className="px-8 py-4 bg-[var(--bg-tertiary)] border border-[var(--border-color)] rounded-xl font-semibold text-[var(--text-primary)] hover:border-cyan-500/50 hover:bg-[var(--bg-secondary)] transition-all duration-300"
              >
                Try MPNext →
              </Link>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section 
          className={`max-w-7xl mx-auto px-6 py-16 transition-all duration-700 delay-200 ${
            mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          <h2 className="text-2xl font-bold text-center mb-12 text-[var(--text-primary)]">
            Why Watch This?
          </h2>
          
          <div className="grid md:grid-cols-3 gap-6">
            {/* Feature 1 */}
            <div className="p-6 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-color)] hover:border-cyan-500/30 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 flex items-center justify-center text-2xl mb-4">
                👁️
              </div>
              <h3 className="text-lg font-semibold mb-2 text-[var(--text-primary)]">
                Visual Learning
              </h3>
              <p className="text-[var(--text-secondary)]">
                See every step of the algorithm with highlighted code and animated data structures.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-6 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-color)] hover:border-purple-500/30 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center text-2xl mb-4">
                ⏯️
              </div>
              <h3 className="text-lg font-semibold mb-2 text-[var(--text-primary)]">
                Control the Pace
              </h3>
              <p className="text-[var(--text-secondary)]">
                Step forward, backward, or let it play automatically at your preferred speed.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-6 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-color)] hover:border-green-500/30 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500/20 to-emerald-500/20 flex items-center justify-center text-2xl mb-4">
                🎯
              </div>
              <h3 className="text-lg font-semibold mb-2 text-[var(--text-primary)]">
                Try Your Own Input
              </h3>
              <p className="text-[var(--text-secondary)]">
                Test algorithms with your own data to see how they behave in different scenarios.
              </p>
            </div>
          </div>
        </section>

        {/* Available Algorithms Section */}
        <section 
          className={`max-w-7xl mx-auto px-6 py-16 transition-all duration-700 delay-300 ${
            mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          <div className="text-center mb-12">
            <h2 className="text-2xl font-bold mb-2 text-[var(--text-primary)]">
              Available Algorithms
            </h2>
            <p className="text-[var(--text-secondary)]">
              Start exploring! More algorithms coming soon.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {algorithms.map((algo) => (
              <Link
                key={algo.id}
                href={`/algorithms/${algo.id}`}
                className="group p-6 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-color)] hover:border-cyan-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/10 hover:-translate-y-1"
              >
                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${algo.color} flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform`}>
                  {algo.icon}
                </div>
                <div className="text-xs font-medium text-cyan-400 uppercase tracking-wider mb-1">
                  {algo.category}
                </div>
                <h3 className="text-xl font-bold text-[var(--text-primary)] mb-2">
                  {algo.name}
                </h3>
                <p className="text-sm text-[var(--text-secondary)]">
                  {algo.description}
                </p>
              </Link>
            ))}

            {/* Coming Soon Card */}
            <div className="p-6 rounded-2xl bg-[var(--bg-tertiary)]/50 border border-dashed border-[var(--border-color)] flex flex-col items-center justify-center text-center">
              <div className="text-4xl mb-3 opacity-50">🚧</div>
              <div className="text-[var(--text-muted)] font-medium">
                More Coming Soon
              </div>
              <div className="text-sm text-[var(--text-muted)] mt-1">
                KMP, Boyer-Moore, and more!
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-[var(--border-color)] mt-16">
          <div className="max-w-7xl mx-auto px-6 py-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center text-sm font-bold text-white">
                λ
              </div>
              <span className="text-[var(--text-secondary)]">
                Watch This — Algorithms, visualized.
              </span>
            </div>
            <div className="text-sm text-[var(--text-muted)]">
              Built for learning 📚
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}
