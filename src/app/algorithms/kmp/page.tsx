"use client";

/*
  🎯 KMP (KNUTH-MORRIS-PRATT) STRING MATCHING VISUALIZER
  Terminal-inspired clean design.
  Uses the optimized KMPnext failure function for fewer comparisons.
*/

import Link from "next/link";
import { useState, useEffect, useRef, useCallback } from "react";

// ============================================
// TYPES
// ============================================

interface Step {
  line: number;
  i: number;
  j: number;
  tChar: string | null;
  pChar: string | null;
  kmpnext: number[];
  matches: number[];
  action: string;
  type: "init" | "outer-while" | "inner-while" | "inner-while-exit" | "increment" | "match-found" | "end";
  comparison?: "match" | "mismatch" | "reset" | "none";
}

// ============================================
// COMPUTE KMPNEXT (OPTIMIZED FAILURE FUNCTION)
// ============================================

function computeKMPNext(pattern: string): number[] {
  const m = pattern.length;
  const kmpnext: number[] = new Array(m + 2).fill(0);
  const p = " " + pattern; // 1-indexed
  
  kmpnext[1] = 0;
  let j = 0;
  
  for (let i = 1; i <= m; i++) {
    // While loop: fallback on mismatch
    while (j > 0 && p[i] !== p[j]) {
      j = kmpnext[j];
    }
    
    j++;
    
    // The KMP optimization: check if next characters match
    if (i === m || p[i + 1] !== p[j]) {
      kmpnext[i + 1] = j;
    } else {
      kmpnext[i + 1] = kmpnext[j];
    }
  }
  
  return kmpnext;
}

// ============================================
// ALGORITHM LOGIC
// ============================================

function computeAllSteps(text: string, pattern: string): Step[] {
  const n = text.length;
  const m = pattern.length;
  const kmpnext = computeKMPNext(pattern);
  const allSteps: Step[] = [];
  const matches: number[] = [];

  const t = " " + text;
  const p = " " + pattern;

  let i = 1;
  let j = 1;
  
  allSteps.push({
    line: 3,
    i: i,
    j: j,
    tChar: null,
    pChar: null,
    kmpnext: [...kmpnext],
    matches: [...matches],
    action: "Initialize: i ← 1, j ← 1",
    type: "init",
  });

  while (j <= n) {
    allSteps.push({
      line: 4,
      i: i,
      j: j,
      tChar: t[j],
      pChar: i <= m ? p[i] : null,
      kmpnext: [...kmpnext],
      matches: [...matches],
      action: `Outer while: j=${j} ≤ n=${n}, continue`,
      type: "outer-while",
    });

    while ((i === m + 1) || (i > 0 && p[i] !== t[j])) {
      const reason = i === m + 1 
        ? `i=${i} = m+1=${m + 1} (found match, look for next)`
        : `i=${i} > 0 and p[${i}]='${p[i]}' ≠ t[${j}]='${t[j]}'`;
      
      allSteps.push({
        line: 5,
        i: i,
        j: j,
        tChar: t[j],
        pChar: i <= m ? p[i] : null,
        kmpnext: [...kmpnext],
        matches: [...matches],
        action: `Inner while: ${reason} → i ← KMPnext[${i}] = ${kmpnext[i]}`,
        type: "inner-while",
        comparison: i === m + 1 ? "reset" : "mismatch",
      });
      
      i = kmpnext[i];
    }

    if (i === 0) {
      allSteps.push({
        line: 5,
        i: i,
        j: j,
        tChar: t[j],
        pChar: p[1],
        kmpnext: [...kmpnext],
        matches: [...matches],
        action: `Inner while exit: i=${i} = 0, will try fresh match`,
        type: "inner-while-exit",
        comparison: "none",
      });
    } else {
      allSteps.push({
        line: 5,
        i: i,
        j: j,
        tChar: t[j],
        pChar: p[i],
        kmpnext: [...kmpnext],
        matches: [...matches],
        action: `Inner while exit: p[${i}]='${p[i]}' = t[${j}]='${t[j]}' (match!)`,
        type: "inner-while-exit",
        comparison: "match",
      });
    }

    i++;
    j++;
    
    allSteps.push({
      line: 6,
      i: i,
      j: j,
      tChar: j <= n ? t[j] : null,
      pChar: i <= m ? p[i] : null,
      kmpnext: [...kmpnext],
      matches: [...matches],
      action: `Increment: i ← ${i - 1} + 1 = ${i}, j ← ${j - 1} + 1 = ${j}`,
      type: "increment",
    });

    if (i === m + 1) {
      const matchPos = j - i + 1;
      matches.push(matchPos);
      
      allSteps.push({
        line: 7,
        i: i,
        j: j,
        tChar: j <= n ? t[j] : null,
        pChar: null,
        kmpnext: [...kmpnext],
        matches: [...matches],
        action: `Match found! i=${i} = m+1=${m + 1} → Output position ${matchPos}`,
        type: "match-found",
        comparison: "match",
      });
    }
  }

  allSteps.push({
    line: 9,
    i: i,
    j: j,
    tChar: null,
    pChar: null,
    kmpnext: [...kmpnext],
    matches: [...matches],
    action: `Complete! Found ${matches.length} match${matches.length !== 1 ? "es" : ""}: ${matches.length > 0 ? matches.join(", ") : "none"}`,
    type: "end",
  });

  return allSteps;
}

// ============================================
// ALGORITHM CODE
// ============================================

const algorithmCode = [
  { line: 1, content: "KMP(t, p)    {n = |t|, m = |p|}", tokens: [
    { type: "function", text: "KMP" },
    { type: "bracket", text: "(" },
    { type: "variable", text: "t" },
    { type: "plain", text: ", " },
    { type: "variable", text: "p" },
    { type: "bracket", text: ")" },
    { type: "comment", text: "    {n = |t|, m = |p|}" },
  ]},
  { line: 2, content: "begin", tokens: [
    { type: "keyword", text: "begin" },
  ]},
  { line: 3, content: "   i ← j ← 1", tokens: [
    { type: "plain", text: "   " },
    { type: "variable", text: "i" },
    { type: "operator", text: " ← " },
    { type: "variable", text: "j" },
    { type: "operator", text: " ← " },
    { type: "number", text: "1" },
  ]},
  { line: 4, content: "   while j ≤ n do", tokens: [
    { type: "plain", text: "   " },
    { type: "keyword", text: "while" },
    { type: "plain", text: " " },
    { type: "variable", text: "j" },
    { type: "operator", text: " ≤ " },
    { type: "variable", text: "n" },
    { type: "plain", text: " " },
    { type: "keyword", text: "do" },
  ]},
  { line: 5, content: "      while (i = m + 1) or (i > 0 and p[i] ≠ t[j]) do i ← KMPnext[i]", tokens: [
    { type: "plain", text: "      " },
    { type: "keyword", text: "while" },
    { type: "plain", text: " " },
    { type: "bracket", text: "(" },
    { type: "variable", text: "i" },
    { type: "operator", text: " = " },
    { type: "variable", text: "m" },
    { type: "operator", text: " + " },
    { type: "number", text: "1" },
    { type: "bracket", text: ")" },
    { type: "plain", text: " " },
    { type: "keyword", text: "or" },
    { type: "plain", text: " " },
    { type: "bracket", text: "(" },
    { type: "variable", text: "i" },
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
    { type: "variable", text: "t" },
    { type: "bracket", text: "[" },
    { type: "variable", text: "j" },
    { type: "bracket", text: "]" },
    { type: "bracket", text: ")" },
    { type: "plain", text: " " },
    { type: "keyword", text: "do" },
    { type: "plain", text: " " },
    { type: "variable", text: "i" },
    { type: "operator", text: " ← " },
    { type: "variable", text: "KMPnext" },
    { type: "bracket", text: "[" },
    { type: "variable", text: "i" },
    { type: "bracket", text: "]" },
  ]},
  { line: 6, content: "      i ← i + 1; j ← j + 1", tokens: [
    { type: "plain", text: "      " },
    { type: "variable", text: "i" },
    { type: "operator", text: " ← " },
    { type: "variable", text: "i" },
    { type: "operator", text: " + " },
    { type: "number", text: "1" },
    { type: "plain", text: "; " },
    { type: "variable", text: "j" },
    { type: "operator", text: " ← " },
    { type: "variable", text: "j" },
    { type: "operator", text: " + " },
    { type: "number", text: "1" },
  ]},
  { line: 7, content: "      if i = m + 1 then Output(j − i + 1)", tokens: [
    { type: "plain", text: "      " },
    { type: "keyword", text: "if" },
    { type: "plain", text: " " },
    { type: "variable", text: "i" },
    { type: "operator", text: " = " },
    { type: "variable", text: "m" },
    { type: "operator", text: " + " },
    { type: "number", text: "1" },
    { type: "plain", text: " " },
    { type: "keyword", text: "then" },
    { type: "plain", text: " " },
    { type: "function", text: "Output" },
    { type: "bracket", text: "(" },
    { type: "variable", text: "j" },
    { type: "operator", text: " − " },
    { type: "variable", text: "i" },
    { type: "operator", text: " + " },
    { type: "number", text: "1" },
    { type: "bracket", text: ")" },
  ]},
  { line: 8, content: "   od", tokens: [
    { type: "plain", text: "   " },
    { type: "keyword", text: "od" },
  ]},
  { line: 9, content: "end", tokens: [
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

export default function KMPPage() {
  const [text, setText] = useState("abacabacababacabacab");
  const [pattern, setPattern] = useState("abacab");
  const [textInput, setTextInput] = useState("abacabacababacabacab");
  const [patternInput, setPatternInput] = useState("abacab");
  const [steps, setSteps] = useState<Step[]>([]);
  const [currentStepIndex, setCurrentStepIndex] = useState(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(2);
  const [codeWidth, setCodeWidth] = useState(520);
  const [isResizing, setIsResizing] = useState(false);
  
  const playIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const codeContainerRef = useRef<HTMLDivElement>(null);

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
    const trimmedText = textInput.trim();
    const trimmedPattern = patternInput.trim();
    
    if (!trimmedText || trimmedText.length < 1) {
      alert("Please enter a text string.");
      return;
    }
    if (!trimmedPattern || trimmedPattern.length < 1) {
      alert("Please enter a pattern string.");
      return;
    }
    if (trimmedPattern.length > trimmedText.length) {
      alert("Pattern cannot be longer than text.");
      return;
    }

    stopPlaying();
    setText(trimmedText);
    setPattern(trimmedPattern);
    const newSteps = computeAllSteps(trimmedText, trimmedPattern);
    setSteps(newSteps);
    setCurrentStepIndex(0);
  }, [textInput, patternInput, stopPlaying]);

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
          <span className="text-[var(--text-primary)]">kmp-search</span>
        </Link>

        {/* Input Controls */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="text-[var(--text-muted)] text-sm">text:</span>
            <input
              type="text"
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && startVisualization()}
              placeholder="enter text..."
              className="px-3 py-1.5 text-sm bg-[var(--bg-primary)] border border-[var(--border-color)] text-[var(--text-primary)] w-48 focus:outline-none focus:border-[var(--accent-green)] transition-colors"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[var(--text-muted)] text-sm">pattern:</span>
            <input
              type="text"
              value={patternInput}
              onChange={(e) => setPatternInput(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && startVisualization()}
              placeholder="enter pattern..."
              className="px-3 py-1.5 text-sm bg-[var(--bg-primary)] border border-[var(--border-color)] text-[var(--text-primary)] w-32 focus:outline-none focus:border-[var(--accent-magenta)] transition-colors"
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
            onMouseDown={() => setIsResizing(true)}
            className="absolute top-0 right-0 w-1 h-full cursor-col-resize hover:bg-[var(--accent-green)]/30 transition-colors"
          />
        </div>

        {/* Execution Panel */}
        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 min-w-[300px]">
          {/* Text Display */}
          <Section title="text t (1-indexed)">
            {steps.length > 0 ? (
              <>
                <div className="flex gap-0.5 flex-wrap justify-center overflow-x-auto pb-1">
                  {text.split("").map((char, idx) => {
                    const oneIdx = idx + 1;
                    const isJ = currentStep?.j === oneIdx && currentStep.type !== "init" && currentStep.type !== "end";
                    const isInMatch = currentStep?.matches.some(
                      pos => oneIdx >= pos && oneIdx < pos + pattern.length
                    );

                    return (
                      <div
                        key={idx}
                        className={`w-8 h-10 flex flex-col items-center justify-center border transition-all relative ${
                          isJ
                            ? "border-[var(--accent-green)] bg-[var(--accent-green)]/10"
                            : isInMatch
                            ? "border-[var(--accent-green)] bg-[var(--accent-green)]/15"
                            : "border-[var(--border-color)] bg-[var(--bg-secondary)]"
                        }`}
                      >
                        <span className="text-[0.5rem] text-[var(--text-muted)] absolute top-0">
                          {oneIdx}
                        </span>
                        <span className="text-sm">{char}</span>
                      </div>
                    );
                  })}
                </div>
                <div className="flex gap-0.5 justify-center mt-1 overflow-x-auto">
                  {text.split("").map((_, idx) => {
                    const oneIdx = idx + 1;
                    const isJ = currentStep?.j === oneIdx && currentStep.type !== "init" && currentStep.type !== "end";
                    
                    return (
                      <div
                        key={idx}
                        className={`w-8 text-center text-xs h-3 ${
                          isJ ? "text-[var(--accent-green)]" : ""
                        }`}
                      >
                        {isJ ? "j" : ""}
                      </div>
                    );
                  })}
                </div>
              </>
            ) : (
              <EmptyState />
            )}
          </Section>

          {/* Pattern Display */}
          <Section title="pattern p (1-indexed)">
            {steps.length > 0 ? (
              <>
                <div className="flex gap-0.5 flex-wrap justify-center">
                  {pattern.split("").map((char, idx) => {
                    const oneIdx = idx + 1;
                    const isI = currentStep?.i === oneIdx && currentStep.type !== "init" && currentStep.type !== "end";
                    const isMatch = currentStep?.comparison === "match" && isI;
                    const isMismatch = currentStep?.comparison === "mismatch" && isI;

                    return (
                      <div
                        key={idx}
                        className={`w-8 h-10 flex flex-col items-center justify-center border transition-all relative ${
                          isI
                            ? "border-[var(--accent-magenta)] bg-[var(--accent-magenta)]/10"
                            : "border-[var(--border-color)] bg-[var(--bg-secondary)]"
                        } ${
                          isMatch ? "border-[var(--accent-green)] bg-[var(--accent-green)]/15" : ""
                        } ${
                          isMismatch ? "border-[var(--accent-red)] bg-[var(--accent-red)]/10" : ""
                        }`}
                      >
                        <span className="text-[0.5rem] text-[var(--text-muted)] absolute top-0">
                          {oneIdx}
                        </span>
                        <span className="text-sm">{char}</span>
                      </div>
                    );
                  })}
                </div>
                <div className="flex gap-0.5 justify-center mt-1">
                  {pattern.split("").map((_, idx) => {
                    const oneIdx = idx + 1;
                    const isI = currentStep?.i === oneIdx && currentStep.type !== "init" && currentStep.type !== "end";
                    
                    return (
                      <div
                        key={idx}
                        className={`w-8 text-center text-xs h-3 ${
                          isI ? "text-[var(--accent-magenta)]" : ""
                        }`}
                      >
                        {isI ? "i" : ""}
                      </div>
                    );
                  })}
                </div>
                <div className="flex gap-4 justify-center flex-wrap mt-2 text-xs text-[var(--text-muted)]">
                  <span><span className="text-[var(--accent-green)]">■</span> j (text)</span>
                  <span><span className="text-[var(--accent-magenta)]">■</span> i (pattern)</span>
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
                active={["inner-while", "inner-while-exit", "increment"].includes(currentStep?.type || "")}
              />
              <VariableCard
                name="j"
                value={currentStep?.j ?? "—"}
                active={["outer-while", "increment"].includes(currentStep?.type || "")}
              />
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
                name="t[j]"
                value={currentStep?.tChar ? `'${currentStep.tChar}'` : "—"}
                active={false}
              />
              <VariableCard
                name="p[i]"
                value={currentStep?.pChar ? `'${currentStep.pChar}'` : "—"}
                active={false}
              />
            </div>
          </Section>

          {/* KMPNext Array */}
          <Section title="KMPNext array (precomputed)">
            {steps.length > 0 && currentStep ? (
              <div className="flex flex-col items-center gap-1">
                <div className="flex gap-0.5 justify-center text-xs text-[var(--text-muted)]">
                  <span className="italic">Uses optimized failure function for fewer comparisons</span>
                </div>
                <div className="flex gap-0.5 justify-center mt-1">
                  {currentStep.kmpnext.slice(1, pattern.length + 2).map((_, idx) => {
                    const realIdx = idx + 1;
                    const char = realIdx <= pattern.length ? pattern[realIdx - 1] : "—";
                    return (
                      <div key={idx} className="w-8 text-center text-xs text-[var(--text-muted)]">
                        {char}
                      </div>
                    );
                  })}
                </div>
                <div className="flex gap-0.5 flex-wrap justify-center">
                  {currentStep.kmpnext.slice(1, pattern.length + 2).map((value, idx) => {
                    const realIdx = idx + 1;
                    const isUsed = currentStep.type === "inner-while" && currentStep.i === realIdx;

                    return (
                      <div
                        key={idx}
                        className={`w-8 h-10 flex flex-col items-center justify-center border transition-all ${
                          isUsed
                            ? "border-[var(--accent-yellow)] bg-[var(--accent-yellow)]/10"
                            : "border-[var(--border-color)] bg-[var(--bg-secondary)]"
                        }`}
                      >
                        <span className="text-[0.5rem] text-[var(--text-muted)]">[{realIdx}]</span>
                        <span className={`text-sm ${value !== undefined ? "text-[var(--accent-green)]" : "text-[var(--text-muted)]"}`}>
                          {value !== undefined ? value : "—"}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <EmptyState />
            )}
          </Section>

          {/* Matches Found */}
          <Section title="matches found">
            {steps.length > 0 && currentStep ? (
              <div className="flex flex-wrap gap-2 justify-center min-h-[32px] items-center">
                {currentStep.matches.length > 0 ? (
                  currentStep.matches.map((pos, idx) => (
                    <div
                      key={idx}
                      className="px-3 py-1 border border-[var(--accent-green)] text-[var(--accent-green)] text-sm"
                    >
                      pos {pos}
                    </div>
                  ))
                ) : (
                  <span className="text-[var(--text-muted)] text-sm">no matches yet</span>
                )}
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
                  enter text and pattern, then click &quot;run&quot; to begin...
                </span>
              )}
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

