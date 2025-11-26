"use client";

/*
  🔤 BOYER-MOORE COMPUTED (D Array) VISUALIZER PAGE
  Terminal-inspired clean design.
  
  Computes the D array (good suffix shift) for Boyer-Moore algorithm.
*/

import Link from "next/link";
import { useState, useEffect, useRef, useCallback } from "react";

// ============================================
// TYPES
// ============================================

interface Step {
  line: number;
  i: number | null;
  j: number;
  pVar: number | null; // the p variable used in second loop (not the pattern)
  pI: string | null;
  pJ: string | null;
  dIdx: number | null;
  dVal: number | null;
  rnextIdx: number | null;
  rnextVal: number | null;
  dSnapshot: Record<number, number | undefined>;
  rnextSnapshot: Record<number, number | undefined>;
  action: string;
  type: "init" | "for-down" | "while" | "while-exit" | "d-assign" | "rnext-assign" | "for-up" | "d-fill" | "p-update" | "end";
  comparison?: "match" | "mismatch" | "none";
}

// ============================================
// ALGORITHM LOGIC
// ============================================

function computeAllSteps(originalPattern: string): Step[] {
  const p = " " + originalPattern; // 1-indexed
  const m = originalPattern.length;
  
  // D[0..m] - good suffix shift
  const D: (number | undefined)[] = new Array(m + 1).fill(undefined);
  // Rnext[0..m] - reverse failure function
  const Rnext: (number | undefined)[] = new Array(m + 1).fill(undefined);
  
  const allSteps: Step[] = [];

  // Line 3: j ← Rnext[m] ← m + 1
  let j = m + 1;
  Rnext[m] = m + 1;
  
  allSteps.push({
    line: 3,
    i: null,
    j: j,
    pVar: null,
    pI: null,
    pJ: null,
    dIdx: null,
    dVal: null,
    rnextIdx: m,
    rnextVal: m + 1,
    dSnapshot: { ...D } as Record<number, number | undefined>,
    rnextSnapshot: { ...Rnext } as Record<number, number | undefined>,
    action: `Initialize: j ← Rnext[${m}] ← ${m + 1}`,
    type: "init",
  });

  // Line 4: for i ← m downto 1 do
  for (let i = m; i >= 1; i--) {
    allSteps.push({
      line: 4,
      i: i,
      j: j,
      pVar: null,
      pI: p[i],
      pJ: j >= 1 && j <= m ? p[j] : null,
      dIdx: null,
      dVal: null,
      rnextIdx: null,
      rnextVal: null,
      dSnapshot: { ...D } as Record<number, number | undefined>,
      rnextSnapshot: { ...Rnext } as Record<number, number | undefined>,
      action: `Enter for loop: i = ${i} (downto 1)`,
      type: "for-down",
    });

    // Line 5-8: while j ≤ m and p[i] ≠ p[j] do
    while (j <= m && p[i] !== p[j]) {
      allSteps.push({
        line: 5,
        i: i,
        j: j,
        pVar: null,
        pI: p[i],
        pJ: p[j],
        dIdx: null,
        dVal: null,
        rnextIdx: null,
        rnextVal: null,
        dSnapshot: { ...D } as Record<number, number | undefined>,
        rnextSnapshot: { ...Rnext } as Record<number, number | undefined>,
        action: `While: j=${j} ≤ ${m} and p[${i}]='${p[i]}' ≠ p[${j}]='${p[j]}'`,
        type: "while",
        comparison: "mismatch",
      });

      // Line 6: if D[j] undefined then D[j] ← j - i
      if (D[j] === undefined) {
        D[j] = j - i;
        allSteps.push({
          line: 6,
          i: i,
          j: j,
          pVar: null,
          pI: p[i],
          pJ: p[j],
          dIdx: j,
          dVal: j - i,
          rnextIdx: null,
          rnextVal: null,
          dSnapshot: { ...D } as Record<number, number | undefined>,
          rnextSnapshot: { ...Rnext } as Record<number, number | undefined>,
          action: `D[${j}] undefined → D[${j}] ← ${j} - ${i} = ${j - i}`,
          type: "d-assign",
        });
      }

      // Line 7: j ← Rnext[j]
      const oldJ = j;
      j = Rnext[j]!;
      allSteps.push({
        line: 7,
        i: i,
        j: j,
        pVar: null,
        pI: p[i],
        pJ: j >= 1 && j <= m ? p[j] : null,
        dIdx: null,
        dVal: null,
        rnextIdx: null,
        rnextVal: null,
        dSnapshot: { ...D } as Record<number, number | undefined>,
        rnextSnapshot: { ...Rnext } as Record<number, number | undefined>,
        action: `j ← Rnext[${oldJ}] = ${j}`,
        type: "while",
      });
    }

    // While exit
    if (j > m) {
      allSteps.push({
        line: 5,
        i: i,
        j: j,
        pVar: null,
        pI: p[i],
        pJ: null,
        dIdx: null,
        dVal: null,
        rnextIdx: null,
        rnextVal: null,
        dSnapshot: { ...D } as Record<number, number | undefined>,
        rnextSnapshot: { ...Rnext } as Record<number, number | undefined>,
        action: `While check: j=${j} > ${m}, condition false → exit while`,
        type: "while-exit",
        comparison: "none",
      });
    } else if (p[i] === p[j]) {
      allSteps.push({
        line: 5,
        i: i,
        j: j,
        pVar: null,
        pI: p[i],
        pJ: p[j],
        dIdx: null,
        dVal: null,
        rnextIdx: null,
        rnextVal: null,
        dSnapshot: { ...D } as Record<number, number | undefined>,
        rnextSnapshot: { ...Rnext } as Record<number, number | undefined>,
        action: `While check: p[${i}]='${p[i]}' = p[${j}]='${p[j]}' → exit while`,
        type: "while-exit",
        comparison: "match",
      });
    }

    // Line 9: j ← j - 1; Rnext[i - 1] ← j
    j = j - 1;
    Rnext[i - 1] = j;
    allSteps.push({
      line: 9,
      i: i,
      j: j,
      pVar: null,
      pI: p[i],
      pJ: j >= 1 && j <= m ? p[j] : null,
      dIdx: null,
      dVal: null,
      rnextIdx: i - 1,
      rnextVal: j,
      dSnapshot: { ...D } as Record<number, number | undefined>,
      rnextSnapshot: { ...Rnext } as Record<number, number | undefined>,
      action: `j ← j - 1 = ${j}; Rnext[${i - 1}] ← ${j}`,
      type: "rnext-assign",
    });
  }

  // Line 11: p ← Rnext[0]
  let pVar = Rnext[0]!;
  allSteps.push({
    line: 11,
    i: null,
    j: j,
    pVar: pVar,
    pI: null,
    pJ: null,
    dIdx: null,
    dVal: null,
    rnextIdx: null,
    rnextVal: null,
    dSnapshot: { ...D } as Record<number, number | undefined>,
    rnextSnapshot: { ...Rnext } as Record<number, number | undefined>,
    action: `p ← Rnext[0] = ${pVar}`,
    type: "init",
  });

  // Line 12: for j ← 0 to m do
  for (let jLoop = 0; jLoop <= m; jLoop++) {
    allSteps.push({
      line: 12,
      i: null,
      j: jLoop,
      pVar: pVar,
      pI: null,
      pJ: null,
      dIdx: null,
      dVal: null,
      rnextIdx: null,
      rnextVal: null,
      dSnapshot: { ...D } as Record<number, number | undefined>,
      rnextSnapshot: { ...Rnext } as Record<number, number | undefined>,
      action: `Enter for loop: j = ${jLoop}`,
      type: "for-up",
    });

    // Line 13: if D[j] undefined then D[j] ← p
    if (D[jLoop] === undefined) {
      D[jLoop] = pVar;
      allSteps.push({
        line: 13,
        i: null,
        j: jLoop,
        pVar: pVar,
        pI: null,
        pJ: null,
        dIdx: jLoop,
        dVal: pVar,
        rnextIdx: null,
        rnextVal: null,
        dSnapshot: { ...D } as Record<number, number | undefined>,
        rnextSnapshot: { ...Rnext } as Record<number, number | undefined>,
        action: `D[${jLoop}] undefined → D[${jLoop}] ← p = ${pVar}`,
        type: "d-fill",
      });
    }

    // Line 14: if j = p then p ← Rnext[p]
    if (jLoop === pVar) {
      const oldP = pVar;
      pVar = Rnext[pVar]!;
      allSteps.push({
        line: 14,
        i: null,
        j: jLoop,
        pVar: pVar,
        pI: null,
        pJ: null,
        dIdx: null,
        dVal: null,
        rnextIdx: null,
        rnextVal: null,
        dSnapshot: { ...D } as Record<number, number | undefined>,
        rnextSnapshot: { ...Rnext } as Record<number, number | undefined>,
        action: `j=${jLoop} = p=${oldP} → p ← Rnext[${oldP}] = ${pVar}`,
        type: "p-update",
      });
    }
  }

  allSteps.push({
    line: 16,
    i: null,
    j: m,
    pVar: pVar,
    pI: null,
    pJ: null,
    dIdx: null,
    dVal: null,
    rnextIdx: null,
    rnextVal: null,
    dSnapshot: { ...D } as Record<number, number | undefined>,
    rnextSnapshot: { ...Rnext } as Record<number, number | undefined>,
    action: "Algorithm complete!",
    type: "end",
  });

  return allSteps;
}

// ============================================
// ALGORITHM CODE
// ============================================

const algorithmCode = [
  { line: 1, content: "ComputeD(p)    {m = |p|}", tokens: [
    { type: "function", text: "ComputeD" },
    { type: "bracket", text: "(" },
    { type: "variable", text: "p" },
    { type: "bracket", text: ")" },
    { type: "comment", text: "    {m = |p|}" },
  ]},
  { line: 2, content: "begin", tokens: [
    { type: "keyword", text: "begin" },
  ]},
  { line: 3, content: "   j ← Rnext[m] ← m + 1", tokens: [
    { type: "plain", text: "   " },
    { type: "variable", text: "j" },
    { type: "operator", text: " ← " },
    { type: "variable", text: "Rnext" },
    { type: "bracket", text: "[" },
    { type: "variable", text: "m" },
    { type: "bracket", text: "]" },
    { type: "operator", text: " ← " },
    { type: "variable", text: "m" },
    { type: "operator", text: " + " },
    { type: "number", text: "1" },
  ]},
  { line: 4, content: "   for i ← m downto 1 do", tokens: [
    { type: "plain", text: "   " },
    { type: "keyword", text: "for" },
    { type: "plain", text: " " },
    { type: "variable", text: "i" },
    { type: "operator", text: " ← " },
    { type: "variable", text: "m" },
    { type: "plain", text: " " },
    { type: "keyword", text: "downto" },
    { type: "plain", text: " " },
    { type: "number", text: "1" },
    { type: "plain", text: " " },
    { type: "keyword", text: "do" },
  ]},
  { line: 5, content: "      while j ≤ m and p[i] ≠ p[j] do", tokens: [
    { type: "plain", text: "      " },
    { type: "keyword", text: "while" },
    { type: "plain", text: " " },
    { type: "variable", text: "j" },
    { type: "operator", text: " ≤ " },
    { type: "variable", text: "m" },
    { type: "plain", text: " " },
    { type: "keyword", text: "and" },
    { type: "plain", text: " " },
    { type: "variable", text: "p" },
    { type: "bracket", text: "[" },
    { type: "variable", text: "i" },
    { type: "bracket", text: "]" },
    { type: "operator", text: " ≠ " },
    { type: "variable", text: "p" },
    { type: "bracket", text: "[" },
    { type: "variable", text: "j" },
    { type: "bracket", text: "]" },
    { type: "plain", text: " " },
    { type: "keyword", text: "do" },
  ]},
  { line: 6, content: "         if D[j] undefined then D[j] ← j − i", tokens: [
    { type: "plain", text: "         " },
    { type: "keyword", text: "if" },
    { type: "plain", text: " " },
    { type: "variable", text: "D" },
    { type: "bracket", text: "[" },
    { type: "variable", text: "j" },
    { type: "bracket", text: "]" },
    { type: "plain", text: " " },
    { type: "keyword", text: "undefined" },
    { type: "plain", text: " " },
    { type: "keyword", text: "then" },
    { type: "plain", text: " " },
    { type: "variable", text: "D" },
    { type: "bracket", text: "[" },
    { type: "variable", text: "j" },
    { type: "bracket", text: "]" },
    { type: "operator", text: " ← " },
    { type: "variable", text: "j" },
    { type: "operator", text: " − " },
    { type: "variable", text: "i" },
  ]},
  { line: 7, content: "         j ← Rnext[j]", tokens: [
    { type: "plain", text: "         " },
    { type: "variable", text: "j" },
    { type: "operator", text: " ← " },
    { type: "variable", text: "Rnext" },
    { type: "bracket", text: "[" },
    { type: "variable", text: "j" },
    { type: "bracket", text: "]" },
  ]},
  { line: 8, content: "      od", tokens: [
    { type: "plain", text: "      " },
    { type: "keyword", text: "od" },
  ]},
  { line: 9, content: "      j ← j − 1; Rnext[i − 1] ← j", tokens: [
    { type: "plain", text: "      " },
    { type: "variable", text: "j" },
    { type: "operator", text: " ← " },
    { type: "variable", text: "j" },
    { type: "operator", text: " − " },
    { type: "number", text: "1" },
    { type: "plain", text: "; " },
    { type: "variable", text: "Rnext" },
    { type: "bracket", text: "[" },
    { type: "variable", text: "i" },
    { type: "operator", text: " − " },
    { type: "number", text: "1" },
    { type: "bracket", text: "]" },
    { type: "operator", text: " ← " },
    { type: "variable", text: "j" },
  ]},
  { line: 10, content: "   od", tokens: [
    { type: "plain", text: "   " },
    { type: "keyword", text: "od" },
  ]},
  { line: 11, content: "   p ← Rnext[0]", tokens: [
    { type: "plain", text: "   " },
    { type: "variable", text: "p" },
    { type: "operator", text: " ← " },
    { type: "variable", text: "Rnext" },
    { type: "bracket", text: "[" },
    { type: "number", text: "0" },
    { type: "bracket", text: "]" },
  ]},
  { line: 12, content: "   for j ← 0 to m do", tokens: [
    { type: "plain", text: "   " },
    { type: "keyword", text: "for" },
    { type: "plain", text: " " },
    { type: "variable", text: "j" },
    { type: "operator", text: " ← " },
    { type: "number", text: "0" },
    { type: "plain", text: " " },
    { type: "keyword", text: "to" },
    { type: "plain", text: " " },
    { type: "variable", text: "m" },
    { type: "plain", text: " " },
    { type: "keyword", text: "do" },
  ]},
  { line: 13, content: "      if D[j] undefined then D[j] ← p", tokens: [
    { type: "plain", text: "      " },
    { type: "keyword", text: "if" },
    { type: "plain", text: " " },
    { type: "variable", text: "D" },
    { type: "bracket", text: "[" },
    { type: "variable", text: "j" },
    { type: "bracket", text: "]" },
    { type: "plain", text: " " },
    { type: "keyword", text: "undefined" },
    { type: "plain", text: " " },
    { type: "keyword", text: "then" },
    { type: "plain", text: " " },
    { type: "variable", text: "D" },
    { type: "bracket", text: "[" },
    { type: "variable", text: "j" },
    { type: "bracket", text: "]" },
    { type: "operator", text: " ← " },
    { type: "variable", text: "p" },
  ]},
  { line: 14, content: "      if j = p then p ← Rnext[p]", tokens: [
    { type: "plain", text: "      " },
    { type: "keyword", text: "if" },
    { type: "plain", text: " " },
    { type: "variable", text: "j" },
    { type: "operator", text: " = " },
    { type: "variable", text: "p" },
    { type: "plain", text: " " },
    { type: "keyword", text: "then" },
    { type: "plain", text: " " },
    { type: "variable", text: "p" },
    { type: "operator", text: " ← " },
    { type: "variable", text: "Rnext" },
    { type: "bracket", text: "[" },
    { type: "variable", text: "p" },
    { type: "bracket", text: "]" },
  ]},
  { line: 15, content: "   od", tokens: [
    { type: "plain", text: "   " },
    { type: "keyword", text: "od" },
  ]},
  { line: 16, content: "end", tokens: [
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

export default function BMComputeDPage() {
  const [pattern, setPattern] = useState("abacabacab");
  const [inputValue, setInputValue] = useState("abacabacab");
  const [steps, setSteps] = useState<Step[]>([]);
  const [currentStepIndex, setCurrentStepIndex] = useState(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(2);
  const [codeWidth, setCodeWidth] = useState(450);
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
      const newWidth = Math.min(Math.max(280, e.clientX), window.innerWidth * 0.6);
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
    const trimmedPattern = inputValue.trim();
    if (!trimmedPattern || trimmedPattern.length < 2) {
      alert("Please enter a pattern with at least 2 characters.");
      return;
    }

    stopPlaying();
    setPattern(trimmedPattern);
    const newSteps = computeAllSteps(trimmedPattern);
    setSteps(newSteps);
    setCurrentStepIndex(0);
  }, [inputValue, stopPlaying]);

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
          <span className="text-[var(--text-primary)]">bm-computed</span>
        </Link>

        {/* Input Controls */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="text-[var(--text-muted)] text-sm">pattern:</span>
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && startVisualization()}
              placeholder="enter pattern..."
              className="px-3 py-1.5 text-sm bg-[var(--bg-primary)] border border-[var(--border-color)] text-[var(--text-primary)] w-40 focus:outline-none focus:border-[var(--accent-green)] transition-colors"
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
          {/* Pattern Display */}
          <Section title="pattern (1-indexed)">
            {steps.length > 0 ? (
              <>
                <div className="flex gap-0.5 flex-wrap justify-center">
                  {pattern.split("").map((char, idx) => {
                    const oneBasedIdx = idx + 1;
                    const isI = currentStep?.i === oneBasedIdx;
                    const isJ = currentStep?.j === oneBasedIdx && 
                               currentStep.type !== "init" && 
                               currentStep.type !== "end" &&
                               currentStep.type !== "for-up" &&
                               currentStep.type !== "d-fill" &&
                               currentStep.type !== "p-update";
                    const isMatch = currentStep?.comparison === "match" && (isI || isJ);
                    const isMismatch = currentStep?.comparison === "mismatch" && (isI || isJ);

                    return (
                      <div
                        key={idx}
                        className={`w-10 h-12 flex flex-col items-center justify-center border transition-all relative ${
                          isI && isJ
                            ? "border-[var(--accent-green)] bg-[var(--accent-green)]/10"
                            : isI
                            ? "border-[var(--accent-green)] bg-[var(--accent-green)]/10"
                            : isJ
                            ? "border-[var(--accent-magenta)] bg-[var(--accent-magenta)]/10"
                            : "border-[var(--border-color)] bg-[var(--bg-secondary)]"
                        } ${
                          isMatch ? "border-[var(--accent-green)] bg-[var(--accent-green)]/15" : ""
                        } ${
                          isMismatch ? "border-[var(--accent-red)] bg-[var(--accent-red)]/10" : ""
                        }`}
                      >
                        <span className="text-[0.6rem] text-[var(--text-muted)] absolute top-0.5">
                          {oneBasedIdx}
                        </span>
                        <span className="text-base">{char}</span>
                      </div>
                    );
                  })}
                </div>
                {/* Pointer Labels */}
                <div className="flex gap-0.5 justify-center mt-1">
                  {pattern.split("").map((_, idx) => {
                    const oneBasedIdx = idx + 1;
                    const isI = currentStep?.i === oneBasedIdx;
                    const isJ = currentStep?.j === oneBasedIdx && 
                               currentStep.type !== "init" && 
                               currentStep.type !== "end" &&
                               currentStep.type !== "for-up" &&
                               currentStep.type !== "d-fill" &&
                               currentStep.type !== "p-update";
                    
                    return (
                      <div
                        key={idx}
                        className={`w-10 text-center text-xs h-4 ${
                          isI && isJ
                            ? "text-[var(--accent-green)]"
                            : isI
                            ? "text-[var(--accent-green)]"
                            : isJ
                            ? "text-[var(--accent-magenta)]"
                            : ""
                        }`}
                      >
                        {isI && isJ ? "i,j" : isI ? "i" : isJ ? "j" : ""}
                      </div>
                    );
                  })}
                </div>
                {/* Legend */}
                <div className="flex gap-4 justify-center flex-wrap mt-2 text-xs text-[var(--text-muted)]">
                  <span><span className="text-[var(--accent-green)]">■</span> i</span>
                  <span><span className="text-[var(--accent-magenta)]">■</span> j</span>
                  <span><span className="text-[var(--accent-green)]">✓</span> match</span>
                  <span><span className="text-[var(--accent-red)]">✗</span> mismatch</span>
                </div>
              </>
            ) : (
              <EmptyState />
            )}
          </Section>

          {/* Variables */}
          <Section title="variables">
            <div className="grid grid-cols-6 gap-2">
              <VariableCard
                name="i"
                value={currentStep?.i ?? "—"}
                active={currentStep?.type === "for-down"}
              />
              <VariableCard
                name="j"
                value={currentStep?.j ?? "—"}
                active={["while", "while-exit", "rnext-assign", "for-up"].includes(currentStep?.type || "")}
              />
              <VariableCard
                name="p (var)"
                value={currentStep?.pVar ?? "—"}
                active={["d-fill", "p-update"].includes(currentStep?.type || "")}
              />
              <VariableCard
                name="m"
                value={pattern.length || "—"}
                active={false}
              />
              <VariableCard
                name="p[i]"
                value={currentStep?.pI ? `'${currentStep.pI}'` : "—"}
                active={false}
              />
              <VariableCard
                name="p[j]"
                value={currentStep?.pJ ? `'${currentStep.pJ}'` : "—"}
                active={false}
              />
            </div>
          </Section>

          {/* D Array */}
          <Section title="D array - Good Suffix Shift (0-indexed)">
            {steps.length > 0 ? (
              <div className="flex gap-0.5 flex-wrap justify-center">
                {Array.from({ length: pattern.length + 1 }, (_, idx) => idx).map((idx) => {
                  const value = currentStep?.dSnapshot[idx];
                  const isCurrent = currentStep?.dIdx === idx;
                  const isFilled = value !== undefined;

                  return (
                    <div
                      key={idx}
                      className={`w-10 h-12 flex flex-col items-center justify-center border transition-all ${
                        isCurrent
                          ? "border-[var(--accent-cyan)] bg-[var(--accent-cyan)]/10"
                          : "border-[var(--border-color)] bg-[var(--bg-secondary)]"
                      }`}
                    >
                      <span className="text-[0.55rem] text-[var(--text-muted)]">[{idx}]</span>
                      <span
                        className={`text-base ${
                          isFilled ? "text-[var(--accent-cyan)]" : "text-[var(--text-muted)]"
                        }`}
                      >
                        {isFilled ? value : "—"}
                      </span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <EmptyState />
            )}
          </Section>

          {/* Rnext Array */}
          <Section title="Rnext array - Reverse Next (0-indexed)">
            {steps.length > 0 ? (
              <div className="flex gap-0.5 flex-wrap justify-center">
                {Array.from({ length: pattern.length + 1 }, (_, idx) => idx).map((idx) => {
                  const value = currentStep?.rnextSnapshot[idx];
                  const isCurrent = currentStep?.rnextIdx === idx;
                  const isFilled = value !== undefined;

                  return (
                    <div
                      key={idx}
                      className={`w-10 h-12 flex flex-col items-center justify-center border transition-all ${
                        isCurrent
                          ? "border-[var(--accent-yellow)] bg-[var(--accent-yellow)]/10"
                          : "border-[var(--border-color)] bg-[var(--bg-secondary)]"
                      }`}
                    >
                      <span className="text-[0.55rem] text-[var(--text-muted)]">[{idx}]</span>
                      <span
                        className={`text-base ${
                          isFilled ? "text-[var(--accent-yellow)]" : "text-[var(--text-muted)]"
                        }`}
                      >
                        {isFilled ? value : "—"}
                      </span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <EmptyState />
            )}
          </Section>

          {/* Current Action */}
          <Section title="current action">
            <div className="text-sm bg-[var(--bg-primary)] border border-[var(--border-color)] p-3 min-h-[50px]">
              {currentStep ? (
                <>
                  <span className="text-[var(--accent-green)]">
                    [{currentStepIndex + 1}/{steps.length}]
                  </span>{" "}
                  <span className="text-[var(--text-primary)]">{currentStep.action}</span>
                </>
              ) : (
                <span className="text-[var(--text-muted)]">
                  enter a pattern and click &quot;run&quot; to begin...
                </span>
              )}
            </div>
          </Section>

          {/* Step History Table */}
          <Section title="assignment history" className="flex-1">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="text-[var(--text-muted)] text-xs uppercase">
                    <th className="p-2 text-center border-b border-[var(--border-color)]">step</th>
                    <th className="p-2 text-center border-b border-[var(--border-color)]">i</th>
                    <th className="p-2 text-center border-b border-[var(--border-color)]">j</th>
                    <th className="p-2 text-center border-b border-[var(--border-color)]">D</th>
                    <th className="p-2 text-center border-b border-[var(--border-color)]">Rnext</th>
                    <th className="p-2 text-left border-b border-[var(--border-color)]">action</th>
                  </tr>
                </thead>
                <tbody>
                  {steps
                    .filter((s, idx) => idx <= currentStepIndex && 
                      (s.type === "init" || s.type === "d-assign" || s.type === "rnext-assign" || s.type === "d-fill" || s.type === "end"))
                    .map((step, idx) => {
                      const stepIndex = steps.indexOf(step);
                      const relevantSteps = steps.filter((s, i) => 
                        i <= currentStepIndex && 
                        (s.type === "init" || s.type === "d-assign" || s.type === "rnext-assign" || s.type === "d-fill" || s.type === "end")
                      );
                      const isCurrent = stepIndex === currentStepIndex ||
                        (idx === relevantSteps.length - 1);

                      return (
                        <tr
                          key={stepIndex}
                          className={isCurrent ? "bg-[var(--line-highlight)]" : ""}
                        >
                          {step.type === "end" ? (
                            <>
                              <td className="p-2 text-center border-b border-[var(--border-color)] text-[var(--accent-green)]">✓</td>
                              <td colSpan={5} className="p-2 text-center border-b border-[var(--border-color)] text-[var(--accent-green)]">complete</td>
                            </>
                          ) : (
                            <>
                              <td className="p-2 text-center border-b border-[var(--border-color)] text-[var(--text-muted)]">{idx}</td>
                              <td className="p-2 text-center border-b border-[var(--border-color)] text-[var(--accent-green)]">{step.i ?? "—"}</td>
                              <td className="p-2 text-center border-b border-[var(--border-color)] text-[var(--accent-magenta)]">{step.j}</td>
                              <td className="p-2 text-center border-b border-[var(--border-color)] text-[var(--accent-cyan)]">
                                {step.dIdx !== null ? `[${step.dIdx}]=${step.dVal}` : "—"}
                              </td>
                              <td className="p-2 text-center border-b border-[var(--border-color)] text-[var(--accent-yellow)]">
                                {step.rnextIdx !== null ? `[${step.rnextIdx}]=${step.rnextVal}` : "—"}
                              </td>
                              <td className="p-2 text-left border-b border-[var(--border-color)] text-[var(--text-secondary)] text-xs truncate max-w-[200px]">{step.action}</td>
                            </>
                          )}
                        </tr>
                      );
                    })}
                </tbody>
              </table>
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
}: {
  name: string;
  value: string | number;
  active: boolean;
}) {
  return (
    <div
      className={`bg-[var(--bg-primary)] border p-2 text-center transition-all ${
        active
          ? "border-[var(--accent-yellow)]"
          : "border-[var(--border-color)]"
      }`}
    >
      <div className="text-[0.65rem] text-[var(--text-muted)] uppercase mb-0.5">
        {name}
      </div>
      <div className={`text-lg ${active ? "text-[var(--accent-yellow)]" : "text-[var(--text-primary)]"}`}>
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

