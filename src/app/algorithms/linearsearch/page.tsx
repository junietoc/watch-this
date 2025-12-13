"use client";

/*
  🔎 LINEAR SEARCH VISUALIZER PAGE
  Simple sequential search through array elements.
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
  type: "init" | "check" | "found" | "not-found";
  array: number[];
  target: number;
  i: number;
  checking: number | null;
  checked: Set<number>;
  found: number | null;
}

// ============================================
// PRESET ARRAYS AND TARGETS
// ============================================

const presetSearches: Record<string, { array: number[]; target: number }> = {
  found: { array: [34, 7, 23, 32, 5, 62, 14, 28, 91, 45], target: 62 },
  notfound: { array: [34, 7, 23, 32, 5, 62, 14, 28, 91, 45], target: 99 },
  first: { array: [10, 20, 30, 40, 50, 60, 70, 80], target: 10 },
  last: { array: [10, 20, 30, 40, 50, 60, 70, 80], target: 80 },
  middle: { array: [10, 20, 30, 40, 50, 60, 70, 80], target: 40 },
  small: { array: [5, 2, 8, 1, 9], target: 8 },
  duplicates: { array: [10, 20, 30, 20, 40, 20, 50], target: 20 },
};

// ============================================
// ALGORITHM LOGIC
// ============================================

function computeAllSteps(array: number[], target: number): Step[] {
  const allSteps: Step[] = [];
  const checked = new Set<number>();

  // Initial step
  allSteps.push({
    line: 1,
    action: `Initialize linear search: target = ${target}, array has ${array.length} elements`,
    type: "init",
    array: [...array],
    target,
    i: 0,
    checking: null,
    checked: new Set(checked),
    found: null,
  });

  for (let i = 0; i < array.length; i++) {
    // Check current element
    allSteps.push({
      line: 3,
      action: `Check index ${i}: is array[${i}] = ${array[i]} equal to target ${target}?`,
      type: "check",
      array: [...array],
      target,
      i,
      checking: i,
      checked: new Set(checked),
      found: null,
    });

    if (array[i] === target) {
      // Found!
      allSteps.push({
        line: 4,
        action: `Found! array[${i}] = ${array[i]} equals target ${target}`,
        type: "found",
        array: [...array],
        target,
        i,
        checking: i,
        checked: new Set(checked),
        found: i,
      });
      return allSteps;
    }

    // Not equal, mark as checked
    checked.add(i);

    allSteps.push({
      line: 3,
      action: `${array[i]} ≠ ${target}, continue to next element`,
      type: "check",
      array: [...array],
      target,
      i,
      checking: null,
      checked: new Set(checked),
      found: null,
    });
  }

  // Not found
  allSteps.push({
    line: 5,
    action: `Not found! Searched all ${array.length} elements, target ${target} is not in the array`,
    type: "not-found",
    array: [...array],
    target,
    i: array.length,
    checking: null,
    checked: new Set(checked),
    found: null,
  });

  return allSteps;
}

// ============================================
// ALGORITHM CODE
// ============================================

const algorithmCode = [
  { line: 1, content: "linearSearch(A, n, target)", tokens: [
    { type: "function", text: "linearSearch" },
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
  { line: 3, content: "   for i ← 0 to n-1 do", tokens: [
    { type: "plain", text: "   " },
    { type: "keyword", text: "for" },
    { type: "plain", text: " " },
    { type: "variable", text: "i" },
    { type: "operator", text: " ← " },
    { type: "number", text: "0" },
    { type: "plain", text: " " },
    { type: "keyword", text: "to" },
    { type: "plain", text: " " },
    { type: "variable", text: "n" },
    { type: "operator", text: "-" },
    { type: "number", text: "1" },
    { type: "plain", text: " " },
    { type: "keyword", text: "do" },
  ]},
  { line: 4, content: "      if A[i] = target then", tokens: [
    { type: "plain", text: "      " },
    { type: "keyword", text: "if" },
    { type: "plain", text: " " },
    { type: "variable", text: "A" },
    { type: "bracket", text: "[" },
    { type: "variable", text: "i" },
    { type: "bracket", text: "]" },
    { type: "operator", text: " = " },
    { type: "variable", text: "target" },
    { type: "plain", text: " " },
    { type: "keyword", text: "then" },
  ]},
  { line: 5, content: "         return i", tokens: [
    { type: "plain", text: "         " },
    { type: "keyword", text: "return" },
    { type: "plain", text: " " },
    { type: "variable", text: "i" },
  ]},
  { line: 6, content: "   return -1  // not found", tokens: [
    { type: "plain", text: "   " },
    { type: "keyword", text: "return" },
    { type: "plain", text: " " },
    { type: "number", text: "-1" },
    { type: "plain", text: "  " },
    { type: "comment", text: "// not found" },
  ]},
  { line: 7, content: "end", tokens: [
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

export default function LinearSearchPage() {
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
      .filter(n => !isNaN(n));
    
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
    if (!currentStep) return "var(--bg-tertiary)";

    // Found
    if (currentStep.found === index) {
      return "var(--accent-green)";
    }

    // Currently checking
    if (currentStep.checking === index) {
      return "var(--accent-yellow)";
    }

    // Already checked (not found)
    if (currentStep.checked.has(index)) {
      return "var(--accent-red)";
    }

    // Not yet checked
    return "var(--bg-tertiary)";
  };

  const getBarBorder = (index: number) => {
    if (!currentStep) return "var(--border-color)";

    if (currentStep.found === index) {
      return "var(--accent-green)";
    }

    if (currentStep.checking === index) {
      return "var(--accent-yellow)";
    }

    if (currentStep.checked.has(index)) {
      return "var(--accent-red)";
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
          <span className="text-[var(--text-primary)]">linearsearch</span>
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
              <option value="found">found (62)</option>
              <option value="notfound">not found (99)</option>
              <option value="first">first element</option>
              <option value="last">last element</option>
              <option value="middle">middle element</option>
              <option value="small">small array</option>
              <option value="duplicates">duplicates (20)</option>
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
                  
                  return (
                    <div
                      key={index}
                      className="flex flex-col items-center gap-1 transition-all duration-200"
                      style={{ width: Math.max(30, 500 / displayArray.length) }}
                    >
                      {/* Value label */}
                      <span className={`text-xs ${
                        currentStep?.checking === index ? "text-[var(--accent-yellow)] font-bold" :
                        currentStep?.found === index ? "text-[var(--accent-green)] font-bold" :
                        currentStep?.checked.has(index) ? "text-[var(--text-muted)]" :
                        "text-[var(--text-secondary)]"
                      }`}>
                        {value}
                      </span>
                      {/* Bar */}
                      <div
                        className="w-full transition-all duration-200 border-2 relative"
                        style={{
                          height: barHeight,
                          backgroundColor: barColor,
                          borderColor: borderColor,
                        }}
                      >
                        {/* Check/X mark */}
                        {currentStep?.checked.has(index) && (
                          <div className="absolute inset-0 flex items-center justify-center text-white font-bold text-lg">
                            ✗
                          </div>
                        )}
                        {currentStep?.found === index && (
                          <div className="absolute inset-0 flex items-center justify-center text-white font-bold text-lg">
                            ✓
                          </div>
                        )}
                      </div>
                      {/* Index label */}
                      <span className="text-xs text-[var(--text-muted)]">
                        {index}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Current index pointer */}
              {currentStep && currentStep.checking !== null && (
                <div className="flex items-end justify-center gap-1 mt-2">
                  {displayArray.map((_, index) => (
                    <div
                      key={index}
                      className="flex flex-col items-center text-xs font-bold"
                      style={{ width: Math.max(30, 500 / displayArray.length) }}
                    >
                      {currentStep.checking === index && (
                        <span className="text-[var(--accent-yellow)]">▲ i={index}</span>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Legend */}
              <div className="absolute bottom-3 left-3 flex flex-wrap gap-3 text-xs text-[var(--text-muted)] bg-[var(--bg-secondary)]/90 px-3 py-2 rounded">
                <span className="flex items-center gap-1">
                  <span className="w-3 h-3 bg-[var(--accent-yellow)]"></span> checking
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-3 h-3 bg-[var(--accent-red)]"></span> checked (≠)
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-3 h-3 bg-[var(--accent-green)]"></span> found (=)
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-3 h-3 bg-[var(--bg-tertiary)]"></span> unchecked
                </span>
              </div>
            </div>
          </Section>

          {/* Variables Row */}
          <div className="grid grid-cols-2 gap-4">
            {/* Variables */}
            <Section title="variables">
              <div className="grid grid-cols-3 gap-2">
                <VariableCard
                  name="i"
                  value={currentStep?.i ?? "—"}
                  active={currentStep?.type === "check"}
                />
                <VariableCard
                  name="A[i]"
                  value={currentStep !== null && currentStep?.checking !== null ? displayArray[currentStep.checking] : "—"}
                  active={currentStep?.type === "check"}
                />
                <VariableCard
                  name="target"
                  value={target}
                  active={false}
                />
              </div>
            </Section>

            {/* Progress */}
            <Section title="progress">
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-[var(--bg-primary)] border border-[var(--border-color)] p-2 text-center">
                  <div className="text-[0.65rem] text-[var(--text-muted)] uppercase mb-0.5">
                    checked
                  </div>
                  <div className="text-lg text-[var(--accent-red)]">
                    {currentStep?.checked.size ?? 0}
                  </div>
                </div>
                <div className="bg-[var(--bg-primary)] border border-[var(--border-color)] p-2 text-center">
                  <div className="text-[0.65rem] text-[var(--text-muted)] uppercase mb-0.5">
                    remaining
                  </div>
                  <div className="text-lg text-[var(--text-secondary)]">
                    {displayArray.length - (currentStep?.checked.size ?? 0) - (currentStep?.found !== null ? 1 : 0)}
                  </div>
                </div>
              </div>
            </Section>
          </div>

          {/* Comparison Detail */}
          <Section title="current comparison">
            <div className="flex items-center justify-center gap-8 min-h-[60px]">
              {currentStep && currentStep.checking !== null ? (
                <>
                  <div className="text-center">
                    <div className="text-xs text-[var(--text-muted)] mb-1">A[{currentStep.i}]</div>
                    <div className="text-2xl font-bold text-[var(--accent-yellow)]">
                      {displayArray[currentStep.checking]}
                    </div>
                  </div>
                  <div className="text-2xl text-[var(--text-muted)]">
                    {displayArray[currentStep.checking] === target ? "=" : "≠"}
                  </div>
                  <div className="text-center">
                    <div className="text-xs text-[var(--text-muted)] mb-1">target</div>
                    <div className="text-2xl font-bold text-[var(--accent-magenta)]">
                      {target}
                    </div>
                  </div>
                  <div className="text-sm text-[var(--text-secondary)] ml-4">
                    {displayArray[currentStep.checking] === target 
                      ? "→ match found!" 
                      : "→ continue search"}
                  </div>
                </>
              ) : currentStep?.type === "found" ? (
                <div className="text-[var(--accent-green)] text-xl font-bold">
                  🎯 Target {target} found at index {currentStep.found}!
                </div>
              ) : currentStep?.type === "not-found" ? (
                <div className="text-[var(--accent-red)] text-xl font-bold">
                  ❌ Target {target} not found after checking all {displayArray.length} elements
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
          <Section title="array (unsorted)">
            <div className="flex items-center gap-1 min-h-[40px] flex-wrap font-mono text-sm">
              <span className="text-[var(--text-muted)]">[</span>
              {displayArray.map((val, idx) => {
                const isFound = currentStep?.found === idx;
                const isChecking = currentStep?.checking === idx;
                const isChecked = currentStep?.checked.has(idx);
                
                return (
                  <span key={idx} className="flex items-center">
                    <span
                      className={`px-1 ${
                        isFound
                          ? "text-[var(--accent-green)] font-bold"
                          : isChecking
                          ? "text-[var(--accent-yellow)] font-bold"
                          : isChecked
                          ? "text-[var(--accent-red)] line-through"
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

          {/* Complexity Comparison */}
          <Section title="complexity note">
            <div className="text-sm text-[var(--text-secondary)]">
              <p className="mb-2">
                <span className="text-[var(--accent-orange)]">Linear Search:</span> O(n) — must check each element sequentially
              </p>
              <p>
                <span className="text-[var(--accent-cyan)]">Binary Search:</span> O(log n) — but requires sorted array
              </p>
              <p className="mt-2 text-[var(--text-muted)] text-xs">
                For this {displayArray.length}-element array: Linear checks up to {displayArray.length} elements, Binary would check ~{Math.ceil(Math.log2(displayArray.length))}
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

