"use client";

/*
  📋 ALGORITHMS LISTING PAGE
  
  Terminal-inspired clean design.
  URL: /algorithms
*/

import Link from "next/link";
import { useState } from "react";

// Define algorithm categories and their algorithms
const categories = [
  {
    name: "String Matching",
    description: "Algorithms for finding patterns within text",
    algorithms: [
      {
        id: "mpnext",
        name: "MPNext",
        description: "Compute the failure function (prefix function) for Morris-Pratt pattern matching.",
        complexity: "O(m)",
        status: "available" as const,
      },
      {
        id: "mp",
        name: "MP Search",
        description: "Morris-Pratt algorithm for finding all occurrences of a pattern in text.",
        complexity: "O(n + m)",
        status: "available" as const,
      },
      {
        id: "kmp",
        name: "KMP Search",
        description: "Knuth-Morris-Pratt algorithm with improved failure function.",
        complexity: "O(n + m)",
        status: "coming-soon" as const,
      },
      {
        id: "boyer-moore",
        name: "Boyer-Moore",
        description: "String searching using bad character and good suffix heuristics.",
        complexity: "O(nm) worst",
        status: "coming-soon" as const,
      },
    ],
  },
  {
    name: "Sorting",
    description: "Algorithms for ordering elements",
    algorithms: [
      {
        id: "quicksort",
        name: "Quicksort",
        description: "Divide-and-conquer sorting using pivot partitioning.",
        complexity: "O(n log n)",
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
    algorithms: [
      {
        id: "dijkstra",
        name: "Dijkstra",
        description: "Find shortest paths from a source vertex.",
        complexity: "O((V+E)logV)",
        status: "coming-soon" as const,
      },
      {
        id: "bfs",
        name: "BFS",
        description: "Breadth-first search for level-order traversal.",
        complexity: "O(V + E)",
        status: "coming-soon" as const,
      },
    ],
  },
];

export default function AlgorithmsPage() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const displayCategories = selectedCategory
    ? categories.filter((c) => c.name === selectedCategory)
    : categories;

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] font-mono">
      {/* Header */}
      <header className="border-b border-[var(--border-color)] bg-[var(--bg-secondary)] sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <span className="text-[var(--accent-green)]">$</span>
            <span className="text-[var(--text-primary)]">watch_this</span>
            <span className="text-[var(--text-muted)]">/</span>
            <span className="text-[var(--text-secondary)]">algorithms</span>
          </Link>

          <nav className="flex items-center gap-6 text-sm">
            <Link
              href="/"
              className="text-[var(--text-secondary)] hover:text-[var(--accent-green)] transition-colors"
            >
              cd ~
            </Link>
          </nav>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-12">
        {/* Page Title */}
        <div className="mb-10">
          <div className="text-sm text-[var(--text-muted)] mb-2">
            $ ls -la ./algorithms
          </div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-2">
            Algorithm Library
          </h1>
          <p className="text-[var(--text-secondary)]">
            Select an algorithm to visualize. Step through each operation.
          </p>
          <p className="text-xs text-[var(--text-muted)] mt-3">
            made with love by <a href="https://junietoc.github.io/website/" target="_blank" rel="noopener noreferrer" className="text-[var(--accent-green)] hover:underline">Juliana Nieto Cárdenas</a> with Opus 4.5 support ♥
          </p>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap gap-2 mb-10 text-sm">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`px-3 py-1.5 border transition-all ${
              selectedCategory === null
                ? "border-[var(--accent-green)] text-[var(--accent-green)] bg-[var(--accent-green)]/10"
                : "border-[var(--border-color)] text-[var(--text-secondary)] hover:border-[var(--text-muted)]"
            }`}
          >
            all
          </button>
          {categories.map((category) => (
            <button
              key={category.name}
              onClick={() => setSelectedCategory(category.name)}
              className={`px-3 py-1.5 border transition-all ${
                selectedCategory === category.name
                  ? "border-[var(--accent-green)] text-[var(--accent-green)] bg-[var(--accent-green)]/10"
                  : "border-[var(--border-color)] text-[var(--text-secondary)] hover:border-[var(--text-muted)]"
              }`}
            >
              {category.name.toLowerCase().replace(" ", "-")}
            </button>
          ))}
        </div>

        {/* Algorithm Categories */}
        <div className="space-y-12">
          {displayCategories.map((category) => (
            <section key={category.name}>
              {/* Category Header */}
              <div className="mb-4">
                <h2 className="text-lg font-medium text-[var(--text-primary)]">
                  # {category.name}
                </h2>
                <p className="text-sm text-[var(--text-muted)]">
                  {category.description}
                </p>
              </div>

              {/* Algorithm Cards */}
              <div className="grid md:grid-cols-2 gap-3">
                {category.algorithms.map((algo) => (
                  <div key={algo.id}>
                    {algo.status === "available" ? (
                      <Link
                        href={`/algorithms/${algo.id}`}
                        className="block p-4 border border-[var(--border-color)] bg-[var(--bg-secondary)] hover:border-[var(--accent-green)] transition-all group"
                      >
                        <AlgorithmCardContent algo={algo} />
                      </Link>
                    ) : (
                      <div className="p-4 border border-dashed border-[var(--border-color)] opacity-50">
                        <AlgorithmCardContent algo={algo} />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>

        {/* Tips */}
        <div className="mt-16 p-5 border border-[var(--border-color)] bg-[var(--bg-secondary)]">
          <div className="text-[var(--text-muted)] text-sm mb-3">
            # tips
          </div>
          <ul className="text-sm text-[var(--text-secondary)] space-y-2">
            <li className="flex items-center gap-2">
              <span className="text-[var(--accent-green)]">→</span>
              Use arrow keys or h/l to step through the algorithm
            </li>
            <li className="flex items-center gap-2">
              <span className="text-[var(--accent-green)]">→</span>
              Press space to play/pause auto-stepping
            </li>
            <li className="flex items-center gap-2">
              <span className="text-[var(--accent-green)]">→</span>
              Try different inputs to understand edge cases
            </li>
          </ul>
        </div>
      </main>
    </div>
  );
}

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
      <div className="flex items-center justify-between mb-2">
        <span
          className={`text-xs px-2 py-0.5 ${
            algo.status === "available"
              ? "text-[var(--accent-green)] border border-[var(--accent-green)]/30"
              : "text-[var(--text-muted)] border border-[var(--border-color)]"
          }`}
        >
          {algo.status === "available" ? "ready" : "soon"}
        </span>
        <span className="text-xs text-[var(--text-muted)] font-mono">
          {algo.complexity}
        </span>
      </div>

      <h3 className="text-[var(--text-primary)] font-medium mb-1">
        {algo.name}
      </h3>

      <p className="text-xs text-[var(--text-secondary)] line-clamp-2">
        {algo.description}
      </p>

      {algo.status === "available" && (
        <div className="mt-3 text-xs text-[var(--accent-green)] opacity-0 group-hover:opacity-100 transition-opacity">
          run →
        </div>
      )}
    </>
  );
}
