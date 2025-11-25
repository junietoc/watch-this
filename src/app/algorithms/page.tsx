"use client";

/*
  📋 ALGORITHMS LISTING PAGE
  
  This page shows all available algorithms in a grid format.
  URL: /algorithms
  
  NEXT.JS ROUTING:
  - Folder structure = URL structure
  - src/app/algorithms/page.tsx → /algorithms
  - This is called "file-based routing"
*/

import Link from "next/link";
import { useState } from "react";

// Define algorithm categories and their algorithms
const categories = [
  {
    name: "String Matching",
    description: "Algorithms for finding patterns within text",
    icon: "🔤",
    algorithms: [
      {
        id: "mpnext",
        name: "MPNext",
        description: "Compute the failure function (prefix function) for Morris-Pratt pattern matching. This preprocessing step is essential for efficient string searching.",
        complexity: "O(m)",
        status: "available" as const,
      },
      {
        id: "kmp",
        name: "KMP Search",
        description: "Knuth-Morris-Pratt algorithm for finding pattern occurrences in text using the failure function.",
        complexity: "O(n + m)",
        status: "coming-soon" as const,
      },
      {
        id: "boyer-moore",
        name: "Boyer-Moore",
        description: "Efficient string searching using bad character and good suffix heuristics.",
        complexity: "O(nm) worst, O(n/m) best",
        status: "coming-soon" as const,
      },
    ],
  },
  {
    name: "Sorting",
    description: "Algorithms for ordering elements",
    icon: "📊",
    algorithms: [
      {
        id: "quicksort",
        name: "Quicksort",
        description: "Divide-and-conquer sorting using pivot partitioning.",
        complexity: "O(n log n) average",
        status: "coming-soon" as const,
      },
      {
        id: "mergesort",
        name: "Merge Sort",
        description: "Stable divide-and-conquer sorting algorithm.",
        complexity: "O(n log n)",
        status: "coming-soon" as const,
      },
    ],
  },
  {
    name: "Graph Algorithms",
    description: "Algorithms for traversing and analyzing graphs",
    icon: "🕸️",
    algorithms: [
      {
        id: "dijkstra",
        name: "Dijkstra's",
        description: "Find shortest paths from a source vertex to all other vertices.",
        complexity: "O((V + E) log V)",
        status: "coming-soon" as const,
      },
      {
        id: "bfs",
        name: "BFS",
        description: "Breadth-first search for level-order graph traversal.",
        complexity: "O(V + E)",
        status: "coming-soon" as const,
      },
    ],
  },
];

export default function AlgorithmsPage() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Filter algorithms based on selected category
  const displayCategories = selectedCategory
    ? categories.filter((c) => c.name === selectedCategory)
    : categories;

  return (
    <div className="min-h-screen bg-[var(--bg-primary)]">
      {/* Header */}
      <header className="border-b border-[var(--border-color)] bg-[var(--bg-secondary)]/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center text-lg font-bold text-white shadow-lg shadow-cyan-500/25 group-hover:scale-105 transition-transform">
              λ
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
              Watch This
            </span>
          </Link>

          <nav className="flex items-center gap-6">
            <span className="text-[var(--text-primary)] font-medium">
              Algorithms
            </span>
            <Link
              href="/"
              className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
            >
              Home
            </Link>
          </nav>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12">
        {/* Page Title */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-[var(--text-primary)] mb-4">
            Algorithm Library
          </h1>
          <p className="text-lg text-[var(--text-secondary)] max-w-2xl">
            Choose an algorithm to visualize. Step through each operation and see
            exactly how it works.
          </p>
        </div>

        {/* Category Filter Pills */}
        <div className="flex flex-wrap gap-3 mb-10">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              selectedCategory === null
                ? "bg-gradient-to-r from-cyan-500 to-purple-600 text-white shadow-lg shadow-cyan-500/25"
                : "bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[var(--border-color)]"
            }`}
          >
            All Categories
          </button>
          {categories.map((category) => (
            <button
              key={category.name}
              onClick={() => setSelectedCategory(category.name)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${
                selectedCategory === category.name
                  ? "bg-gradient-to-r from-cyan-500 to-purple-600 text-white shadow-lg shadow-cyan-500/25"
                  : "bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[var(--border-color)]"
              }`}
            >
              <span>{category.icon}</span>
              {category.name}
            </button>
          ))}
        </div>

        {/* Algorithm Categories */}
        <div className="space-y-12">
          {displayCategories.map((category) => (
            <section key={category.name}>
              {/* Category Header */}
              <div className="flex items-center gap-3 mb-6">
                <span className="text-3xl">{category.icon}</span>
                <div>
                  <h2 className="text-2xl font-bold text-[var(--text-primary)]">
                    {category.name}
                  </h2>
                  <p className="text-sm text-[var(--text-secondary)]">
                    {category.description}
                  </p>
                </div>
              </div>

              {/* Algorithm Cards Grid */}
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {category.algorithms.map((algo) => (
                  <div key={algo.id} className="relative">
                    {algo.status === "available" ? (
                      <Link
                        href={`/algorithms/${algo.id}`}
                        className="block p-6 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-color)] hover:border-cyan-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/10 hover:-translate-y-1 h-full"
                      >
                        <AlgorithmCardContent algo={algo} />
                      </Link>
                    ) : (
                      <div className="p-6 rounded-2xl bg-[var(--bg-secondary)]/50 border border-dashed border-[var(--border-color)] h-full opacity-60">
                        <AlgorithmCardContent algo={algo} />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>

        {/* Info Box */}
        <div className="mt-16 p-6 rounded-2xl bg-gradient-to-r from-cyan-500/10 to-purple-500/10 border border-cyan-500/20">
          <div className="flex items-start gap-4">
            <div className="text-3xl">💡</div>
            <div>
              <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">
                Learning Tips
              </h3>
              <ul className="text-[var(--text-secondary)] space-y-2">
                <li className="flex items-center gap-2">
                  <span className="text-cyan-400">→</span>
                  Use the step-by-step controls to understand each operation
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-cyan-400">→</span>
                  Try different inputs to see how the algorithm behaves
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-cyan-400">→</span>
                  Watch the code highlighting to follow the execution flow
                </li>
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

// Extracted card content component
function AlgorithmCardContent({
  algo,
}: {
  algo: {
    id: string;
    name: string;
    description: string;
    complexity: string;
    status: "available" | "coming-soon";
  };
}) {
  return (
    <>
      {/* Status Badge */}
      <div className="flex items-center justify-between mb-4">
        <span
          className={`px-3 py-1 rounded-full text-xs font-medium ${
            algo.status === "available"
              ? "bg-green-500/20 text-green-400 border border-green-500/30"
              : "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30"
          }`}
        >
          {algo.status === "available" ? "Available" : "Coming Soon"}
        </span>
        <span className="text-xs font-mono text-[var(--text-muted)]">
          {algo.complexity}
        </span>
      </div>

      {/* Algorithm Name */}
      <h3 className="text-xl font-bold text-[var(--text-primary)] mb-2">
        {algo.name}
      </h3>

      {/* Description */}
      <p className="text-sm text-[var(--text-secondary)] line-clamp-3">
        {algo.description}
      </p>

      {/* CTA */}
      {algo.status === "available" && (
        <div className="mt-4 flex items-center gap-2 text-cyan-400 text-sm font-medium">
          <span>Start Visualizing</span>
          <span>→</span>
        </div>
      )}
    </>
  );
}

