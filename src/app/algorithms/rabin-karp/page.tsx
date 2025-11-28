"use client";

/*
  🔢 RABIN-KARP VISUALIZER PAGE
  Terminal-inspired clean design.
  Visualizes the Rabin-Karp string matching algorithm using rolling hash.
*/

import Link from "next/link";
import { useState, useEffect, useRef, useCallback } from "react";

// ============================================
// TYPES
// ============================================

interface Step {
  line: number;
  phase: "init" | "preprocessing" | "searching" | "end";
  j: number | null;
  i: number | null;
  h: number;
  pHash: number;
  tHash: number;
  hashMatch: boolean;
  stringMatch: boolean | null;
  matchFound: boolean;
  matchPositions: number[];
  spuriousHit: boolean;
  action: string;
  type: "init" | "compute-h" | "compute-hash" | "search-start" | "hash-check" | "string-check" | "update-hash" | "match-found" | "spurious-hit" | "end";
  highlightText: { start: number; end: number } | null;
  highlightPattern: boolean;
  comparingChars?: { textIdx: number; patternIdx: number } | null;
}

// ============================================
// ALGORITHM LOGIC
// ============================================

function computeAllSteps(text: string, pattern: string, q: number, d: number): Step[] {
  const n = text.length;
  const m = pattern.length;
  const allSteps: Step[] = [];
  const matchPositions: number[] = [];

  // Helper to get char value (for simplicity, use charCodeAt)
  const charVal = (c: string) => c.charCodeAt(0);

  // Compute h = d^(m-1) mod q
  let h = 1;
  for (let i = 0; i < m - 1; i++) {
    h = (h * d) % q;
  }

  allSteps.push({
    line: 3,
    phase: "init",
    j: null,
    i: null,
    h: h,
    pHash: 0,
    tHash: 0,
    hashMatch: false,
    stringMatch: null,
    matchFound: false,
    matchPositions: [],
    spuriousHit: false,
    action: `Initialize: h ← d^(m-1) mod q = ${d}^${m - 1} mod ${q} = ${h}`,
    type: "compute-h",
    highlightText: null,
    highlightPattern: false,
  });

  // Compute initial hashes using Horner's rule
  let pHash = 0;
  let tHash = 0;

  allSteps.push({
    line: 4,
    phase: "preprocessing",
    j: null,
    i: null,
    h: h,
    pHash: 0,
    tHash: 0,
    hashMatch: false,
    stringMatch: null,
    matchFound: false,
    matchPositions: [],
    spuriousHit: false,
    action: `Initialize: p̄ ← 0, t̄₀ ← 0`,
    type: "init",
    highlightText: null,
    highlightPattern: false,
  });

  for (let i = 0; i < m; i++) {
    pHash = (d * pHash + charVal(pattern[i])) % q;
    tHash = (d * tHash + charVal(text[i])) % q;

    allSteps.push({
      line: 6,
      phase: "preprocessing",
      j: null,
      i: i + 1,
      h: h,
      pHash: pHash,
      tHash: tHash,
      hashMatch: false,
      stringMatch: null,
      matchFound: false,
      matchPositions: [],
      spuriousHit: false,
      action: `i=${i + 1}: p̄ ← (${d} × p̄ + p[${i + 1}]='${pattern[i]}') mod ${q} = ${pHash}, t̄₀ ← (${d} × t̄₀ + t[${i + 1}]='${text[i]}') mod ${q} = ${tHash}`,
      type: "compute-hash",
      highlightText: { start: 0, end: i + 1 },
      highlightPattern: true,
    });
  }

  // Searching phase
  for (let j = 0; j <= n - m; j++) {
    allSteps.push({
      line: 9,
      phase: "searching",
      j: j,
      i: null,
      h: h,
      pHash: pHash,
      tHash: tHash,
      hashMatch: pHash === tHash,
      stringMatch: null,
      matchFound: false,
      matchPositions: [...matchPositions],
      spuriousHit: false,
      action: `j=${j}: Compare hashes: p̄=${pHash} ${pHash === tHash ? "=" : "≠"} t̄ⱼ=${tHash}`,
      type: "hash-check",
      highlightText: { start: j, end: j + m },
      highlightPattern: true,
    });

    if (pHash === tHash) {
      // Check actual string match
      let match = true;
      for (let k = 0; k < m; k++) {
        allSteps.push({
          line: 10,
          phase: "searching",
          j: j,
          i: k + 1,
          h: h,
          pHash: pHash,
          tHash: tHash,
          hashMatch: true,
          stringMatch: null,
          matchFound: false,
          matchPositions: [...matchPositions],
          spuriousHit: false,
          action: `Verify: p[${k + 1}]='${pattern[k]}' ${pattern[k] === text[j + k] ? "=" : "≠"} t[${j + k + 1}]='${text[j + k]}'`,
          type: "string-check",
          highlightText: { start: j, end: j + m },
          highlightPattern: true,
          comparingChars: { textIdx: j + k, patternIdx: k },
        });

        if (pattern[k] !== text[j + k]) {
          match = false;
          allSteps.push({
            line: 10,
            phase: "searching",
            j: j,
            i: null,
            h: h,
            pHash: pHash,
            tHash: tHash,
            hashMatch: true,
            stringMatch: false,
            matchFound: false,
            matchPositions: [...matchPositions],
            spuriousHit: true,
            action: `Spurious hit! Hash matched but strings differ at position ${k + 1}`,
            type: "spurious-hit",
            highlightText: { start: j, end: j + m },
            highlightPattern: true,
          });
          break;
        }
      }

      if (match) {
        matchPositions.push(j);
        allSteps.push({
          line: 10,
          phase: "searching",
          j: j,
          i: null,
          h: h,
          pHash: pHash,
          tHash: tHash,
          hashMatch: true,
          stringMatch: true,
          matchFound: true,
          matchPositions: [...matchPositions],
          spuriousHit: false,
          action: `✓ Match found at position ${j}!`,
          type: "match-found",
          highlightText: { start: j, end: j + m },
          highlightPattern: true,
        });
      }
    }

    // Update hash for next position (rolling hash)
    if (j < n - m) {
      const oldHash = tHash;
      tHash = (d * (tHash - charVal(text[j]) * h) + charVal(text[j + m])) % q;
      // Handle negative modulo
      if (tHash < 0) tHash += q;

      allSteps.push({
        line: 11,
        phase: "searching",
        j: j,
        i: null,
        h: h,
        pHash: pHash,
        tHash: tHash,
        hashMatch: false,
        stringMatch: null,
        matchFound: false,
        matchPositions: [...matchPositions],
        spuriousHit: false,
        action: `Rolling hash: t̄ⱼ₊₁ ← (${d}(${oldHash} - t[${j + 1}]='${text[j]}'×${h}) + t[${j + m + 1}]='${text[j + m]}') mod ${q} = ${tHash}`,
        type: "update-hash",
        highlightText: { start: j + 1, end: j + m + 1 },
        highlightPattern: false,
      });
    }
  }

  allSteps.push({
    line: 13,
    phase: "end",
    j: null,
    i: null,
    h: h,
    pHash: pHash,
    tHash: tHash,
    hashMatch: false,
    stringMatch: null,
    matchFound: false,
    matchPositions: [...matchPositions],
    spuriousHit: false,
    action: `Algorithm complete! Found ${matchPositions.length} match${matchPositions.length !== 1 ? "es" : ""} at position${matchPositions.length !== 1 ? "s" : ""}: [${matchPositions.join(", ")}]`,
    type: "end",
    highlightText: null,
    highlightPattern: false,
  });

  return allSteps;
}

// ============================================
// ALGORITHM CODE
// ============================================

const algorithmCode = [
  { line: 1, content: "RabinKarp(t, p, q)    {n = |t|, m = |p|, d = |Σ|}", tokens: [
    { type: "function", text: "RabinKarp" },
    { type: "bracket", text: "(" },
    { type: "variable", text: "t" },
    { type: "plain", text: ", " },
    { type: "variable", text: "p" },
    { type: "plain", text: ", " },
    { type: "variable", text: "q" },
    { type: "bracket", text: ")" },
    { type: "comment", text: "    {n = |t|, m = |p|, d = |Σ|}" },
  ]},
  { line: 2, content: "begin", tokens: [
    { type: "keyword", text: "begin" },
  ]},
  { line: 3, content: "   h ← d^(m-1) mod q", tokens: [
    { type: "plain", text: "   " },
    { type: "variable", text: "h" },
    { type: "operator", text: " ← " },
    { type: "variable", text: "d" },
    { type: "operator", text: "^" },
    { type: "bracket", text: "(" },
    { type: "variable", text: "m" },
    { type: "operator", text: "-" },
    { type: "number", text: "1" },
    { type: "bracket", text: ")" },
    { type: "plain", text: " " },
    { type: "keyword", text: "mod" },
    { type: "plain", text: " " },
    { type: "variable", text: "q" },
  ]},
  { line: 4, content: "   p̄ ← t̄₀ ← 0", tokens: [
    { type: "plain", text: "   " },
    { type: "variable", text: "p̄" },
    { type: "operator", text: " ← " },
    { type: "variable", text: "t̄₀" },
    { type: "operator", text: " ← " },
    { type: "number", text: "0" },
  ]},
  { line: 5, content: "   for i ← 1 to m do", tokens: [
    { type: "plain", text: "   " },
    { type: "keyword", text: "for" },
    { type: "plain", text: " " },
    { type: "variable", text: "i" },
    { type: "operator", text: " ← " },
    { type: "number", text: "1" },
    { type: "plain", text: " " },
    { type: "keyword", text: "to" },
    { type: "plain", text: " " },
    { type: "variable", text: "m" },
    { type: "plain", text: " " },
    { type: "keyword", text: "do" },
    { type: "comment", text: "                   ▷ Preprocessing" },
  ]},
  { line: 6, content: "      p̄ ← (d p̄ + p[i]) mod q", tokens: [
    { type: "plain", text: "      " },
    { type: "variable", text: "p̄" },
    { type: "operator", text: " ← " },
    { type: "bracket", text: "(" },
    { type: "variable", text: "d" },
    { type: "plain", text: " " },
    { type: "variable", text: "p̄" },
    { type: "operator", text: " + " },
    { type: "variable", text: "p" },
    { type: "bracket", text: "[" },
    { type: "variable", text: "i" },
    { type: "bracket", text: "]" },
    { type: "bracket", text: ")" },
    { type: "plain", text: " " },
    { type: "keyword", text: "mod" },
    { type: "plain", text: " " },
    { type: "variable", text: "q" },
  ]},
  { line: 7, content: "      t̄₀ ← (d t̄₀ + t[i]) mod q", tokens: [
    { type: "plain", text: "      " },
    { type: "variable", text: "t̄₀" },
    { type: "operator", text: " ← " },
    { type: "bracket", text: "(" },
    { type: "variable", text: "d" },
    { type: "plain", text: " " },
    { type: "variable", text: "t̄₀" },
    { type: "operator", text: " + " },
    { type: "variable", text: "t" },
    { type: "bracket", text: "[" },
    { type: "variable", text: "i" },
    { type: "bracket", text: "]" },
    { type: "bracket", text: ")" },
    { type: "plain", text: " " },
    { type: "keyword", text: "mod" },
    { type: "plain", text: " " },
    { type: "variable", text: "q" },
  ]},
  { line: 8, content: "   od", tokens: [
    { type: "plain", text: "   " },
    { type: "keyword", text: "od" },
  ]},
  { line: 9, content: "   for j ← 0 to n-m do", tokens: [
    { type: "plain", text: "   " },
    { type: "keyword", text: "for" },
    { type: "plain", text: " " },
    { type: "variable", text: "j" },
    { type: "operator", text: " ← " },
    { type: "number", text: "0" },
    { type: "plain", text: " " },
    { type: "keyword", text: "to" },
    { type: "plain", text: " " },
    { type: "variable", text: "n" },
    { type: "operator", text: "-" },
    { type: "variable", text: "m" },
    { type: "plain", text: " " },
    { type: "keyword", text: "do" },
    { type: "comment", text: "               ▷ Searching" },
  ]},
  { line: 10, content: "      if p̄ = t̄ⱼ then if p[1..m] = t[j+1..j+m] then Output(j)", tokens: [
    { type: "plain", text: "      " },
    { type: "keyword", text: "if" },
    { type: "plain", text: " " },
    { type: "variable", text: "p̄" },
    { type: "operator", text: " = " },
    { type: "variable", text: "t̄ⱼ" },
    { type: "plain", text: " " },
    { type: "keyword", text: "then" },
    { type: "plain", text: " " },
    { type: "keyword", text: "if" },
    { type: "plain", text: " " },
    { type: "variable", text: "p" },
    { type: "bracket", text: "[" },
    { type: "number", text: "1" },
    { type: "operator", text: ".." },
    { type: "variable", text: "m" },
    { type: "bracket", text: "]" },
    { type: "operator", text: " = " },
    { type: "variable", text: "t" },
    { type: "bracket", text: "[" },
    { type: "variable", text: "j" },
    { type: "operator", text: "+" },
    { type: "number", text: "1" },
    { type: "operator", text: ".." },
    { type: "variable", text: "j" },
    { type: "operator", text: "+" },
    { type: "variable", text: "m" },
    { type: "bracket", text: "]" },
    { type: "plain", text: " " },
    { type: "keyword", text: "then" },
    { type: "plain", text: " " },
    { type: "function", text: "Output" },
    { type: "bracket", text: "(" },
    { type: "variable", text: "j" },
    { type: "bracket", text: ")" },
  ]},
  { line: 11, content: "      if j < n-m then t̄ⱼ₊₁ ← (d(t̄ⱼ - t[j+1]h) + t[j+m+1]) mod q", tokens: [
    { type: "plain", text: "      " },
    { type: "keyword", text: "if" },
    { type: "plain", text: " " },
    { type: "variable", text: "j" },
    { type: "operator", text: " < " },
    { type: "variable", text: "n" },
    { type: "operator", text: "-" },
    { type: "variable", text: "m" },
    { type: "plain", text: " " },
    { type: "keyword", text: "then" },
    { type: "plain", text: " " },
    { type: "variable", text: "t̄ⱼ₊₁" },
    { type: "operator", text: " ← " },
    { type: "bracket", text: "(" },
    { type: "variable", text: "d" },
    { type: "bracket", text: "(" },
    { type: "variable", text: "t̄ⱼ" },
    { type: "operator", text: " - " },
    { type: "variable", text: "t" },
    { type: "bracket", text: "[" },
    { type: "variable", text: "j" },
    { type: "operator", text: "+" },
    { type: "number", text: "1" },
    { type: "bracket", text: "]" },
    { type: "variable", text: "h" },
    { type: "bracket", text: ")" },
    { type: "operator", text: " + " },
    { type: "variable", text: "t" },
    { type: "bracket", text: "[" },
    { type: "variable", text: "j" },
    { type: "operator", text: "+" },
    { type: "variable", text: "m" },
    { type: "operator", text: "+" },
    { type: "number", text: "1" },
    { type: "bracket", text: "]" },
    { type: "bracket", text: ")" },
    { type: "plain", text: " " },
    { type: "keyword", text: "mod" },
    { type: "plain", text: " " },
    { type: "variable", text: "q" },
  ]},
  { line: 12, content: "   od", tokens: [
    { type: "plain", text: "   " },
    { type: "keyword", text: "od" },
  ]},
  { line: 13, content: "end", tokens: [
    { type: "keyword", text: "end" },
  ]},
];

const tokenColors: Record<string, string> = {
  keyword: "text-[var(--accent-magenta)]",
  function: "text-[var(--accent-green)]",
  variable: "text-[var(--accent-orange)]",
  operator: "text-[var(--accent-red)]",
  number: "text-[var(--accent-purple)]",
  comment: "text-[var(--text-muted)] italic",
  bracket: "text-[var(--text-secondary)]",
  plain: "",
};

// ============================================
// MAIN COMPONENT
// ============================================

export default function RabinKarpPage() {
  const [text, setText] = useState("abracadabra");
  const [pattern, setPattern] = useState("abra");
  const [prime, setPrime] = useState(101);
  const [alphabetSize, setAlphabetSize] = useState(256);
  const [inputText, setInputText] = useState("abracadabra");
  const [inputPattern, setInputPattern] = useState("abra");
  const [inputPrime, setInputPrime] = useState("101");
  const [steps, setSteps] = useState<Step[]>([]);
  const [currentStepIndex, setCurrentStepIndex] = useState(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(2);
  const [codeWidth, setCodeWidth] = useState(520);
  const [isResizing, setIsResizing] = useState(false);

  const playIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const codeContainerRef = useRef<HTMLDivElement>(null);
  const resizeRef = useRef<HTMLDivElement>(null);

  const currentStep = currentStepIndex >= 0 ? steps[currentStepIndex] : null;

  // ============================================
  // RESIZE HANDLER
  // ============================================

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;
      const newWidth = Math.min(Math.max(320, e.clientX), window.innerWidth * 0.6);
      setCodeWidth(newWidth);
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isResizing]);

  // ============================================
  // PLAYBACK FUNCTIONS
  // ============================================

  const stopPlaying = useCallback(() => {
    setIsPlaying(false);
    if (playIntervalRef.current) {
      clearInterval(playIntervalRef.current);
      playIntervalRef.current = null;
    }
  }, []);

  const nextStep = useCallback(() => {
    setCurrentStepIndex((prev) => {
      if (prev < steps.length - 1) {
        return prev + 1;
      }
      stopPlaying();
      return prev;
    });
  }, [steps.length, stopPlaying]);

  const prevStep = useCallback(() => {
    setCurrentStepIndex((prev) => Math.max(0, prev - 1));
  }, []);

  const goToStart = useCallback(() => {
    stopPlaying();
    if (steps.length > 0) {
      setCurrentStepIndex(0);
    }
  }, [steps.length, stopPlaying]);

  const goToEnd = useCallback(() => {
    stopPlaying();
    if (steps.length > 0) {
      setCurrentStepIndex(steps.length - 1);
    }
  }, [steps.length, stopPlaying]);

  const startVisualization = useCallback(() => {
    const trimmedText = inputText.trim();
    const trimmedPattern = inputPattern.trim();
    const q = parseInt(inputPrime) || 101;

    if (!trimmedText || !trimmedPattern) {
      alert("Please enter both text and pattern.");
      return;
    }

    if (trimmedPattern.length > trimmedText.length) {
      alert("Pattern must not be longer than text.");
      return;
    }

    if (q < 2) {
      alert("Prime q must be at least 2.");
      return;
    }

    stopPlaying();
    setText(trimmedText);
    setPattern(trimmedPattern);
    setPrime(q);
    const newSteps = computeAllSteps(trimmedText, trimmedPattern, q, alphabetSize);
    setSteps(newSteps);
    setCurrentStepIndex(0);
  }, [inputText, inputPattern, inputPrime, alphabetSize, stopPlaying]);

  const resetVisualization = useCallback(() => {
    stopPlaying();
    setSteps([]);
    setCurrentStepIndex(-1);
  }, [stopPlaying]);

  const playPause = useCallback(() => {
    if (isPlaying) {
      stopPlaying();
    } else {
      if (steps.length === 0) {
        startVisualization();
        return;
      }
      setIsPlaying(true);
    }
  }, [isPlaying, steps.length, stopPlaying, startVisualization]);

  // ============================================
  // EFFECTS
  // ============================================

  useEffect(() => {
    if (isPlaying) {
      const interval = setInterval(() => {
        setCurrentStepIndex((prev) => {
          if (prev < steps.length - 1) {
            return prev + 1;
          }
          setIsPlaying(false);
          return prev;
        });
      }, 1000 / speed);
      playIntervalRef.current = interval;

      return () => clearInterval(interval);
    }
  }, [isPlaying, speed, steps.length]);

  useEffect(() => {
    if (currentStep && codeContainerRef.current) {
      const lineElement = codeContainerRef.current.querySelector(
        `[data-line="${currentStep.line}"]`
      );
      if (lineElement) {
        lineElement.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }
  }, [currentStep]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement).tagName === "INPUT") return;

      if (e.key === "ArrowRight" || e.key === "l") nextStep();
      if (e.key === "ArrowLeft" || e.key === "h") prevStep();
      if (e.key === " ") {
        e.preventDefault();
        playPause();
      }
      if (e.key === "Home") goToStart();
      if (e.key === "End") goToEnd();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [nextStep, prevStep, playPause, goToStart, goToEnd]);

  // ============================================
  // RENDER
  // ============================================

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] flex flex-col font-mono">
      {/* Header */}
      <header className="bg-[var(--bg-secondary)] border-b border-[var(--border-color)] px-4 py-3 flex items-center justify-between flex-wrap gap-4">
        {/* Logo */}
        <Link href="/algorithms" className="flex items-center gap-2 group">
          <span className="text-[var(--accent-green)]">$</span>
          <span className="text-[var(--text-secondary)]">./</span>
          <span className="text-[var(--text-primary)]">rabin-karp</span>
        </Link>

        {/* Input Controls */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="text-[var(--text-muted)] text-sm">text:</span>
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && startVisualization()}
              placeholder="enter text..."
              className="px-3 py-1.5 text-sm bg-[var(--bg-primary)] border border-[var(--border-color)] text-[var(--text-primary)] w-32 focus:outline-none focus:border-[var(--accent-green)] transition-colors"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[var(--text-muted)] text-sm">pattern:</span>
            <input
              type="text"
              value={inputPattern}
              onChange={(e) => setInputPattern(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && startVisualization()}
              placeholder="enter pattern..."
              className="px-3 py-1.5 text-sm bg-[var(--bg-primary)] border border-[var(--border-color)] text-[var(--text-primary)] w-24 focus:outline-none focus:border-[var(--accent-green)] transition-colors"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[var(--text-muted)] text-sm">q:</span>
            <input
              type="number"
              value={inputPrime}
              onChange={(e) => setInputPrime(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && startVisualization()}
              placeholder="prime"
              className="px-3 py-1.5 text-sm bg-[var(--bg-primary)] border border-[var(--border-color)] text-[var(--text-primary)] w-16 focus:outline-none focus:border-[var(--accent-green)] transition-colors"
            />
          </div>
          <button
            onClick={startVisualization}
            className="px-4 py-1.5 border border-[var(--accent-green)] text-[var(--accent-green)] hover:bg-[var(--accent-green)] hover:text-[var(--bg-primary)] transition-colors text-sm"
          >
            run
          </button>
          <button
            onClick={resetVisualization}
            className="px-4 py-1.5 border border-[var(--border-color)] text-[var(--text-secondary)] hover:border-[var(--text-muted)] transition-colors text-sm"
          >
            reset
          </button>
        </div>

        {/* Playback Controls */}
        <div className="flex items-center gap-1">
          <button
            onClick={goToStart}
            className="w-8 h-8 flex items-center justify-center border border-[var(--border-color)] hover:border-[var(--accent-green)] hover:text-[var(--accent-green)] transition-colors text-xs"
            title="Go to start"
          >
            |◁
          </button>
          <button
            onClick={prevStep}
            className="w-8 h-8 flex items-center justify-center border border-[var(--border-color)] hover:border-[var(--accent-green)] hover:text-[var(--accent-green)] transition-colors text-xs"
            title="Previous step (←)"
          >
            ◁
          </button>
          <button
            onClick={playPause}
            className="w-8 h-8 flex items-center justify-center border border-[var(--accent-green)] text-[var(--accent-green)] hover:bg-[var(--accent-green)] hover:text-[var(--bg-primary)] transition-colors text-xs"
            title="Play/Pause (space)"
          >
            {isPlaying ? "||" : "▷"}
          </button>
          <button
            onClick={nextStep}
            className="w-8 h-8 flex items-center justify-center border border-[var(--border-color)] hover:border-[var(--accent-green)] hover:text-[var(--accent-green)] transition-colors text-xs"
            title="Next step (→)"
          >
            ▷
          </button>
          <button
            onClick={goToEnd}
            className="w-8 h-8 flex items-center justify-center border border-[var(--border-color)] hover:border-[var(--accent-green)] hover:text-[var(--accent-green)] transition-colors text-xs"
            title="Go to end"
          >
            ▷|
          </button>

          {/* Speed Control */}
          <div className="flex items-center gap-2 ml-3 text-sm text-[var(--text-secondary)]">
            <input
              type="range"
              min="0.5"
              max="10"
              step="0.5"
              value={speed}
              onChange={(e) => setSpeed(parseFloat(e.target.value))}
              className="w-20 h-1 appearance-none bg-[var(--border-color)] cursor-pointer accent-[var(--accent-green)]"
            />
            <span className="text-xs text-[var(--text-muted)] w-16">
              {speed < 1 ? speed.toFixed(1) : Math.round(speed)} step/s
            </span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Code Panel */}
        <div
          style={{ width: codeWidth }}
          className="bg-[var(--bg-code)] border-r border-[var(--border-color)] flex flex-col shrink-0 relative"
        >
          <div className="px-4 py-2 bg-[var(--bg-secondary)] border-b border-[var(--border-color)] text-xs text-[var(--text-muted)] uppercase tracking-wider">
            # algorithm
          </div>
          <div ref={codeContainerRef} className="flex-1 overflow-auto">
            {algorithmCode.map((line) => (
              <div
                key={line.line}
                data-line={line.line}
                className={`flex text-sm leading-7 transition-colors ${
                  currentStep?.line === line.line
                    ? "bg-[var(--line-highlight)] border-l-2 border-[var(--accent-green)]"
                    : "border-l-2 border-transparent"
                }`}
              >
                <span
                  className={`w-8 px-2 text-right shrink-0 select-none ${
                    currentStep?.line === line.line
                      ? "text-[var(--accent-green)]"
                      : "text-[var(--text-muted)]"
                  }`}
                >
                  {line.line}
                </span>
                <code className="px-3 py-0.5 whitespace-nowrap">
                  {line.tokens.map((token, i) => (
                    <span key={i} className={tokenColors[token.type]}>
                      {token.text}
                    </span>
                  ))}
                </code>
              </div>
            ))}
          </div>

          {/* Resize Handle */}
          <div
            ref={resizeRef}
            onMouseDown={() => setIsResizing(true)}
            className="absolute top-0 right-0 w-1 h-full cursor-col-resize hover:bg-[var(--accent-green)]/30 transition-colors"
          />
        </div>

        {/* Execution Panel */}
        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 min-w-[300px]">
          {/* Text Display */}
          <Section title="text t (0-indexed)">
            {steps.length > 0 ? (
              <>
                <div className="flex gap-0.5 flex-wrap justify-center">
                  {text.split("").map((char, idx) => {
                    const isInWindow = currentStep?.highlightText &&
                      idx >= currentStep.highlightText.start &&
                      idx < currentStep.highlightText.end;
                    const isComparing = currentStep?.comparingChars?.textIdx === idx;
                    const isMatchPosition = currentStep?.matchPositions.some(
                      pos => idx >= pos && idx < pos + pattern.length
                    );

                    return (
                      <div
                        key={idx}
                        className={`w-9 h-12 flex flex-col items-center justify-center border transition-all relative ${
                          isComparing
                            ? "border-[var(--accent-yellow)] bg-[var(--accent-yellow)]/20"
                            : isInWindow
                            ? "border-[var(--accent-cyan)] bg-[var(--accent-cyan)]/10"
                            : isMatchPosition
                            ? "border-[var(--accent-green)] bg-[var(--accent-green)]/10"
                            : "border-[var(--border-color)] bg-[var(--bg-secondary)]"
                        }`}
                      >
                        <span className="text-[0.6rem] text-[var(--text-muted)] absolute top-0.5">
                          {idx}
                        </span>
                        <span className="text-base">{char}</span>
                      </div>
                    );
                  })}
                </div>
                {/* Position indicator */}
                {currentStep?.j !== null && currentStep?.j !== undefined && (
                  <div className="flex gap-0.5 justify-center mt-1">
                    {text.split("").map((_, idx) => {
                      const isJ = idx === currentStep?.j;
                      return (
                        <div
                          key={idx}
                          className={`w-9 text-center text-xs h-4 ${
                            isJ ? "text-[var(--accent-cyan)]" : ""
                          }`}
                        >
                          {isJ ? "j" : ""}
                        </div>
                      );
                    })}
                  </div>
                )}
              </>
            ) : (
              <EmptyState />
            )}
          </Section>

          {/* Pattern Display */}
          <Section title="pattern p (0-indexed)">
            {steps.length > 0 ? (
              <div className="flex gap-0.5 flex-wrap justify-center">
                {pattern.split("").map((char, idx) => {
                  const isComparing = currentStep?.comparingChars?.patternIdx === idx;
                  const isHighlighted = currentStep?.highlightPattern;

                  return (
                    <div
                      key={idx}
                      className={`w-9 h-12 flex flex-col items-center justify-center border transition-all relative ${
                        isComparing
                          ? "border-[var(--accent-yellow)] bg-[var(--accent-yellow)]/20"
                          : isHighlighted
                          ? "border-[var(--accent-magenta)] bg-[var(--accent-magenta)]/10"
                          : "border-[var(--border-color)] bg-[var(--bg-secondary)]"
                      }`}
                    >
                      <span className="text-[0.6rem] text-[var(--text-muted)] absolute top-0.5">
                        {idx}
                      </span>
                      <span className="text-base">{char}</span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <EmptyState />
            )}
          </Section>

          {/* Variables */}
          <Section title="variables">
            <div className="grid grid-cols-6 gap-2">
              <VariableCard
                name="n"
                value={text.length || "—"}
                active={false}
              />
              <VariableCard
                name="m"
                value={pattern.length || "—"}
                active={false}
              />
              <VariableCard
                name="q"
                value={prime || "—"}
                active={false}
              />
              <VariableCard
                name="h"
                value={currentStep?.h ?? "—"}
                active={currentStep?.type === "compute-h"}
              />
              <VariableCard
                name="p̄"
                value={currentStep?.pHash ?? "—"}
                active={currentStep?.type === "compute-hash" || currentStep?.type === "hash-check"}
              />
              <VariableCard
                name="t̄ⱼ"
                value={currentStep?.tHash ?? "—"}
                active={currentStep?.type === "compute-hash" || currentStep?.type === "hash-check" || currentStep?.type === "update-hash"}
              />
            </div>
            <div className="grid grid-cols-4 gap-2 mt-2">
              <VariableCard
                name="j"
                value={currentStep?.j ?? "—"}
                active={currentStep?.phase === "searching"}
              />
              <VariableCard
                name="i"
                value={currentStep?.i ?? "—"}
                active={currentStep?.type === "compute-hash" || currentStep?.type === "string-check"}
              />
              <VariableCard
                name="hash match"
                value={currentStep?.hashMatch ? "✓" : "✗"}
                active={currentStep?.hashMatch === true}
                highlight={currentStep?.hashMatch ? "green" : "red"}
              />
              <VariableCard
                name="string match"
                value={currentStep?.stringMatch === null ? "—" : currentStep?.stringMatch ? "✓" : "✗"}
                active={currentStep?.stringMatch !== null}
                highlight={currentStep?.stringMatch === true ? "green" : currentStep?.stringMatch === false ? "red" : undefined}
              />
            </div>
          </Section>

          {/* Hash Comparison Visual */}
          <Section title="hash comparison">
            {steps.length > 0 && currentStep?.phase === "searching" ? (
              <div className="flex items-center justify-center gap-8 py-4">
                <div className="text-center">
                  <div className="text-xs text-[var(--text-muted)] mb-1">pattern hash p̄</div>
                  <div className={`text-2xl font-bold ${
                    currentStep?.hashMatch ? "text-[var(--accent-green)]" : "text-[var(--text-primary)]"
                  }`}>
                    {currentStep?.pHash}
                  </div>
                </div>
                <div className={`text-3xl ${
                  currentStep?.hashMatch ? "text-[var(--accent-green)]" : "text-[var(--accent-red)]"
                }`}>
                  {currentStep?.hashMatch ? "=" : "≠"}
                </div>
                <div className="text-center">
                  <div className="text-xs text-[var(--text-muted)] mb-1">window hash t̄ⱼ</div>
                  <div className={`text-2xl font-bold ${
                    currentStep?.hashMatch ? "text-[var(--accent-green)]" : "text-[var(--text-primary)]"
                  }`}>
                    {currentStep?.tHash}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-6 text-[var(--text-muted)] text-sm">
                {steps.length === 0 ? "no data" : "preprocessing..."}
              </div>
            )}
          </Section>

          {/* Current Action */}
          <Section title="current action">
            <div className={`text-sm bg-[var(--bg-primary)] border p-3 min-h-[50px] ${
              currentStep?.type === "match-found"
                ? "border-[var(--accent-green)]"
                : currentStep?.type === "spurious-hit"
                ? "border-[var(--accent-red)]"
                : "border-[var(--border-color)]"
            }`}>
              {currentStep ? (
                <>
                  <span className="text-[var(--accent-green)]">
                    [{currentStepIndex + 1}/{steps.length}]
                  </span>{" "}
                  <span className={`${
                    currentStep.type === "match-found"
                      ? "text-[var(--accent-green)]"
                      : currentStep.type === "spurious-hit"
                      ? "text-[var(--accent-red)]"
                      : "text-[var(--text-primary)]"
                  }`}>
                    {currentStep.action}
                  </span>
                </>
              ) : (
                <span className="text-[var(--text-muted)]">
                  enter text and pattern, then click &quot;run&quot; to begin...
                </span>
              )}
            </div>
          </Section>

          {/* Matches Found */}
          <Section title="matches found">
            {currentStep?.matchPositions && currentStep.matchPositions.length > 0 ? (
              <div className="flex flex-wrap gap-2 justify-center">
                {currentStep.matchPositions.map((pos, idx) => (
                  <div
                    key={idx}
                    className="px-3 py-2 border border-[var(--accent-green)] bg-[var(--accent-green)]/10 text-[var(--accent-green)]"
                  >
                    <span className="text-xs text-[var(--text-muted)]">position</span>
                    <span className="ml-2 text-lg font-bold">{pos}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4 text-[var(--text-muted)] text-sm">
                {steps.length === 0 ? "no data" : "no matches yet"}
              </div>
            )}
          </Section>

          {/* Rolling Hash Explanation */}
          <Section title="rolling hash formula" className="text-sm">
            <div className="bg-[var(--bg-primary)] border border-[var(--border-color)] p-3 text-[var(--text-secondary)]">
              <div className="mb-2">
                <span className="text-[var(--accent-orange)]">t̄ⱼ₊₁</span>
                <span className="text-[var(--accent-red)]"> = </span>
                <span className="text-[var(--text-primary)]">(d(t̄ⱼ - t[j+1]×h) + t[j+m+1])</span>
                <span className="text-[var(--accent-magenta)]"> mod </span>
                <span className="text-[var(--accent-orange)]">q</span>
              </div>
              <div className="text-xs text-[var(--text-muted)]">
                Remove leftmost char contribution, shift left (×d), add new rightmost char
              </div>
            </div>
          </Section>
        </div>
      </div>
    </div>
  );
}

// ============================================
// HELPER COMPONENTS
// ============================================

function Section({
  title,
  children,
  className = "",
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`bg-[var(--bg-secondary)] border border-[var(--border-color)] overflow-hidden ${className}`}>
      <div className="px-3 py-2 bg-[var(--bg-tertiary)] border-b border-[var(--border-color)] text-xs text-[var(--text-muted)] uppercase tracking-wider">
        # {title}
      </div>
      <div className="p-3">{children}</div>
    </div>
  );
}

function VariableCard({
  name,
  value,
  active,
  highlight,
}: {
  name: string;
  value: string | number;
  active: boolean;
  highlight?: "green" | "red";
}) {
  const borderColor = highlight === "green"
    ? "border-[var(--accent-green)]"
    : highlight === "red"
    ? "border-[var(--accent-red)]"
    : active
    ? "border-[var(--accent-yellow)]"
    : "border-[var(--border-color)]";

  const textColor = highlight === "green"
    ? "text-[var(--accent-green)]"
    : highlight === "red"
    ? "text-[var(--accent-red)]"
    : active
    ? "text-[var(--accent-yellow)]"
    : "text-[var(--text-primary)]";

  return (
    <div
      className={`bg-[var(--bg-primary)] border p-2 text-center transition-all ${borderColor}`}
    >
      <div className="text-[0.65rem] text-[var(--text-muted)] uppercase mb-0.5">
        {name}
      </div>
      <div className={`text-lg ${textColor}`}>
        {value}
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="text-center py-6 text-[var(--text-muted)] text-sm">
      no data
    </div>
  );
}

