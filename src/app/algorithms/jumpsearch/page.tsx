"use client";

/*
  🦘 JUMP SEARCH VISUALIZER PAGE
  Search by jumping blocks then linear search within block.
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
  type: "init" | "jump" | "overshoot" | "linear" | "found" | "not-found";
  array: number[];
  target: number;
  jumpSize: number;
  prev: number;
  curr: number;
  checking: number | null;
  jumped: Set<number>;
  linearChecked: Set<number>;
  found: number | null;
  blockStart: number | null;
  blockEnd: number | null;
}

// ============================================
// PRESET ARRAYS AND TARGETS
// ============================================

const presetSearches: Record<string, { array: number[]; target: number }> = {
  found: { array: [2, 5, 8, 12, 16, 23, 38, 45, 56, 72, 91], target: 56 },
  notfound: { array: [2, 5, 8, 12, 16, 23, 38, 45, 56, 72, 91], target: 50 },
  first: { array: [10, 20, 30, 40, 50, 60, 70, 80, 90, 100], target: 10 },
  last: { array: [10, 20, 30, 40, 50, 60, 70, 80, 90, 100], target: 100 },
  inblock: { array: [5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60], target: 35 },
  small: { array: [1, 3, 5, 7, 9], target: 7 },
  large: { array: [1, 4, 7, 10, 13, 16, 19, 22, 25, 28, 31, 34, 37, 40, 43, 46], target: 31 },
};

// ============================================
// ALGORITHM LOGIC
// ============================================

function computeAllSteps(array: number[], target: number): Step[] {
  const allSteps: Step[] = [];
  const n = array.length;
  const jumpSize = Math.floor(Math.sqrt(n));
  const jumped = new Set<number>();
  const linearChecked = new Set<number>();

  // Initial step
  allSteps.push({
    line: 1,
    action: `Initialize jump search: target = ${target}, array size = ${n}, jump size = √${n} ≈ ${jumpSize}`,
    type: "init",
    array: [...array],
    target,
    jumpSize,
    prev: 0,
    curr: 0,
    checking: null,
    jumped: new Set(jumped),
    linearChecked: new Set(linearChecked),
    found: null,
    blockStart: null,
    blockEnd: null,
  });

  let prev = 0;
  let curr = jumpSize;

  // Jump phase - find the block where target might be
  while (curr < n && array[curr] < target) {
    jumped.add(curr);

    allSteps.push({
      line: 3,
      action: `Jump: check array[${curr}] = ${array[curr]} < target ${target}? Yes, jump ahead`,
      type: "jump",
      array: [...array],
      target,
      jumpSize,
      prev,
      curr,
      checking: curr,
      jumped: new Set(jumped),
      linearChecked: new Set(linearChecked),
      found: null,
      blockStart: null,
      blockEnd: null,
    });

    prev = curr;
    curr = Math.min(curr + jumpSize, n);
  }

  // Check if we've jumped past or reached the end
  if (curr >= n) {
    curr = n - 1;
  }

  jumped.add(curr);

  allSteps.push({
    line: 4,
    action: `Jump stop: array[${curr}] = ${array[curr]} ≥ target ${target} (or end reached). Block found: [${prev}..${curr}]`,
    type: "overshoot",
    array: [...array],
    target,
    jumpSize,
    prev,
    curr,
    checking: curr,
    jumped: new Set(jumped),
    linearChecked: new Set(linearChecked),
    found: null,
    blockStart: prev,
    blockEnd: curr,
  });

  // Linear search phase - search backwards within the block
  allSteps.push({
    line: 5,
    action: `Linear search in block [${prev}..${curr}]`,
    type: "linear",
    array: [...array],
    target,
    jumpSize,
    prev,
    curr,
    checking: null,
    jumped: new Set(jumped),
    linearChecked: new Set(linearChecked),
    found: null,
    blockStart: prev,
    blockEnd: curr,
  });

  for (let i = prev; i <= curr; i++) {
    linearChecked.add(i);

    allSteps.push({
      line: 6,
      action: `Linear check: array[${i}] = ${array[i]} === target ${target}?`,
      type: "linear",
      array: [...array],
      target,
      jumpSize,
      prev,
      curr,
      checking: i,
      jumped: new Set(jumped),
      linearChecked: new Set(linearChecked),
      found: null,
      blockStart: prev,
      blockEnd: curr,
    });

    if (array[i] === target) {
      allSteps.push({
        line: 7,
        action: `Found! array[${i}] = ${array[i]} equals target ${target}`,
        type: "found",
        array: [...array],
        target,
        jumpSize,
        prev,
        curr,
        checking: i,
        jumped: new Set(jumped),
        linearChecked: new Set(linearChecked),
        found: i,
        blockStart: prev,
        blockEnd: curr,
      });
      return allSteps;
    }

    if (array[i] > target) {
      // Element not in array (we've passed where it should be)
      allSteps.push({
        line: 8,
        action: `Not found! array[${i}] = ${array[i]} > target ${target}, element doesn't exist`,
        type: "not-found",
        array: [...array],
        target,
        jumpSize,
        prev,
        curr,
        checking: i,
        jumped: new Set(jumped),
        linearChecked: new Set(linearChecked),
        found: null,
        blockStart: prev,
        blockEnd: curr,
      });
      return allSteps;
    }
  }

  // Not found after searching the block
  allSteps.push({
    line: 8,
    action: `Not found! Searched entire block [${prev}..${curr}], target ${target} is not in the array`,
    type: "not-found",
    array: [...array],
    target,
    jumpSize,
    prev,
    curr,
    checking: null,
    jumped: new Set(jumped),
    linearChecked: new Set(linearChecked),
    found: null,
    blockStart: prev,
    blockEnd: curr,
  });

  return allSteps;
}

// ============================================
// ALGORITHM CODE
// ============================================

const algorithmCode = [
  { line: 1, content: "jumpSearch(A, n, target)", tokens: [
    { type: "function", text: "jumpSearch" },
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
  { line: 3, content: "   step ← √n", tokens: [
    { type: "plain", text: "   " },
    { type: "variable", text: "step" },
    { type: "operator", text: " ← " },
    { type: "plain", text: "√" },
    { type: "variable", text: "n" },
  ]},
  { line: 4, content: "   prev ← 0; curr ← step", tokens: [
    { type: "plain", text: "   " },
    { type: "variable", text: "prev" },
    { type: "operator", text: " ← " },
    { type: "number", text: "0" },
    { type: "plain", text: "; " },
    { type: "variable", text: "curr" },
    { type: "operator", text: " ← " },
    { type: "variable", text: "step" },
  ]},
  { line: 5, content: "   // Jump phase", tokens: [
    { type: "plain", text: "   " },
    { type: "comment", text: "// Jump phase" },
  ]},
  { line: 6, content: "   while curr < n and A[curr] < target", tokens: [
    { type: "plain", text: "   " },
    { type: "keyword", text: "while" },
    { type: "plain", text: " " },
    { type: "variable", text: "curr" },
    { type: "operator", text: " < " },
    { type: "variable", text: "n" },
    { type: "plain", text: " " },
    { type: "keyword", text: "and" },
    { type: "plain", text: " " },
    { type: "variable", text: "A" },
    { type: "bracket", text: "[" },
    { type: "variable", text: "curr" },
    { type: "bracket", text: "]" },
    { type: "operator", text: " < " },
    { type: "variable", text: "target" },
  ]},
  { line: 7, content: "      prev ← curr", tokens: [
    { type: "plain", text: "      " },
    { type: "variable", text: "prev" },
    { type: "operator", text: " ← " },
    { type: "variable", text: "curr" },
  ]},
  { line: 8, content: "      curr ← min(curr + step, n)", tokens: [
    { type: "plain", text: "      " },
    { type: "variable", text: "curr" },
    { type: "operator", text: " ← " },
    { type: "function", text: "min" },
    { type: "bracket", text: "(" },
    { type: "variable", text: "curr" },
    { type: "operator", text: " + " },
    { type: "variable", text: "step" },
    { type: "plain", text: ", " },
    { type: "variable", text: "n" },
    { type: "bracket", text: ")" },
  ]},
  { line: 9, content: "   // Linear phase in block", tokens: [
    { type: "plain", text: "   " },
    { type: "comment", text: "// Linear phase in block" },
  ]},
  { line: 10, content: "   for i ← prev to curr do", tokens: [
    { type: "plain", text: "   " },
    { type: "keyword", text: "for" },
    { type: "plain", text: " " },
    { type: "variable", text: "i" },
    { type: "operator", text: " ← " },
    { type: "variable", text: "prev" },
    { type: "plain", text: " " },
    { type: "keyword", text: "to" },
    { type: "plain", text: " " },
    { type: "variable", text: "curr" },
    { type: "plain", text: " " },
    { type: "keyword", text: "do" },
  ]},
  { line: 11, content: "      if A[i] = target then", tokens: [
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
  { line: 12, content: "         return i", tokens: [
    { type: "plain", text: "         " },
    { type: "keyword", text: "return" },
    { type: "plain", text: " " },
    { type: "variable", text: "i" },
  ]},
  { line: 13, content: "   return -1", tokens: [
    { type: "plain", text: "   " },
    { type: "keyword", text: "return" },
    { type: "plain", text: " " },
    { type: "number", text: "-1" },
  ]},
  { line: 14, content: "end", tokens: [
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

export default function JumpSearchPage() {
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
      .sort((a, b) => a - b); // Jump search requires sorted array
    
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

    // In active block (linear search phase)
    if (currentStep.blockStart !== null && currentStep.blockEnd !== null) {
      if (index >= currentStep.blockStart && index <= currentStep.blockEnd) {
        if (currentStep.linearChecked.has(index)) {
          return "var(--accent-cyan)";
        }
        return "var(--accent-orange)";
      }
    }

    // Jumped positions
    if (currentStep.jumped.has(index)) {
      return "var(--accent-magenta)";
    }

    // Linear checked
    if (currentStep.linearChecked.has(index)) {
      return "var(--accent-cyan)";
    }

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

    if (currentStep.jumped.has(index)) {
      return "var(--accent-magenta)";
    }

    if (currentStep.blockStart !== null && currentStep.blockEnd !== null) {
      if (index >= currentStep.blockStart && index <= currentStep.blockEnd) {
        return "var(--accent-orange)";
      }
    }

    return "var(--border-color)";
  };

  // ============================================
  // RENDER
  // ============================================

  const displayArray = currentStep ? currentStep.array : inputArray;
  const jumpSize = Math.floor(Math.sqrt(displayArray.length));

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] flex flex-col font-mono">
      {/* Header */}
      <header className="bg-[var(--bg-secondary)] border-b border-[var(--border-color)] px-4 py-3 flex items-center justify-between flex-wrap gap-4">
        {/* Logo */}
        <Link href="/algorithms" className="flex items-center gap-2 group">
          <span className="text-[var(--accent-green)]">$</span>
          <span className="text-[var(--text-secondary)]">./</span>
          <span className="text-[var(--text-primary)]">jumpsearch</span>
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
              <option value="found">found (56)</option>
              <option value="notfound">not found (50)</option>
              <option value="first">first element</option>
              <option value="last">last element</option>
              <option value="inblock">in block (35)</option>
              <option value="small">small array</option>
              <option value="large">large (16 elem)</option>
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
          {/* Target and Jump Size Display */}
          <div className="grid grid-cols-2 gap-4">
            <Section title="search target">
              <div className="flex items-center justify-center gap-4">
                <span className="text-[var(--text-muted)]">Target:</span>
                <div className="px-4 py-2 border-2 border-[var(--accent-magenta)] bg-[var(--accent-magenta)]/10 text-[var(--accent-magenta)] font-bold text-xl">
                  {target}
                </div>
                {currentStep?.type === "found" && (
                  <span className="text-[var(--accent-green)] font-bold">✓ FOUND</span>
                )}
                {currentStep?.type === "not-found" && (
                  <span className="text-[var(--accent-red)] font-bold">✗ NOT FOUND</span>
                )}
              </div>
            </Section>

            <Section title="jump configuration">
              <div className="flex items-center justify-center gap-6">
                <div className="text-center">
                  <div className="text-xs text-[var(--text-muted)] mb-1">array size</div>
                  <div className="text-xl font-bold text-[var(--text-primary)]">{displayArray.length}</div>
                </div>
                <div className="text-center">
                  <div className="text-xs text-[var(--text-muted)] mb-1">jump size (√n)</div>
                  <div className="text-xl font-bold text-[var(--accent-cyan)]">{jumpSize}</div>
                </div>
              </div>
            </Section>
          </div>

          {/* Array Visualization */}
          <Section title="array visualization" className="flex-1">
            <div className="relative bg-[var(--bg-primary)] border border-[var(--border-color)] rounded overflow-hidden p-4" style={{ minHeight: 280 }}>
              {/* Block indicators at top */}
              <div className="flex justify-center gap-1 mb-4">
                {Array.from({ length: Math.ceil(displayArray.length / jumpSize) }).map((_, blockIdx) => {
                  const blockStart = blockIdx * jumpSize;
                  const blockEnd = Math.min((blockIdx + 1) * jumpSize - 1, displayArray.length - 1);
                  const isActiveBlock = currentStep?.blockStart === blockStart || 
                    (currentStep !== null && currentStep?.blockStart !== null && blockStart >= (currentStep?.blockStart ?? 0) && blockStart <= (currentStep?.blockEnd ?? 0));
                  
                  return (
                    <div
                      key={blockIdx}
                      className={`px-2 py-1 text-xs border ${
                        isActiveBlock
                          ? "border-[var(--accent-orange)] bg-[var(--accent-orange)]/20 text-[var(--accent-orange)]"
                          : "border-[var(--border-color)] text-[var(--text-muted)]"
                      }`}
                    >
                      Block {blockIdx}: [{blockStart}..{blockEnd}]
                    </div>
                  );
                })}
              </div>

              {/* Bar Chart */}
              <div className="flex items-end justify-center gap-1 h-44">
                {displayArray.map((value, index) => {
                  const barHeight = (value / maxValue) * 140 + 20;
                  const barColor = getBarColor(index);
                  const borderColor = getBarBorder(index);
                  
                  return (
                    <div
                      key={index}
                      className="flex flex-col items-center gap-1 transition-all duration-200"
                      style={{ width: Math.max(28, 500 / displayArray.length) }}
                    >
                      {/* Value label */}
                      <span className={`text-xs ${
                        currentStep?.checking === index ? "text-[var(--accent-yellow)] font-bold" :
                        currentStep?.found === index ? "text-[var(--accent-green)] font-bold" :
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
                        {currentStep?.jumped.has(index) && !currentStep?.linearChecked.has(index) && currentStep?.found !== index && (
                          <div className="absolute inset-0 flex items-center justify-center text-white font-bold text-xs">
                            🦘
                          </div>
                        )}
                        {currentStep?.found === index && (
                          <div className="absolute inset-0 flex items-center justify-center text-white font-bold">
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

              {/* Legend */}
              <div className="absolute bottom-3 left-3 flex flex-wrap gap-3 text-xs text-[var(--text-muted)] bg-[var(--bg-secondary)]/90 px-3 py-2 rounded">
                <span className="flex items-center gap-1">
                  <span className="w-3 h-3 bg-[var(--accent-magenta)]"></span> jumped
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-3 h-3 bg-[var(--accent-orange)]"></span> active block
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-3 h-3 bg-[var(--accent-yellow)]"></span> checking
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-3 h-3 bg-[var(--accent-cyan)]"></span> linear checked
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-3 h-3 bg-[var(--accent-green)]"></span> found
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
                  name="step"
                  value={currentStep?.jumpSize ?? jumpSize}
                  active={false}
                />
                <VariableCard
                  name="prev"
                  value={currentStep?.prev ?? "—"}
                  active={currentStep?.type === "jump" || currentStep?.type === "overshoot"}
                />
                <VariableCard
                  name="curr"
                  value={currentStep?.curr ?? "—"}
                  active={currentStep?.type === "jump" || currentStep?.type === "overshoot"}
                />
                <VariableCard
                  name="i"
                  value={currentStep?.checking ?? "—"}
                  active={currentStep?.type === "linear"}
                />
              </div>
            </Section>

            {/* Phase */}
            <Section title="current phase">
              <div className="flex items-center justify-center gap-4 min-h-[50px]">
                <div className={`px-4 py-2 border-2 ${
                  currentStep?.type === "jump" || currentStep?.type === "overshoot"
                    ? "border-[var(--accent-magenta)] bg-[var(--accent-magenta)]/20 text-[var(--accent-magenta)]"
                    : "border-[var(--border-color)] text-[var(--text-muted)]"
                }`}>
                  🦘 Jump Phase
                </div>
                <span className="text-[var(--text-muted)]">→</span>
                <div className={`px-4 py-2 border-2 ${
                  currentStep?.type === "linear"
                    ? "border-[var(--accent-cyan)] bg-[var(--accent-cyan)]/20 text-[var(--accent-cyan)]"
                    : "border-[var(--border-color)] text-[var(--text-muted)]"
                }`}>
                  🔍 Linear Phase
                </div>
              </div>
            </Section>
          </div>

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
                const isFound = currentStep?.found === idx;
                const isChecking = currentStep?.checking === idx;
                const isJumped = currentStep?.jumped.has(idx);
                const inBlock = currentStep?.blockStart !== null && 
                  idx >= (currentStep?.blockStart ?? 0) && idx <= (currentStep?.blockEnd ?? 0);
                
                return (
                  <span key={idx} className="flex items-center">
                    <span
                      className={`px-1 ${
                        isFound
                          ? "text-[var(--accent-green)] font-bold"
                          : isChecking
                          ? "text-[var(--accent-yellow)] font-bold"
                          : inBlock
                          ? "text-[var(--accent-orange)]"
                          : isJumped
                          ? "text-[var(--accent-magenta)]"
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
          <Section title="complexity comparison">
            <div className="text-sm text-[var(--text-secondary)] grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-[var(--accent-orange)] font-bold mb-1">Linear O(n)</div>
                <div className="text-xs text-[var(--text-muted)]">up to {displayArray.length} checks</div>
              </div>
              <div className="text-center">
                <div className="text-[var(--accent-cyan)] font-bold mb-1">Jump O(√n)</div>
                <div className="text-xs text-[var(--text-muted)]">~{jumpSize + jumpSize} checks</div>
              </div>
              <div className="text-center">
                <div className="text-[var(--accent-green)] font-bold mb-1">Binary O(log n)</div>
                <div className="text-xs text-[var(--text-muted)]">~{Math.ceil(Math.log2(displayArray.length))} checks</div>
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

