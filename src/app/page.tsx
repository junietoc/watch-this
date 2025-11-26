"use client";

/*
  🏠 PAGE.TSX - The Landing Page (Home)
  
  Terminal-inspired clean design.
*/

import Link from "next/link";
import { useState, useEffect } from "react";

// Algorithm data
const algorithms = [
  {
    id: "mpnext",
    name: "MPNext",
    category: "String Matching",
    description: "Compute the failure function for Morris-Pratt pattern matching",
    icon: "λ",
  },
  {
    id: "mp",
    name: "MP Search",
    category: "String Matching",
    description: "Find all pattern occurrences in text using Morris-Pratt",
    icon: "→",
  },
];

export default function Home() {
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] font-mono">
      {/* Navigation Header */}
      <header className="border-b border-[var(--border-color)] bg-[var(--bg-secondary)]">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-[var(--accent-green)] text-lg">$</span>
            <span className="text-[var(--text-primary)] font-medium">
              watch_this
            </span>
            <span className="text-[var(--accent-green)] animate-blink">_</span>
          </div>
          
          <nav className="flex items-center gap-6 text-sm">
            <Link 
              href="/algorithms"
              className="text-[var(--text-secondary)] hover:text-[var(--accent-green)] transition-colors"
            >
              ./algorithms
            </Link>
            <a 
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[var(--text-secondary)] hover:text-[var(--accent-green)] transition-colors"
            >
              github
            </a>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <main>
        <section className="max-w-5xl mx-auto px-6 pt-20 pb-16">
          <div 
            className={`max-w-2xl transition-all duration-500 ${
              mounted ? "opacity-100" : "opacity-0"
            }`}
          >
            {/* Terminal prompt style */}
            <div className="text-sm text-[var(--text-muted)] mb-4">
              ~/algorithms $
            </div>
            
            {/* Main Headline */}
            <h1 className="text-4xl md:text-5xl font-bold mb-6 text-[var(--text-primary)]">
              watch<span className="text-[var(--accent-green)]">_</span>this
            </h1>
            
            <p className="text-lg text-[var(--text-secondary)] mb-4 leading-relaxed">
              Algorithms visualized, step by step.
            </p>
            
            <p className="text-[var(--text-muted)] max-w-xl mb-10 leading-relaxed">
              An interactive tool for understanding how algorithms work.
              Watch the execution flow, inspect variables, and learn by doing.
            </p>

            {/* CTA */}
            <div className="flex flex-col sm:flex-row items-start gap-4">
              <Link
                href="/algorithms"
                className="group px-6 py-3 border border-[var(--accent-green)] text-[var(--accent-green)] hover:bg-[var(--accent-green)] hover:text-[var(--bg-primary)] transition-all duration-200 flex items-center gap-2"
              >
                <span className="text-[var(--text-muted)] group-hover:text-[var(--bg-primary)]">$</span>
                explore --all
              </Link>
              
              <Link
                href="/algorithms/mpnext"
                className="px-6 py-3 border border-[var(--border-color)] text-[var(--text-secondary)] hover:border-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all duration-200"
              >
                run mpnext
              </Link>
            </div>
          </div>
        </section>

        {/* Available Algorithms Section */}
        <section 
          className={`max-w-5xl mx-auto px-6 py-16 transition-all duration-500 delay-200 ${
            mounted ? "opacity-100" : "opacity-0"
          }`}
        >
          <div className="text-sm text-[var(--text-muted)] mb-8">
            # available algorithms
          </div>

          <div className="grid md:grid-cols-2 gap-4 max-w-3xl">
            {algorithms.map((algo) => (
              <Link
                key={algo.id}
                href={`/algorithms/${algo.id}`}
                className="group p-5 border border-[var(--border-color)] bg-[var(--bg-secondary)] hover:border-[var(--accent-green)] transition-all duration-200"
              >
                <div className="flex items-start gap-4">
                  <span className="text-[var(--accent-green)] text-xl font-bold">
                    {algo.icon}
                  </span>
                  <div>
                    <div className="text-xs text-[var(--text-muted)] uppercase tracking-wider mb-1">
                      {algo.category}
                    </div>
                    <h3 className="text-[var(--text-primary)] font-medium mb-1">
                      {algo.name}
                    </h3>
                    <p className="text-sm text-[var(--text-secondary)]">
                      {algo.description}
                    </p>
                    <div className="mt-3 text-xs text-[var(--accent-green)] opacity-0 group-hover:opacity-100 transition-opacity">
                      run →
                    </div>
                  </div>
                </div>
              </Link>
            ))}

            {/* Coming Soon */}
            <div className="p-5 border border-dashed border-[var(--border-color)] flex items-center justify-center">
              <span className="text-[var(--text-muted)] text-sm">
                more coming soon...
              </span>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-[var(--border-color)] mt-16">
          <div className="max-w-5xl mx-auto px-6 py-6 flex items-center justify-between text-sm">
            <div className="text-[var(--text-muted)]">
              $ echo &quot;built for learning&quot;
            </div>
            <div className="text-[var(--text-muted)]">
              v1.0
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}
