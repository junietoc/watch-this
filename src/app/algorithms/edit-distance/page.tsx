"use client";

/*
  ✏️ EDIT DISTANCE (LEVENSHTEIN) VISUALIZER
  Classic DP problem for string transformation.
  Terminal-inspired clean design with 2D DP table.
*/

import Link from "next/link";
import { useState, useEffect, useRef, useCallback } from "react";

// ============================================
// TYPES
// ============================================

interface Step {
  line: number;
  action: string;
  type: "init" | "match" | "insert" | "delete" | "replace" | "complete" | "backtrack";
  i: number;
  j: number;
  dp: number[][];
  operation: string;
  path: [number, number][];
}

// ============================================
// PRESET STRING PAIRS
// ============================================

const presetPairs: Record<string, [string, string]> = {
  classic: ["HORSE", "ROS"],
  similar: ["KITTEN", "SITTING"],
  empty: ["ABC", ""],
  same: ["TEST", "TEST"],
  reverse: ["ABCD", "DCBA"],
  dna: ["GCAT", "GTAC"],
};

// ============================================
// ALGORITHM LOGIC
// ============================================

function computeAllSteps(s1: string, s2: string): Step[] {
  const steps: Step[] = [];
  const m = s1.length;
  const n = s2.length;
  
  // Initialize DP table
  const dp: number[][] = Array(m + 1).fill(null).map(() => Array(n + 1).fill(0));
  
  // Base cases
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  
  steps.push({
    line: 1,
    action: `Initialize DP table: dp[i][0] = i (delete all), dp[0][j] = j (insert all)`,
    type: "init",
    i: -1,
    j: -1,
    dp: dp.map(row => [...row]),
    operation: "init",
    path: [],
  });
  
  // Fill DP table
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (s1[i - 1] === s2[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1];
        steps.push({
          line: 3,
          action: `Match! '${s1[i - 1]}' == '${s2[j - 1]}', dp[${i}][${j}] = dp[${i - 1}][${j - 1}] = ${dp[i][j]}`,
          type: "match",
          i,
          j,
          dp: dp.map(row => [...row]),
          operation: "match",
          path: [],
        });
      } else {
        const insertCost = dp[i][j - 1] + 1;
        const deleteCost = dp[i - 1][j] + 1;
        const replaceCost = dp[i - 1][j - 1] + 1;
        
        const minCost = Math.min(insertCost, deleteCost, replaceCost);
        dp[i][j] = minCost;
        
        let operation = "replace";
        let opName = "Replace";
        if (minCost === insertCost) { operation = "insert"; opName = "Insert"; }
        else if (minCost === deleteCost) { operation = "delete"; opName = "Delete"; }
        
        steps.push({
          line: 4,
          action: `'${s1[i - 1]}' ≠ '${s2[j - 1]}': min(ins=${insertCost}, del=${deleteCost}, rep=${replaceCost}) = ${minCost} → ${opName}`,
          type: operation as "insert" | "delete" | "replace",
          i,
          j,
          dp: dp.map(row => [...row]),
          operation,
          path: [],
        });
      }
    }
  }
  
  // Backtrack to find optimal path
  const path: [number, number][] = [];
  let bi = m, bj = n;
  path.push([bi, bj]);
  
  while (bi > 0 || bj > 0) {
    if (bi > 0 && bj > 0 && s1[bi - 1] === s2[bj - 1]) {
      bi--; bj--;
    } else if (bi > 0 && bj > 0 && dp[bi][bj] === dp[bi - 1][bj - 1] + 1) {
      bi--; bj--;
    } else if (bj > 0 && dp[bi][bj] === dp[bi][bj - 1] + 1) {
      bj--;
    } else {
      bi--;
    }
    path.push([bi, bj]);
  }
  path.reverse();
  
  steps.push({
    line: 5,
    action: `Backtrack to find optimal transformation path`,
    type: "backtrack",
    i: m,
    j: n,
    dp: dp.map(row => [...row]),
    operation: "backtrack",
    path: [...path],
  });
  
  steps.push({
    line: 6,
    action: `Complete! Edit distance from "${s1}" to "${s2}" = ${dp[m][n]} operations`,
    type: "complete",
    i: m,
    j: n,
    dp: dp.map(row => [...row]),
    operation: "complete",
    path: [...path],
  });
  
  return steps;
}

// ============================================
// ALGORITHM CODE
// ============================================

const algorithmCode = [
  { line: 1, content: "EditDistance(s1, s2)", tokens: [
    { type: "function", text: "EditDistance" },
    { type: "bracket", text: "(" },
    { type: "variable", text: "s1" },
    { type: "plain", text: ", " },
    { type: "variable", text: "s2" },
    { type: "bracket", text: ")" },
  ]},
  { line: 2, content: "begin", tokens: [{ type: "keyword", text: "begin" }]},
  { line: 3, content: "   dp[i][0] ← i; dp[0][j] ← j", tokens: [
    { type: "plain", text: "   " },
    { type: "variable", text: "dp" },
    { type: "bracket", text: "[" },
    { type: "variable", text: "i" },
    { type: "bracket", text: "][" },
    { type: "number", text: "0" },
    { type: "bracket", text: "]" },
    { type: "operator", text: " ← " },
    { type: "variable", text: "i" },
    { type: "plain", text: "; " },
    { type: "variable", text: "dp" },
    { type: "bracket", text: "[" },
    { type: "number", text: "0" },
    { type: "bracket", text: "][" },
    { type: "variable", text: "j" },
    { type: "bracket", text: "]" },
    { type: "operator", text: " ← " },
    { type: "variable", text: "j" },
  ]},
  { line: 4, content: "   for i ← 1 to m, j ← 1 to n do", tokens: [
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
    { type: "plain", text: ", " },
    { type: "variable", text: "j" },
    { type: "operator", text: " ← " },
    { type: "number", text: "1" },
    { type: "plain", text: " " },
    { type: "keyword", text: "to" },
    { type: "plain", text: " " },
    { type: "variable", text: "n" },
    { type: "plain", text: " " },
    { type: "keyword", text: "do" },
  ]},
  { line: 5, content: "      if s1[i] == s2[j]", tokens: [
    { type: "plain", text: "      " },
    { type: "keyword", text: "if" },
    { type: "plain", text: " " },
    { type: "variable", text: "s1" },
    { type: "bracket", text: "[" },
    { type: "variable", text: "i" },
    { type: "bracket", text: "]" },
    { type: "operator", text: " == " },
    { type: "variable", text: "s2" },
    { type: "bracket", text: "[" },
    { type: "variable", text: "j" },
    { type: "bracket", text: "]" },
  ]},
  { line: 6, content: "         dp[i][j] ← dp[i-1][j-1]", tokens: [
    { type: "plain", text: "         " },
    { type: "variable", text: "dp" },
    { type: "bracket", text: "[" },
    { type: "variable", text: "i" },
    { type: "bracket", text: "][" },
    { type: "variable", text: "j" },
    { type: "bracket", text: "]" },
    { type: "operator", text: " ← " },
    { type: "variable", text: "dp" },
    { type: "bracket", text: "[" },
    { type: "variable", text: "i-1" },
    { type: "bracket", text: "][" },
    { type: "variable", text: "j-1" },
    { type: "bracket", text: "]" },
  ]},
  { line: 7, content: "      else", tokens: [
    { type: "plain", text: "      " },
    { type: "keyword", text: "else" },
  ]},
  { line: 8, content: "         dp[i][j] ← 1 + min(dp[i][j-1],  // ins", tokens: [
    { type: "plain", text: "         " },
    { type: "variable", text: "dp" },
    { type: "bracket", text: "[" },
    { type: "variable", text: "i" },
    { type: "bracket", text: "][" },
    { type: "variable", text: "j" },
    { type: "bracket", text: "]" },
    { type: "operator", text: " ← " },
    { type: "number", text: "1" },
    { type: "operator", text: " + " },
    { type: "function", text: "min" },
    { type: "bracket", text: "(" },
    { type: "variable", text: "dp" },
    { type: "bracket", text: "[" },
    { type: "variable", text: "i" },
    { type: "bracket", text: "][" },
    { type: "variable", text: "j-1" },
    { type: "bracket", text: "]" },
    { type: "comment", text: ",  // ins" },
  ]},
  { line: 9, content: "                       dp[i-1][j],  // del", tokens: [
    { type: "plain", text: "                       " },
    { type: "variable", text: "dp" },
    { type: "bracket", text: "[" },
    { type: "variable", text: "i-1" },
    { type: "bracket", text: "][" },
    { type: "variable", text: "j" },
    { type: "bracket", text: "]" },
    { type: "comment", text: ",  // del" },
  ]},
  { line: 10, content: "                       dp[i-1][j-1])// rep", tokens: [
    { type: "plain", text: "                       " },
    { type: "variable", text: "dp" },
    { type: "bracket", text: "[" },
    { type: "variable", text: "i-1" },
    { type: "bracket", text: "][" },
    { type: "variable", text: "j-1" },
    { type: "bracket", text: "]" },
    { type: "bracket", text: ")" },
    { type: "comment", text: "// rep" },
  ]},
  { line: 11, content: "   return dp[m][n]", tokens: [
    { type: "plain", text: "   " },
    { type: "keyword", text: "return" },
    { type: "plain", text: " " },
    { type: "variable", text: "dp" },
    { type: "bracket", text: "[" },
    { type: "variable", text: "m" },
    { type: "bracket", text: "][" },
    { type: "variable", text: "n" },
    { type: "bracket", text: "]" },
  ]},
  { line: 12, content: "end", tokens: [{ type: "keyword", text: "end" }]},
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

export default function EditDistancePage() {
  const [selectedPreset, setSelectedPreset] = useState<string>("classic");
  const [s1, setS1] = useState<string>("HORSE");
  const [s2, setS2] = useState<string>("ROS");
  const [steps, setSteps] = useState<Step[]>([]);
  const [currentStepIndex, setCurrentStepIndex] = useState(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1.5);
  const [codeWidth, setCodeWidth] = useState(420);
  const [isResizing, setIsResizing] = useState(false);
  const [customS1, setCustomS1] = useState("");
  const [customS2, setCustomS2] = useState("");

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
    setSteps(computeAllSteps(s1, s2));
    setCurrentStepIndex(0);
  }, [s1, s2, stopPlaying]);

  const resetVisualization = useCallback(() => { stopPlaying(); setSteps([]); setCurrentStepIndex(-1); }, [stopPlaying]);

  const playPause = useCallback(() => {
    if (isPlaying) stopPlaying();
    else { if (steps.length === 0) { startVisualization(); return; } setIsPlaying(true); }
  }, [isPlaying, steps.length, stopPlaying, startVisualization]);

  const handlePresetChange = useCallback((preset: string) => {
    setSelectedPreset(preset);
    const [str1, str2] = presetPairs[preset];
    setS1(str1);
    setS2(str2);
    resetVisualization();
  }, [resetVisualization]);

  const handleCustomInput = useCallback(() => {
    if (customS1.length > 0 || customS2.length > 0) {
      setSelectedPreset("custom");
      setS1(customS1.toUpperCase());
      setS2(customS2.toUpperCase());
      resetVisualization();
    }
  }, [customS1, customS2, resetVisualization]);

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

  const getCellColor = (i: number, j: number) => {
    if (!currentStep) return "";
    const isOnPath = currentStep.path.some(([pi, pj]) => pi === i && pj === j);
    if (currentStep.i === i && currentStep.j === j) {
      if (currentStep.type === "match") return "bg-[var(--accent-green)]/40 border-[var(--accent-green)]";
      if (currentStep.type === "insert") return "bg-[var(--accent-cyan)]/40 border-[var(--accent-cyan)]";
      if (currentStep.type === "delete") return "bg-[var(--accent-red)]/40 border-[var(--accent-red)]";
      if (currentStep.type === "replace") return "bg-[var(--accent-yellow)]/40 border-[var(--accent-yellow)]";
    }
    if (isOnPath) return "bg-[var(--accent-magenta)]/30 border-[var(--accent-magenta)]";
    if (i === s1.length && j === s2.length && currentStep.type === "complete") return "bg-[var(--accent-green)]/50 border-[var(--accent-green)]";
    return "border-[var(--border-color)]";
  };

  const getOperationIcon = (type: string) => {
    if (type === "match") return "✓";
    if (type === "insert") return "↓";
    if (type === "delete") return "→";
    if (type === "replace") return "↘";
    return "";
  };

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] flex flex-col font-mono">
      <header className="bg-[var(--bg-secondary)] border-b border-[var(--border-color)] px-4 py-3 flex items-center justify-between flex-wrap gap-4">
        <Link href="/algorithms" className="flex items-center gap-2">
          <span className="text-[var(--accent-green)]">$</span>
          <span className="text-[var(--text-secondary)]">./</span>
          <span className="text-[var(--text-primary)]">edit-distance</span>
        </Link>
        <div className="flex items-center gap-3 flex-wrap">
          <select value={selectedPreset} onChange={(e) => handlePresetChange(e.target.value)} className="px-3 py-1.5 text-sm bg-[var(--bg-primary)] border border-[var(--border-color)] text-[var(--text-primary)] cursor-pointer">
            {Object.keys(presetPairs).map((k) => <option key={k} value={k}>{k}: {presetPairs[k][0]} → {presetPairs[k][1]}</option>)}
          </select>
          <input type="text" value={customS1} onChange={(e) => setCustomS1(e.target.value)} placeholder="s1" className="w-20 px-3 py-1.5 text-sm bg-[var(--bg-primary)] border border-[var(--border-color)] text-[var(--text-primary)]" />
          <input type="text" value={customS2} onChange={(e) => setCustomS2(e.target.value)} placeholder="s2" className="w-20 px-3 py-1.5 text-sm bg-[var(--bg-primary)] border border-[var(--border-color)] text-[var(--text-primary)]" />
          <button onClick={handleCustomInput} className="px-3 py-1.5 border border-[var(--border-color)] text-[var(--text-secondary)] text-sm">set</button>
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
          <Section title="strings">
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <span className="text-[var(--text-muted)] w-8">s1:</span>
                <div className="flex gap-1">
                  {s1.split("").map((c, i) => (
                    <span key={i} className={`w-8 h-8 flex items-center justify-center border ${currentStep && currentStep.i - 1 === i ? "bg-[var(--accent-yellow)]/30 border-[var(--accent-yellow)]" : "border-[var(--border-color)] bg-[var(--bg-primary)]"}`}>{c}</span>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-[var(--text-muted)] w-8">s2:</span>
                <div className="flex gap-1">
                  {s2.split("").map((c, i) => (
                    <span key={i} className={`w-8 h-8 flex items-center justify-center border ${currentStep && currentStep.j - 1 === i ? "bg-[var(--accent-cyan)]/30 border-[var(--accent-cyan)]" : "border-[var(--border-color)] bg-[var(--bg-primary)]"}`}>{c}</span>
                  ))}
                </div>
              </div>
            </div>
          </Section>

          <Section title="dp table" className="flex-1">
            <div className="overflow-auto">
              <table className="border-collapse">
                <thead>
                  <tr>
                    <th className="w-10 h-10 border border-[var(--border-color)] bg-[var(--bg-tertiary)]"></th>
                    <th className="w-10 h-10 border border-[var(--border-color)] bg-[var(--bg-tertiary)] text-[var(--text-muted)]">ε</th>
                    {s2.split("").map((c, j) => (
                      <th key={j} className={`w-10 h-10 border border-[var(--border-color)] bg-[var(--bg-tertiary)] ${currentStep && currentStep.j - 1 === j ? "text-[var(--accent-cyan)]" : "text-[var(--accent-orange)]"}`}>{c}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="w-10 h-10 border border-[var(--border-color)] bg-[var(--bg-tertiary)] text-[var(--text-muted)] text-center">ε</td>
                    {(currentStep?.dp[0] ?? Array(s2.length + 1).fill(0)).map((val, j) => (
                      <td key={j} className={`w-10 h-10 border text-center ${getCellColor(0, j)}`}>{val}</td>
                    ))}
                  </tr>
                  {s1.split("").map((c, i) => (
                    <tr key={i}>
                      <td className={`w-10 h-10 border border-[var(--border-color)] bg-[var(--bg-tertiary)] text-center ${currentStep && currentStep.i - 1 === i ? "text-[var(--accent-yellow)]" : "text-[var(--accent-orange)]"}`}>{c}</td>
                      {(currentStep?.dp[i + 1] ?? Array(s2.length + 1).fill(0)).map((val, j) => (
                        <td key={j} className={`w-10 h-10 border text-center font-bold ${getCellColor(i + 1, j)}`}>{val ?? ""}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Section>

          <div className="grid grid-cols-2 gap-4">
            <Section title="operation">
              <div className="flex items-center gap-4">
                {currentStep && currentStep.type !== "init" && currentStep.type !== "complete" && currentStep.type !== "backtrack" && (
                  <>
                    <span className={`text-4xl ${
                      currentStep.type === "match" ? "text-[var(--accent-green)]" :
                      currentStep.type === "insert" ? "text-[var(--accent-cyan)]" :
                      currentStep.type === "delete" ? "text-[var(--accent-red)]" :
                      "text-[var(--accent-yellow)]"
                    }`}>{getOperationIcon(currentStep.type)}</span>
                    <div>
                      <div className="text-lg font-bold capitalize">{currentStep.type}</div>
                      <div className="text-sm text-[var(--text-muted)]">
                        {currentStep.type === "match" && "Characters match, no cost"}
                        {currentStep.type === "insert" && "Insert character from s2"}
                        {currentStep.type === "delete" && "Delete character from s1"}
                        {currentStep.type === "replace" && "Replace character"}
                      </div>
                    </div>
                  </>
                )}
                {(!currentStep || currentStep.type === "init") && (
                  <span className="text-[var(--text-muted)]">Initializing...</span>
                )}
                {currentStep?.type === "complete" && (
                  <div className="text-center w-full">
                    <div className="text-3xl font-bold text-[var(--accent-green)]">{currentStep.dp[s1.length][s2.length]}</div>
                    <div className="text-sm text-[var(--text-muted)]">operations needed</div>
                  </div>
                )}
              </div>
            </Section>

            <Section title="legend">
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="flex items-center gap-2"><span className="w-4 h-4 bg-[var(--accent-green)]/40 border border-[var(--accent-green)]"></span> Match (free)</div>
                <div className="flex items-center gap-2"><span className="w-4 h-4 bg-[var(--accent-cyan)]/40 border border-[var(--accent-cyan)]"></span> Insert (+1)</div>
                <div className="flex items-center gap-2"><span className="w-4 h-4 bg-[var(--accent-red)]/40 border border-[var(--accent-red)]"></span> Delete (+1)</div>
                <div className="flex items-center gap-2"><span className="w-4 h-4 bg-[var(--accent-yellow)]/40 border border-[var(--accent-yellow)]"></span> Replace (+1)</div>
                <div className="flex items-center gap-2 col-span-2"><span className="w-4 h-4 bg-[var(--accent-magenta)]/30 border border-[var(--accent-magenta)]"></span> Optimal path</div>
              </div>
            </Section>
          </div>

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

