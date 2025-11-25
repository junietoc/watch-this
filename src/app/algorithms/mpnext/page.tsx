"use client";

/*
  🔤 MPNEXT VISUALIZER PAGE
  
  This is your original visualizer converted to React!
  
  KEY REACT CONCEPTS USED:
  
  1. useState: Stores data that can change (like currentStep, pattern, etc.)
     - When state changes, React re-renders the component
  
  2. useEffect: Runs code at specific times
     - After render, on mount, when dependencies change
  
  3. useRef: Stores values that DON'T cause re-renders
     - Good for intervals, DOM elements, etc.
  
  4. useCallback: Memoizes functions to prevent unnecessary re-renders
     - Important for effects that depend on functions
  
  COMPONENT STRUCTURE:
  - Main page component (MPNextPage)
  - Sub-components for each section (PatternDisplay, CodePanel, etc.)
*/

import Link from "next/link";
import { useState, useEffect, useRef, useCallback } from "react";

// ============================================
// TYPES - Define the shape of our data
// ============================================

interface Step {
  line: number;
  i: number | null;
  j: number;
  jStart: number | null;
  jEnd: number | null;
  pI: string | null;
  pJ: string | null;
  mpnextIdx: number | null;
  mpnextVal: number | null;
  mpnextSnapshot: Record<number, number | null>;
  action: string;
  type: "init" | "for" | "while" | "while-exit" | "increment" | "no-increment" | "assign" | "end";
  comparison?: "match" | "mismatch" | "none";
}

// ============================================
// ALGORITHM LOGIC - Compute all steps
// ============================================

function computeAllSteps(p: string): Step[] {
  const m = p.length;
  const mpnext: (number | null)[] = new Array(m + 1).fill(null);
  const allSteps: Step[] = [];

  // Step 0: Initialization - line 3
  mpnext[1] = 0;
  allSteps.push({
    line: 3,
    i: null,
    j: 0,
    jStart: null,
    jEnd: 0,
    pI: null,
    pJ: null,
    mpnextIdx: 1,
    mpnextVal: 0,
    mpnextSnapshot: { 1: 0 },
    action: "Initialize: j ← 0, MPnext[1] ← 0",
    type: "init",
  });

  let j = 0;

  for (let i = 1; i < m; i++) {
    const jStart = j;

    // Step: Enter for loop - line 4
    allSteps.push({
      line: 4,
      i: i,
      j: j,
      jStart: jStart,
      jEnd: null,
      pI: p[i],
      pJ: j < m ? p[j] : null,
      mpnextIdx: null,
      mpnextVal: null,
      mpnextSnapshot: { ...mpnext } as Record<number, number | null>,
      action: `Enter for loop: i = ${i}`,
      type: "for",
    });

    // While loop iterations - line 5
    while (j > 0 && p[i] !== p[j]) {
      allSteps.push({
        line: 5,
        i: i,
        j: j,
        jStart: jStart,
        jEnd: null,
        pI: p[i],
        pJ: p[j],
        mpnextIdx: null,
        mpnextVal: null,
        mpnextSnapshot: { ...mpnext } as Record<number, number | null>,
        action: `While: j=${j} > 0 and p[${i}]='${p[i]}' ≠ p[${j}]='${p[j]}' → j ← MPnext[${j}] = ${mpnext[j]}`,
        type: "while",
        comparison: "mismatch",
      });
      j = mpnext[j]!;
    }

    // Check condition - line 5 (when skipped or exited)
    if (j === 0) {
      allSteps.push({
        line: 5,
        i: i,
        j: j,
        jStart: jStart,
        jEnd: null,
        pI: p[i],
        pJ: p[j],
        mpnextIdx: null,
        mpnextVal: null,
        mpnextSnapshot: { ...mpnext } as Record<number, number | null>,
        action: `While check: j=${j} = 0, condition false → exit while`,
        type: "while-exit",
        comparison: p[i] === p[j] ? "match" : "none",
      });
    } else if (p[i] === p[j]) {
      allSteps.push({
        line: 5,
        i: i,
        j: j,
        jStart: jStart,
        jEnd: null,
        pI: p[i],
        pJ: p[j],
        mpnextIdx: null,
        mpnextVal: null,
        mpnextSnapshot: { ...mpnext } as Record<number, number | null>,
        action: `While check: p[${i}]='${p[i]}' = p[${j}]='${p[j]}' → exit while`,
        type: "while-exit",
        comparison: "match",
      });
    }

    // Check for match and increment - line 6
    const matched = p[i] === p[j];
    if (matched) {
      allSteps.push({
        line: 6,
        i: i,
        j: j,
        jStart: jStart,
        jEnd: j + 1,
        pI: p[i],
        pJ: p[j],
        mpnextIdx: null,
        mpnextVal: null,
        mpnextSnapshot: { ...mpnext } as Record<number, number | null>,
        action: `Match: p[${i}]='${p[i]}' = p[${j}]='${p[j]}' → j ← j + 1 = ${j + 1}`,
        type: "increment",
        comparison: "match",
      });
      j++;
    } else {
      allSteps.push({
        line: 6,
        i: i,
        j: j,
        jStart: jStart,
        jEnd: j,
        pI: p[i],
        pJ: p[j],
        mpnextIdx: null,
        mpnextVal: null,
        mpnextSnapshot: { ...mpnext } as Record<number, number | null>,
        action: `No match: p[${i}]='${p[i]}' ≠ p[${j}]='${p[j]}' → j stays ${j}`,
        type: "no-increment",
        comparison: "mismatch",
      });
    }

    // Assign MPnext - line 7
    mpnext[i + 1] = j;
    allSteps.push({
      line: 7,
      i: i,
      j: j,
      jStart: jStart,
      jEnd: j,
      pI: p[i],
      pJ: null,
      mpnextIdx: i + 1,
      mpnextVal: j,
      mpnextSnapshot: { ...mpnext } as Record<number, number | null>,
      action: `Assign: MPnext[${i + 1}] ← ${j}`,
      type: "assign",
    });
  }

  // End - line 9
  allSteps.push({
    line: 9,
    i: null,
    j: j,
    jStart: null,
    jEnd: j,
    pI: null,
    pJ: null,
    mpnextIdx: null,
    mpnextVal: null,
    mpnextSnapshot: { ...mpnext } as Record<number, number | null>,
    action: "Algorithm complete!",
    type: "end",
  });

  return allSteps;
}

// ============================================
// ALGORITHM CODE - The pseudocode to display
// ============================================

const algorithmCode = [
  { line: 1, content: "ComputeMPNext(p)    {m = |p|}", tokens: [
    { type: "function", text: "ComputeMPNext" },
    { type: "bracket", text: "(" },
    { type: "variable", text: "p" },
    { type: "bracket", text: ")" },
    { type: "comment", text: "    {m = |p|}" },
  ]},
  { line: 2, content: "begin", tokens: [
    { type: "keyword", text: "begin" },
  ]},
  { line: 3, content: "   j ← MPnext[1] ← 0", tokens: [
    { type: "plain", text: "   " },
    { type: "variable", text: "j" },
    { type: "operator", text: " ← " },
    { type: "variable", text: "MPnext" },
    { type: "bracket", text: "[" },
    { type: "number", text: "1" },
    { type: "bracket", text: "]" },
    { type: "operator", text: " ← " },
    { type: "number", text: "0" },
  ]},
  { line: 4, content: "   for i ← 1 to m do", tokens: [
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
  ]},
  { line: 5, content: "      while j > 0 and p[i] ≠ p[j] do j ← MPnext[j]", tokens: [
    { type: "plain", text: "      " },
    { type: "keyword", text: "while" },
    { type: "plain", text: " " },
    { type: "variable", text: "j" },
    { type: "operator", text: " > " },
    { type: "number", text: "0" },
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
    { type: "plain", text: " " },
    { type: "variable", text: "j" },
    { type: "operator", text: " ← " },
    { type: "variable", text: "MPnext" },
    { type: "bracket", text: "[" },
    { type: "variable", text: "j" },
    { type: "bracket", text: "]" },
  ]},
  { line: 6, content: "      j ← j + 1", tokens: [
    { type: "plain", text: "      " },
    { type: "variable", text: "j" },
    { type: "operator", text: " ← " },
    { type: "variable", text: "j" },
    { type: "operator", text: " + " },
    { type: "number", text: "1" },
  ]},
  { line: 7, content: "      MPnext[i + 1] ← j", tokens: [
    { type: "plain", text: "      " },
    { type: "variable", text: "MPnext" },
    { type: "bracket", text: "[" },
    { type: "variable", text: "i" },
    { type: "operator", text: " + " },
    { type: "number", text: "1" },
    { type: "bracket", text: "]" },
    { type: "operator", text: " ← " },
    { type: "variable", text: "j" },
  ]},
  { line: 8, content: "   od", tokens: [
    { type: "plain", text: "   " },
    { type: "keyword", text: "od" },
  ]},
  { line: 9, content: "end", tokens: [
    { type: "keyword", text: "end" },
  ]},
];

// Token type to color mapping
const tokenColors: Record<string, string> = {
  keyword: "text-[var(--accent-magenta)] font-medium",
  function: "text-[var(--accent-cyan)]",
  variable: "text-[var(--accent-orange)]",
  operator: "text-[var(--accent-red)]",
  number: "text-[var(--accent-green)]",
  comment: "text-[var(--text-muted)] italic",
  bracket: "text-[var(--text-secondary)]",
  plain: "",
};

// ============================================
// MAIN COMPONENT
// ============================================

export default function MPNextPage() {
  // State management
  const [pattern, setPattern] = useState("abacabacab");
  const [inputValue, setInputValue] = useState("abacabacab");
  const [steps, setSteps] = useState<Step[]>([]);
  const [currentStepIndex, setCurrentStepIndex] = useState(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(2); // steps per second
  
  // Refs for values that don't trigger re-renders
  const playIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const codeContainerRef = useRef<HTMLDivElement>(null);

  // Current step data
  const currentStep = currentStepIndex >= 0 ? steps[currentStepIndex] : null;

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

  // Handle autoplay
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

  // Scroll to highlighted code line
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

  // Keyboard shortcuts
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
    <div className="min-h-screen bg-[var(--bg-primary)] flex flex-col">
      {/* Header */}
      <header className="bg-[var(--bg-secondary)] border-b border-[var(--border-color)] px-4 py-3 flex items-center justify-between flex-wrap gap-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center text-sm font-bold text-white group-hover:scale-105 transition-transform">
            λ
          </div>
          <span className="font-bold text-[var(--accent-cyan)]">
            MPNext Visualizer
          </span>
        </Link>

        {/* Input Controls */}
        <div className="flex items-center gap-3 flex-wrap">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && startVisualization()}
            placeholder="Enter pattern..."
            className="px-4 py-2 font-mono text-sm bg-[var(--bg-tertiary)] border border-[var(--border-color)] rounded-lg text-[var(--text-primary)] w-48 focus:outline-none focus:border-[var(--accent-cyan)] focus:ring-2 focus:ring-[var(--accent-cyan)]/20 transition-all"
          />
          <button
            onClick={startVisualization}
            className="px-4 py-2 bg-[var(--accent-green)] text-black font-semibold rounded-lg hover:bg-green-400 transition-colors"
          >
            Run
          </button>
          <button
            onClick={resetVisualization}
            className="px-4 py-2 bg-[var(--bg-tertiary)] border border-[var(--border-color)] text-[var(--text-primary)] font-semibold rounded-lg hover:border-[var(--accent-cyan)] transition-colors"
          >
            Reset
          </button>
        </div>

        {/* Playback Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={goToStart}
            className="w-9 h-9 flex items-center justify-center bg-[var(--bg-tertiary)] border border-[var(--border-color)] rounded-lg hover:border-[var(--accent-cyan)] transition-colors"
            title="Go to start"
          >
            ⏮
          </button>
          <button
            onClick={prevStep}
            className="w-9 h-9 flex items-center justify-center bg-[var(--bg-tertiary)] border border-[var(--border-color)] rounded-lg hover:border-[var(--accent-cyan)] transition-colors"
            title="Previous step"
          >
            ◀
          </button>
          <button
            onClick={playPause}
            className="w-9 h-9 flex items-center justify-center bg-[var(--accent-green)] text-black rounded-lg hover:bg-green-400 transition-colors"
            title="Play/Pause"
          >
            {isPlaying ? "⏸" : "▶"}
          </button>
          <button
            onClick={nextStep}
            className="w-9 h-9 flex items-center justify-center bg-[var(--bg-tertiary)] border border-[var(--border-color)] rounded-lg hover:border-[var(--accent-cyan)] transition-colors"
            title="Next step"
          >
            ▶
          </button>
          <button
            onClick={goToEnd}
            className="w-9 h-9 flex items-center justify-center bg-[var(--bg-tertiary)] border border-[var(--border-color)] rounded-lg hover:border-[var(--accent-cyan)] transition-colors"
            title="Go to end"
          >
            ⏭
          </button>

          {/* Speed Control */}
          <div className="flex items-center gap-2 ml-4 text-sm text-[var(--text-secondary)]">
            <input
              type="range"
              min="0.5"
              max="10"
              step="0.5"
              value={speed}
              onChange={(e) => setSpeed(parseFloat(e.target.value))}
              className="w-24 h-1.5 appearance-none bg-[var(--bg-tertiary)] rounded cursor-pointer accent-[var(--accent-cyan)]"
            />
            <div className="px-3 py-1 bg-[var(--bg-tertiary)] border border-[var(--border-color)] rounded-lg flex items-center gap-1">
              <span className="font-mono font-semibold text-[var(--accent-cyan)] min-w-[28px] text-right">
                {speed < 1 ? speed.toFixed(1) : Math.round(speed)}
              </span>
              <span className="text-xs text-[var(--text-muted)]">steps/sec</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Code Panel */}
        <div className="w-[480px] min-w-[280px] max-w-[70vw] bg-[var(--bg-code)] border-r border-[var(--border-color)] flex flex-col shrink-0">
          <div className="px-4 py-3 bg-[var(--bg-secondary)] border-b border-[var(--border-color)] text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider flex items-center gap-2 sticky top-0 z-10">
            <span>📜</span>
            Algorithm Code
          </div>
          <div ref={codeContainerRef} className="flex-1 overflow-y-auto overflow-x-auto">
            {algorithmCode.map((line) => (
              <div
                key={line.line}
                data-line={line.line}
                className={`flex font-mono text-sm leading-7 transition-colors min-w-fit hover:bg-white/[0.03] ${
                  currentStep?.line === line.line
                    ? "bg-[var(--line-highlight)] border-l-[3px] border-[var(--accent-cyan)]"
                    : ""
                }`}
              >
                <span
                  className={`w-12 px-3 text-right shrink-0 select-none bg-[var(--bg-secondary)] border-r border-[var(--border-color)] ${
                    currentStep?.line === line.line
                      ? "text-[var(--accent-cyan)]"
                      : "text-[var(--text-muted)]"
                  }`}
                >
                  {line.line}
                </span>
                <span className="px-4 py-1 whitespace-pre">
                  {line.tokens.map((token, i) => (
                    <span key={i} className={tokenColors[token.type]}>
                      {token.text}
                    </span>
                  ))}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Execution Panel */}
        <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-5 min-w-[300px]">
          {/* Pattern Display */}
          <Section title="Pattern String (0-indexed)" icon="🔤">
            {steps.length > 0 ? (
              <>
                <div className="flex gap-1 flex-wrap justify-center">
                  {pattern.split("").map((char, idx) => {
                    const isI = currentStep?.i === idx;
                    const isJ = currentStep?.j === idx && currentStep.type !== "init" && currentStep.type !== "end";
                    const isMatch = currentStep?.comparison === "match" && (isI || isJ);
                    const isMismatch = currentStep?.comparison === "mismatch" && (isI || isJ);

                    return (
                      <div
                        key={idx}
                        className={`w-11 h-13 flex flex-col items-center justify-center rounded-md border-2 font-mono transition-all relative ${
                          isI && isJ
                            ? "border-[var(--accent-cyan)] bg-[var(--accent-cyan)]/15 shadow-[0_0_12px_var(--glow-cyan)]"
                            : isI
                            ? "border-[var(--accent-cyan)] bg-[var(--accent-cyan)]/15 shadow-[0_0_12px_var(--glow-cyan)]"
                            : isJ
                            ? "border-[var(--accent-magenta)] bg-[var(--accent-magenta)]/15 shadow-[0_0_12px_var(--glow-magenta)]"
                            : "border-[var(--border-color)] bg-[var(--bg-tertiary)]"
                        } ${
                          isMatch ? "border-[var(--accent-green)] bg-[var(--accent-green)]/15" : ""
                        } ${
                          isMismatch ? "border-[var(--accent-red)] bg-[var(--accent-red)]/15" : ""
                        }`}
                      >
                        <span className="text-[0.65rem] text-[var(--text-muted)] absolute top-0.5">
                          {idx}
                        </span>
                        <span className="text-lg font-semibold">{char}</span>
                      </div>
                    );
                  })}
                </div>
                {/* Pointer Labels */}
                <div className="flex gap-1 justify-center mt-2">
                  {pattern.split("").map((_, idx) => {
                    const isI = currentStep?.i === idx;
                    const isJ = currentStep?.j === idx && currentStep.type !== "init" && currentStep.type !== "end";
                    
                    return (
                      <div
                        key={idx}
                        className={`w-11 text-center font-mono text-xs font-semibold h-5 ${
                          isI && isJ
                            ? "text-[var(--accent-cyan)]"
                            : isI
                            ? "text-[var(--accent-cyan)]"
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
                <div className="flex gap-5 justify-center flex-wrap mt-3">
                  <LegendItem color="cyan" label="i position" />
                  <LegendItem color="magenta" label="j position" />
                  <LegendItem color="green" label="match" />
                </div>
              </>
            ) : (
              <EmptyState />
            )}
          </Section>

          {/* Variables */}
          <Section title="Variables" icon="📊">
            <div className="grid grid-cols-5 gap-3">
              <VariableCard
                name="i"
                value={currentStep?.i ?? "—"}
                active={currentStep?.type === "for"}
              />
              <VariableCard
                name="j"
                value={currentStep?.j ?? "—"}
                active={["while", "while-exit", "increment", "no-increment"].includes(currentStep?.type || "")}
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

          {/* MPNext Array */}
          <Section title="MPNext Array (1-indexed)" icon="📈">
            {steps.length > 0 ? (
              <div className="flex gap-1 flex-wrap justify-center">
                {Array.from({ length: pattern.length }, (_, i) => i + 1).map((idx) => {
                  const value = currentStep?.mpnextSnapshot[idx];
                  const isCurrent = currentStep?.mpnextIdx === idx;
                  const isFilled = value !== null && value !== undefined;

                  return (
                    <div
                      key={idx}
                      className={`w-11 h-14 flex flex-col items-center justify-center rounded-md border-2 font-mono transition-all ${
                        isCurrent
                          ? "border-[var(--accent-green)] bg-[var(--accent-green)]/15 shadow-[0_0_12px_rgba(63,185,80,0.3)]"
                          : "border-[var(--border-color)] bg-[var(--bg-tertiary)]"
                      }`}
                    >
                      <span className="text-[0.6rem] text-[var(--text-muted)]">[{idx}]</span>
                      <span
                        className={`text-lg font-bold ${
                          isFilled ? "text-[var(--accent-green)]" : "text-[var(--text-muted)]"
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
          <Section title="Current Action" icon="⚡">
            <div className="font-mono text-sm bg-[var(--bg-tertiary)] rounded-lg p-4 min-h-[60px] leading-relaxed">
              {currentStep ? (
                <>
                  <span className="text-[var(--accent-cyan)] font-semibold">
                    Step {currentStepIndex + 1}/{steps.length}:
                  </span>{" "}
                  <span className="text-[var(--text-primary)]">{currentStep.action}</span>
                </>
              ) : (
                <span className="text-[var(--text-secondary)]">
                  Enter a pattern and click &quot;Run&quot; to begin...
                </span>
              )}
            </div>
          </Section>

          {/* Step History Table */}
          <Section title="Step History" icon="📜" className="flex-1">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse font-mono text-sm">
                <thead>
                  <tr>
                    <th className="p-3 text-center border-b border-[var(--border-color)] bg-[var(--bg-tertiary)] text-[var(--accent-cyan)] font-semibold uppercase text-xs tracking-wider sticky top-0">
                      Step
                    </th>
                    <th className="p-3 text-center border-b border-[var(--border-color)] bg-[var(--bg-tertiary)] text-[var(--accent-cyan)] font-semibold uppercase text-xs tracking-wider sticky top-0">
                      i
                    </th>
                    <th className="p-3 text-center border-b border-[var(--border-color)] bg-[var(--bg-tertiary)] text-[var(--accent-cyan)] font-semibold uppercase text-xs tracking-wider sticky top-0">
                      p[i]
                    </th>
                    <th className="p-3 text-center border-b border-[var(--border-color)] bg-[var(--bg-tertiary)] text-[var(--accent-cyan)] font-semibold uppercase text-xs tracking-wider sticky top-0">
                      j start
                    </th>
                    <th className="p-3 text-center border-b border-[var(--border-color)] bg-[var(--bg-tertiary)] text-[var(--accent-cyan)] font-semibold uppercase text-xs tracking-wider sticky top-0">
                      j end
                    </th>
                    <th className="p-3 text-center border-b border-[var(--border-color)] bg-[var(--bg-tertiary)] text-[var(--accent-cyan)] font-semibold uppercase text-xs tracking-wider sticky top-0">
                      MPnext
                    </th>
                    <th className="p-3 text-left border-b border-[var(--border-color)] bg-[var(--bg-tertiary)] text-[var(--accent-cyan)] font-semibold uppercase text-xs tracking-wider sticky top-0 max-w-[300px]">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {steps
                    .filter((s, idx) => idx <= currentStepIndex && (s.type === "init" || s.type === "assign" || s.type === "end"))
                    .map((step, idx) => {
                      const stepIndex = steps.indexOf(step);
                      const isCurrent = stepIndex === currentStepIndex ||
                        (currentStepIndex > stepIndex && 
                         (idx === steps.filter((s, i) => i <= currentStepIndex && (s.type === "init" || s.type === "assign" || s.type === "end")).length - 1));

                      return (
                        <tr
                          key={stepIndex}
                          className={`${isCurrent ? "bg-[var(--line-highlight)]" : ""}`}
                        >
                          {step.type === "init" ? (
                            <>
                              <td className="p-3 text-center border-b border-[var(--border-color)] text-[var(--text-secondary)]">0</td>
                              <td className="p-3 text-center border-b border-[var(--border-color)] text-[var(--text-secondary)]">—</td>
                              <td className="p-3 text-center border-b border-[var(--border-color)] text-[var(--text-secondary)]">—</td>
                              <td className="p-3 text-center border-b border-[var(--border-color)] text-[var(--text-secondary)]">0</td>
                              <td className="p-3 text-center border-b border-[var(--border-color)] text-[var(--text-secondary)]">0</td>
                              <td className="p-3 text-center border-b border-[var(--border-color)] text-[var(--accent-green)]">MPnext[1]=0</td>
                              <td className="p-3 text-left border-b border-[var(--border-color)] text-[var(--text-secondary)] text-xs max-w-[300px]">Initialize</td>
                            </>
                          ) : step.type === "assign" ? (
                            <>
                              <td className="p-3 text-center border-b border-[var(--border-color)] text-[var(--text-secondary)]">{idx}</td>
                              <td className="p-3 text-center border-b border-[var(--border-color)] text-[var(--accent-cyan)]">{step.i}</td>
                              <td className="p-3 text-center border-b border-[var(--border-color)] text-[var(--text-secondary)]">{step.pI}</td>
                              <td className="p-3 text-center border-b border-[var(--border-color)] text-[var(--text-secondary)]">{step.jStart}</td>
                              <td className="p-3 text-center border-b border-[var(--border-color)] text-[var(--accent-magenta)]">{step.jEnd}</td>
                              <td className="p-3 text-center border-b border-[var(--border-color)] text-[var(--accent-green)]">MPnext[{step.mpnextIdx}]={step.mpnextVal}</td>
                              <td className="p-3 text-left border-b border-[var(--border-color)] text-[var(--text-secondary)] text-xs max-w-[300px]">{step.action}</td>
                            </>
                          ) : (
                            <>
                              <td className="p-3 text-center border-b border-[var(--border-color)] text-[var(--text-secondary)]">✓</td>
                              <td colSpan={6} className="p-3 text-center border-b border-[var(--border-color)] text-[var(--accent-green)]">Algorithm complete!</td>
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
  icon,
  children,
  className = "",
}: {
  title: string;
  icon: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl overflow-hidden ${className}`}>
      <div className="px-4 py-2.5 bg-[var(--bg-tertiary)] border-b border-[var(--border-color)] text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider flex items-center gap-2">
        <span>{icon}</span>
        {title}
      </div>
      <div className="p-4">{children}</div>
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
      className={`bg-[var(--bg-tertiary)] border rounded-lg p-3 text-center transition-all ${
        active
          ? "border-[var(--accent-yellow)] shadow-[0_0_12px_rgba(210,153,34,0.2)]"
          : "border-[var(--border-color)]"
      }`}
    >
      <div className="text-[0.7rem] text-[var(--text-muted)] uppercase tracking-wider mb-1">
        {name}
      </div>
      <div className="font-mono text-xl font-bold text-[var(--accent-yellow)]">
        {value}
      </div>
    </div>
  );
}

function LegendItem({ color, label }: { color: "cyan" | "magenta" | "green"; label: string }) {
  const colorClasses = {
    cyan: "border-[var(--accent-cyan)] bg-[var(--accent-cyan)]/15",
    magenta: "border-[var(--accent-magenta)] bg-[var(--accent-magenta)]/15",
    green: "border-[var(--accent-green)] bg-[var(--accent-green)]/15",
  };

  return (
    <div className="flex items-center gap-1.5 text-xs text-[var(--text-secondary)]">
      <div className={`w-3 h-3 rounded-sm border-2 ${colorClasses[color]}`} />
      {label}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="text-center py-8 text-[var(--text-muted)]">
      No pattern loaded
    </div>
  );
}

