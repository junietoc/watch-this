"use client";

/*
  📥 INSERTION SORT VISUALIZER PAGE
  Build sorted array one element at a time.
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
  type: "init" | "pick" | "compare" | "shift" | "insert" | "complete";
  array: number[];
  i: number;
  j: number;
  key: number | null;
  keyOriginalIndex: number | null;
  comparing: [number, number] | null;
  shifting: number | null;
  insertPosition: number | null;
  sorted: Set<number>;
}

// ============================================
// PRESET ARRAYS
// ============================================

const presetArrays: Record<string, number[]> = {
  random: [64, 34, 25, 12, 22, 11, 90],
  reversed: [70, 60, 50, 40, 30, 20, 10],
  nearly: [10, 20, 30, 50, 40, 60, 70],
  duplicates: [30, 10, 50, 30, 20, 50, 10],
  small: [5, 2, 8, 1, 9],
  best: [10, 20, 30, 40, 50, 60, 70],
};

// ============================================
// ALGORITHM LOGIC
// ============================================

function computeAllSteps(inputArray: number[]): Step[] {
  const allSteps: Step[] = [];
  const array = [...inputArray];
  const n = array.length;
  const sorted = new Set<number>([0]); // First element is trivially sorted

  // Initial step
  allSteps.push({
    line: 1,
    action: `Initialize insertion sort with array of ${n} elements. First element is trivially sorted.`,
    type: "init",
    array: [...array],
    i: 0,
    j: 0,
    key: null,
    keyOriginalIndex: null,
    comparing: null,
    shifting: null,
    insertPosition: null,
    sorted: new Set(sorted),
  });

  for (let i = 1; i < n; i++) {
    const key = array[i];
    let j = i - 1;

    // Pick the key
    allSteps.push({
      line: 3,
      action: `Pick key: array[${i}] = ${key} to insert into sorted portion`,
      type: "pick",
      array: [...array],
      i,
      j,
      key,
      keyOriginalIndex: i,
      comparing: null,
      shifting: null,
      insertPosition: null,
      sorted: new Set(sorted),
    });

    // Compare and shift
    while (j >= 0 && array[j] > key) {
      // Compare step
      allSteps.push({
        line: 4,
        action: `Compare: array[${j}] = ${array[j]} > key = ${key}?`,
        type: "compare",
        array: [...array],
        i,
        j,
        key,
        keyOriginalIndex: i,
        comparing: [j, i],
        shifting: null,
        insertPosition: null,
        sorted: new Set(sorted),
      });

      // Shift step
      allSteps.push({
        line: 5,
        action: `Shift: ${array[j]} > ${key}, move array[${j}] to array[${j + 1}]`,
        type: "shift",
        array: [...array],
        i,
        j,
        key,
        keyOriginalIndex: i,
        comparing: null,
        shifting: j,
        insertPosition: null,
        sorted: new Set(sorted),
      });

      array[j + 1] = array[j];

      allSteps.push({
        line: 5,
        action: `After shift: array[${j + 1}] = ${array[j + 1]}`,
        type: "shift",
        array: [...array],
        i,
        j,
        key,
        keyOriginalIndex: i,
        comparing: null,
        shifting: null,
        insertPosition: null,
        sorted: new Set(sorted),
      });

      j--;
    }

    // Final comparison (if j >= 0)
    if (j >= 0) {
      allSteps.push({
        line: 4,
        action: `Compare: array[${j}] = ${array[j]} ≤ key = ${key}, stop shifting`,
        type: "compare",
        array: [...array],
        i,
        j,
        key,
        keyOriginalIndex: i,
        comparing: [j, i],
        shifting: null,
        insertPosition: null,
        sorted: new Set(sorted),
      });
    } else {
      allSteps.push({
        line: 4,
        action: `Reached beginning of array (j = ${j}), stop shifting`,
        type: "compare",
        array: [...array],
        i,
        j,
        key,
        keyOriginalIndex: i,
        comparing: null,
        shifting: null,
        insertPosition: null,
        sorted: new Set(sorted),
      });
    }

    // Insert the key
    const insertPos = j + 1;
    array[insertPos] = key;

    // Update sorted set
    sorted.add(i);

    allSteps.push({
      line: 6,
      action: `Insert: place key ${key} at position ${insertPos}`,
      type: "insert",
      array: [...array],
      i,
      j,
      key,
      keyOriginalIndex: i,
      comparing: null,
      shifting: null,
      insertPosition: insertPos,
      sorted: new Set(sorted),
    });
  }

  // Final complete step
  allSteps.push({
    line: 7,
    action: "Insertion sort complete! Array is fully sorted.",
    type: "complete",
    array: [...array],
    i: n - 1,
    j: 0,
    key: null,
    keyOriginalIndex: null,
    comparing: null,
    shifting: null,
    insertPosition: null,
    sorted: new Set(sorted),
  });

  return allSteps;
}

// ============================================
// ALGORITHM CODE
// ============================================

const algorithmCode = [
  { line: 1, content: "insertionSort(A, n)", tokens: [
    { type: "function", text: "insertionSort" },
    { type: "bracket", text: "(" },
    { type: "variable", text: "A" },
    { type: "plain", text: ", " },
    { type: "variable", text: "n" },
    { type: "bracket", text: ")" },
  ]},
  { line: 2, content: "begin", tokens: [
    { type: "keyword", text: "begin" },
  ]},
  { line: 3, content: "   for i ← 1 to n-1 do", tokens: [
    { type: "plain", text: "   " },
    { type: "keyword", text: "for" },
    { type: "plain", text: " " },
    { type: "variable", text: "i" },
    { type: "operator", text: " ← " },
    { type: "number", text: "1" },
    { type: "plain", text: " " },
    { type: "keyword", text: "to" },
    { type: "plain", text: " " },
    { type: "variable", text: "n" },
    { type: "operator", text: "-" },
    { type: "number", text: "1" },
    { type: "plain", text: " " },
    { type: "keyword", text: "do" },
  ]},
  { line: 4, content: "      key ← A[i]", tokens: [
    { type: "plain", text: "      " },
    { type: "variable", text: "key" },
    { type: "operator", text: " ← " },
    { type: "variable", text: "A" },
    { type: "bracket", text: "[" },
    { type: "variable", text: "i" },
    { type: "bracket", text: "]" },
  ]},
  { line: 5, content: "      j ← i - 1", tokens: [
    { type: "plain", text: "      " },
    { type: "variable", text: "j" },
    { type: "operator", text: " ← " },
    { type: "variable", text: "i" },
    { type: "operator", text: " - " },
    { type: "number", text: "1" },
  ]},
  { line: 6, content: "      while j ≥ 0 and A[j] > key do", tokens: [
    { type: "plain", text: "      " },
    { type: "keyword", text: "while" },
    { type: "plain", text: " " },
    { type: "variable", text: "j" },
    { type: "operator", text: " ≥ " },
    { type: "number", text: "0" },
    { type: "plain", text: " " },
    { type: "keyword", text: "and" },
    { type: "plain", text: " " },
    { type: "variable", text: "A" },
    { type: "bracket", text: "[" },
    { type: "variable", text: "j" },
    { type: "bracket", text: "]" },
    { type: "operator", text: " > " },
    { type: "variable", text: "key" },
    { type: "plain", text: " " },
    { type: "keyword", text: "do" },
  ]},
  { line: 7, content: "         A[j+1] ← A[j]", tokens: [
    { type: "plain", text: "         " },
    { type: "variable", text: "A" },
    { type: "bracket", text: "[" },
    { type: "variable", text: "j" },
    { type: "operator", text: "+" },
    { type: "number", text: "1" },
    { type: "bracket", text: "]" },
    { type: "operator", text: " ← " },
    { type: "variable", text: "A" },
    { type: "bracket", text: "[" },
    { type: "variable", text: "j" },
    { type: "bracket", text: "]" },
  ]},
  { line: 8, content: "         j ← j - 1", tokens: [
    { type: "plain", text: "         " },
    { type: "variable", text: "j" },
    { type: "operator", text: " ← " },
    { type: "variable", text: "j" },
    { type: "operator", text: " - " },
    { type: "number", text: "1" },
  ]},
  { line: 9, content: "      A[j+1] ← key", tokens: [
    { type: "plain", text: "      " },
    { type: "variable", text: "A" },
    { type: "bracket", text: "[" },
    { type: "variable", text: "j" },
    { type: "operator", text: "+" },
    { type: "number", text: "1" },
    { type: "bracket", text: "]" },
    { type: "operator", text: " ← " },
    { type: "variable", text: "key" },
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

export default function InsertionSortPage() {
  const [selectedPreset, setSelectedPreset] = useState<string>("random");
  const [inputArray, setInputArray] = useState<number[]>(presetArrays.random);
  const [customInput, setCustomInput] = useState<string>("");
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
    const newSteps = computeAllSteps(inputArray);
    setSteps(newSteps);
    setCurrentStepIndex(0);
  }, [inputArray, stopPlaying]);

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
    setInputArray(presetArrays[preset]);
    setCustomInput("");
    resetVisualization();
  }, [resetVisualization]);

  const handleCustomInput = useCallback(() => {
    const parsed = customInput
      .split(/[,\s]+/)
      .map(s => parseInt(s.trim(), 10))
      .filter(n => !isNaN(n));
    
    if (parsed.length > 0) {
      setInputArray(parsed);
      setSelectedPreset("custom");
      resetVisualization();
    }
  }, [customInput, resetVisualization]);

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

    // Complete - all sorted
    if (currentStep.type === "complete") {
      return "var(--accent-green)";
    }

    // Insert position
    if (currentStep.insertPosition === index) {
      return "var(--accent-green)";
    }

    // Currently shifting
    if (currentStep.shifting === index) {
      return "var(--accent-magenta)";
    }

    // Currently comparing
    if (currentStep.comparing && currentStep.comparing[0] === index) {
      return "var(--accent-yellow)";
    }

    // The key being inserted (shown at original position or floating)
    if (currentStep.keyOriginalIndex === index && currentStep.type === "pick") {
      return "var(--accent-red)";
    }

    // Sorted portion
    if (index < currentStep.i) {
      return "var(--accent-cyan)";
    }

    // Unsorted portion
    return "var(--bg-tertiary)";
  };

  const getBarBorder = (index: number) => {
    if (!currentStep) return "var(--border-color)";

    if (currentStep.insertPosition === index) {
      return "var(--accent-green)";
    }

    if (currentStep.shifting === index) {
      return "var(--accent-magenta)";
    }

    if (currentStep.comparing && currentStep.comparing[0] === index) {
      return "var(--accent-yellow)";
    }

    if (currentStep.keyOriginalIndex === index && currentStep.type === "pick") {
      return "var(--accent-red)";
    }

    if (index < currentStep.i) {
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
          <span className="text-[var(--text-primary)]">insertionsort</span>
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
              <option value="random">random (7)</option>
              <option value="reversed">reversed (7)</option>
              <option value="nearly">nearly sorted (7)</option>
              <option value="duplicates">duplicates (7)</option>
              <option value="small">small (5)</option>
              <option value="best">best case (7)</option>
              {selectedPreset === "custom" && <option value="custom">custom</option>}
            </select>
          </div>
          
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={customInput}
              onChange={(e) => setCustomInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleCustomInput()}
              placeholder="custom: 5,3,8,1..."
              className="px-3 py-1.5 text-sm bg-[var(--bg-primary)] border border-[var(--border-color)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-green)] transition-colors w-40"
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
          {/* Array Visualization */}
          <Section title="array visualization" className="flex-1">
            <div className="relative bg-[var(--bg-primary)] border border-[var(--border-color)] rounded overflow-hidden p-4" style={{ minHeight: 320 }}>
              {/* Key indicator (floating above) */}
              {currentStep && currentStep.key !== null && currentStep.type !== "insert" && currentStep.type !== "complete" && (
                <div className="absolute top-4 left-1/2 transform -translate-x-1/2 flex flex-col items-center">
                  <span className="text-xs text-[var(--accent-red)] mb-1">key</span>
                  <div className="w-12 h-12 flex items-center justify-center border-2 border-[var(--accent-red)] bg-[var(--accent-red)]/20 text-[var(--accent-red)] font-bold text-lg">
                    {currentStep.key}
                  </div>
                </div>
              )}

              {/* Bar Chart */}
              <div className="flex items-end justify-center gap-1 h-64 mt-16">
                {displayArray.map((value, index) => {
                  const barHeight = (value / maxValue) * 180 + 20;
                  const barColor = getBarColor(index);
                  const borderColor = getBarBorder(index);
                  
                  return (
                    <div
                      key={index}
                      className="flex flex-col items-center gap-1 transition-all duration-200"
                      style={{ width: Math.max(30, 400 / displayArray.length) }}
                    >
                      {/* Value label */}
                      <span className="text-xs text-[var(--text-secondary)]">
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

              {/* Sorted/Unsorted boundary indicator */}
              {currentStep && currentStep.i > 0 && currentStep.type !== "complete" && (
                <div className="flex items-end justify-center gap-1 mt-2">
                  {displayArray.map((_, index) => (
                    <div
                      key={index}
                      className="flex flex-col items-center text-xs"
                      style={{ width: Math.max(30, 400 / displayArray.length) }}
                    >
                      {index === currentStep.i - 1 && (
                        <span className="text-[var(--accent-cyan)] font-bold">|</span>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Legend */}
              <div className="absolute bottom-3 left-3 flex flex-wrap gap-3 text-xs text-[var(--text-muted)] bg-[var(--bg-secondary)]/90 px-3 py-2 rounded">
                <span className="flex items-center gap-1">
                  <span className="w-3 h-3 bg-[var(--accent-red)]"></span> key
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-3 h-3 bg-[var(--accent-yellow)]"></span> comparing
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-3 h-3 bg-[var(--accent-magenta)]"></span> shifting
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-3 h-3 bg-[var(--accent-green)]"></span> inserted
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-3 h-3 bg-[var(--accent-cyan)]"></span> sorted
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
                  name="i"
                  value={currentStep?.i ?? "—"}
                  active={currentStep?.type === "pick"}
                />
                <VariableCard
                  name="j"
                  value={currentStep?.j ?? "—"}
                  active={currentStep?.type === "compare" || currentStep?.type === "shift"}
                />
                <VariableCard
                  name="key"
                  value={currentStep?.key ?? "—"}
                  active={currentStep?.key !== null}
                />
                <VariableCard
                  name="insert"
                  value={currentStep?.insertPosition ?? "—"}
                  active={currentStep?.type === "insert"}
                />
              </div>
            </Section>

            {/* Progress */}
            <Section title="progress">
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-[var(--bg-primary)] border border-[var(--border-color)] p-2 text-center">
                  <div className="text-[0.65rem] text-[var(--text-muted)] uppercase mb-0.5">
                    sorted portion
                  </div>
                  <div className="text-lg text-[var(--accent-cyan)]">
                    [0..{currentStep ? currentStep.i - 1 : 0}]
                  </div>
                </div>
                <div className="bg-[var(--bg-primary)] border border-[var(--border-color)] p-2 text-center">
                  <div className="text-[0.65rem] text-[var(--text-muted)] uppercase mb-0.5">
                    unsorted portion
                  </div>
                  <div className="text-lg text-[var(--text-secondary)]">
                    [{currentStep ? currentStep.i : 1}..{displayArray.length - 1}]
                  </div>
                </div>
              </div>
            </Section>
          </div>

          {/* Key Operation Detail */}
          <Section title="current operation">
            <div className="flex items-center justify-center gap-8 min-h-[60px]">
              {currentStep?.type === "compare" && currentStep.comparing ? (
                <>
                  <div className="text-center">
                    <div className="text-xs text-[var(--text-muted)] mb-1">A[{currentStep.j}]</div>
                    <div className="text-2xl font-bold text-[var(--accent-yellow)]">
                      {currentStep.array[currentStep.comparing[0]]}
                    </div>
                  </div>
                  <div className="text-2xl text-[var(--text-muted)]">
                    {currentStep.array[currentStep.comparing[0]] > (currentStep.key ?? 0) ? ">" : "≤"}
                  </div>
                  <div className="text-center">
                    <div className="text-xs text-[var(--text-muted)] mb-1">key</div>
                    <div className="text-2xl font-bold text-[var(--accent-red)]">
                      {currentStep.key}
                    </div>
                  </div>
                  <div className="text-sm text-[var(--text-secondary)] ml-4">
                    {currentStep.array[currentStep.comparing[0]] > (currentStep.key ?? 0)
                      ? "→ shift right"
                      : "→ stop, insert here"}
                  </div>
                </>
              ) : currentStep?.type === "shift" ? (
                <div className="text-[var(--accent-magenta)] text-lg">
                  Shifting element at position {currentStep.shifting} to the right
                </div>
              ) : currentStep?.type === "insert" ? (
                <div className="text-[var(--accent-green)] text-lg">
                  Inserting key {currentStep.key} at position {currentStep.insertPosition}
                </div>
              ) : currentStep?.type === "pick" ? (
                <div className="text-[var(--accent-red)] text-lg">
                  Picked key = {currentStep.key} from position {currentStep.i}
                </div>
              ) : (
                <span className="text-[var(--text-muted)] text-sm">
                  {currentStep?.type === "complete" ? "Sorting complete!" : "No active operation"}
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
          <Section title="array state">
            <div className="flex items-center gap-1 min-h-[40px] flex-wrap font-mono text-sm">
              <span className="text-[var(--text-muted)]">[</span>
              {displayArray.map((val, idx) => (
                <span key={idx} className="flex items-center">
                  <span
                    className={`px-1 ${
                      currentStep?.type === "complete"
                        ? "text-[var(--accent-green)]"
                        : currentStep?.insertPosition === idx
                        ? "text-[var(--accent-green)]"
                        : currentStep?.shifting === idx
                        ? "text-[var(--accent-magenta)]"
                        : idx < (currentStep?.i ?? 0)
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
              ))}
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

