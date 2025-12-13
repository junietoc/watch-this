"use client";

/*
  📈 LONGEST INCREASING SUBSEQUENCE VISUALIZER
  Classic DP problem with O(n²) solution.
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
  type: "init" | "compare" | "extend" | "no-extend" | "update-best" | "complete" | "backtrack";
  i: number;
  j: number;
  dp: number[];
  parent: number[];
  bestIdx: number;
  bestLength: number;
  comparing: boolean;
  lisIndices: number[];
}

// ============================================
// PRESET ARRAYS
// ============================================

const presetArrays: Record<string, number[]> = {
  classic: [10, 22, 9, 33, 21, 50, 41, 60, 80],
  simple: [3, 10, 2, 1, 20],
  decreasing: [9, 8, 7, 6, 5, 4, 3, 2, 1],
  increasing: [1, 2, 3, 4, 5, 6, 7],
  mixed: [5, 1, 4, 2, 8, 3, 9, 6],
  random: [3, 4, -1, 0, 6, 2, 3],
};

// ============================================
// ALGORITHM LOGIC
// ============================================

function computeAllSteps(arr: number[]): Step[] {
  const steps: Step[] = [];
  const n = arr.length;
  
  if (n === 0) return steps;
  
  const dp: number[] = new Array(n).fill(1);
  const parent: number[] = new Array(n).fill(-1);
  let bestIdx = 0;
  let bestLength = 1;
  
  steps.push({
    line: 1,
    action: `Initialize dp[i] = 1 for all positions (each element is LIS of length 1)`,
    type: "init",
    i: -1,
    j: -1,
    dp: [...dp],
    parent: [...parent],
    bestIdx: 0,
    bestLength: 1,
    comparing: false,
    lisIndices: [],
  });
  
  for (let i = 1; i < n; i++) {
    steps.push({
      line: 2,
      action: `Consider element at index i=${i}: arr[${i}]=${arr[i]}`,
      type: "init",
      i,
      j: -1,
      dp: [...dp],
      parent: [...parent],
      bestIdx,
      bestLength,
      comparing: false,
      lisIndices: [],
    });
    
    for (let j = 0; j < i; j++) {
      steps.push({
        line: 3,
        action: `Compare arr[${j}]=${arr[j]} with arr[${i}]=${arr[i]}`,
        type: "compare",
        i,
        j,
        dp: [...dp],
        parent: [...parent],
        bestIdx,
        bestLength,
        comparing: true,
        lisIndices: [],
      });
      
      if (arr[j] < arr[i]) {
        if (dp[j] + 1 > dp[i]) {
          dp[i] = dp[j] + 1;
          parent[i] = j;
          
          steps.push({
            line: 4,
            action: `${arr[j]} < ${arr[i]} and dp[${j}]+1=${dp[j]} > old dp[${i}], update dp[${i}]=${dp[i]}`,
            type: "extend",
            i,
            j,
            dp: [...dp],
            parent: [...parent],
            bestIdx,
            bestLength,
            comparing: false,
            lisIndices: [],
          });
        } else {
          steps.push({
            line: 5,
            action: `${arr[j]} < ${arr[i]} but dp[${j}]+1=${dp[j]+1} ≤ dp[${i}]=${dp[i]}, no improvement`,
            type: "no-extend",
            i,
            j,
            dp: [...dp],
            parent: [...parent],
            bestIdx,
            bestLength,
            comparing: false,
            lisIndices: [],
          });
        }
      } else {
        steps.push({
          line: 5,
          action: `${arr[j]} ≥ ${arr[i]}, cannot extend LIS`,
          type: "no-extend",
          i,
          j,
          dp: [...dp],
          parent: [...parent],
          bestIdx,
          bestLength,
          comparing: false,
          lisIndices: [],
        });
      }
    }
    
    if (dp[i] > bestLength) {
      bestLength = dp[i];
      bestIdx = i;
      
      steps.push({
        line: 6,
        action: `New best! LIS length = ${bestLength} ending at index ${bestIdx}`,
        type: "update-best",
        i,
        j: -1,
        dp: [...dp],
        parent: [...parent],
        bestIdx,
        bestLength,
        comparing: false,
        lisIndices: [],
      });
    }
  }
  
  // Backtrack to find LIS
  const lisIndices: number[] = [];
  let idx = bestIdx;
  while (idx !== -1) {
    lisIndices.unshift(idx);
    idx = parent[idx];
  }
  
  steps.push({
    line: 7,
    action: `Backtrack from index ${bestIdx} to reconstruct LIS`,
    type: "backtrack",
    i: -1,
    j: -1,
    dp: [...dp],
    parent: [...parent],
    bestIdx,
    bestLength,
    comparing: false,
    lisIndices: [...lisIndices],
  });
  
  steps.push({
    line: 8,
    action: `Complete! LIS has length ${bestLength}: [${lisIndices.map(i => arr[i]).join(", ")}]`,
    type: "complete",
    i: -1,
    j: -1,
    dp: [...dp],
    parent: [...parent],
    bestIdx,
    bestLength,
    comparing: false,
    lisIndices: [...lisIndices],
  });
  
  return steps;
}

// ============================================
// ALGORITHM CODE
// ============================================

const algorithmCode = [
  { line: 1, content: "LIS(arr)", tokens: [
    { type: "function", text: "LIS" },
    { type: "bracket", text: "(" },
    { type: "variable", text: "arr" },
    { type: "bracket", text: ")" },
  ]},
  { line: 2, content: "begin", tokens: [{ type: "keyword", text: "begin" }]},
  { line: 3, content: "   dp[i] ← 1 ∀i  // each element is LIS of 1", tokens: [
    { type: "plain", text: "   " },
    { type: "variable", text: "dp" },
    { type: "bracket", text: "[" },
    { type: "variable", text: "i" },
    { type: "bracket", text: "]" },
    { type: "operator", text: " ← " },
    { type: "number", text: "1" },
    { type: "plain", text: " ∀" },
    { type: "variable", text: "i" },
    { type: "comment", text: "  // each element is LIS of 1" },
  ]},
  { line: 4, content: "   for i ← 1 to n-1 do", tokens: [
    { type: "plain", text: "   " },
    { type: "keyword", text: "for" },
    { type: "plain", text: " " },
    { type: "variable", text: "i" },
    { type: "operator", text: " ← " },
    { type: "number", text: "1" },
    { type: "plain", text: " " },
    { type: "keyword", text: "to" },
    { type: "plain", text: " " },
    { type: "variable", text: "n-1" },
    { type: "plain", text: " " },
    { type: "keyword", text: "do" },
  ]},
  { line: 5, content: "      for j ← 0 to i-1 do", tokens: [
    { type: "plain", text: "      " },
    { type: "keyword", text: "for" },
    { type: "plain", text: " " },
    { type: "variable", text: "j" },
    { type: "operator", text: " ← " },
    { type: "number", text: "0" },
    { type: "plain", text: " " },
    { type: "keyword", text: "to" },
    { type: "plain", text: " " },
    { type: "variable", text: "i-1" },
    { type: "plain", text: " " },
    { type: "keyword", text: "do" },
  ]},
  { line: 6, content: "         if arr[j] < arr[i] and dp[j]+1 > dp[i]", tokens: [
    { type: "plain", text: "         " },
    { type: "keyword", text: "if" },
    { type: "plain", text: " " },
    { type: "variable", text: "arr" },
    { type: "bracket", text: "[" },
    { type: "variable", text: "j" },
    { type: "bracket", text: "]" },
    { type: "operator", text: " < " },
    { type: "variable", text: "arr" },
    { type: "bracket", text: "[" },
    { type: "variable", text: "i" },
    { type: "bracket", text: "]" },
    { type: "keyword", text: " and " },
    { type: "variable", text: "dp" },
    { type: "bracket", text: "[" },
    { type: "variable", text: "j" },
    { type: "bracket", text: "]" },
    { type: "operator", text: "+" },
    { type: "number", text: "1" },
    { type: "operator", text: " > " },
    { type: "variable", text: "dp" },
    { type: "bracket", text: "[" },
    { type: "variable", text: "i" },
    { type: "bracket", text: "]" },
  ]},
  { line: 7, content: "            dp[i] ← dp[j] + 1", tokens: [
    { type: "plain", text: "            " },
    { type: "variable", text: "dp" },
    { type: "bracket", text: "[" },
    { type: "variable", text: "i" },
    { type: "bracket", text: "]" },
    { type: "operator", text: " ← " },
    { type: "variable", text: "dp" },
    { type: "bracket", text: "[" },
    { type: "variable", text: "j" },
    { type: "bracket", text: "]" },
    { type: "operator", text: " + " },
    { type: "number", text: "1" },
  ]},
  { line: 8, content: "            parent[i] ← j", tokens: [
    { type: "plain", text: "            " },
    { type: "variable", text: "parent" },
    { type: "bracket", text: "[" },
    { type: "variable", text: "i" },
    { type: "bracket", text: "]" },
    { type: "operator", text: " ← " },
    { type: "variable", text: "j" },
  ]},
  { line: 9, content: "   return max(dp), backtrack", tokens: [
    { type: "plain", text: "   " },
    { type: "keyword", text: "return" },
    { type: "plain", text: " " },
    { type: "function", text: "max" },
    { type: "bracket", text: "(" },
    { type: "variable", text: "dp" },
    { type: "bracket", text: ")" },
    { type: "plain", text: ", backtrack" },
  ]},
  { line: 10, content: "end", tokens: [{ type: "keyword", text: "end" }]},
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

export default function LISPage() {
  const [selectedPreset, setSelectedPreset] = useState<string>("classic");
  const [arr, setArr] = useState<number[]>(presetArrays.classic);
  const [steps, setSteps] = useState<Step[]>([]);
  const [currentStepIndex, setCurrentStepIndex] = useState(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1.5);
  const [codeWidth, setCodeWidth] = useState(380);
  const [isResizing, setIsResizing] = useState(false);
  const [customInput, setCustomInput] = useState("");

  const playIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const codeContainerRef = useRef<HTMLDivElement>(null);

  const currentStep = currentStepIndex >= 0 ? steps[currentStepIndex] : null;

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;
      setCodeWidth(Math.min(Math.max(280, e.clientX), window.innerWidth * 0.5));
    };
    const handleMouseUp = () => setIsResizing(false);
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

  const stopPlaying = useCallback(() => {
    setIsPlaying(false);
    if (playIntervalRef.current) { clearInterval(playIntervalRef.current); playIntervalRef.current = null; }
  }, []);

  const nextStep = useCallback(() => {
    setCurrentStepIndex((prev) => { if (prev < steps.length - 1) return prev + 1; stopPlaying(); return prev; });
  }, [steps.length, stopPlaying]);

  const prevStep = useCallback(() => setCurrentStepIndex((prev) => Math.max(0, prev - 1)), []);
  const goToStart = useCallback(() => { stopPlaying(); if (steps.length > 0) setCurrentStepIndex(0); }, [steps.length, stopPlaying]);
  const goToEnd = useCallback(() => { stopPlaying(); if (steps.length > 0) setCurrentStepIndex(steps.length - 1); }, [steps.length, stopPlaying]);

  const startVisualization = useCallback(() => {
    stopPlaying();
    setSteps(computeAllSteps(arr));
    setCurrentStepIndex(0);
  }, [arr, stopPlaying]);

  const resetVisualization = useCallback(() => { stopPlaying(); setSteps([]); setCurrentStepIndex(-1); }, [stopPlaying]);

  const playPause = useCallback(() => {
    if (isPlaying) stopPlaying();
    else { if (steps.length === 0) { startVisualization(); return; } setIsPlaying(true); }
  }, [isPlaying, steps.length, stopPlaying, startVisualization]);

  const handlePresetChange = useCallback((preset: string) => {
    setSelectedPreset(preset);
    setArr(presetArrays[preset]);
    resetVisualization();
  }, [resetVisualization]);

  const handleCustomInput = useCallback(() => {
    const nums = customInput.split(",").map(s => parseInt(s.trim())).filter(n => !isNaN(n));
    if (nums.length > 0) {
      setSelectedPreset("custom");
      setArr(nums);
      resetVisualization();
    }
  }, [customInput, resetVisualization]);

  useEffect(() => {
    if (isPlaying) {
      const interval = setInterval(() => {
        setCurrentStepIndex((prev) => { if (prev < steps.length - 1) return prev + 1; setIsPlaying(false); return prev; });
      }, 1000 / speed);
      playIntervalRef.current = interval;
      return () => clearInterval(interval);
    }
  }, [isPlaying, speed, steps.length]);

  useEffect(() => {
    if (currentStep && codeContainerRef.current) {
      const el = codeContainerRef.current.querySelector(`[data-line="${currentStep.line}"]`);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [currentStep]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement).tagName === "INPUT") return;
      if (e.key === "ArrowRight" || e.key === "l") nextStep();
      if (e.key === "ArrowLeft" || e.key === "h") prevStep();
      if (e.key === " ") { e.preventDefault(); playPause(); }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [nextStep, prevStep, playPause]);

  const maxVal = Math.max(...arr, 1);

  const getBarColor = (idx: number) => {
    if (!currentStep) return "var(--bg-tertiary)";
    if (currentStep.lisIndices.includes(idx)) return "var(--accent-green)";
    if (currentStep.i === idx) return "var(--accent-yellow)";
    if (currentStep.j === idx) return "var(--accent-cyan)";
    if (idx === currentStep.bestIdx && currentStep.type !== "init") return "var(--accent-magenta)";
    return "var(--bg-tertiary)";
  };

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] flex flex-col font-mono">
      <header className="bg-[var(--bg-secondary)] border-b border-[var(--border-color)] px-4 py-3 flex items-center justify-between flex-wrap gap-4">
        <Link href="/algorithms" className="flex items-center gap-2">
          <span className="text-[var(--accent-green)]">$</span>
          <span className="text-[var(--text-secondary)]">./</span>
          <span className="text-[var(--text-primary)]">lis</span>
        </Link>
        <div className="flex items-center gap-3 flex-wrap">
          <select value={selectedPreset} onChange={(e) => handlePresetChange(e.target.value)} className="px-3 py-1.5 text-sm bg-[var(--bg-primary)] border border-[var(--border-color)] text-[var(--text-primary)] cursor-pointer">
            {Object.keys(presetArrays).map((k) => <option key={k} value={k}>{k}</option>)}
          </select>
          <input type="text" value={customInput} onChange={(e) => setCustomInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleCustomInput()} placeholder="e.g. 3,10,2,1,20" className="w-40 px-3 py-1.5 text-sm bg-[var(--bg-primary)] border border-[var(--border-color)] text-[var(--text-primary)]" />
          <button onClick={startVisualization} className="px-4 py-1.5 border border-[var(--accent-green)] text-[var(--accent-green)] hover:bg-[var(--accent-green)] hover:text-[var(--bg-primary)] text-sm">run</button>
          <button onClick={resetVisualization} className="px-4 py-1.5 border border-[var(--border-color)] text-[var(--text-secondary)] text-sm">reset</button>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={goToStart} className="w-8 h-8 flex items-center justify-center border border-[var(--border-color)] text-xs">|◁</button>
          <button onClick={prevStep} className="w-8 h-8 flex items-center justify-center border border-[var(--border-color)] text-xs">◁</button>
          <button onClick={playPause} className="w-8 h-8 flex items-center justify-center border border-[var(--accent-green)] text-[var(--accent-green)] text-xs">{isPlaying ? "||" : "▷"}</button>
          <button onClick={nextStep} className="w-8 h-8 flex items-center justify-center border border-[var(--border-color)] text-xs">▷</button>
          <button onClick={goToEnd} className="w-8 h-8 flex items-center justify-center border border-[var(--border-color)] text-xs">▷|</button>
          <input type="range" min="0.5" max="5" step="0.5" value={speed} onChange={(e) => setSpeed(parseFloat(e.target.value))} className="w-20 h-1 ml-3 accent-[var(--accent-green)]" />
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <div style={{ width: codeWidth }} className="bg-[var(--bg-code)] border-r border-[var(--border-color)] flex flex-col shrink-0 relative">
          <div className="px-4 py-2 bg-[var(--bg-secondary)] border-b border-[var(--border-color)] text-xs text-[var(--text-muted)] uppercase"># algorithm</div>
          <div ref={codeContainerRef} className="flex-1 overflow-auto">
            {algorithmCode.map((line) => (
              <div key={line.line} data-line={line.line} className={`flex text-sm leading-7 ${currentStep?.line === line.line ? "bg-[var(--line-highlight)] border-l-2 border-[var(--accent-green)]" : "border-l-2 border-transparent"}`}>
                <span className={`w-8 px-2 text-right shrink-0 ${currentStep?.line === line.line ? "text-[var(--accent-green)]" : "text-[var(--text-muted)]"}`}>{line.line}</span>
                <code className="px-3 py-0.5 whitespace-nowrap">{line.tokens.map((t, i) => <span key={i} className={tokenColors[t.type]}>{t.text}</span>)}</code>
              </div>
            ))}
          </div>
          <div onMouseDown={() => setIsResizing(true)} className="absolute top-0 right-0 w-1 h-full cursor-col-resize hover:bg-[var(--accent-green)]/30" />
        </div>

        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 min-w-[400px]">
          <Section title="array visualization" className="flex-1">
            <div className="flex items-end gap-2 h-48 px-4 pb-8 pt-4 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded relative">
              {arr.map((val, idx) => (
                <div key={idx} className="flex flex-col items-center flex-1 min-w-0">
                  <div className="text-xs text-[var(--text-muted)] mb-1 truncate">{val}</div>
                  <div
                    className="w-full rounded-t transition-all duration-300"
                    style={{
                      height: `${(Math.abs(val) / maxVal) * 120}px`,
                      minHeight: 20,
                      backgroundColor: getBarColor(idx),
                    }}
                  />
                  <div className="text-xs text-[var(--text-muted)] mt-1">{idx}</div>
                </div>
              ))}
              <div className="absolute bottom-2 left-3 flex gap-3 text-xs text-[var(--text-muted)]">
                <span className="flex items-center gap-1"><span className="w-3 h-3 rounded" style={{ backgroundColor: "var(--accent-yellow)" }}></span> i (current)</span>
                <span className="flex items-center gap-1"><span className="w-3 h-3 rounded" style={{ backgroundColor: "var(--accent-cyan)" }}></span> j (compare)</span>
                <span className="flex items-center gap-1"><span className="w-3 h-3 rounded" style={{ backgroundColor: "var(--accent-green)" }}></span> LIS</span>
              </div>
            </div>
          </Section>

          <div className="grid grid-cols-2 gap-4">
            <Section title="dp array">
              <div className="flex gap-1 flex-wrap">
                {(currentStep?.dp ?? new Array(arr.length).fill(1)).map((val, idx) => (
                  <div key={idx} className={`w-10 h-10 flex flex-col items-center justify-center text-xs border ${currentStep?.i === idx ? "border-[var(--accent-yellow)] bg-[var(--accent-yellow)]/20" : currentStep?.lisIndices.includes(idx) ? "border-[var(--accent-green)] bg-[var(--accent-green)]/20" : "border-[var(--border-color)] bg-[var(--bg-primary)]"}`}>
                    <span className="text-[var(--text-muted)]">{idx}</span>
                    <span className="font-bold text-[var(--accent-purple)]">{val}</span>
                  </div>
                ))}
              </div>
            </Section>

            <Section title="variables">
              <div className="grid grid-cols-2 gap-2">
                <VariableCard name="i" value={currentStep?.i ?? "-"} color="var(--accent-yellow)" />
                <VariableCard name="j" value={currentStep?.j ?? "-"} color="var(--accent-cyan)" />
                <VariableCard name="bestLength" value={currentStep?.bestLength ?? 1} color="var(--accent-green)" />
                <VariableCard name="bestIdx" value={currentStep?.bestIdx ?? 0} color="var(--accent-magenta)" />
              </div>
            </Section>
          </div>

          {currentStep?.lisIndices && currentStep.lisIndices.length > 0 && (
            <Section title="longest increasing subsequence">
              <div className="flex items-center gap-3">
                <div className="flex gap-2">
                  {currentStep.lisIndices.map((idx, i) => (
                    <span key={i} className="px-3 py-2 bg-[var(--accent-green)]/20 border border-[var(--accent-green)] text-[var(--accent-green)] font-bold">
                      {arr[idx]}
                    </span>
                  ))}
                </div>
                <span className="text-[var(--text-muted)]">length = {currentStep.lisIndices.length}</span>
              </div>
            </Section>
          )}

          <Section title="current action">
            <div className="text-sm bg-[var(--bg-primary)] border border-[var(--border-color)] p-3 min-h-[50px]">
              {currentStep ? <><span className="text-[var(--accent-green)]">[{currentStepIndex + 1}/{steps.length}]</span> {currentStep.action}</> : <span className="text-[var(--text-muted)]">click &quot;run&quot; to begin...</span>}
            </div>
          </Section>
        </div>
      </div>
    </div>
  );
}

function Section({ title, children, className = "" }: { title: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-[var(--bg-secondary)] border border-[var(--border-color)] overflow-hidden ${className}`}>
      <div className="px-3 py-2 bg-[var(--bg-tertiary)] border-b border-[var(--border-color)] text-xs text-[var(--text-muted)] uppercase"># {title}</div>
      <div className="p-3">{children}</div>
    </div>
  );
}

function VariableCard({ name, value, color }: { name: string; value: number | string; color: string }) {
  return (
    <div className="flex items-center justify-between px-3 py-2 bg-[var(--bg-primary)] border border-[var(--border-color)]">
      <span className="text-[var(--text-muted)] text-sm">{name}</span>
      <span className="font-bold text-lg" style={{ color }}>{value}</span>
    </div>
  );
}

