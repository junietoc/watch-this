"use client";

/*
  🌲 KRUSKAL'S ALGORITHM VISUALIZER
  Minimum Spanning Tree using Union-Find.
  Terminal-inspired clean design.
*/

import Link from "next/link";
import { useState, useEffect, useRef, useCallback, useMemo } from "react";

// ============================================
// TYPES
// ============================================

interface Node {
  id: string;
  x: number;
  y: number;
  label: string;
}

interface Edge {
  from: string;
  to: string;
  weight: number;
}

interface Graph {
  nodes: Node[];
  edges: Edge[];
}

interface Step {
  line: number;
  action: string;
  type: "init" | "sort" | "check" | "add" | "skip" | "complete";
  currentEdgeIdx: number;
  mstEdges: Edge[];
  parent: Map<string, string>;
  rank: Map<string, number>;
  exploring: Edge | null;
  totalWeight: number;
  sortedEdges: Edge[];
}

// ============================================
// PRESET GRAPHS
// ============================================

const presetGraphs: Record<string, Graph> = {
  simple: {
    nodes: [
      { id: "A", x: 100, y: 200, label: "A" },
      { id: "B", x: 250, y: 80, label: "B" },
      { id: "C", x: 250, y: 320, label: "C" },
      { id: "D", x: 400, y: 80, label: "D" },
      { id: "E", x: 400, y: 320, label: "E" },
      { id: "F", x: 520, y: 200, label: "F" },
    ],
    edges: [
      { from: "A", to: "B", weight: 4 },
      { from: "A", to: "C", weight: 3 },
      { from: "B", to: "C", weight: 1 },
      { from: "B", to: "D", weight: 2 },
      { from: "C", to: "E", weight: 4 },
      { from: "D", to: "E", weight: 3 },
      { from: "D", to: "F", weight: 2 },
      { from: "E", to: "F", weight: 1 },
    ],
  },
  complete: {
    nodes: [
      { id: "1", x: 300, y: 80, label: "1" },
      { id: "2", x: 150, y: 200, label: "2" },
      { id: "3", x: 450, y: 200, label: "3" },
      { id: "4", x: 200, y: 350, label: "4" },
      { id: "5", x: 400, y: 350, label: "5" },
    ],
    edges: [
      { from: "1", to: "2", weight: 2 },
      { from: "1", to: "3", weight: 3 },
      { from: "1", to: "4", weight: 7 },
      { from: "1", to: "5", weight: 5 },
      { from: "2", to: "3", weight: 4 },
      { from: "2", to: "4", weight: 1 },
      { from: "2", to: "5", weight: 6 },
      { from: "3", to: "4", weight: 5 },
      { from: "3", to: "5", weight: 2 },
      { from: "4", to: "5", weight: 3 },
    ],
  },
  hexagon: {
    nodes: [
      { id: "A", x: 300, y: 60, label: "A" },
      { id: "B", x: 450, y: 140, label: "B" },
      { id: "C", x: 450, y: 280, label: "C" },
      { id: "D", x: 300, y: 360, label: "D" },
      { id: "E", x: 150, y: 280, label: "E" },
      { id: "F", x: 150, y: 140, label: "F" },
    ],
    edges: [
      { from: "A", to: "B", weight: 5 },
      { from: "B", to: "C", weight: 3 },
      { from: "C", to: "D", weight: 4 },
      { from: "D", to: "E", weight: 2 },
      { from: "E", to: "F", weight: 6 },
      { from: "F", to: "A", weight: 1 },
      { from: "A", to: "D", weight: 7 },
      { from: "B", to: "E", weight: 4 },
      { from: "C", to: "F", weight: 5 },
    ],
  },
};

// ============================================
// UNION-FIND HELPERS
// ============================================

function find(parent: Map<string, string>, x: string): string {
  if (parent.get(x) !== x) {
    parent.set(x, find(parent, parent.get(x)!));
  }
  return parent.get(x)!;
}

function union(parent: Map<string, string>, rank: Map<string, number>, x: string, y: string): boolean {
  const rootX = find(parent, x);
  const rootY = find(parent, y);
  
  if (rootX === rootY) return false;
  
  const rankX = rank.get(rootX) ?? 0;
  const rankY = rank.get(rootY) ?? 0;
  
  if (rankX < rankY) {
    parent.set(rootX, rootY);
  } else if (rankX > rankY) {
    parent.set(rootY, rootX);
  } else {
    parent.set(rootY, rootX);
    rank.set(rootX, rankX + 1);
  }
  
  return true;
}

// ============================================
// ALGORITHM LOGIC
// ============================================

function computeAllSteps(graph: Graph): Step[] {
  const allSteps: Step[] = [];
  
  const parent = new Map<string, string>();
  const rank = new Map<string, number>();
  const mstEdges: Edge[] = [];
  let totalWeight = 0;
  
  // Initialize Union-Find
  for (const node of graph.nodes) {
    parent.set(node.id, node.id);
    rank.set(node.id, 0);
  }
  
  allSteps.push({
    line: 1,
    action: `Initialize Kruskal's: create ${graph.nodes.length} singleton sets`,
    type: "init",
    currentEdgeIdx: -1,
    mstEdges: [],
    parent: new Map(parent),
    rank: new Map(rank),
    exploring: null,
    totalWeight: 0,
    sortedEdges: [],
  });
  
  // Sort edges by weight
  const sortedEdges = [...graph.edges].sort((a, b) => a.weight - b.weight);
  
  allSteps.push({
    line: 2,
    action: `Sort ${sortedEdges.length} edges by weight: [${sortedEdges.map(e => e.weight).join(", ")}]`,
    type: "sort",
    currentEdgeIdx: -1,
    mstEdges: [],
    parent: new Map(parent),
    rank: new Map(rank),
    exploring: null,
    totalWeight: 0,
    sortedEdges: [...sortedEdges],
  });
  
  // Process edges
  for (let i = 0; i < sortedEdges.length && mstEdges.length < graph.nodes.length - 1; i++) {
    const edge = sortedEdges[i];
    
    allSteps.push({
      line: 4,
      action: `Check edge (${edge.from}, ${edge.to}) weight=${edge.weight}`,
      type: "check",
      currentEdgeIdx: i,
      mstEdges: [...mstEdges],
      parent: new Map(parent),
      rank: new Map(rank),
      exploring: edge,
      totalWeight,
      sortedEdges: [...sortedEdges],
    });
    
    const rootFrom = find(parent, edge.from);
    const rootTo = find(parent, edge.to);
    
    if (rootFrom !== rootTo) {
      // Add edge to MST
      union(parent, rank, edge.from, edge.to);
      mstEdges.push(edge);
      totalWeight += edge.weight;
      
      allSteps.push({
        line: 5,
        action: `Add edge (${edge.from}, ${edge.to}): different components (${rootFrom} ≠ ${rootTo}), total=${totalWeight}`,
        type: "add",
        currentEdgeIdx: i,
        mstEdges: [...mstEdges],
        parent: new Map(parent),
        rank: new Map(rank),
        exploring: edge,
        totalWeight,
        sortedEdges: [...sortedEdges],
      });
    } else {
      allSteps.push({
        line: 6,
        action: `Skip edge (${edge.from}, ${edge.to}): same component (root=${rootFrom}), would create cycle`,
        type: "skip",
        currentEdgeIdx: i,
        mstEdges: [...mstEdges],
        parent: new Map(parent),
        rank: new Map(rank),
        exploring: edge,
        totalWeight,
        sortedEdges: [...sortedEdges],
      });
    }
  }
  
  allSteps.push({
    line: 7,
    action: `Kruskal's complete! MST has ${mstEdges.length} edges, total weight = ${totalWeight}`,
    type: "complete",
    currentEdgeIdx: sortedEdges.length,
    mstEdges: [...mstEdges],
    parent: new Map(parent),
    rank: new Map(rank),
    exploring: null,
    totalWeight,
    sortedEdges: [...sortedEdges],
  });
  
  return allSteps;
}

// ============================================
// ALGORITHM CODE
// ============================================

const algorithmCode = [
  { line: 1, content: "Kruskal(G)", tokens: [
    { type: "function", text: "Kruskal" },
    { type: "bracket", text: "(" },
    { type: "variable", text: "G" },
    { type: "bracket", text: ")" },
  ]},
  { line: 2, content: "begin", tokens: [{ type: "keyword", text: "begin" }]},
  { line: 3, content: "   MST ← ∅; makeSet(v) ∀v∈V", tokens: [
    { type: "plain", text: "   " },
    { type: "variable", text: "MST" },
    { type: "operator", text: " ← " },
    { type: "plain", text: "∅; " },
    { type: "function", text: "makeSet" },
    { type: "bracket", text: "(" },
    { type: "variable", text: "v" },
    { type: "bracket", text: ")" },
    { type: "plain", text: " ∀" },
    { type: "variable", text: "v" },
    { type: "plain", text: "∈" },
    { type: "variable", text: "V" },
  ]},
  { line: 4, content: "   sort E by weight", tokens: [
    { type: "plain", text: "   " },
    { type: "keyword", text: "sort" },
    { type: "plain", text: " " },
    { type: "variable", text: "E" },
    { type: "plain", text: " by weight" },
  ]},
  { line: 5, content: "   for each (u,v) ∈ E do", tokens: [
    { type: "plain", text: "   " },
    { type: "keyword", text: "for each" },
    { type: "plain", text: " " },
    { type: "bracket", text: "(" },
    { type: "variable", text: "u" },
    { type: "plain", text: "," },
    { type: "variable", text: "v" },
    { type: "bracket", text: ")" },
    { type: "operator", text: " ∈ " },
    { type: "variable", text: "E" },
    { type: "plain", text: " " },
    { type: "keyword", text: "do" },
  ]},
  { line: 6, content: "      if find(u) ≠ find(v) then", tokens: [
    { type: "plain", text: "      " },
    { type: "keyword", text: "if" },
    { type: "plain", text: " " },
    { type: "function", text: "find" },
    { type: "bracket", text: "(" },
    { type: "variable", text: "u" },
    { type: "bracket", text: ")" },
    { type: "operator", text: " ≠ " },
    { type: "function", text: "find" },
    { type: "bracket", text: "(" },
    { type: "variable", text: "v" },
    { type: "bracket", text: ")" },
    { type: "plain", text: " " },
    { type: "keyword", text: "then" },
  ]},
  { line: 7, content: "         MST ← MST ∪ {(u,v)}", tokens: [
    { type: "plain", text: "         " },
    { type: "variable", text: "MST" },
    { type: "operator", text: " ← " },
    { type: "variable", text: "MST" },
    { type: "operator", text: " ∪ " },
    { type: "bracket", text: "{" },
    { type: "bracket", text: "(" },
    { type: "variable", text: "u" },
    { type: "plain", text: "," },
    { type: "variable", text: "v" },
    { type: "bracket", text: ")" },
    { type: "bracket", text: "}" },
  ]},
  { line: 8, content: "         union(u, v)", tokens: [
    { type: "plain", text: "         " },
    { type: "function", text: "union" },
    { type: "bracket", text: "(" },
    { type: "variable", text: "u" },
    { type: "plain", text: ", " },
    { type: "variable", text: "v" },
    { type: "bracket", text: ")" },
  ]},
  { line: 9, content: "   return MST", tokens: [
    { type: "plain", text: "   " },
    { type: "keyword", text: "return" },
    { type: "plain", text: " " },
    { type: "variable", text: "MST" },
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

export default function KruskalsPage() {
  const [selectedGraph, setSelectedGraph] = useState<string>("simple");
  const [graph, setGraph] = useState<Graph>(presetGraphs.simple);
  const [steps, setSteps] = useState<Step[]>([]);
  const [currentStepIndex, setCurrentStepIndex] = useState(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1.5);
  const [codeWidth, setCodeWidth] = useState(380);
  const [isResizing, setIsResizing] = useState(false);
  
  const playIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const codeContainerRef = useRef<HTMLDivElement>(null);

  const currentStep = currentStepIndex >= 0 ? steps[currentStepIndex] : null;

  const mstEdgeSet = useMemo(() => {
    if (!currentStep) return new Set<string>();
    const edges = new Set<string>();
    for (const edge of currentStep.mstEdges) {
      edges.add(`${edge.from}-${edge.to}`);
      edges.add(`${edge.to}-${edge.from}`);
    }
    return edges;
  }, [currentStep]);

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
    setSteps(computeAllSteps(graph));
    setCurrentStepIndex(0);
  }, [graph, stopPlaying]);

  const resetVisualization = useCallback(() => { stopPlaying(); setSteps([]); setCurrentStepIndex(-1); }, [stopPlaying]);

  const playPause = useCallback(() => {
    if (isPlaying) stopPlaying();
    else { if (steps.length === 0) { startVisualization(); return; } setIsPlaying(true); }
  }, [isPlaying, steps.length, stopPlaying, startVisualization]);

  const handleGraphChange = useCallback((graphKey: string) => {
    setSelectedGraph(graphKey);
    setGraph(presetGraphs[graphKey]);
    resetVisualization();
  }, [resetVisualization]);

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

  const getNodeColor = (nodeId: string) => {
    if (!currentStep) return "var(--bg-tertiary)";
    if (currentStep.exploring?.from === nodeId || currentStep.exploring?.to === nodeId) return "var(--accent-yellow)";
    const hasEdge = currentStep.mstEdges.some(e => e.from === nodeId || e.to === nodeId);
    if (hasEdge) return "var(--accent-cyan)";
    return "var(--bg-tertiary)";
  };

  const getEdgeStyle = (from: string, to: string) => {
    if (currentStep?.exploring && ((currentStep.exploring.from === from && currentStep.exploring.to === to) || (currentStep.exploring.from === to && currentStep.exploring.to === from))) {
      return { stroke: currentStep.type === "skip" ? "var(--accent-red)" : "var(--accent-yellow)", strokeWidth: 4, opacity: 1 };
    }
    if (mstEdgeSet.has(`${from}-${to}`) || mstEdgeSet.has(`${to}-${from}`)) {
      return { stroke: "var(--accent-green)", strokeWidth: 3, opacity: 1 };
    }
    return { stroke: "var(--border-color)", strokeWidth: 1.5, opacity: 0.4 };
  };

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] flex flex-col font-mono">
      <header className="bg-[var(--bg-secondary)] border-b border-[var(--border-color)] px-4 py-3 flex items-center justify-between flex-wrap gap-4">
        <Link href="/algorithms" className="flex items-center gap-2">
          <span className="text-[var(--accent-green)]">$</span>
          <span className="text-[var(--text-secondary)]">./</span>
          <span className="text-[var(--text-primary)]">kruskals</span>
        </Link>
        <div className="flex items-center gap-3 flex-wrap">
          <select value={selectedGraph} onChange={(e) => handleGraphChange(e.target.value)} className="px-3 py-1.5 text-sm bg-[var(--bg-primary)] border border-[var(--border-color)] text-[var(--text-primary)] cursor-pointer">
            <option value="simple">simple (6 nodes)</option>
            <option value="complete">complete (5)</option>
            <option value="hexagon">hexagon (6)</option>
          </select>
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
          <Section title="graph & mst" className="flex-1">
            <div className="relative bg-[var(--bg-primary)] border border-[var(--border-color)] rounded overflow-hidden" style={{ minHeight: 380 }}>
              <svg width="100%" height="380" viewBox="0 0 600 380" className="block">
                {graph.edges.map((edge, idx) => {
                  const f = graph.nodes.find(n => n.id === edge.from), t = graph.nodes.find(n => n.id === edge.to);
                  if (!f || !t) return null;
                  const style = getEdgeStyle(edge.from, edge.to);
                  const mx = (f.x + t.x) / 2, my = (f.y + t.y) / 2;
                  return (
                    <g key={idx}>
                      <line x1={f.x} y1={f.y} x2={t.x} y2={t.y} stroke={style.stroke} strokeWidth={style.strokeWidth} opacity={style.opacity} />
                      <rect x={mx - 12} y={my - 10} width={24} height={20} fill="var(--bg-primary)" rx={4} />
                      <text x={mx} y={my} textAnchor="middle" dominantBaseline="central" fill="var(--accent-purple)" fontSize="12" fontWeight="bold">{edge.weight}</text>
                    </g>
                  );
                })}
                {graph.nodes.map((node) => (
                  <g key={node.id}>
                    <circle cx={node.x} cy={node.y} r={24} fill={getNodeColor(node.id)} stroke={getNodeColor(node.id)} strokeWidth={2} />
                    <text x={node.x} y={node.y} textAnchor="middle" dominantBaseline="central" fill="var(--text-primary)" fontSize="14" fontWeight="bold">{node.label}</text>
                  </g>
                ))}
              </svg>
              <div className="absolute bottom-3 left-3 flex gap-3 text-xs text-[var(--text-muted)] bg-[var(--bg-secondary)]/90 px-3 py-2 rounded">
                <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-[var(--accent-yellow)]"></span> checking</span>
                <span className="flex items-center gap-1"><span className="w-4 h-1 bg-[var(--accent-green)]"></span> MST edge</span>
                <span className="flex items-center gap-1"><span className="w-4 h-1 bg-[var(--accent-red)]"></span> skipped</span>
              </div>
              <div className="absolute top-3 right-3 bg-[var(--bg-secondary)]/90 px-4 py-2 rounded border border-[var(--accent-green)]">
                <div className="text-xs text-[var(--text-muted)]">MST Weight</div>
                <div className="text-2xl font-bold text-[var(--accent-green)]">{currentStep?.totalWeight ?? 0}</div>
              </div>
            </div>
          </Section>

          <div className="grid grid-cols-2 gap-4">
            <Section title="sorted edges">
              <div className="space-y-1 max-h-40 overflow-auto">
                {(currentStep?.sortedEdges ?? []).map((e, i) => {
                  const isCurrent = currentStep?.currentEdgeIdx === i;
                  const isInMST = currentStep?.mstEdges.some(m => m.from === e.from && m.to === e.to);
                  return (
                    <div key={i} className={`flex items-center justify-between text-sm px-2 py-1 ${isCurrent ? "bg-[var(--accent-yellow)]/20 border border-[var(--accent-yellow)]" : isInMST ? "bg-[var(--accent-green)]/20 border border-[var(--accent-green)]" : "bg-[var(--bg-primary)] border border-[var(--border-color)]"}`}>
                      <span>({e.from}, {e.to})</span>
                      <span className="text-[var(--accent-purple)] font-bold">{e.weight}</span>
                    </div>
                  );
                })}
              </div>
            </Section>

            <Section title="union-find sets">
              <div className="space-y-2">
                {currentStep && (() => {
                  const sets = new Map<string, string[]>();
                  for (const node of graph.nodes) {
                    const root = find(new Map(currentStep.parent), node.id);
                    if (!sets.has(root)) sets.set(root, []);
                    sets.get(root)!.push(node.id);
                  }
                  return Array.from(sets.entries()).map(([root, members], i) => (
                    <div key={i} className="text-sm px-2 py-1 bg-[var(--bg-primary)] border border-[var(--accent-cyan)]">
                      <span className="text-[var(--text-muted)]">root={root}: </span>
                      <span className="text-[var(--accent-cyan)]">{`{${members.join(", ")}}`}</span>
                    </div>
                  ));
                })()}
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

