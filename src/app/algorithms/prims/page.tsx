"use client";

/*
  🌳 PRIM'S ALGORITHM VISUALIZER
  Minimum Spanning Tree construction.
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

interface MSTEdge {
  from: string;
  to: string;
  weight: number;
}

interface Step {
  line: number;
  action: string;
  type: "init" | "select" | "check-edge" | "add-edge" | "skip-edge" | "complete";
  currentNode: string | null;
  inMST: Set<string>;
  mstEdges: MSTEdge[];
  exploring: string | null;
  exploringEdge: [string, string] | null;
  totalWeight: number;
  candidateEdges: { from: string; to: string; weight: number }[];
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
  sparse: {
    nodes: [
      { id: "A", x: 100, y: 100, label: "A" },
      { id: "B", x: 300, y: 100, label: "B" },
      { id: "C", x: 500, y: 100, label: "C" },
      { id: "D", x: 100, y: 300, label: "D" },
      { id: "E", x: 300, y: 300, label: "E" },
      { id: "F", x: 500, y: 300, label: "F" },
    ],
    edges: [
      { from: "A", to: "B", weight: 5 },
      { from: "B", to: "C", weight: 3 },
      { from: "A", to: "D", weight: 2 },
      { from: "B", to: "E", weight: 4 },
      { from: "C", to: "F", weight: 6 },
      { from: "D", to: "E", weight: 1 },
      { from: "E", to: "F", weight: 2 },
    ],
  },
};

// ============================================
// ALGORITHM LOGIC
// ============================================

function getAdjacencyList(graph: Graph): Map<string, { node: string; weight: number }[]> {
  const adj = new Map<string, { node: string; weight: number }[]>();
  for (const node of graph.nodes) adj.set(node.id, []);
  for (const edge of graph.edges) {
    adj.get(edge.from)?.push({ node: edge.to, weight: edge.weight });
    adj.get(edge.to)?.push({ node: edge.from, weight: edge.weight });
  }
  return adj;
}

function computeAllSteps(graph: Graph, startNode: string): Step[] {
  const adj = getAdjacencyList(graph);
  const allSteps: Step[] = [];
  
  const inMST = new Set<string>();
  const mstEdges: MSTEdge[] = [];
  let totalWeight = 0;
  
  // Priority queue simulation: edges sorted by weight
  const candidateEdges: { from: string; to: string; weight: number }[] = [];
  
  // Initial step
  allSteps.push({
    line: 1,
    action: `Initialize Prim's algorithm from node '${startNode}'`,
    type: "init",
    currentNode: null,
    inMST: new Set(inMST),
    mstEdges: [...mstEdges],
    exploring: null,
    exploringEdge: null,
    totalWeight,
    candidateEdges: [...candidateEdges],
  });
  
  // Add start node to MST
  inMST.add(startNode);
  
  // Add all edges from start node to candidates
  const startNeighbors = adj.get(startNode) || [];
  for (const { node, weight } of startNeighbors) {
    candidateEdges.push({ from: startNode, to: node, weight });
  }
  candidateEdges.sort((a, b) => a.weight - b.weight);
  
  allSteps.push({
    line: 2,
    action: `Add '${startNode}' to MST, add its edges to candidate list`,
    type: "select",
    currentNode: startNode,
    inMST: new Set(inMST),
    mstEdges: [...mstEdges],
    exploring: null,
    exploringEdge: null,
    totalWeight,
    candidateEdges: [...candidateEdges],
  });
  
  while (candidateEdges.length > 0 && inMST.size < graph.nodes.length) {
    // Find minimum weight edge connecting MST to non-MST node
    let minEdge: { from: string; to: string; weight: number } | null = null;
    let minIdx = -1;
    
    for (let i = 0; i < candidateEdges.length; i++) {
      const edge = candidateEdges[i];
      if (!inMST.has(edge.to)) {
        minEdge = edge;
        minIdx = i;
        break;
      }
    }
    
    if (minEdge === null) break;
    
    // Remove selected edge from candidates
    candidateEdges.splice(minIdx, 1);
    
    // Check if the destination is already in MST
    allSteps.push({
      line: 4,
      action: `Check min edge: (${minEdge.from}, ${minEdge.to}) weight=${minEdge.weight}`,
      type: "check-edge",
      currentNode: minEdge.from,
      inMST: new Set(inMST),
      mstEdges: [...mstEdges],
      exploring: minEdge.to,
      exploringEdge: [minEdge.from, minEdge.to],
      totalWeight,
      candidateEdges: [...candidateEdges],
    });
    
    if (inMST.has(minEdge.to)) {
      allSteps.push({
        line: 5,
        action: `Skip: '${minEdge.to}' already in MST`,
        type: "skip-edge",
        currentNode: minEdge.from,
        inMST: new Set(inMST),
        mstEdges: [...mstEdges],
        exploring: minEdge.to,
        exploringEdge: [minEdge.from, minEdge.to],
        totalWeight,
        candidateEdges: [...candidateEdges],
      });
      continue;
    }
    
    // Add edge to MST
    inMST.add(minEdge.to);
    mstEdges.push({ from: minEdge.from, to: minEdge.to, weight: minEdge.weight });
    totalWeight += minEdge.weight;
    
    allSteps.push({
      line: 6,
      action: `Add edge (${minEdge.from}, ${minEdge.to}) to MST, weight=${minEdge.weight}, total=${totalWeight}`,
      type: "add-edge",
      currentNode: minEdge.to,
      inMST: new Set(inMST),
      mstEdges: [...mstEdges],
      exploring: minEdge.to,
      exploringEdge: [minEdge.from, minEdge.to],
      totalWeight,
      candidateEdges: [...candidateEdges],
    });
    
    // Add new edges from the newly added node
    const newNeighbors = adj.get(minEdge.to) || [];
    for (const { node, weight } of newNeighbors) {
      if (!inMST.has(node)) {
        candidateEdges.push({ from: minEdge.to, to: node, weight });
      }
    }
    candidateEdges.sort((a, b) => a.weight - b.weight);
    
    // Remove edges that now connect two MST nodes
    const validCandidates = candidateEdges.filter(e => !inMST.has(e.to));
    candidateEdges.length = 0;
    candidateEdges.push(...validCandidates);
    
    allSteps.push({
      line: 7,
      action: `Update candidates: add edges from '${minEdge.to}', remove invalid edges`,
      type: "select",
      currentNode: minEdge.to,
      inMST: new Set(inMST),
      mstEdges: [...mstEdges],
      exploring: null,
      exploringEdge: null,
      totalWeight,
      candidateEdges: [...candidateEdges],
    });
  }
  
  allSteps.push({
    line: 8,
    action: `Prim's complete! MST has ${mstEdges.length} edges, total weight = ${totalWeight}`,
    type: "complete",
    currentNode: null,
    inMST: new Set(inMST),
    mstEdges: [...mstEdges],
    exploring: null,
    exploringEdge: null,
    totalWeight,
    candidateEdges: [],
  });
  
  return allSteps;
}

// ============================================
// ALGORITHM CODE
// ============================================

const algorithmCode = [
  { line: 1, content: "Prim(G, s)", tokens: [
    { type: "function", text: "Prim" },
    { type: "bracket", text: "(" },
    { type: "variable", text: "G" },
    { type: "plain", text: ", " },
    { type: "variable", text: "s" },
    { type: "bracket", text: ")" },
  ]},
  { line: 2, content: "begin", tokens: [{ type: "keyword", text: "begin" }]},
  { line: 3, content: "   MST ← {s}; Q ← edges(s)", tokens: [
    { type: "plain", text: "   " },
    { type: "variable", text: "MST" },
    { type: "operator", text: " ← " },
    { type: "bracket", text: "{" },
    { type: "variable", text: "s" },
    { type: "bracket", text: "}" },
    { type: "plain", text: "; " },
    { type: "variable", text: "Q" },
    { type: "operator", text: " ← " },
    { type: "function", text: "edges" },
    { type: "bracket", text: "(" },
    { type: "variable", text: "s" },
    { type: "bracket", text: ")" },
  ]},
  { line: 4, content: "   while |MST| < |V| do", tokens: [
    { type: "plain", text: "   " },
    { type: "keyword", text: "while" },
    { type: "plain", text: " |" },
    { type: "variable", text: "MST" },
    { type: "plain", text: "| < |" },
    { type: "variable", text: "V" },
    { type: "plain", text: "| " },
    { type: "keyword", text: "do" },
  ]},
  { line: 5, content: "      (u,v) ← extractMin(Q)", tokens: [
    { type: "plain", text: "      " },
    { type: "bracket", text: "(" },
    { type: "variable", text: "u" },
    { type: "plain", text: "," },
    { type: "variable", text: "v" },
    { type: "bracket", text: ")" },
    { type: "operator", text: " ← " },
    { type: "function", text: "extractMin" },
    { type: "bracket", text: "(" },
    { type: "variable", text: "Q" },
    { type: "bracket", text: ")" },
  ]},
  { line: 6, content: "      if v ∉ MST then", tokens: [
    { type: "plain", text: "      " },
    { type: "keyword", text: "if" },
    { type: "plain", text: " " },
    { type: "variable", text: "v" },
    { type: "operator", text: " ∉ " },
    { type: "variable", text: "MST" },
    { type: "plain", text: " " },
    { type: "keyword", text: "then" },
  ]},
  { line: 7, content: "         MST ← MST ∪ {v, (u,v)}", tokens: [
    { type: "plain", text: "         " },
    { type: "variable", text: "MST" },
    { type: "operator", text: " ← " },
    { type: "variable", text: "MST" },
    { type: "operator", text: " ∪ " },
    { type: "bracket", text: "{" },
    { type: "variable", text: "v" },
    { type: "plain", text: ", " },
    { type: "bracket", text: "(" },
    { type: "variable", text: "u" },
    { type: "plain", text: "," },
    { type: "variable", text: "v" },
    { type: "bracket", text: ")" },
    { type: "bracket", text: "}" },
  ]},
  { line: 8, content: "         Q ← Q ∪ edges(v)", tokens: [
    { type: "plain", text: "         " },
    { type: "variable", text: "Q" },
    { type: "operator", text: " ← " },
    { type: "variable", text: "Q" },
    { type: "operator", text: " ∪ " },
    { type: "function", text: "edges" },
    { type: "bracket", text: "(" },
    { type: "variable", text: "v" },
    { type: "bracket", text: ")" },
  ]},
  { line: 9, content: "end", tokens: [{ type: "keyword", text: "end" }]},
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

export default function PrimsPage() {
  const [selectedGraph, setSelectedGraph] = useState<string>("simple");
  const [graph, setGraph] = useState<Graph>(presetGraphs.simple);
  const [startNode, setStartNode] = useState<string>("A");
  const [steps, setSteps] = useState<Step[]>([]);
  const [currentStepIndex, setCurrentStepIndex] = useState(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1.5);
  const [codeWidth, setCodeWidth] = useState(380);
  const [isResizing, setIsResizing] = useState(false);
  
  const playIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const codeContainerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);

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
    if (!graph.nodes.find(n => n.id === startNode)) { alert("Please select a valid start node."); return; }
    stopPlaying();
    setSteps(computeAllSteps(graph, startNode));
    setCurrentStepIndex(0);
  }, [graph, startNode, stopPlaying]);

  const resetVisualization = useCallback(() => { stopPlaying(); setSteps([]); setCurrentStepIndex(-1); }, [stopPlaying]);

  const playPause = useCallback(() => {
    if (isPlaying) stopPlaying();
    else { if (steps.length === 0) { startVisualization(); return; } setIsPlaying(true); }
  }, [isPlaying, steps.length, stopPlaying, startVisualization]);

  const handleGraphChange = useCallback((graphKey: string) => {
    setSelectedGraph(graphKey);
    setGraph(presetGraphs[graphKey]);
    setStartNode(presetGraphs[graphKey].nodes[0].id);
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
      if (e.key === "Home") goToStart();
      if (e.key === "End") goToEnd();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [nextStep, prevStep, playPause, goToStart, goToEnd]);

  const getNodeColor = (nodeId: string) => {
    if (!currentStep) return nodeId === startNode ? "var(--accent-cyan)" : "var(--bg-tertiary)";
    if (currentStep.currentNode === nodeId) return "var(--accent-green)";
    if (currentStep.exploring === nodeId) return "var(--accent-yellow)";
    if (currentStep.inMST.has(nodeId)) return "var(--accent-cyan)";
    return "var(--bg-tertiary)";
  };

  const getEdgeStyle = (from: string, to: string) => {
    if (currentStep?.exploringEdge) {
      const [ef, et] = currentStep.exploringEdge;
      if ((ef === from && et === to) || (ef === to && et === from)) {
        return { stroke: "var(--accent-yellow)", strokeWidth: 4, opacity: 1 };
      }
    }
    const key1 = `${from}-${to}`, key2 = `${to}-${from}`;
    if (mstEdgeSet.has(key1) || mstEdgeSet.has(key2)) {
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
          <span className="text-[var(--text-primary)]">prims</span>
        </Link>
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="text-[var(--text-muted)] text-sm">graph:</span>
            <select value={selectedGraph} onChange={(e) => handleGraphChange(e.target.value)} className="px-3 py-1.5 text-sm bg-[var(--bg-primary)] border border-[var(--border-color)] text-[var(--text-primary)] cursor-pointer">
              <option value="simple">simple (6 nodes)</option>
              <option value="complete">complete (5)</option>
              <option value="sparse">sparse (6)</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[var(--text-muted)] text-sm">start:</span>
            <select value={startNode} onChange={(e) => setStartNode(e.target.value)} disabled={steps.length > 0} className="px-3 py-1.5 text-sm bg-[var(--bg-primary)] border border-[var(--border-color)] text-[var(--text-primary)] cursor-pointer disabled:opacity-50">
              {graph.nodes.map(node => (<option key={node.id} value={node.id}>{node.label}</option>))}
            </select>
          </div>
          <button onClick={startVisualization} className="px-4 py-1.5 border border-[var(--accent-green)] text-[var(--accent-green)] hover:bg-[var(--accent-green)] hover:text-[var(--bg-primary)] text-sm">run</button>
          <button onClick={resetVisualization} className="px-4 py-1.5 border border-[var(--border-color)] text-[var(--text-secondary)] text-sm">reset</button>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={goToStart} className="w-8 h-8 flex items-center justify-center border border-[var(--border-color)] hover:border-[var(--accent-green)] text-xs">|◁</button>
          <button onClick={prevStep} className="w-8 h-8 flex items-center justify-center border border-[var(--border-color)] hover:border-[var(--accent-green)] text-xs">◁</button>
          <button onClick={playPause} className="w-8 h-8 flex items-center justify-center border border-[var(--accent-green)] text-[var(--accent-green)] text-xs">{isPlaying ? "||" : "▷"}</button>
          <button onClick={nextStep} className="w-8 h-8 flex items-center justify-center border border-[var(--border-color)] hover:border-[var(--accent-green)] text-xs">▷</button>
          <button onClick={goToEnd} className="w-8 h-8 flex items-center justify-center border border-[var(--border-color)] hover:border-[var(--accent-green)] text-xs">▷|</button>
          <div className="flex items-center gap-2 ml-3">
            <input type="range" min="0.5" max="5" step="0.5" value={speed} onChange={(e) => setSpeed(parseFloat(e.target.value))} className="w-20 h-1 accent-[var(--accent-green)]" />
            <span className="text-xs text-[var(--text-muted)] w-16">{speed} step/s</span>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <div style={{ width: codeWidth }} className="bg-[var(--bg-code)] border-r border-[var(--border-color)] flex flex-col shrink-0 relative">
          <div className="px-4 py-2 bg-[var(--bg-secondary)] border-b border-[var(--border-color)] text-xs text-[var(--text-muted)] uppercase"># algorithm</div>
          <div ref={codeContainerRef} className="flex-1 overflow-auto">
            {algorithmCode.map((line) => (
              <div key={line.line} data-line={line.line} className={`flex text-sm leading-7 ${currentStep?.line === line.line ? "bg-[var(--line-highlight)] border-l-2 border-[var(--accent-green)]" : "border-l-2 border-transparent"}`}>
                <span className={`w-8 px-2 text-right shrink-0 ${currentStep?.line === line.line ? "text-[var(--accent-green)]" : "text-[var(--text-muted)]"}`}>{line.line}</span>
                <code className="px-3 py-0.5 whitespace-nowrap">{line.tokens.map((token, i) => (<span key={i} className={tokenColors[token.type]}>{token.text}</span>))}</code>
              </div>
            ))}
          </div>
          <div onMouseDown={() => setIsResizing(true)} className="absolute top-0 right-0 w-1 h-full cursor-col-resize hover:bg-[var(--accent-green)]/30" />
        </div>

        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 min-w-[400px]">
          <Section title="minimum spanning tree" className="flex-1">
            <div className="relative bg-[var(--bg-primary)] border border-[var(--border-color)] rounded overflow-hidden" style={{ minHeight: 400 }}>
              <svg ref={svgRef} width="100%" height="400" viewBox="0 0 600 400" className="block">
                {graph.edges.map((edge, idx) => {
                  const fromNode = graph.nodes.find(n => n.id === edge.from);
                  const toNode = graph.nodes.find(n => n.id === edge.to);
                  if (!fromNode || !toNode) return null;
                  const style = getEdgeStyle(edge.from, edge.to);
                  const midX = (fromNode.x + toNode.x) / 2, midY = (fromNode.y + toNode.y) / 2;
                  return (
                    <g key={idx}>
                      <line x1={fromNode.x} y1={fromNode.y} x2={toNode.x} y2={toNode.y} stroke={style.stroke} strokeWidth={style.strokeWidth} opacity={style.opacity} />
                      <rect x={midX - 12} y={midY - 10} width={24} height={20} fill="var(--bg-primary)" rx={4} />
                      <text x={midX} y={midY} textAnchor="middle" dominantBaseline="central" fill="var(--accent-purple)" fontSize="12" fontWeight="bold" fontFamily="monospace">{edge.weight}</text>
                    </g>
                  );
                })}
                {graph.nodes.map((node) => (
                  <g key={node.id}>
                    <circle cx={node.x} cy={node.y} r={24} fill={getNodeColor(node.id)} stroke={getNodeColor(node.id)} strokeWidth={2} />
                    <text x={node.x} y={node.y} textAnchor="middle" dominantBaseline="central" fill="var(--text-primary)" fontSize="14" fontWeight="bold" fontFamily="monospace">{node.label}</text>
                  </g>
                ))}
              </svg>
              <div className="absolute bottom-3 left-3 flex flex-wrap gap-3 text-xs text-[var(--text-muted)] bg-[var(--bg-secondary)]/90 px-3 py-2 rounded">
                <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-[var(--accent-green)]"></span> current</span>
                <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-[var(--accent-yellow)]"></span> checking</span>
                <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-[var(--accent-cyan)]"></span> in MST</span>
                <span className="flex items-center gap-1"><span className="w-4 h-1 bg-[var(--accent-green)]"></span> MST edge</span>
              </div>
              <div className="absolute top-3 right-3 bg-[var(--bg-secondary)]/90 px-4 py-2 rounded border border-[var(--accent-green)]">
                <div className="text-xs text-[var(--text-muted)]">MST Weight</div>
                <div className="text-2xl font-bold text-[var(--accent-green)]">{currentStep?.totalWeight ?? 0}</div>
              </div>
            </div>
          </Section>

          <div className="grid grid-cols-2 gap-4">
            <Section title="mst edges">
              <div className="space-y-1 max-h-32 overflow-auto">
                {currentStep?.mstEdges.length ? currentStep.mstEdges.map((e, i) => (
                  <div key={i} className="flex items-center justify-between text-sm px-2 py-1 bg-[var(--bg-primary)] border border-[var(--accent-green)]/30">
                    <span className="text-[var(--text-primary)]">({e.from}, {e.to})</span>
                    <span className="text-[var(--accent-purple)] font-bold">{e.weight}</span>
                  </div>
                )) : <span className="text-[var(--text-muted)] text-sm">no edges yet</span>}
              </div>
            </Section>
            
            <Section title="candidate edges">
              <div className="space-y-1 max-h-32 overflow-auto">
                {currentStep?.candidateEdges.length ? currentStep.candidateEdges.slice(0, 5).map((e, i) => (
                  <div key={i} className={`flex items-center justify-between text-sm px-2 py-1 bg-[var(--bg-primary)] ${i === 0 ? "border border-[var(--accent-yellow)]" : "border border-[var(--border-color)]"}`}>
                    <span className="text-[var(--text-secondary)]">({e.from}, {e.to})</span>
                    <span className="text-[var(--accent-purple)]">{e.weight}</span>
                  </div>
                )) : <span className="text-[var(--text-muted)] text-sm">no candidates</span>}
                {(currentStep?.candidateEdges.length ?? 0) > 5 && <div className="text-xs text-[var(--text-muted)]">+{(currentStep?.candidateEdges.length ?? 0) - 5} more</div>}
              </div>
            </Section>
          </div>

          <Section title="current action">
            <div className="text-sm bg-[var(--bg-primary)] border border-[var(--border-color)] p-3 min-h-[50px]">
              {currentStep ? (
                <><span className="text-[var(--accent-green)]">[{currentStepIndex + 1}/{steps.length}]</span> <span className="text-[var(--text-primary)]">{currentStep.action}</span></>
              ) : (
                <span className="text-[var(--text-muted)]">select a start node and click &quot;run&quot; to begin...</span>
              )}
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

