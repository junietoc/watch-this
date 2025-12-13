"use client";

/*
  🔍 BINARY SEARCH VISUALIZER PAGE
  Efficient search in sorted arrays by halving the search space.
  Terminal-inspired clean design.
*/

import Link from "next/link";
import { useState, useEffect, useRef, useCallback } from "react";

// ============================================
// TYPES
// ============================================

interface Step {
  line: number;
  action: string;
  type: "init" | "check" | "compare" | "found" | "not-found" | "narrow-left" | "narrow-right";
  array: number[];
  target: number;
  low: number;
  high: number;
  mid: number | null;
  comparing: number | null;
  eliminated: Set<number>;
  found: number | null;
}

// ============================================
// PRESET ARRAYS AND TARGETS
// ============================================

const presetSearches: Record<string, { array: number[]; target: number }> = {
  found: { array: [2, 5, 8, 12, 16, 23, 38, 45, 56, 72, 91], target: 23 },
  notfound: { array: [2, 5, 8, 12, 16, 23, 38, 45, 56, 72, 91], target: 20 },
  first: { array: [10, 20, 30, 40, 50, 60, 70, 80, 90], target: 10 },
  last: { array: [10, 20, 30, 40, 50, 60, 70, 80, 90], target: 90 },
  middle: { array: [10, 20, 30, 40, 50, 60, 70, 80, 90], target: 50 },
  small: { array: [1, 3, 5, 7, 9], target: 7 },
  single: { array: [42], target: 42 },
};

// ============================================
// ALGORITHM LOGIC
// ============================================

function computeAllSteps(array: number[], target: number): Step[] {
  const allSteps: Step[] = [];
  const eliminated = new Set<number>();

  let low = 0;
  let high = array.length - 1;

  // Initial step
  allSteps.push({
    line: 1,
    action: `Initialize binary search: target = ${target}, searching in sorted array of ${array.length} elements`,
    type: "init",
    array: [...array],
    target,
    low,
    high,
    mid: null,
    comparing: null,
    eliminated: new Set(eliminated),
    found: null,
  });

  while (low <= high) {
    const mid = Math.floor((low + high) / 2);

    // Calculate mid step
    allSteps.push({
      line: 3,
      action: `Calculate mid: (${low} + ${high}) / 2 = ${mid}`,
      type: "check",
      array: [...array],
      target,
      low,
      high,
      mid,
      comparing: null,
      eliminated: new Set(eliminated),
      found: null,
    });

    // Compare step
    allSteps.push({
      line: 4,
      action: `Compare: array[${mid}] = ${array[mid]} vs target = ${target}`,
      type: "compare",
      array: [...array],
      target,
      low,
      high,
      mid,
      comparing: mid,
      eliminated: new Set(eliminated),
      found: null,
    });

    if (array[mid] === target) {
      // Found!
      allSteps.push({
        line: 5,
        action: `Found! array[${mid}] = ${array[mid]} equals target ${target}`,
        type: "found",
        array: [...array],
        target,
        low,
        high,
        mid,
        comparing: mid,
        eliminated: new Set(eliminated),
        found: mid,
      });
      return allSteps;
    } else if (array[mid] < target) {
      // Eliminate left half
      for (let i = low; i <= mid; i++) {
        eliminated.add(i);
      }

      allSteps.push({
        line: 7,
        action: `${array[mid]} < ${target}: target is in right half, eliminate indices [${low}..${mid}]`,
        type: "narrow-right",
        array: [...array],
        target,
        low,
        high,
        mid,
        comparing: mid,
        eliminated: new Set(eliminated),
        found: null,
      });

      low = mid + 1;

      allSteps.push({
        line: 8,
        action: `Update low = ${low}, search range is now [${low}..${high}]`,
        type: "narrow-right",
        array: [...array],
        target,
        low,
        high,
        mid: null,
        comparing: null,
        eliminated: new Set(eliminated),
        found: null,
      });
    } else {
      // Eliminate right half
      for (let i = mid; i <= high; i++) {
        eliminated.add(i);
      }

      allSteps.push({
        line: 9,
        action: `${array[mid]} > ${target}: target is in left half, eliminate indices [${mid}..${high}]`,
        type: "narrow-left",
        array: [...array],
        target,
        low,
        high,
        mid,
        comparing: mid,
        eliminated: new Set(eliminated),
        found: null,
      });

      high = mid - 1;

      allSteps.push({
        line: 10,
        action: `Update high = ${high}, search range is now [${low}..${high}]`,
        type: "narrow-left",
        array: [...array],
        target,
        low,
        high,
        mid: null,
        comparing: null,
        eliminated: new Set(eliminated),
        found: null,
      });
    }
  }

  // Not found
  allSteps.push({
    line: 11,
    action: `Not found! low (${low}) > high (${high}), target ${target} is not in the array`,
    type: "not-found",
    array: [...array],
    target,
    low,
    high,
    mid: null,
    comparing: null,
    eliminated: new Set(eliminated),
    found: null,
  });

  return allSteps;
}

// ============================================
// ALGORITHM CODE
// ============================================

const algorithmCode = [
  { line: 1, content: "binarySearch(A, n, target)", tokens: [
    { type: "function", text: "binarySearch" },
    { type: "bracket", text: "(" },
    { type: "variable", text: "A" },
    { type: "plain", text: ", " },
    { type: "variable", text: "n" },
    { type: "plain", text: ", " },
    { type: "variable", text: "target" },
    { type: "bracket", text: ")" },
  ]},
  { line: 2, content: "begin", tokens: [
    { type: "keyword", text: "begin" },
  ]},
  { line: 3, content: "   low ← 0; high ← n-1", tokens: [
    { type: "plain", text: "   " },
    { type: "variable", text: "low" },
    { type: "operator", text: " ← " },
    { type: "number", text: "0" },
    { type: "plain", text: "; " },
    { type: "variable", text: "high" },
    { type: "operator", text: " ← " },
    { type: "variable", text: "n" },
    { type: "operator", text: "-" },
    { type: "number", text: "1" },
  ]},
  { line: 4, content: "   while low ≤ high do", tokens: [
    { type: "plain", text: "   " },
    { type: "keyword", text: "while" },
    { type: "plain", text: " " },
    { type: "variable", text: "low" },
    { type: "operator", text: " ≤ " },
    { type: "variable", text: "high" },
    { type: "plain", text: " " },
    { type: "keyword", text: "do" },
  ]},
  { line: 5, content: "      mid ← (low + high) / 2", tokens: [
    { type: "plain", text: "      " },
    { type: "variable", text: "mid" },
    { type: "operator", text: " ← " },
    { type: "bracket", text: "(" },
    { type: "variable", text: "low" },
    { type: "operator", text: " + " },
    { type: "variable", text: "high" },
    { type: "bracket", text: ")" },
    { type: "operator", text: " / " },
    { type: "number", text: "2" },
  ]},
  { line: 6, content: "      if A[mid] = target then", tokens: [
    { type: "plain", text: "      " },
    { type: "keyword", text: "if" },
    { type: "plain", text: " " },
    { type: "variable", text: "A" },
    { type: "bracket", text: "[" },
    { type: "variable", text: "mid" },
    { type: "bracket", text: "]" },
    { type: "operator", text: " = " },
    { type: "variable", text: "target" },
    { type: "plain", text: " " },
    { type: "keyword", text: "then" },
  ]},
  { line: 7, content: "         return mid", tokens: [
    { type: "plain", text: "         " },
    { type: "keyword", text: "return" },
    { type: "plain", text: " " },
    { type: "variable", text: "mid" },
  ]},
  { line: 8, content: "      else if A[mid] < target then", tokens: [
    { type: "plain", text: "      " },
    { type: "keyword", text: "else if" },
    { type: "plain", text: " " },
    { type: "variable", text: "A" },
    { type: "bracket", text: "[" },
    { type: "variable", text: "mid" },
    { type: "bracket", text: "]" },
    { type: "operator", text: " < " },
    { type: "variable", text: "target" },
    { type: "plain", text: " " },
    { type: "keyword", text: "then" },
  ]},
  { line: 9, content: "         low ← mid + 1", tokens: [
    { type: "plain", text: "         " },
    { type: "variable", text: "low" },
    { type: "operator", text: " ← " },
    { type: "variable", text: "mid" },
    { type: "operator", text: " + " },
    { type: "number", text: "1" },
  ]},
  { line: 10, content: "      else", tokens: [
    { type: "plain", text: "      " },
    { type: "keyword", text: "else" },
  ]},
  { line: 11, content: "         high ← mid - 1", tokens: [
    { type: "plain", text: "         " },
    { type: "variable", text: "high" },
    { type: "operator", text: " ← " },
    { type: "variable", text: "mid" },
    { type: "operator", text: " - " },
    { type: "number", text: "1" },
  ]},
  { line: 12, content: "   return -1  // not found", tokens: [
    { type: "plain", text: "   " },
    { type: "keyword", text: "return" },
    { type: "plain", text: " " },
    { type: "number", text: "-1" },
    { type: "plain", text: "  " },
    { type: "comment", text: "// not found" },
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

export default function BinarySearchPage() {
  const [selectedPreset, setSelectedPreset] = useState<string>("found");
  const [inputArray, setInputArray] = useState<number[]>(presetSearches.found.array);
  const [target, setTarget] = useState<number>(presetSearches.found.target);
  const [customInput, setCustomInput] = useState<string>("");
  const [customTarget, setCustomTarget] = useState<string>("");
  const [steps, setSteps] = useState<Step[]>([]);
  const [currentStepIndex, setCurrentStepIndex] = useState(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1.5);
  const [codeWidth, setCodeWidth] = useState(380);
  const [isResizing, setIsResizing] = useState(false);

  const playIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const codeContainerRef = useRef<HTMLDivElement>(null);

  const currentStep = currentStepIndex >= 0 ? steps[currentStepIndex] : null;
  const maxValue = Math.max(...inputArray, 1);

  // ============================================
  // RESIZE HANDLER
  // ============================================

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;
      const newWidth = Math.min(Math.max(280, e.clientX), window.innerWidth * 0.5);
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
    if (inputArray.length === 0) {
      alert("Please enter an array.");
      return;
    }

    stopPlaying();
    const newSteps = computeAllSteps(inputArray, target);
    setSteps(newSteps);
    setCurrentStepIndex(0);
  }, [inputArray, target, stopPlaying]);

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

  const handlePresetChange = useCallback((preset: string) => {
    setSelectedPreset(preset);
    setInputArray(presetSearches[preset].array);
    setTarget(presetSearches[preset].target);
    setCustomInput("");
    setCustomTarget("");
    resetVisualization();
  }, [resetVisualization]);

  const handleCustomInput = useCallback(() => {
    const parsed = customInput
      .split(/[,\s]+/)
      .map(s => parseInt(s.trim(), 10))
      .filter(n => !isNaN(n))
      .sort((a, b) => a - b); // Binary search requires sorted array
    
    const parsedTarget = parseInt(customTarget.trim(), 10);

    if (parsed.length > 0 && !isNaN(parsedTarget)) {
      setInputArray(parsed);
      setTarget(parsedTarget);
      setSelectedPreset("custom");
      resetVisualization();
    } else if (parsed.length > 0) {
      setInputArray(parsed);
      setSelectedPreset("custom");
      resetVisualization();
    }
  }, [customInput, customTarget, resetVisualization]);

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

  const getBarColor = (index: number) => {
    if (!currentStep) return "var(--accent-cyan)";

    // Found
    if (currentStep.found === index) {
      return "var(--accent-green)";
    }

    // Eliminated
    if (currentStep.eliminated.has(index)) {
      return "var(--bg-tertiary)";
    }

    // Currently comparing (mid)
    if (currentStep.comparing === index) {
      return "var(--accent-yellow)";
    }

    // In search range
    if (index >= currentStep.low && index <= currentStep.high) {
      // Mid position
      if (currentStep.mid === index) {
        return "var(--accent-red)";
      }
      return "var(--accent-cyan)";
    }

    return "var(--bg-tertiary)";
  };

  const getBarBorder = (index: number) => {
    if (!currentStep) return "var(--border-color)";

    if (currentStep.found === index) {
      return "var(--accent-green)";
    }

    if (currentStep.comparing === index) {
      return "var(--accent-yellow)";
    }

    if (currentStep.mid === index) {
      return "var(--accent-red)";
    }

    if (index >= currentStep.low && index <= currentStep.high && !currentStep.eliminated.has(index)) {
      return "var(--accent-cyan)";
    }

    return "var(--border-color)";
  };

  // ============================================
  // RENDER
  // ============================================

  const displayArray = currentStep ? currentStep.array : inputArray;

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] flex flex-col font-mono">
      {/* Header */}
      <header className="bg-[var(--bg-secondary)] border-b border-[var(--border-color)] px-4 py-3 flex items-center justify-between flex-wrap gap-4">
        {/* Logo */}
        <Link href="/algorithms" className="flex items-center gap-2 group">
          <span className="text-[var(--accent-green)]">$</span>
          <span className="text-[var(--text-secondary)]">./</span>
          <span className="text-[var(--text-primary)]">binarysearch</span>
        </Link>

        {/* Input Controls */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="text-[var(--text-muted)] text-sm">preset:</span>
            <select
              value={selectedPreset}
              onChange={(e) => handlePresetChange(e.target.value)}
              className="px-3 py-1.5 text-sm bg-[var(--bg-primary)] border border-[var(--border-color)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-green)] transition-colors cursor-pointer"
            >
              <option value="found">found (23)</option>
              <option value="notfound">not found (20)</option>
              <option value="first">first element</option>
              <option value="last">last element</option>
              <option value="middle">middle element</option>
              <option value="small">small array</option>
              <option value="single">single element</option>
              {selectedPreset === "custom" && <option value="custom">custom</option>}
            </select>
          </div>
          
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={customInput}
              onChange={(e) => setCustomInput(e.target.value)}
              placeholder="array: 1,3,5,7..."
              className="px-3 py-1.5 text-sm bg-[var(--bg-primary)] border border-[var(--border-color)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-green)] transition-colors w-32"
            />
            <input
              type="text"
              value={customTarget}
              onChange={(e) => setCustomTarget(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleCustomInput()}
              placeholder="target"
              className="px-3 py-1.5 text-sm bg-[var(--bg-primary)] border border-[var(--border-color)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-green)] transition-colors w-20"
            />
            <button
              onClick={handleCustomInput}
              className="px-3 py-1.5 border border-[var(--border-color)] text-[var(--text-secondary)] hover:border-[var(--accent-green)] hover:text-[var(--accent-green)] transition-colors text-sm"
            >
              set
            </button>
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
              max="5"
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

        {/* Visualization Panel */}
        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 min-w-[400px]">
          {/* Target Display */}
          <Section title="search target">
            <div className="flex items-center justify-center gap-4">
              <span className="text-[var(--text-muted)]">Looking for:</span>
              <div className="px-6 py-3 border-2 border-[var(--accent-magenta)] bg-[var(--accent-magenta)]/10 text-[var(--accent-magenta)] font-bold text-2xl">
                {target}
              </div>
              {currentStep?.type === "found" && (
                <span className="text-[var(--accent-green)] font-bold animate-pulse">
                  ✓ FOUND at index {currentStep.found}
                </span>
              )}
              {currentStep?.type === "not-found" && (
                <span className="text-[var(--accent-red)] font-bold">
                  ✗ NOT FOUND
                </span>
              )}
            </div>
          </Section>

          {/* Array Visualization */}
          <Section title="array visualization" className="flex-1">
            <div className="relative bg-[var(--bg-primary)] border border-[var(--border-color)] rounded overflow-hidden p-4" style={{ minHeight: 280 }}>
              {/* Bar Chart */}
              <div className="flex items-end justify-center gap-1 h-48">
                {displayArray.map((value, index) => {
                  const barHeight = (value / maxValue) * 160 + 20;
                  const barColor = getBarColor(index);
                  const borderColor = getBarBorder(index);
                  const isEliminated = currentStep?.eliminated.has(index);
                  
                  return (
                    <div
                      key={index}
                      className={`flex flex-col items-center gap-1 transition-all duration-200 ${isEliminated ? "opacity-30" : ""}`}
                      style={{ width: Math.max(30, 500 / displayArray.length) }}
                    >
                      {/* Value label */}
                      <span className={`text-xs ${isEliminated ? "text-[var(--text-muted)]" : "text-[var(--text-secondary)]"}`}>
                        {value}
                      </span>
                      {/* Bar */}
                      <div
                        className="w-full transition-all duration-200 border-2"
                        style={{
                          height: barHeight,
                          backgroundColor: barColor,
                          borderColor: borderColor,
                        }}
                      />
                      {/* Index label */}
                      <span className="text-xs text-[var(--text-muted)]">
                        {index}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Pointer indicators */}
              {currentStep && (
                <div className="flex items-end justify-center gap-1 mt-2">
                  {displayArray.map((_, index) => (
                    <div
                      key={index}
                      className="flex flex-col items-center text-xs font-bold"
                      style={{ width: Math.max(30, 500 / displayArray.length) }}
                    >
                      {currentStep.low === index && !currentStep.eliminated.has(index) && (
                        <span className="text-[var(--accent-cyan)]">L</span>
                      )}
                      {currentStep.mid === index && (
                        <span className="text-[var(--accent-red)]">M</span>
                      )}
                      {currentStep.high === index && !currentStep.eliminated.has(index) && (
                        <span className="text-[var(--accent-cyan)]">H</span>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Legend */}
              <div className="absolute bottom-3 left-3 flex flex-wrap gap-3 text-xs text-[var(--text-muted)] bg-[var(--bg-secondary)]/90 px-3 py-2 rounded">
                <span className="flex items-center gap-1">
                  <span className="w-3 h-3 bg-[var(--accent-red)]"></span> mid
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-3 h-3 bg-[var(--accent-yellow)]"></span> comparing
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-3 h-3 bg-[var(--accent-green)]"></span> found
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-3 h-3 bg-[var(--accent-cyan)]"></span> search range
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-3 h-3 bg-[var(--bg-tertiary)] opacity-30"></span> eliminated
                </span>
              </div>
            </div>
          </Section>

          {/* Variables Row */}
          <div className="grid grid-cols-2 gap-4">
            {/* Variables */}
            <Section title="variables">
              <div className="grid grid-cols-4 gap-2">
                <VariableCard
                  name="low"
                  value={currentStep?.low ?? "—"}
                  active={currentStep?.type === "narrow-right" || currentStep?.type === "narrow-left"}
                />
                <VariableCard
                  name="high"
                  value={currentStep?.high ?? "—"}
                  active={currentStep?.type === "narrow-right" || currentStep?.type === "narrow-left"}
                />
                <VariableCard
                  name="mid"
                  value={currentStep?.mid ?? "—"}
                  active={currentStep?.type === "check" || currentStep?.type === "compare"}
                />
                <VariableCard
                  name="target"
                  value={target}
                  active={false}
                />
              </div>
            </Section>

            {/* Search Space */}
            <Section title="search space">
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-[var(--bg-primary)] border border-[var(--border-color)] p-2 text-center">
                  <div className="text-[0.65rem] text-[var(--text-muted)] uppercase mb-0.5">
                    range
                  </div>
                  <div className="text-lg text-[var(--accent-cyan)]">
                    [{currentStep?.low ?? 0}..{currentStep?.high ?? displayArray.length - 1}]
                  </div>
                </div>
                <div className="bg-[var(--bg-primary)] border border-[var(--border-color)] p-2 text-center">
                  <div className="text-[0.65rem] text-[var(--text-muted)] uppercase mb-0.5">
                    remaining
                  </div>
                  <div className="text-lg text-[var(--accent-orange)]">
                    {currentStep ? Math.max(0, currentStep.high - currentStep.low + 1) : displayArray.length}
                  </div>
                </div>
              </div>
            </Section>
          </div>

          {/* Comparison Detail */}
          <Section title="current comparison">
            <div className="flex items-center justify-center gap-8 min-h-[60px]">
              {currentStep?.type === "compare" && currentStep.mid !== null ? (
                <>
                  <div className="text-center">
                    <div className="text-xs text-[var(--text-muted)] mb-1">A[{currentStep.mid}]</div>
                    <div className="text-2xl font-bold text-[var(--accent-yellow)]">
                      {currentStep.array[currentStep.mid]}
                    </div>
                  </div>
                  <div className="text-2xl text-[var(--text-muted)]">
                    {currentStep.array[currentStep.mid] === target ? "=" : 
                     currentStep.array[currentStep.mid] < target ? "<" : ">"}
                  </div>
                  <div className="text-center">
                    <div className="text-xs text-[var(--text-muted)] mb-1">target</div>
                    <div className="text-2xl font-bold text-[var(--accent-magenta)]">
                      {target}
                    </div>
                  </div>
                  <div className="text-sm text-[var(--text-secondary)] ml-4">
                    {currentStep.array[currentStep.mid] === target 
                      ? "→ found!" 
                      : currentStep.array[currentStep.mid] < target
                      ? "→ search right half"
                      : "→ search left half"}
                  </div>
                </>
              ) : currentStep?.type === "found" ? (
                <div className="text-[var(--accent-green)] text-xl font-bold">
                  🎯 Target {target} found at index {currentStep.found}!
                </div>
              ) : currentStep?.type === "not-found" ? (
                <div className="text-[var(--accent-red)] text-xl font-bold">
                  ❌ Target {target} not found in array
                </div>
              ) : (
                <span className="text-[var(--text-muted)] text-sm">
                  No active comparison
                </span>
              )}
            </div>
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
                  select a preset and click &quot;run&quot; to begin...
                </span>
              )}
            </div>
          </Section>

          {/* Array State */}
          <Section title="array (sorted)">
            <div className="flex items-center gap-1 min-h-[40px] flex-wrap font-mono text-sm">
              <span className="text-[var(--text-muted)]">[</span>
              {displayArray.map((val, idx) => {
                const isEliminated = currentStep?.eliminated.has(idx);
                const isFound = currentStep?.found === idx;
                const isMid = currentStep?.mid === idx;
                const inRange = currentStep && idx >= currentStep.low && idx <= currentStep.high && !isEliminated;
                
                return (
                  <span key={idx} className="flex items-center">
                    <span
                      className={`px-1 ${
                        isFound
                          ? "text-[var(--accent-green)] font-bold"
                          : isMid
                          ? "text-[var(--accent-red)]"
                          : isEliminated
                          ? "text-[var(--text-muted)] line-through opacity-50"
                          : inRange
                          ? "text-[var(--accent-cyan)]"
                          : "text-[var(--text-primary)]"
                      }`}
                    >
                      {val}
                    </span>
                    {idx < displayArray.length - 1 && (
                      <span className="text-[var(--text-muted)]">,</span>
                    )}
                  </span>
                );
              })}
              <span className="text-[var(--text-muted)]">]</span>
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
  value: string | number | null;
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
        {value ?? "—"}
      </div>
    </div>
  );
}

