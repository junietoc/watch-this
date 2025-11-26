"use client";

/*
  🔤 KMPNEXT VISUALIZER PAGE
  Terminal-inspired clean design.
  Implements the optimized KMP failure function (ComputeKMPNext).
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
  jStart: number | null;
  jEnd: number | null;
  pI: string | null;
  pJ: string | null;
  pIPlus1: string | null;
  kmpnextIdx: number | null;
  kmpnextVal: number | null;
  kmpnextSnapshot: Record<number, number | null>;
  action: string;
  type: "init" | "for" | "while" | "while-exit" | "increment" | "if-check" | "assign-j" | "assign-kmpnext" | "end";
  comparison?: "match" | "mismatch" | "none";
  conditionMet?: boolean;
}

// ============================================
// ALGORITHM LOGIC
// ============================================

function computeAllSteps(originalPattern: string): Step[] {
  const p = " " + originalPattern;
  const m = originalPattern.length;
  const kmpnext: (number | null)[] = new Array(m + 2).fill(null);
  const allSteps: Step[] = [];

  kmpnext[1] = 0;
  let j = 0;
  
  allSteps.push({
    line: 3,
    i: null,
    j: 0,
    jStart: null,
    jEnd: 0,
    pI: null,
    pJ: null,
    pIPlus1: null,
    kmpnextIdx: 1,
    kmpnextVal: 0,
    kmpnextSnapshot: { 1: 0 },
    action: "Initialize: j ← 0, KMPnext[1] ← 0",
    type: "init",
  });

  for (let i = 1; i <= m; i++) {
    const jStart = j;

    allSteps.push({
      line: 4,
      i: i,
      j: j,
      jStart: jStart,
      jEnd: null,
      pI: p[i],
      pJ: j >= 1 && j <= m ? p[j] : null,
      pIPlus1: i < m ? p[i + 1] : null,
      kmpnextIdx: null,
      kmpnextVal: null,
      kmpnextSnapshot: { ...kmpnext } as Record<number, number | null>,
      action: `Enter for loop: i = ${i}`,
      type: "for",
    });

    while (j > 0 && p[i] !== p[j]) {
      allSteps.push({
        line: 5,
        i: i,
        j: j,
        jStart: jStart,
        jEnd: null,
        pI: p[i],
        pJ: p[j],
        pIPlus1: i < m ? p[i + 1] : null,
        kmpnextIdx: null,
        kmpnextVal: null,
        kmpnextSnapshot: { ...kmpnext } as Record<number, number | null>,
        action: `While: j=${j} > 0 and p[${i}]='${p[i]}' ≠ p[${j}]='${p[j]}' → j ← KMPnext[${j}] = ${kmpnext[j]}`,
        type: "while",
        comparison: "mismatch",
      });
      j = kmpnext[j]!;
    }

    if (j === 0) {
      allSteps.push({
        line: 5,
        i: i,
        j: j,
        jStart: jStart,
        jEnd: null,
        pI: p[i],
        pJ: null,
        pIPlus1: i < m ? p[i + 1] : null,
        kmpnextIdx: null,
        kmpnextVal: null,
        kmpnextSnapshot: { ...kmpnext } as Record<number, number | null>,
        action: `While check: j=${j} = 0, condition false → exit while`,
        type: "while-exit",
        comparison: "none",
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
        pIPlus1: i < m ? p[i + 1] : null,
        kmpnextIdx: null,
        kmpnextVal: null,
        kmpnextSnapshot: { ...kmpnext } as Record<number, number | null>,
        action: `While check: p[${i}]='${p[i]}' = p[${j}]='${p[j]}' → exit while`,
        type: "while-exit",
        comparison: "match",
      });
    }

    allSteps.push({
      line: 6,
      i: i,
      j: j,
      jStart: jStart,
      jEnd: j + 1,
      pI: p[i],
      pJ: j >= 1 && j <= m ? p[j] : null,
      pIPlus1: i < m ? p[i + 1] : null,
      kmpnextIdx: null,
      kmpnextVal: null,
      kmpnextSnapshot: { ...kmpnext } as Record<number, number | null>,
      action: `Increment: j ← j + 1 = ${j + 1}`,
      type: "increment",
      comparison: "none",
    });
    j++;

    // The key difference from MPnext: conditional assignment
    // if i = m or p[i + 1] ≠ p[j] then KMPnext[i + 1] ← j
    // else KMPnext[i + 1] ← KMPnext[j]
    
    const isLastPosition = i === m;
    const pIPlus1Char = i < m ? p[i + 1] : null;
    const pJChar = j >= 1 && j <= m ? p[j] : null;
    const nextCharsDiffer = pIPlus1Char !== pJChar;
    const conditionMet = isLastPosition || nextCharsDiffer;

    // Show the if-check step
    if (isLastPosition) {
      allSteps.push({
        line: 7,
        i: i,
        j: j,
        jStart: jStart,
        jEnd: j,
        pI: p[i],
        pJ: pJChar,
        pIPlus1: pIPlus1Char,
        kmpnextIdx: null,
        kmpnextVal: null,
        kmpnextSnapshot: { ...kmpnext } as Record<number, number | null>,
        action: `If check: i = m (${i} = ${m}) → true, use j = ${j}`,
        type: "if-check",
        conditionMet: true,
      });
    } else {
      const compResult = nextCharsDiffer ? "≠" : "=";
      allSteps.push({
        line: 7,
        i: i,
        j: j,
        jStart: jStart,
        jEnd: j,
        pI: p[i],
        pJ: pJChar,
        pIPlus1: pIPlus1Char,
        kmpnextIdx: null,
        kmpnextVal: null,
        kmpnextSnapshot: { ...kmpnext } as Record<number, number | null>,
        action: `If check: i ≠ m, p[${i + 1}]='${pIPlus1Char}' ${compResult} p[${j}]='${pJChar}' → ${conditionMet ? "then branch" : "else branch"}`,
        type: "if-check",
        conditionMet: conditionMet,
        comparison: nextCharsDiffer ? "mismatch" : "match",
      });
    }

    if (conditionMet) {
      // KMPnext[i + 1] ← j
      kmpnext[i + 1] = j;
      allSteps.push({
        line: 7,
        i: i,
        j: j,
        jStart: jStart,
        jEnd: j,
        pI: p[i],
        pJ: pJChar,
        pIPlus1: pIPlus1Char,
        kmpnextIdx: i + 1,
        kmpnextVal: j,
        kmpnextSnapshot: { ...kmpnext } as Record<number, number | null>,
        action: `Assign (then): KMPnext[${i + 1}] ← j = ${j}`,
        type: "assign-j",
      });
    } else {
      // KMPnext[i + 1] ← KMPnext[j]
      const kmpnextJVal = kmpnext[j]!;
      kmpnext[i + 1] = kmpnextJVal;
      allSteps.push({
        line: 8,
        i: i,
        j: j,
        jStart: jStart,
        jEnd: j,
        pI: p[i],
        pJ: pJChar,
        pIPlus1: pIPlus1Char,
        kmpnextIdx: i + 1,
        kmpnextVal: kmpnextJVal,
        kmpnextSnapshot: { ...kmpnext } as Record<number, number | null>,
        action: `Assign (else): KMPnext[${i + 1}] ← KMPnext[${j}] = ${kmpnextJVal}`,
        type: "assign-kmpnext",
      });
    }
  }

  allSteps.push({
    line: 10,
    i: null,
    j: j,
    jStart: null,
    jEnd: j,
    pI: null,
    pJ: null,
    pIPlus1: null,
    kmpnextIdx: null,
    kmpnextVal: null,
    kmpnextSnapshot: { ...kmpnext } as Record<number, number | null>,
    action: "Algorithm complete!",
    type: "end",
  });

  return allSteps;
}

// ============================================
// ALGORITHM CODE
// ============================================

const algorithmCode = [
  { line: 1, content: "ComputeKMPNext(p)    {m = |p|}", tokens: [
    { type: "function", text: "ComputeKMPNext" },
    { type: "bracket", text: "(" },
    { type: "variable", text: "p" },
    { type: "bracket", text: ")" },
    { type: "comment", text: "    {m = |p|}" },
  ]},
  { line: 2, content: "begin", tokens: [
    { type: "keyword", text: "begin" },
  ]},
  { line: 3, content: "   j ← KMPnext[1] ← 0", tokens: [
    { type: "plain", text: "   " },
    { type: "variable", text: "j" },
    { type: "operator", text: " ← " },
    { type: "variable", text: "KMPnext" },
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
  { line: 5, content: "      while j > 0 and p[i] ≠ p[j] do j ← KMPnext[j]", tokens: [
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
    { type: "variable", text: "KMPnext" },
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
  { line: 7, content: "      if i = m or p[i + 1] ≠ p[j] then KMPnext[i + 1] ← j", tokens: [
    { type: "plain", text: "      " },
    { type: "keyword", text: "if" },
    { type: "plain", text: " " },
    { type: "variable", text: "i" },
    { type: "operator", text: " = " },
    { type: "variable", text: "m" },
    { type: "plain", text: " " },
    { type: "keyword", text: "or" },
    { type: "plain", text: " " },
    { type: "variable", text: "p" },
    { type: "bracket", text: "[" },
    { type: "variable", text: "i" },
    { type: "operator", text: " + " },
    { type: "number", text: "1" },
    { type: "bracket", text: "]" },
    { type: "operator", text: " ≠ " },
    { type: "variable", text: "p" },
    { type: "bracket", text: "[" },
    { type: "variable", text: "j" },
    { type: "bracket", text: "]" },
    { type: "plain", text: " " },
    { type: "keyword", text: "then" },
    { type: "plain", text: " " },
    { type: "variable", text: "KMPnext" },
    { type: "bracket", text: "[" },
    { type: "variable", text: "i" },
    { type: "operator", text: " + " },
    { type: "number", text: "1" },
    { type: "bracket", text: "]" },
    { type: "operator", text: " ← " },
    { type: "variable", text: "j" },
  ]},
  { line: 8, content: "      else KMPnext[i + 1] ← KMPnext[j]", tokens: [
    { type: "plain", text: "      " },
    { type: "keyword", text: "else" },
    { type: "plain", text: " " },
    { type: "variable", text: "KMPnext" },
    { type: "bracket", text: "[" },
    { type: "variable", text: "i" },
    { type: "operator", text: " + " },
    { type: "number", text: "1" },
    { type: "bracket", text: "]" },
    { type: "operator", text: " ← " },
    { type: "variable", text: "KMPnext" },
    { type: "bracket", text: "[" },
    { type: "variable", text: "j" },
    { type: "bracket", text: "]" },
  ]},
  { line: 9, content: "   od", tokens: [
    { type: "plain", text: "   " },
    { type: "keyword", text: "od" },
  ]},
  { line: 10, content: "end", tokens: [
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

export default function KMPNextPage() {
  const [pattern, setPattern] = useState("abacabacab");
  const [inputValue, setInputValue] = useState("abacabacab");
  const [steps, setSteps] = useState<Step[]>([]);
  const [currentStepIndex, setCurrentStepIndex] = useState(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(2);
  const [codeWidth, setCodeWidth] = useState(480);
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
          <span className="text-[var(--text-primary)]">kmpnext</span>
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
                    const isJ = currentStep?.j === oneBasedIdx && currentStep.type !== "init" && currentStep.type !== "end";
                    const isIPlus1 = currentStep?.i !== null && currentStep.i + 1 === oneBasedIdx && currentStep.type === "if-check";
                    const isMatch = currentStep?.comparison === "match" && (isI || isJ);
                    const isMismatch = currentStep?.comparison === "mismatch" && (isI || isJ);

                    return (
                      <div
                        key={idx}
                        className={`w-10 h-12 flex flex-col items-center justify-center border transition-all relative ${
                          isIPlus1
                            ? "border-[var(--accent-cyan)] bg-[var(--accent-cyan)]/10"
                            : isI && isJ
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
                    const isJ = currentStep?.j === oneBasedIdx && currentStep.type !== "init" && currentStep.type !== "end";
                    const isIPlus1 = currentStep?.i !== null && currentStep.i + 1 === oneBasedIdx && currentStep.type === "if-check";
                    
                    return (
                      <div
                        key={idx}
                        className={`w-10 text-center text-xs h-4 ${
                          isIPlus1
                            ? "text-[var(--accent-cyan)]"
                            : isI && isJ
                            ? "text-[var(--accent-green)]"
                            : isI
                            ? "text-[var(--accent-green)]"
                            : isJ
                            ? "text-[var(--accent-magenta)]"
                            : ""
                        }`}
                      >
                        {isIPlus1 ? "i+1" : isI && isJ ? "i,j" : isI ? "i" : isJ ? "j" : ""}
                      </div>
                    );
                  })}
                </div>
                {/* Legend */}
                <div className="flex gap-4 justify-center flex-wrap mt-2 text-xs text-[var(--text-muted)]">
                  <span><span className="text-[var(--accent-green)]">■</span> i</span>
                  <span><span className="text-[var(--accent-magenta)]">■</span> j</span>
                  <span><span className="text-[var(--accent-cyan)]">■</span> i+1</span>
                  <span><span className="text-[var(--accent-green)]">✓</span> match</span>
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
                active={currentStep?.type === "for"}
              />
              <VariableCard
                name="j"
                value={currentStep?.j ?? "—"}
                active={["while", "while-exit", "increment"].includes(currentStep?.type || "")}
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
              <VariableCard
                name="p[i+1]"
                value={currentStep?.pIPlus1 ? `'${currentStep.pIPlus1}'` : "—"}
                active={currentStep?.type === "if-check"}
              />
            </div>
          </Section>

          {/* KMPNext Array */}
          <Section title="KMPNext array (1-indexed)">
            {steps.length > 0 ? (
              <div className="flex gap-0.5 flex-wrap justify-center">
                {Array.from({ length: pattern.length + 1 }, (_, i) => i + 1).map((idx) => {
                  const value = currentStep?.kmpnextSnapshot[idx];
                  const isCurrent = currentStep?.kmpnextIdx === idx;
                  const isFilled = value !== null && value !== undefined;

                  return (
                    <div
                      key={idx}
                      className={`w-10 h-12 flex flex-col items-center justify-center border transition-all ${
                        isCurrent
                          ? "border-[var(--accent-green)] bg-[var(--accent-green)]/10"
                          : "border-[var(--border-color)] bg-[var(--bg-secondary)]"
                      }`}
                    >
                      <span className="text-[0.55rem] text-[var(--text-muted)]">[{idx}]</span>
                      <span
                        className={`text-base ${
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

          {/* Condition Indicator */}
          {currentStep?.type === "if-check" && (
            <Section title="if condition">
              <div className={`text-sm p-3 border ${
                currentStep.conditionMet 
                  ? "border-[var(--accent-green)] bg-[var(--accent-green)]/10 text-[var(--accent-green)]"
                  : "border-[var(--accent-yellow)] bg-[var(--accent-yellow)]/10 text-[var(--accent-yellow)]"
              }`}>
                {currentStep.i === pattern.length ? (
                  <span>i = m → <strong>then branch</strong>: KMPnext[{currentStep.i! + 1}] ← j = {currentStep.j}</span>
                ) : (
                  <span>
                    p[{currentStep.i! + 1}]=&apos;{currentStep.pIPlus1}&apos; {currentStep.conditionMet ? "≠" : "="} p[{currentStep.j}]=&apos;{currentStep.pJ}&apos; → 
                    <strong>{currentStep.conditionMet ? " then branch" : " else branch"}</strong>:
                    {currentStep.conditionMet 
                      ? ` KMPnext[${currentStep.i! + 1}] ← j = ${currentStep.j}`
                      : ` KMPnext[${currentStep.i! + 1}] ← KMPnext[${currentStep.j}]`
                    }
                  </span>
                )}
              </div>
            </Section>
          )}

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
          <Section title="step history" className="flex-1">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="text-[var(--text-muted)] text-xs uppercase">
                    <th className="p-2 text-center border-b border-[var(--border-color)]">step</th>
                    <th className="p-2 text-center border-b border-[var(--border-color)]">i</th>
                    <th className="p-2 text-center border-b border-[var(--border-color)]">p[i]</th>
                    <th className="p-2 text-center border-b border-[var(--border-color)]">j_start</th>
                    <th className="p-2 text-center border-b border-[var(--border-color)]">j_end</th>
                    <th className="p-2 text-center border-b border-[var(--border-color)]">branch</th>
                    <th className="p-2 text-center border-b border-[var(--border-color)]">kmpnext</th>
                    <th className="p-2 text-left border-b border-[var(--border-color)]">action</th>
                  </tr>
                </thead>
                <tbody>
                  {steps
                    .filter((s, idx) => idx <= currentStepIndex && (s.type === "init" || s.type === "assign-j" || s.type === "assign-kmpnext" || s.type === "end"))
                    .map((step, idx) => {
                      const stepIndex = steps.indexOf(step);
                      const isCurrent = stepIndex === currentStepIndex ||
                        (currentStepIndex > stepIndex && 
                         (idx === steps.filter((s, i) => i <= currentStepIndex && (s.type === "init" || s.type === "assign-j" || s.type === "assign-kmpnext" || s.type === "end")).length - 1));

                      return (
                        <tr
                          key={stepIndex}
                          className={isCurrent ? "bg-[var(--line-highlight)]" : ""}
                        >
                          {step.type === "init" ? (
                            <>
                              <td className="p-2 text-center border-b border-[var(--border-color)] text-[var(--text-muted)]">0</td>
                              <td className="p-2 text-center border-b border-[var(--border-color)] text-[var(--text-muted)]">—</td>
                              <td className="p-2 text-center border-b border-[var(--border-color)] text-[var(--text-muted)]">—</td>
                              <td className="p-2 text-center border-b border-[var(--border-color)] text-[var(--text-muted)]">0</td>
                              <td className="p-2 text-center border-b border-[var(--border-color)] text-[var(--text-muted)]">0</td>
                              <td className="p-2 text-center border-b border-[var(--border-color)] text-[var(--text-muted)]">—</td>
                              <td className="p-2 text-center border-b border-[var(--border-color)] text-[var(--accent-green)]">[1]=0</td>
                              <td className="p-2 text-left border-b border-[var(--border-color)] text-[var(--text-secondary)] text-xs">init</td>
                            </>
                          ) : step.type === "assign-j" || step.type === "assign-kmpnext" ? (
                            <>
                              <td className="p-2 text-center border-b border-[var(--border-color)] text-[var(--text-muted)]">{idx}</td>
                              <td className="p-2 text-center border-b border-[var(--border-color)] text-[var(--accent-green)]">{step.i}</td>
                              <td className="p-2 text-center border-b border-[var(--border-color)] text-[var(--text-secondary)]">{step.pI}</td>
                              <td className="p-2 text-center border-b border-[var(--border-color)] text-[var(--text-muted)]">{step.jStart}</td>
                              <td className="p-2 text-center border-b border-[var(--border-color)] text-[var(--accent-magenta)]">{step.jEnd}</td>
                              <td className={`p-2 text-center border-b border-[var(--border-color)] ${
                                step.type === "assign-j" ? "text-[var(--accent-green)]" : "text-[var(--accent-yellow)]"
                              }`}>
                                {step.type === "assign-j" ? "then" : "else"}
                              </td>
                              <td className="p-2 text-center border-b border-[var(--border-color)] text-[var(--accent-green)]">[{step.kmpnextIdx}]={step.kmpnextVal}</td>
                              <td className="p-2 text-left border-b border-[var(--border-color)] text-[var(--text-secondary)] text-xs truncate max-w-[200px]">{step.action}</td>
                            </>
                          ) : (
                            <>
                              <td className="p-2 text-center border-b border-[var(--border-color)] text-[var(--accent-green)]">✓</td>
                              <td colSpan={7} className="p-2 text-center border-b border-[var(--border-color)] text-[var(--accent-green)]">complete</td>
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

