"use client";

/*
  🔀 MERGE SORT VISUALIZER PAGE
  Stable divide-and-conquer sorting algorithm.
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
  type: "init" | "divide" | "merge-start" | "compare" | "copy" | "merge-done" | "complete";
  array: number[];
  left: number;
  mid: number | null;
  right: number;
  leftArray: number[];
  rightArray: number[];
  leftIdx: number | null;
  rightIdx: number | null;
  mergeIdx: number | null;
  comparing: [number, number] | null;
  copying: number | null;
  sorted: Set<number>;
  activeRange: [number, number] | null;
  callStack: { left: number; right: number; phase: string }[];
  tempHighlight: number[];
}

// ============================================
// PRESET ARRAYS
// ============================================

const presetArrays: Record<string, number[]> = {
  random: [38, 27, 43, 3, 9, 82, 10],
  reversed: [80, 70, 60, 50, 40, 30, 20, 10],
  nearly: [10, 20, 30, 50, 40, 60, 70, 80],
  duplicates: [30, 10, 50, 30, 20, 50, 10, 40],
  small: [5, 2, 8, 1],
  large: [45, 23, 78, 12, 56, 34, 89, 67, 10, 43],
};

// ============================================
// ALGORITHM LOGIC
// ============================================

function computeAllSteps(inputArray: number[]): Step[] {
  const allSteps: Step[] = [];
  const array = [...inputArray];
  const sorted = new Set<number>();
  const callStack: { left: number; right: number; phase: string }[] = [];

  // Initial step
  allSteps.push({
    line: 1,
    action: `Initialize merge sort with array of ${array.length} elements`,
    type: "init",
    array: [...array],
    left: 0,
    mid: null,
    right: array.length - 1,
    leftArray: [],
    rightArray: [],
    leftIdx: null,
    rightIdx: null,
    mergeIdx: null,
    comparing: null,
    copying: null,
    sorted: new Set(sorted),
    activeRange: null,
    callStack: [...callStack],
    tempHighlight: [],
  });

  function mergeSort(left: number, right: number) {
    callStack.push({ left, right, phase: "divide" });

    if (left < right) {
      const mid = Math.floor((left + right) / 2);

      allSteps.push({
        line: 3,
        action: `Divide: split array[${left}..${right}] at mid=${mid}`,
        type: "divide",
        array: [...array],
        left,
        mid,
        right,
        leftArray: [],
        rightArray: [],
        leftIdx: null,
        rightIdx: null,
        mergeIdx: null,
        comparing: null,
        copying: null,
        sorted: new Set(sorted),
        activeRange: [left, right],
        callStack: [...callStack],
        tempHighlight: [],
      });

      // Recursively sort left half
      mergeSort(left, mid);
      
      // Recursively sort right half
      mergeSort(mid + 1, right);

      // Update call stack phase to merge
      callStack[callStack.length - 1].phase = "merge";

      // Merge the sorted halves
      merge(left, mid, right);
    } else if (left === right) {
      // Single element is already sorted
      sorted.add(left);
      allSteps.push({
        line: 2,
        action: `Base case: single element array[${left}] = ${array[left]} is sorted`,
        type: "complete",
        array: [...array],
        left,
        mid: null,
        right,
        leftArray: [],
        rightArray: [],
        leftIdx: null,
        rightIdx: null,
        mergeIdx: null,
        comparing: null,
        copying: null,
        sorted: new Set(sorted),
        activeRange: [left, right],
        callStack: [...callStack],
        tempHighlight: [],
      });
    }

    callStack.pop();
  }

  function merge(left: number, mid: number, right: number) {
    // Create temp arrays
    const leftArr = array.slice(left, mid + 1);
    const rightArr = array.slice(mid + 1, right + 1);

    allSteps.push({
      line: 7,
      action: `Merge: combining [${leftArr.join(", ")}] and [${rightArr.join(", ")}]`,
      type: "merge-start",
      array: [...array],
      left,
      mid,
      right,
      leftArray: [...leftArr],
      rightArray: [...rightArr],
      leftIdx: 0,
      rightIdx: 0,
      mergeIdx: left,
      comparing: null,
      copying: null,
      sorted: new Set(sorted),
      activeRange: [left, right],
      callStack: [...callStack],
      tempHighlight: [],
    });

    let i = 0; // Index for left array
    let j = 0; // Index for right array
    let k = left; // Index for merged array

    while (i < leftArr.length && j < rightArr.length) {
      allSteps.push({
        line: 9,
        action: `Compare: L[${i}]=${leftArr[i]} vs R[${j}]=${rightArr[j]}`,
        type: "compare",
        array: [...array],
        left,
        mid,
        right,
        leftArray: [...leftArr],
        rightArray: [...rightArr],
        leftIdx: i,
        rightIdx: j,
        mergeIdx: k,
        comparing: [left + i, mid + 1 + j],
        copying: null,
        sorted: new Set(sorted),
        activeRange: [left, right],
        callStack: [...callStack],
        tempHighlight: [],
      });

      if (leftArr[i] <= rightArr[j]) {
        array[k] = leftArr[i];
        
        allSteps.push({
          line: 10,
          action: `Copy: L[${i}]=${leftArr[i]} ≤ R[${j}]=${rightArr[j]}, place ${leftArr[i]} at index ${k}`,
          type: "copy",
          array: [...array],
          left,
          mid,
          right,
          leftArray: [...leftArr],
          rightArray: [...rightArr],
          leftIdx: i,
          rightIdx: j,
          mergeIdx: k,
          comparing: null,
          copying: k,
          sorted: new Set(sorted),
          activeRange: [left, right],
          callStack: [...callStack],
          tempHighlight: [k],
        });
        
        i++;
      } else {
        array[k] = rightArr[j];
        
        allSteps.push({
          line: 11,
          action: `Copy: R[${j}]=${rightArr[j]} < L[${i}]=${leftArr[i]}, place ${rightArr[j]} at index ${k}`,
          type: "copy",
          array: [...array],
          left,
          mid,
          right,
          leftArray: [...leftArr],
          rightArray: [...rightArr],
          leftIdx: i,
          rightIdx: j,
          mergeIdx: k,
          comparing: null,
          copying: k,
          sorted: new Set(sorted),
          activeRange: [left, right],
          callStack: [...callStack],
          tempHighlight: [k],
        });
        
        j++;
      }
      k++;
    }

    // Copy remaining elements from left array
    while (i < leftArr.length) {
      array[k] = leftArr[i];
      
      allSteps.push({
        line: 12,
        action: `Copy remaining: L[${i}]=${leftArr[i]} to index ${k}`,
        type: "copy",
        array: [...array],
        left,
        mid,
        right,
        leftArray: [...leftArr],
        rightArray: [...rightArr],
        leftIdx: i,
        rightIdx: j,
        mergeIdx: k,
        comparing: null,
        copying: k,
        sorted: new Set(sorted),
        activeRange: [left, right],
        callStack: [...callStack],
        tempHighlight: [k],
      });
      
      i++;
      k++;
    }

    // Copy remaining elements from right array
    while (j < rightArr.length) {
      array[k] = rightArr[j];
      
      allSteps.push({
        line: 13,
        action: `Copy remaining: R[${j}]=${rightArr[j]} to index ${k}`,
        type: "copy",
        array: [...array],
        left,
        mid,
        right,
        leftArray: [...leftArr],
        rightArray: [...rightArr],
        leftIdx: i,
        rightIdx: j,
        mergeIdx: k,
        comparing: null,
        copying: k,
        sorted: new Set(sorted),
        activeRange: [left, right],
        callStack: [...callStack],
        tempHighlight: [k],
      });
      
      j++;
      k++;
    }

    // Mark range as sorted if this is the final merge
    const mergedIndices: number[] = [];
    for (let idx = left; idx <= right; idx++) {
      mergedIndices.push(idx);
    }

    allSteps.push({
      line: 14,
      action: `Merge complete: array[${left}..${right}] = [${array.slice(left, right + 1).join(", ")}]`,
      type: "merge-done",
      array: [...array],
      left,
      mid,
      right,
      leftArray: [],
      rightArray: [],
      leftIdx: null,
      rightIdx: null,
      mergeIdx: null,
      comparing: null,
      copying: null,
      sorted: new Set(sorted),
      activeRange: [left, right],
      callStack: [...callStack],
      tempHighlight: mergedIndices,
    });
  }

  mergeSort(0, array.length - 1);

  // Final complete step - mark all as sorted
  for (let i = 0; i < array.length; i++) {
    sorted.add(i);
  }

  allSteps.push({
    line: 15,
    action: "Merge sort complete! Array is fully sorted.",
    type: "complete",
    array: [...array],
    left: 0,
    mid: null,
    right: array.length - 1,
    leftArray: [],
    rightArray: [],
    leftIdx: null,
    rightIdx: null,
    mergeIdx: null,
    comparing: null,
    copying: null,
    sorted: new Set(sorted),
    activeRange: null,
    callStack: [],
    tempHighlight: [],
  });

  return allSteps;
}

// ============================================
// ALGORITHM CODE
// ============================================

const algorithmCode = [
  { line: 1, content: "mergeSort(A, left, right)", tokens: [
    { type: "function", text: "mergeSort" },
    { type: "bracket", text: "(" },
    { type: "variable", text: "A" },
    { type: "plain", text: ", " },
    { type: "variable", text: "left" },
    { type: "plain", text: ", " },
    { type: "variable", text: "right" },
    { type: "bracket", text: ")" },
  ]},
  { line: 2, content: "begin", tokens: [
    { type: "keyword", text: "begin" },
  ]},
  { line: 3, content: "   if left < right then", tokens: [
    { type: "plain", text: "   " },
    { type: "keyword", text: "if" },
    { type: "plain", text: " " },
    { type: "variable", text: "left" },
    { type: "operator", text: " < " },
    { type: "variable", text: "right" },
    { type: "plain", text: " " },
    { type: "keyword", text: "then" },
  ]},
  { line: 4, content: "      mid ← (left + right) / 2", tokens: [
    { type: "plain", text: "      " },
    { type: "variable", text: "mid" },
    { type: "operator", text: " ← " },
    { type: "bracket", text: "(" },
    { type: "variable", text: "left" },
    { type: "operator", text: " + " },
    { type: "variable", text: "right" },
    { type: "bracket", text: ")" },
    { type: "operator", text: " / " },
    { type: "number", text: "2" },
  ]},
  { line: 5, content: "      mergeSort(A, left, mid)", tokens: [
    { type: "plain", text: "      " },
    { type: "function", text: "mergeSort" },
    { type: "bracket", text: "(" },
    { type: "variable", text: "A" },
    { type: "plain", text: ", " },
    { type: "variable", text: "left" },
    { type: "plain", text: ", " },
    { type: "variable", text: "mid" },
    { type: "bracket", text: ")" },
  ]},
  { line: 6, content: "      mergeSort(A, mid+1, right)", tokens: [
    { type: "plain", text: "      " },
    { type: "function", text: "mergeSort" },
    { type: "bracket", text: "(" },
    { type: "variable", text: "A" },
    { type: "plain", text: ", " },
    { type: "variable", text: "mid" },
    { type: "operator", text: "+" },
    { type: "number", text: "1" },
    { type: "plain", text: ", " },
    { type: "variable", text: "right" },
    { type: "bracket", text: ")" },
  ]},
  { line: 7, content: "      merge(A, left, mid, right)", tokens: [
    { type: "plain", text: "      " },
    { type: "function", text: "merge" },
    { type: "bracket", text: "(" },
    { type: "variable", text: "A" },
    { type: "plain", text: ", " },
    { type: "variable", text: "left" },
    { type: "plain", text: ", " },
    { type: "variable", text: "mid" },
    { type: "plain", text: ", " },
    { type: "variable", text: "right" },
    { type: "bracket", text: ")" },
  ]},
  { line: 8, content: "end", tokens: [
    { type: "keyword", text: "end" },
  ]},
  { line: 9, content: "", tokens: []},
  { line: 10, content: "merge(A, left, mid, right)", tokens: [
    { type: "function", text: "merge" },
    { type: "bracket", text: "(" },
    { type: "variable", text: "A" },
    { type: "plain", text: ", " },
    { type: "variable", text: "left" },
    { type: "plain", text: ", " },
    { type: "variable", text: "mid" },
    { type: "plain", text: ", " },
    { type: "variable", text: "right" },
    { type: "bracket", text: ")" },
  ]},
  { line: 11, content: "begin", tokens: [
    { type: "keyword", text: "begin" },
  ]},
  { line: 12, content: "   L ← A[left..mid]", tokens: [
    { type: "plain", text: "   " },
    { type: "variable", text: "L" },
    { type: "operator", text: " ← " },
    { type: "variable", text: "A" },
    { type: "bracket", text: "[" },
    { type: "variable", text: "left" },
    { type: "operator", text: ".." },
    { type: "variable", text: "mid" },
    { type: "bracket", text: "]" },
  ]},
  { line: 13, content: "   R ← A[mid+1..right]", tokens: [
    { type: "plain", text: "   " },
    { type: "variable", text: "R" },
    { type: "operator", text: " ← " },
    { type: "variable", text: "A" },
    { type: "bracket", text: "[" },
    { type: "variable", text: "mid" },
    { type: "operator", text: "+" },
    { type: "number", text: "1" },
    { type: "operator", text: ".." },
    { type: "variable", text: "right" },
    { type: "bracket", text: "]" },
  ]},
  { line: 14, content: "   i ← 0; j ← 0; k ← left", tokens: [
    { type: "plain", text: "   " },
    { type: "variable", text: "i" },
    { type: "operator", text: " ← " },
    { type: "number", text: "0" },
    { type: "plain", text: "; " },
    { type: "variable", text: "j" },
    { type: "operator", text: " ← " },
    { type: "number", text: "0" },
    { type: "plain", text: "; " },
    { type: "variable", text: "k" },
    { type: "operator", text: " ← " },
    { type: "variable", text: "left" },
  ]},
  { line: 15, content: "   while i < |L| and j < |R| do", tokens: [
    { type: "plain", text: "   " },
    { type: "keyword", text: "while" },
    { type: "plain", text: " " },
    { type: "variable", text: "i" },
    { type: "operator", text: " < " },
    { type: "plain", text: "|" },
    { type: "variable", text: "L" },
    { type: "plain", text: "| " },
    { type: "keyword", text: "and" },
    { type: "plain", text: " " },
    { type: "variable", text: "j" },
    { type: "operator", text: " < " },
    { type: "plain", text: "|" },
    { type: "variable", text: "R" },
    { type: "plain", text: "| " },
    { type: "keyword", text: "do" },
  ]},
  { line: 16, content: "      if L[i] ≤ R[j] then", tokens: [
    { type: "plain", text: "      " },
    { type: "keyword", text: "if" },
    { type: "plain", text: " " },
    { type: "variable", text: "L" },
    { type: "bracket", text: "[" },
    { type: "variable", text: "i" },
    { type: "bracket", text: "]" },
    { type: "operator", text: " ≤ " },
    { type: "variable", text: "R" },
    { type: "bracket", text: "[" },
    { type: "variable", text: "j" },
    { type: "bracket", text: "]" },
    { type: "plain", text: " " },
    { type: "keyword", text: "then" },
  ]},
  { line: 17, content: "         A[k] ← L[i]; i ← i+1", tokens: [
    { type: "plain", text: "         " },
    { type: "variable", text: "A" },
    { type: "bracket", text: "[" },
    { type: "variable", text: "k" },
    { type: "bracket", text: "]" },
    { type: "operator", text: " ← " },
    { type: "variable", text: "L" },
    { type: "bracket", text: "[" },
    { type: "variable", text: "i" },
    { type: "bracket", text: "]" },
    { type: "plain", text: "; " },
    { type: "variable", text: "i" },
    { type: "operator", text: " ← " },
    { type: "variable", text: "i" },
    { type: "operator", text: "+" },
    { type: "number", text: "1" },
  ]},
  { line: 18, content: "      else", tokens: [
    { type: "plain", text: "      " },
    { type: "keyword", text: "else" },
  ]},
  { line: 19, content: "         A[k] ← R[j]; j ← j+1", tokens: [
    { type: "plain", text: "         " },
    { type: "variable", text: "A" },
    { type: "bracket", text: "[" },
    { type: "variable", text: "k" },
    { type: "bracket", text: "]" },
    { type: "operator", text: " ← " },
    { type: "variable", text: "R" },
    { type: "bracket", text: "[" },
    { type: "variable", text: "j" },
    { type: "bracket", text: "]" },
    { type: "plain", text: "; " },
    { type: "variable", text: "j" },
    { type: "operator", text: " ← " },
    { type: "variable", text: "j" },
    { type: "operator", text: "+" },
    { type: "number", text: "1" },
  ]},
  { line: 20, content: "      k ← k+1", tokens: [
    { type: "plain", text: "      " },
    { type: "variable", text: "k" },
    { type: "operator", text: " ← " },
    { type: "variable", text: "k" },
    { type: "operator", text: "+" },
    { type: "number", text: "1" },
  ]},
  { line: 21, content: "   copy remaining L to A", tokens: [
    { type: "plain", text: "   " },
    { type: "comment", text: "copy remaining L to A" },
  ]},
  { line: 22, content: "   copy remaining R to A", tokens: [
    { type: "plain", text: "   " },
    { type: "comment", text: "copy remaining R to A" },
  ]},
  { line: 23, content: "end", tokens: [
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

export default function MergeSortPage() {
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

    // Completed/sorted
    if (currentStep.type === "complete" && currentStep.sorted.has(index)) {
      return "var(--accent-green)";
    }

    // Recently placed
    if (currentStep.tempHighlight.includes(index)) {
      return "var(--accent-green)";
    }

    // Currently copying to this position
    if (currentStep.copying === index) {
      return "var(--accent-magenta)";
    }

    // Currently comparing
    if (currentStep.comparing && (currentStep.comparing[0] === index || currentStep.comparing[1] === index)) {
      return "var(--accent-yellow)";
    }

    // In active range
    if (currentStep.activeRange) {
      const [left, right] = currentStep.activeRange;
      if (index >= left && index <= right) {
        // Mid point
        if (currentStep.mid !== null && index === currentStep.mid) {
          return "var(--accent-red)";
        }
        return "var(--accent-cyan)";
      }
    }

    return "var(--bg-tertiary)";
  };

  const getBarBorder = (index: number) => {
    if (!currentStep) return "var(--border-color)";

    if (currentStep.copying === index) {
      return "var(--accent-magenta)";
    }

    if (currentStep.comparing && (currentStep.comparing[0] === index || currentStep.comparing[1] === index)) {
      return "var(--accent-yellow)";
    }

    if (currentStep.activeRange) {
      const [left, right] = currentStep.activeRange;
      if (index >= left && index <= right) {
        return "var(--accent-cyan)";
      }
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
          <span className="text-[var(--text-primary)]">mergesort</span>
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
              <option value="reversed">reversed (8)</option>
              <option value="nearly">nearly sorted (8)</option>
              <option value="duplicates">duplicates (8)</option>
              <option value="small">small (4)</option>
              <option value="large">large (10)</option>
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
              {/* Bar Chart */}
              <div className="flex items-end justify-center gap-1 h-64">
                {displayArray.map((value, index) => {
                  const barHeight = (value / maxValue) * 200 + 20;
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

              {/* Range indicators */}
              {currentStep && currentStep.activeRange && (
                <div className="flex items-end justify-center gap-1 mt-2">
                  {displayArray.map((_, index) => (
                    <div
                      key={index}
                      className="flex flex-col items-center text-xs"
                      style={{ width: Math.max(30, 400 / displayArray.length) }}
                    >
                      {currentStep.activeRange && index === currentStep.activeRange[0] && (
                        <span className="text-[var(--accent-cyan)] font-bold">L</span>
                      )}
                      {currentStep.mid !== null && index === currentStep.mid && (
                        <span className="text-[var(--accent-red)] font-bold">M</span>
                      )}
                      {currentStep.activeRange && index === currentStep.activeRange[1] && (
                        <span className="text-[var(--accent-cyan)] font-bold">R</span>
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
                  <span className="w-3 h-3 bg-[var(--accent-magenta)]"></span> copying
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-3 h-3 bg-[var(--accent-green)]"></span> merged
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-3 h-3 bg-[var(--accent-cyan)]"></span> active
                </span>
              </div>
            </div>
          </Section>

          {/* Variables and Temp Arrays Row */}
          <div className="grid grid-cols-2 gap-4">
            {/* Variables */}
            <Section title="variables">
              <div className="grid grid-cols-4 gap-2">
                <VariableCard
                  name="left"
                  value={currentStep?.left ?? "—"}
                  active={currentStep?.type === "divide"}
                />
                <VariableCard
                  name="mid"
                  value={currentStep?.mid ?? "—"}
                  active={currentStep?.type === "divide"}
                />
                <VariableCard
                  name="right"
                  value={currentStep?.right ?? "—"}
                  active={currentStep?.type === "divide"}
                />
                <VariableCard
                  name="k"
                  value={currentStep?.mergeIdx ?? "—"}
                  active={currentStep?.type === "copy"}
                />
              </div>
            </Section>

            {/* Merge indices */}
            <Section title="merge pointers">
              <div className="grid grid-cols-2 gap-2">
                <VariableCard
                  name="i (left)"
                  value={currentStep?.leftIdx ?? "—"}
                  active={currentStep?.type === "compare" || currentStep?.type === "copy"}
                />
                <VariableCard
                  name="j (right)"
                  value={currentStep?.rightIdx ?? "—"}
                  active={currentStep?.type === "compare" || currentStep?.type === "copy"}
                />
              </div>
            </Section>
          </div>

          {/* Temp Arrays */}
          <div className="grid grid-cols-2 gap-4">
            <Section title="left array (L)">
              <div className="flex items-center gap-1 min-h-[40px] flex-wrap">
                {currentStep && currentStep.leftArray.length > 0 ? (
                  currentStep.leftArray.map((val, idx) => (
                    <div
                      key={idx}
                      className={`w-10 h-10 flex items-center justify-center border-2 font-bold text-sm transition-all ${
                        currentStep.leftIdx === idx
                          ? "border-[var(--accent-yellow)] bg-[var(--accent-yellow)]/20 text-[var(--accent-yellow)]"
                          : "border-[var(--border-color)] text-[var(--text-primary)]"
                      }`}
                    >
                      {val}
                    </div>
                  ))
                ) : (
                  <span className="text-[var(--text-muted)] text-sm">empty</span>
                )}
              </div>
            </Section>

            <Section title="right array (R)">
              <div className="flex items-center gap-1 min-h-[40px] flex-wrap">
                {currentStep && currentStep.rightArray.length > 0 ? (
                  currentStep.rightArray.map((val, idx) => (
                    <div
                      key={idx}
                      className={`w-10 h-10 flex items-center justify-center border-2 font-bold text-sm transition-all ${
                        currentStep.rightIdx === idx
                          ? "border-[var(--accent-yellow)] bg-[var(--accent-yellow)]/20 text-[var(--accent-yellow)]"
                          : "border-[var(--border-color)] text-[var(--text-primary)]"
                      }`}
                    >
                      {val}
                    </div>
                  ))
                ) : (
                  <span className="text-[var(--text-muted)] text-sm">empty</span>
                )}
              </div>
            </Section>
          </div>

          {/* Call Stack */}
          <Section title="call stack (recursion)">
            <div className="flex items-center gap-2 min-h-[50px] flex-wrap">
              {currentStep && currentStep.callStack.length > 0 ? (
                currentStep.callStack.map((call, idx) => (
                  <div
                    key={idx}
                    className={`px-3 py-2 border text-sm ${
                      idx === currentStep.callStack.length - 1
                        ? call.phase === "merge"
                          ? "border-[var(--accent-magenta)] bg-[var(--accent-magenta)]/10 text-[var(--accent-magenta)]"
                          : "border-[var(--accent-cyan)] bg-[var(--accent-cyan)]/10 text-[var(--accent-cyan)]"
                        : "border-[var(--border-color)] text-[var(--text-secondary)]"
                    }`}
                  >
                    ms({call.left}, {call.right})
                    <span className="text-xs ml-1 opacity-60">
                      {call.phase === "merge" ? "↑" : "↓"}
                    </span>
                  </div>
                ))
              ) : (
                <span className="text-[var(--text-muted)] text-sm">
                  {currentStep?.type === "complete" ? "complete" : "empty"}
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
                      currentStep?.type === "complete" && currentStep.sorted.has(idx)
                        ? "text-[var(--accent-green)]"
                        : currentStep?.tempHighlight.includes(idx)
                        ? "text-[var(--accent-green)]"
                        : currentStep?.copying === idx
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

