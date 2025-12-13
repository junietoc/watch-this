"use client";

/*
  🏠 PAGE.TSX - The Landing Page (Home)
  
  Terminal-inspired clean design.
*/

import Link from "next/link";
import { useState, useEffect } from "react";

// Algorithm data (excluding string matching)
const algorithms = [
  // Sorting
  { id: "quicksort", name: "Quicksort", category: "Sorting", description: "Divide-and-conquer sorting using pivot partitioning", icon: "⚡" },
  { id: "mergesort", name: "Merge Sort", category: "Sorting", description: "Stable divide-and-conquer sorting algorithm", icon: "↔" },
  { id: "bubblesort", name: "Bubble Sort", category: "Sorting", description: "Simple comparison-based sorting with adjacent swaps", icon: "○" },
  { id: "insertionsort", name: "Insertion Sort", category: "Sorting", description: "Build sorted array by inserting into correct position", icon: "▸" },
  { id: "selectionsort", name: "Selection Sort", category: "Sorting", description: "Find minimum and swap to front repeatedly", icon: "◇" },
  // Search
  { id: "linearsearch", name: "Linear Search", category: "Search", description: "Sequential search checking each element one by one", icon: "→" },
  { id: "binarysearch", name: "Binary Search", category: "Search", description: "Efficient search by halving the search space", icon: "÷" },
  { id: "jumpsearch", name: "Jump Search", category: "Search", description: "Search by jumping blocks of √n", icon: "⤳" },
  // Dynamic Programming
  { id: "lis", name: "LIS", category: "Dynamic Programming", description: "Find the longest increasing subsequence", icon: "↗" },
  { id: "edit-distance", name: "Edit Distance", category: "Dynamic Programming", description: "Minimum operations to transform one string to another", icon: "✎" },
  // Graphs
  { id: "bfs", name: "BFS", category: "Graphs", description: "Breadth-first search for level-order traversal", icon: "◎" },
  { id: "dfs", name: "DFS", category: "Graphs", description: "Depth-first search with discovery/finish times", icon: "↓" },
  { id: "dijkstra", name: "Dijkstra", category: "Graphs", description: "Find shortest paths from a source vertex", icon: "◈" },
  { id: "prims", name: "Prim's MST", category: "Graphs", description: "Build minimum spanning tree from any vertex", icon: "⊛" },
  { id: "kruskals", name: "Kruskal's MST", category: "Graphs", description: "Build MST using Union-Find", icon: "⊕" },
];

// Fisher-Yates shuffle to get random algorithms
function getRandomAlgorithms(count: number) {
  const shuffled = [...algorithms].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const [featuredAlgorithms, setFeaturedAlgorithms] = useState(algorithms.slice(0, 3));
  
  useEffect(() => {
    setMounted(true);
    setFeaturedAlgorithms(getRandomAlgorithms(3));
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
              href="https://github.com/junietoc"
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
            
            <p className="text-[var(--text-muted)] max-w-xl mb-6 leading-relaxed">
              An interactive tool for understanding how algorithms work.
              Watch the execution flow, inspect variables, and learn by doing.
            </p>

            <p className="text-xs text-[var(--text-muted)] mb-10">
              made with love by <a href="https://junietoc.github.io/website/" target="_blank" rel="noopener noreferrer" className="text-[var(--accent-green)] hover:underline">Juliana Nieto Cárdenas</a> with Opus 4.5 support ♥
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
            {featuredAlgorithms.map((algo) => (
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

            {/* View More */}
            <Link
              href="/algorithms"
              className="p-5 border border-dashed border-[var(--border-color)] hover:border-[var(--accent-green)] flex items-center justify-center transition-all duration-200 group"
            >
              <span className="text-[var(--text-muted)] group-hover:text-[var(--accent-green)] text-sm">
                view all {algorithms.length} algorithms →
              </span>
            </Link>
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
