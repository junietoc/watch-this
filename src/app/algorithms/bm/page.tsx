"use client";

/*
  🎯 BOYER-MOORE STRING MATCHING VISUALIZER
  Terminal-inspired clean design.
  
  Uses the D array (good suffix shift) computed in preprocessing.
  Compares pattern right-to-left.
*/

import Link from "next/link";
import { useState, useEffect, useRef, useCallback } from "react";

// ============================================
// TYPES
// ============================================

interface Step {
  line: number;
  pos: number;
  i: number;
  tIdx: number; // pos + i - 1 (1-indexed position in text)
  tChar: string | null;
  pChar: string | null;
  d: number[];
  matches: number[];
  action: string;
  type: "init" | "outer-while" | "set-i" | "inner-while" | "inner-while-exit" | "match-found" | "shift" | "end";
  comparison?: "match" | "mismatch" | "none";
}

// ============================================
// COMPUTE D ARRAY (from ComputeD preprocessing)
// ============================================

function computeD(pattern: string): number[] {
  const p = " " + pattern; // 1-indexed
  const m = pattern.length;
  
  // D[0..m] - good suffix shift
  const D: number[] = new Array(m + 1).fill(0);
  // Rnext[0..m] - reverse failure function
  const Rnext: number[] = new Array(m + 1).fill(0);
  
  // Line 3: j ← Rnext[m] ← m + 1
  let j = m + 1;
  Rnext[m] = m + 1;

  // Line 4: for i ← m downto 1 do
  for (let i = m; i >= 1; i--) {
    // Line 5-8: while j ≤ m and p[i] ≠ p[j] do
    while (j <= m && p[i] !== p[j]) {
      // Line 6: if D[j] undefined then D[j] ← j - i
      if (D[j] === 0) {
        D[j] = j - i;
      }
      // Line 7: j ← Rnext[j]
      j = Rnext[j];
    }
    // Line 9: j ← j - 1; Rnext[i - 1] ← j
    j = j - 1;
    Rnext[i - 1] = j;
  }

  // Line 11: p ← Rnext[0]
  let pVar = Rnext[0];

  // Line 12: for j ← 0 to m do
  for (let jLoop = 0; jLoop <= m; jLoop++) {
    // Line 13: if D[j] undefined then D[j] ← p
    if (D[jLoop] === 0) {
      D[jLoop] = pVar;
    }
    // Line 14: if j = p then p ← Rnext[p]
    if (jLoop === pVar) {
      pVar = Rnext[pVar];
    }
  }

  return D;
}

// ============================================
// ALGORITHM LOGIC
// ============================================

function computeAllSteps(text: string, pattern: string): Step[] {
  const n = text.length;
  const m = pattern.length;
  const D = computeD(pattern);
  const allSteps: Step[] = [];
  const matches: number[] = [];

  const t = " " + text;    // 1-indexed
  const p = " " + pattern; // 1-indexed

  // Line 3: pos ← 1
  let pos = 1;
  
  allSteps.push({
    line: 3,
    pos: pos,
    i: m,
    tIdx: pos + m - 1,
    tChar: null,
    pChar: null,
    d: [...D],
    matches: [...matches],
    action: "Initialize: pos ← 1",
    type: "init",
  });

  // Line 4: while pos ≤ n - m + 1 do
  while (pos <= n - m + 1) {
    allSteps.push({
      line: 4,
      pos: pos,
      i: m,
      tIdx: pos + m - 1,
      tChar: t[pos + m - 1],
      pChar: p[m],
      d: [...D],
      matches: [...matches],
      action: `Outer while: pos=${pos} ≤ n-m+1=${n - m + 1}, continue`,
      type: "outer-while",
    });

    // Line 5: i ← m
    let i = m;
    
    allSteps.push({
      line: 5,
      pos: pos,
      i: i,
      tIdx: pos + i - 1,
      tChar: t[pos + i - 1],
      pChar: p[i],
      d: [...D],
      matches: [...matches],
      action: `Set i ← m = ${m} (start comparing from right)`,
      type: "set-i",
    });

    // Line 6: while i > 0 and p[i] = t[pos + i - 1] do i ← i - 1
    while (i > 0 && p[i] === t[pos + i - 1]) {
      allSteps.push({
        line: 6,
        pos: pos,
        i: i,
        tIdx: pos + i - 1,
        tChar: t[pos + i - 1],
        pChar: p[i],
        d: [...D],
        matches: [...matches],
        action: `Inner while: i=${i} > 0 and p[${i}]='${p[i]}' = t[${pos + i - 1}]='${t[pos + i - 1]}' → i ← ${i - 1}`,
        type: "inner-while",
        comparison: "match",
      });
      i = i - 1;
    }

    // After while exits
    if (i === 0) {
      // Full match!
      allSteps.push({
        line: 6,
        pos: pos,
        i: i,
        tIdx: pos,
        tChar: null,
        pChar: null,
        d: [...D],
        matches: [...matches],
        action: `Inner while exit: i=${i} = 0 → all characters matched!`,
        type: "inner-while-exit",
        comparison: "none",
      });

      // Line 7: if i = 0 then Output(pos)
      matches.push(pos);
      allSteps.push({
        line: 7,
        pos: pos,
        i: i,
        tIdx: pos,
        tChar: null,
        pChar: null,
        d: [...D],
        matches: [...matches],
        action: `Match found! Output(${pos})`,
        type: "match-found",
        comparison: "match",
      });
    } else {
      // Mismatch at position i
      allSteps.push({
        line: 6,
        pos: pos,
        i: i,
        tIdx: pos + i - 1,
        tChar: t[pos + i - 1],
        pChar: p[i],
        d: [...D],
        matches: [...matches],
        action: `Inner while exit: p[${i}]='${p[i]}' ≠ t[${pos + i - 1}]='${t[pos + i - 1]}' → mismatch`,
        type: "inner-while-exit",
        comparison: "mismatch",
      });
    }

    // Line 8: pos ← pos + D[i]
    const shift = D[i];
    const oldPos = pos;
    pos = pos + shift;
    
    allSteps.push({
      line: 8,
      pos: pos,
      i: i,
      tIdx: pos <= n ? pos + m - 1 : n,
      tChar: null,
      pChar: null,
      d: [...D],
      matches: [...matches],
      action: `Shift: pos ← ${oldPos} + D[${i}] = ${oldPos} + ${shift} = ${pos}`,
      type: "shift",
    });
  }

  // Algorithm complete
  allSteps.push({
    line: 10,
    pos: pos,
    i: 0,
    tIdx: n,
    tChar: null,
    pChar: null,
    d: [...D],
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
  { line: 1, content: "BM(t, p)    {n = |t|, m = |p|}", tokens: [
    { type: "function", text: "BM" },
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
  { line: 3, content: "   pos ← 1", tokens: [
    { type: "plain", text: "   " },
    { type: "variable", text: "pos" },
    { type: "operator", text: " ← " },
    { type: "number", text: "1" },
  ]},
  { line: 4, content: "   while pos ≤ n − m + 1 do", tokens: [
    { type: "plain", text: "   " },
    { type: "keyword", text: "while" },
    { type: "plain", text: " " },
    { type: "variable", text: "pos" },
    { type: "operator", text: " ≤ " },
    { type: "variable", text: "n" },
    { type: "operator", text: " − " },
    { type: "variable", text: "m" },
    { type: "operator", text: " + " },
    { type: "number", text: "1" },
    { type: "plain", text: " " },
    { type: "keyword", text: "do" },
  ]},
  { line: 5, content: "      i ← m", tokens: [
    { type: "plain", text: "      " },
    { type: "variable", text: "i" },
    { type: "operator", text: " ← " },
    { type: "variable", text: "m" },
  ]},
  { line: 6, content: "      while i > 0 and p[i] = t[pos + i − 1] do i ← i − 1", tokens: [
    { type: "plain", text: "      " },
    { type: "keyword", text: "while" },
    { type: "plain", text: " " },
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
    { type: "operator", text: " = " },
    { type: "variable", text: "t" },
    { type: "bracket", text: "[" },
    { type: "variable", text: "pos" },
    { type: "operator", text: " + " },
    { type: "variable", text: "i" },
    { type: "operator", text: " − " },
    { type: "number", text: "1" },
    { type: "bracket", text: "]" },
    { type: "plain", text: " " },
    { type: "keyword", text: "do" },
    { type: "plain", text: " " },
    { type: "variable", text: "i" },
    { type: "operator", text: " ← " },
    { type: "variable", text: "i" },
    { type: "operator", text: " − " },
    { type: "number", text: "1" },
  ]},
  { line: 7, content: "      if i = 0 then Output(pos)", tokens: [
    { type: "plain", text: "      " },
    { type: "keyword", text: "if" },
    { type: "plain", text: " " },
    { type: "variable", text: "i" },
    { type: "operator", text: " = " },
    { type: "number", text: "0" },
    { type: "plain", text: " " },
    { type: "keyword", text: "then" },
    { type: "plain", text: " " },
    { type: "function", text: "Output" },
    { type: "bracket", text: "(" },
    { type: "variable", text: "pos" },
    { type: "bracket", text: ")" },
  ]},
  { line: 8, content: "      pos ← pos + D[i]", tokens: [
    { type: "plain", text: "      " },
    { type: "variable", text: "pos" },
    { type: "operator", text: " ← " },
    { type: "variable", text: "pos" },
    { type: "operator", text: " + " },
    { type: "variable", text: "D" },
    { type: "bracket", text: "[" },
    { type: "variable", text: "i" },
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

export default function BMPage() {
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
  // RENDER HELPERS
  // ============================================

  // Calculate pattern alignment on text
  const getPatternAlignmentStart = () => {
    if (!currentStep) return 0;
    return currentStep.pos - 1; // 0-indexed
  };

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
          <span className="text-[var(--text-primary)]">bm-search</span>
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
          {/* Text + Pattern Alignment Display */}
          <Section title="text t with pattern alignment (1-indexed)">
            {steps.length > 0 ? (
              <>
                {/* Text row */}
                <div className="flex gap-0.5 flex-wrap justify-center overflow-x-auto pb-1">
                  {text.split("").map((char, idx) => {
                    const oneIdx = idx + 1;
                    const alignStart = getPatternAlignmentStart();
                    const isInPattern = idx >= alignStart && idx < alignStart + pattern.length;
                    const patternIdx = idx - alignStart; // 0-indexed in pattern
                    const isComparing = currentStep?.tIdx === oneIdx && 
                                       currentStep.type !== "init" && 
                                       currentStep.type !== "end" &&
                                       currentStep.type !== "shift";
                    const isMatch = isComparing && currentStep?.comparison === "match";
                    const isMismatch = isComparing && currentStep?.comparison === "mismatch";
                    const isInFoundMatch = currentStep?.matches.some(
                      pos => oneIdx >= pos && oneIdx < pos + pattern.length
                    );

                    return (
                      <div
                        key={idx}
                        className={`w-8 h-10 flex flex-col items-center justify-center border transition-all relative ${
                          isComparing
                            ? isMismatch
                              ? "border-[var(--accent-red)] bg-[var(--accent-red)]/10"
                              : isMatch
                              ? "border-[var(--accent-green)] bg-[var(--accent-green)]/15"
                              : "border-[var(--accent-cyan)] bg-[var(--accent-cyan)]/10"
                            : isInFoundMatch
                            ? "border-[var(--accent-green)] bg-[var(--accent-green)]/20"
                            : isInPattern
                            ? "border-[var(--accent-yellow)]/50 bg-[var(--accent-yellow)]/5"
                            : "border-[var(--border-color)] bg-[var(--bg-secondary)]"
                        }`}
                      >
                        <span className="text-[0.5rem] text-[var(--text-muted)] absolute top-0">
                          {oneIdx}
                        </span>
                        <span className="text-sm">{char}</span>
                        {isInPattern && (
                          <span className="text-[0.45rem] text-[var(--accent-yellow)] absolute bottom-0">
                            p[{patternIdx + 1}]
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
                
                {/* Pattern row - aligned with text */}
                <div className="flex gap-0.5 justify-center overflow-x-auto mt-1">
                  {text.split("").map((_, idx) => {
                    const alignStart = getPatternAlignmentStart();
                    const isInPattern = idx >= alignStart && idx < alignStart + pattern.length;
                    const patternIdx = idx - alignStart;
                    const patternChar = isInPattern ? pattern[patternIdx] : "";
                    const oneIdx = idx + 1;
                    const isI = currentStep?.i === patternIdx + 1 && isInPattern && 
                               currentStep.type !== "init" && 
                               currentStep.type !== "end" &&
                               currentStep.type !== "shift";
                    const isComparing = currentStep?.tIdx === oneIdx && 
                                       currentStep.type !== "init" && 
                                       currentStep.type !== "end" &&
                                       currentStep.type !== "shift";
                    const isMatch = isComparing && currentStep?.comparison === "match";
                    const isMismatch = isComparing && currentStep?.comparison === "mismatch";

                    return (
                      <div
                        key={idx}
                        className={`w-8 h-8 flex items-center justify-center border transition-all ${
                          isInPattern
                            ? isI
                              ? isMismatch
                                ? "border-[var(--accent-red)] bg-[var(--accent-red)]/10"
                                : isMatch
                                ? "border-[var(--accent-green)] bg-[var(--accent-green)]/15"
                                : "border-[var(--accent-magenta)] bg-[var(--accent-magenta)]/10"
                              : "border-[var(--accent-yellow)]/30 bg-[var(--bg-secondary)]"
                            : "border-transparent bg-transparent"
                        }`}
                      >
                        <span className={`text-sm ${
                          isI ? "text-[var(--accent-magenta)] font-bold" : "text-[var(--text-secondary)]"
                        }`}>
                          {patternChar}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* Pointer indicator row */}
                <div className="flex gap-0.5 justify-center overflow-x-auto">
                  {text.split("").map((_, idx) => {
                    const alignStart = getPatternAlignmentStart();
                    const isInPattern = idx >= alignStart && idx < alignStart + pattern.length;
                    const patternIdx = idx - alignStart;
                    const oneIdx = idx + 1;
                    const isI = currentStep?.i === patternIdx + 1 && isInPattern && 
                               currentStep.type !== "init" && 
                               currentStep.type !== "end" &&
                               currentStep.type !== "shift";
                    const isPos = idx === alignStart && currentStep?.type !== "end";

                    return (
                      <div
                        key={idx}
                        className={`w-8 text-center text-xs h-4 ${
                          isI ? "text-[var(--accent-magenta)]" : isPos ? "text-[var(--accent-yellow)]" : ""
                        }`}
                      >
                        {isI ? "i" : isPos ? "pos" : ""}
                      </div>
                    );
                  })}
                </div>

                {/* Legend */}
                <div className="flex gap-4 justify-center flex-wrap mt-2 text-xs text-[var(--text-muted)]">
                  <span><span className="text-[var(--accent-yellow)]">■</span> pos/window</span>
                  <span><span className="text-[var(--accent-magenta)]">■</span> i (comparing)</span>
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
                name="pos"
                value={currentStep?.pos ?? "—"}
                active={["outer-while", "shift"].includes(currentStep?.type || "")}
              />
              <VariableCard
                name="i"
                value={currentStep?.i ?? "—"}
                active={["set-i", "inner-while", "inner-while-exit"].includes(currentStep?.type || "")}
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
                name="t[pos+i-1]"
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

          {/* D Array */}
          <Section title="D array - Good Suffix Shift (precomputed)">
            {steps.length > 0 && currentStep ? (
              <div className="flex flex-col items-center gap-1">
                <div className="flex gap-0.5 justify-center overflow-x-auto">
                  {currentStep.d.map((value, idx) => {
                    const isUsed = currentStep.type === "shift" && currentStep.i === idx;

                    return (
                      <div
                        key={idx}
                        className={`w-10 h-12 flex flex-col items-center justify-center border transition-all ${
                          isUsed
                            ? "border-[var(--accent-cyan)] bg-[var(--accent-cyan)]/10"
                            : "border-[var(--border-color)] bg-[var(--bg-secondary)]"
                        }`}
                      >
                        <span className="text-[0.5rem] text-[var(--text-muted)]">D[{idx}]</span>
                        <span className={`text-sm ${isUsed ? "text-[var(--accent-cyan)] font-bold" : "text-[var(--accent-cyan)]"}`}>
                          {value}
                        </span>
                      </div>
                    );
                  })}
                </div>
                <div className="text-xs text-[var(--text-muted)] mt-1">
                  D[i] = shift amount when mismatch at pattern position i
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

          {/* Key Insight */}
          <Section title="key insight">
            <div className="text-xs text-[var(--text-secondary)] space-y-2">
              <p>
                <span className="text-[var(--accent-magenta)] font-bold">Boyer-Moore</span> compares 
                the pattern from <span className="text-[var(--accent-yellow)]">right to left</span> (i starts at m).
              </p>
              <p>
                When a mismatch occurs at position i in the pattern, it shifts by <span className="text-[var(--accent-cyan)]">D[i]</span> positions.
              </p>
              <p>
                The <span className="text-[var(--accent-cyan)]">D array</span> (good suffix shift) allows skipping 
                positions that cannot match, making the algorithm very efficient in practice.
              </p>
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

