"use client";

/*
  🛤️ DIJKSTRA'S ALGORITHM VISUALIZER
  Shortest path from source to all vertices.
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
  type: "init" | "extract" | "relax" | "update" | "skip" | "complete";
  currentNode: string | null;
  distances: Map<string, number>;
  previous: Map<string, string | null>;
  visited: Set<string>;
  unvisited: Set<string>;
  exploring: string | null;
  exploringEdge: [string, string] | null;
  relaxing: boolean;
}

// ============================================
// PRESET GRAPHS
// ============================================

const presetGraphs: Record<string, Graph> = {
  simple: {
    nodes: [
      { id: "A", x: 100, y: 200, label: "A" },
      { id: "B", x: 250, y: 100, label: "B" },
      { id: "C", x: 250, y: 300, label: "C" },
      { id: "D", x: 400, y: 100, label: "D" },
      { id: "E", x: 400, y: 300, label: "E" },
      { id: "F", x: 520, y: 200, label: "F" },
    ],
    edges: [
      { from: "A", to: "B", weight: 4 },
      { from: "A", to: "C", weight: 2 },
      { from: "B", to: "C", weight: 1 },
      { from: "B", to: "D", weight: 5 },
      { from: "C", to: "E", weight: 3 },
      { from: "D", to: "F", weight: 2 },
      { from: "E", to: "D", weight: 1 },
      { from: "E", to: "F", weight: 6 },
    ],
  },
  weighted: {
    nodes: [
      { id: "S", x: 100, y: 200, label: "S" },
      { id: "A", x: 220, y: 100, label: "A" },
      { id: "B", x: 220, y: 300, label: "B" },
      { id: "C", x: 380, y: 100, label: "C" },
      { id: "D", x: 380, y: 300, label: "D" },
      { id: "T", x: 500, y: 200, label: "T" },
    ],
    edges: [
      { from: "S", to: "A", weight: 10 },
      { from: "S", to: "B", weight: 5 },
      { from: "A", to: "C", weight: 1 },
      { from: "A", to: "B", weight: 2 },
      { from: "B", to: "A", weight: 3 },
      { from: "B", to: "C", weight: 9 },
      { from: "B", to: "D", weight: 2 },
      { from: "C", to: "T", weight: 4 },
      { from: "D", to: "C", weight: 6 },
      { from: "D", to: "T", weight: 7 },
    ],
  },
  pentagon: {
    nodes: [
      { id: "1", x: 300, y: 80, label: "1" },
      { id: "2", x: 480, y: 180, label: "2" },
      { id: "3", x: 420, y: 360, label: "3" },
      { id: "4", x: 180, y: 360, label: "4" },
      { id: "5", x: 120, y: 180, label: "5" },
    ],
    edges: [
      { from: "1", to: "2", weight: 3 },
      { from: "2", to: "3", weight: 4 },
      { from: "3", to: "4", weight: 2 },
      { from: "4", to: "5", weight: 5 },
      { from: "5", to: "1", weight: 1 },
      { from: "1", to: "3", weight: 8 },
      { from: "2", to: "4", weight: 6 },
    ],
  },
};

// ============================================
// ALGORITHM LOGIC
// ============================================

function getAdjacencyList(graph: Graph): Map<string, { node: string; weight: number }[]> {
  const adj = new Map<string, { node: string; weight: number }[]>();
  
  for (const node of graph.nodes) {
    adj.set(node.id, []);
  }
  
  for (const edge of graph.edges) {
    adj.get(edge.from)?.push({ node: edge.to, weight: edge.weight });
    adj.get(edge.to)?.push({ node: edge.from, weight: edge.weight });
  }
  
  return adj;
}

function computeAllSteps(graph: Graph, startNode: string): Step[] {
  const adj = getAdjacencyList(graph);
  const allSteps: Step[] = [];
  
  const distances = new Map<string, number>();
  const previous = new Map<string, string | null>();
  const visited = new Set<string>();
  const unvisited = new Set<string>();
  
  // Initialize
  for (const node of graph.nodes) {
    distances.set(node.id, node.id === startNode ? 0 : Infinity);
    previous.set(node.id, null);
    unvisited.add(node.id);
  }
  
  allSteps.push({
    line: 1,
    action: `Initialize: set dist[${startNode}] = 0, all others = ∞`,
    type: "init",
    currentNode: null,
    distances: new Map(distances),
    previous: new Map(previous),
    visited: new Set(visited),
    unvisited: new Set(unvisited),
    exploring: null,
    exploringEdge: null,
    relaxing: false,
  });
  
  while (unvisited.size > 0) {
    // Find minimum distance node
    let minNode: string | null = null;
    let minDist = Infinity;
    
    for (const node of unvisited) {
      const dist = distances.get(node) ?? Infinity;
      if (dist < minDist) {
        minDist = dist;
        minNode = node;
      }
    }
    
    if (minNode === null || minDist === Infinity) break;
    
    unvisited.delete(minNode);
    visited.add(minNode);
    
    allSteps.push({
      line: 3,
      action: `Extract min: u = '${minNode}' with dist = ${minDist}`,
      type: "extract",
      currentNode: minNode,
      distances: new Map(distances),
      previous: new Map(previous),
      visited: new Set(visited),
      unvisited: new Set(unvisited),
      exploring: null,
      exploringEdge: null,
      relaxing: false,
    });
    
    // Relax neighbors
    const neighbors = adj.get(minNode) || [];
    
    for (const { node: neighbor, weight } of neighbors) {
      if (visited.has(neighbor)) {
        allSteps.push({
          line: 5,
          action: `Skip '${neighbor}': already visited`,
          type: "skip",
          currentNode: minNode,
          distances: new Map(distances),
          previous: new Map(previous),
          visited: new Set(visited),
          unvisited: new Set(unvisited),
          exploring: neighbor,
          exploringEdge: [minNode, neighbor],
          relaxing: false,
        });
        continue;
      }
      
      const currentDist = distances.get(neighbor) ?? Infinity;
      const newDist = (distances.get(minNode) ?? Infinity) + weight;
      
      allSteps.push({
        line: 6,
        action: `Relax edge (${minNode}, ${neighbor}): ${minDist} + ${weight} = ${newDist} vs current ${currentDist === Infinity ? "∞" : currentDist}`,
        type: "relax",
        currentNode: minNode,
        distances: new Map(distances),
        previous: new Map(previous),
        visited: new Set(visited),
        unvisited: new Set(unvisited),
        exploring: neighbor,
        exploringEdge: [minNode, neighbor],
        relaxing: true,
      });
      
      if (newDist < currentDist) {
        distances.set(neighbor, newDist);
        previous.set(neighbor, minNode);
        
        allSteps.push({
          line: 7,
          action: `Update: dist[${neighbor}] = ${newDist}, prev[${neighbor}] = ${minNode}`,
          type: "update",
          currentNode: minNode,
          distances: new Map(distances),
          previous: new Map(previous),
          visited: new Set(visited),
          unvisited: new Set(unvisited),
          exploring: neighbor,
          exploringEdge: [minNode, neighbor],
          relaxing: false,
        });
      } else {
        allSteps.push({
          line: 6,
          action: `No update: ${newDist} ≥ ${currentDist}`,
          type: "relax",
          currentNode: minNode,
          distances: new Map(distances),
          previous: new Map(previous),
          visited: new Set(visited),
          unvisited: new Set(unvisited),
          exploring: neighbor,
          exploringEdge: [minNode, neighbor],
          relaxing: false,
        });
      }
    }
  }
  
  allSteps.push({
    line: 9,
    action: "Dijkstra complete! All shortest paths found.",
    type: "complete",
    currentNode: null,
    distances: new Map(distances),
    previous: new Map(previous),
    visited: new Set(visited),
    unvisited: new Set(unvisited),
    exploring: null,
    exploringEdge: null,
    relaxing: false,
  });
  
  return allSteps;
}

// ============================================
// ALGORITHM CODE
// ============================================

const algorithmCode = [
  { line: 1, content: "Dijkstra(G, s)", tokens: [
    { type: "function", text: "Dijkstra" },
    { type: "bracket", text: "(" },
    { type: "variable", text: "G" },
    { type: "plain", text: ", " },
    { type: "variable", text: "s" },
    { type: "bracket", text: ")" },
  ]},
  { line: 2, content: "begin", tokens: [{ type: "keyword", text: "begin" }]},
  { line: 3, content: "   dist[s] ← 0; ∀v≠s: dist[v] ← ∞", tokens: [
    { type: "plain", text: "   " },
    { type: "variable", text: "dist" },
    { type: "bracket", text: "[" },
    { type: "variable", text: "s" },
    { type: "bracket", text: "]" },
    { type: "operator", text: " ← " },
    { type: "number", text: "0" },
    { type: "plain", text: "; ∀" },
    { type: "variable", text: "v" },
    { type: "plain", text: "≠" },
    { type: "variable", text: "s" },
    { type: "plain", text: ": " },
    { type: "variable", text: "dist" },
    { type: "bracket", text: "[" },
    { type: "variable", text: "v" },
    { type: "bracket", text: "]" },
    { type: "operator", text: " ← " },
    { type: "plain", text: "∞" },
  ]},
  { line: 4, content: "   Q ← V  // priority queue", tokens: [
    { type: "plain", text: "   " },
    { type: "variable", text: "Q" },
    { type: "operator", text: " ← " },
    { type: "variable", text: "V" },
    { type: "plain", text: "  " },
    { type: "comment", text: "// priority queue" },
  ]},
  { line: 5, content: "   while Q ≠ ∅ do", tokens: [
    { type: "plain", text: "   " },
    { type: "keyword", text: "while" },
    { type: "plain", text: " " },
    { type: "variable", text: "Q" },
    { type: "operator", text: " ≠ " },
    { type: "plain", text: "∅ " },
    { type: "keyword", text: "do" },
  ]},
  { line: 6, content: "      u ← extractMin(Q)", tokens: [
    { type: "plain", text: "      " },
    { type: "variable", text: "u" },
    { type: "operator", text: " ← " },
    { type: "function", text: "extractMin" },
    { type: "bracket", text: "(" },
    { type: "variable", text: "Q" },
    { type: "bracket", text: ")" },
  ]},
  { line: 7, content: "      for each v ∈ adj(u) do", tokens: [
    { type: "plain", text: "      " },
    { type: "keyword", text: "for each" },
    { type: "plain", text: " " },
    { type: "variable", text: "v" },
    { type: "operator", text: " ∈ " },
    { type: "function", text: "adj" },
    { type: "bracket", text: "(" },
    { type: "variable", text: "u" },
    { type: "bracket", text: ")" },
    { type: "plain", text: " " },
    { type: "keyword", text: "do" },
  ]},
  { line: 8, content: "         if dist[u]+w(u,v) < dist[v]", tokens: [
    { type: "plain", text: "         " },
    { type: "keyword", text: "if" },
    { type: "plain", text: " " },
    { type: "variable", text: "dist" },
    { type: "bracket", text: "[" },
    { type: "variable", text: "u" },
    { type: "bracket", text: "]" },
    { type: "operator", text: "+" },
    { type: "function", text: "w" },
    { type: "bracket", text: "(" },
    { type: "variable", text: "u" },
    { type: "plain", text: "," },
    { type: "variable", text: "v" },
    { type: "bracket", text: ")" },
    { type: "operator", text: " < " },
    { type: "variable", text: "dist" },
    { type: "bracket", text: "[" },
    { type: "variable", text: "v" },
    { type: "bracket", text: "]" },
  ]},
  { line: 9, content: "            dist[v] ← dist[u]+w(u,v)", tokens: [
    { type: "plain", text: "            " },
    { type: "variable", text: "dist" },
    { type: "bracket", text: "[" },
    { type: "variable", text: "v" },
    { type: "bracket", text: "]" },
    { type: "operator", text: " ← " },
    { type: "variable", text: "dist" },
    { type: "bracket", text: "[" },
    { type: "variable", text: "u" },
    { type: "bracket", text: "]" },
    { type: "operator", text: "+" },
    { type: "function", text: "w" },
    { type: "bracket", text: "(" },
    { type: "variable", text: "u" },
    { type: "plain", text: "," },
    { type: "variable", text: "v" },
    { type: "bracket", text: ")" },
  ]},
  { line: 10, content: "            prev[v] ← u", tokens: [
    { type: "plain", text: "            " },
    { type: "variable", text: "prev" },
    { type: "bracket", text: "[" },
    { type: "variable", text: "v" },
    { type: "bracket", text: "]" },
    { type: "operator", text: " ← " },
    { type: "variable", text: "u" },
  ]},
  { line: 11, content: "end", tokens: [{ type: "keyword", text: "end" }]},
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

export default function DijkstraPage() {
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

  const shortestPathEdges = useMemo(() => {
    if (!currentStep) return new Set<string>();
    const edges = new Set<string>();
    for (const [node, prev] of currentStep.previous) {
      if (prev !== null) {
        edges.add(`${prev}-${node}`);
        edges.add(`${node}-${prev}`);
      }
    }
    return edges;
  }, [currentStep]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;
      const newWidth = Math.min(Math.max(280, e.clientX), window.innerWidth * 0.5);
      setCodeWidth(newWidth);
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

  const prevStep = useCallback(() => { setCurrentStepIndex((prev) => Math.max(0, prev - 1)); }, []);
  const goToStart = useCallback(() => { stopPlaying(); if (steps.length > 0) setCurrentStepIndex(0); }, [steps.length, stopPlaying]);
  const goToEnd = useCallback(() => { stopPlaying(); if (steps.length > 0) setCurrentStepIndex(steps.length - 1); }, [steps.length, stopPlaying]);

  const startVisualization = useCallback(() => {
    if (!graph.nodes.find(n => n.id === startNode)) { alert("Please select a valid start node."); return; }
    stopPlaying();
    const newSteps = computeAllSteps(graph, startNode);
    setSteps(newSteps);
    setCurrentStepIndex(0);
  }, [graph, startNode, stopPlaying]);

  const resetVisualization = useCallback(() => { stopPlaying(); setSteps([]); setCurrentStepIndex(-1); }, [stopPlaying]);

  const playPause = useCallback(() => {
    if (isPlaying) { stopPlaying(); } 
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
      const lineElement = codeContainerRef.current.querySelector(`[data-line="${currentStep.line}"]`);
      if (lineElement) lineElement.scrollIntoView({ behavior: "smooth", block: "center" });
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
    if (currentStep.visited.has(nodeId)) return "var(--accent-cyan)";
    return "var(--bg-tertiary)";
  };

  const getEdgeStyle = (from: string, to: string) => {
    if (currentStep?.exploringEdge) {
      const [ef, et] = currentStep.exploringEdge;
      if ((ef === from && et === to) || (ef === to && et === from)) {
        return { stroke: currentStep.relaxing ? "var(--accent-yellow)" : "var(--accent-orange)", strokeWidth: 3, opacity: 1 };
      }
    }
    const edgeKey1 = `${from}-${to}`;
    const edgeKey2 = `${to}-${from}`;
    if (shortestPathEdges.has(edgeKey1) || shortestPathEdges.has(edgeKey2)) {
      return { stroke: "var(--accent-cyan)", strokeWidth: 2.5, opacity: 1 };
    }
    return { stroke: "var(--border-color)", strokeWidth: 1.5, opacity: 0.5 };
  };

  const getEdgeWeight = (from: string, to: string) => {
    const edge = graph.edges.find(e => (e.from === from && e.to === to) || (e.from === to && e.to === from));
    return edge?.weight ?? 0;
  };

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] flex flex-col font-mono">
      <header className="bg-[var(--bg-secondary)] border-b border-[var(--border-color)] px-4 py-3 flex items-center justify-between flex-wrap gap-4">
        <Link href="/algorithms" className="flex items-center gap-2">
          <span className="text-[var(--accent-green)]">$</span>
          <span className="text-[var(--text-secondary)]">./</span>
          <span className="text-[var(--text-primary)]">dijkstra</span>
        </Link>
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="text-[var(--text-muted)] text-sm">graph:</span>
            <select value={selectedGraph} onChange={(e) => handleGraphChange(e.target.value)} className="px-3 py-1.5 text-sm bg-[var(--bg-primary)] border border-[var(--border-color)] text-[var(--text-primary)] cursor-pointer">
              <option value="simple">simple (6 nodes)</option>
              <option value="weighted">weighted (6)</option>
              <option value="pentagon">pentagon (5)</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[var(--text-muted)] text-sm">source:</span>
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
          <Section title="weighted graph" className="flex-1">
            <div className="relative bg-[var(--bg-primary)] border border-[var(--border-color)] rounded overflow-hidden" style={{ minHeight: 420 }}>
              <svg ref={svgRef} width="100%" height="420" viewBox="0 0 600 420" className="block">
                {graph.edges.map((edge, idx) => {
                  const fromNode = graph.nodes.find(n => n.id === edge.from);
                  const toNode = graph.nodes.find(n => n.id === edge.to);
                  if (!fromNode || !toNode) return null;
                  const style = getEdgeStyle(edge.from, edge.to);
                  const midX = (fromNode.x + toNode.x) / 2;
                  const midY = (fromNode.y + toNode.y) / 2;
                  return (
                    <g key={idx}>
                      <line x1={fromNode.x} y1={fromNode.y} x2={toNode.x} y2={toNode.y} stroke={style.stroke} strokeWidth={style.strokeWidth} opacity={style.opacity} />
                      <rect x={midX - 12} y={midY - 10} width={24} height={20} fill="var(--bg-primary)" rx={4} />
                      <text x={midX} y={midY} textAnchor="middle" dominantBaseline="central" fill="var(--accent-purple)" fontSize="12" fontWeight="bold" fontFamily="monospace">{edge.weight}</text>
                    </g>
                  );
                })}
                {graph.nodes.map((node) => {
                  const fillColor = getNodeColor(node.id);
                  const dist = currentStep?.distances.get(node.id);
                  return (
                    <g key={node.id}>
                      <circle cx={node.x} cy={node.y} r={24} fill={fillColor} stroke={fillColor} strokeWidth={2} />
                      <text x={node.x} y={node.y} textAnchor="middle" dominantBaseline="central" fill="var(--text-primary)" fontSize="14" fontWeight="bold" fontFamily="monospace">{node.label}</text>
                      {dist !== undefined && (
                        <g>
                          <rect x={node.x + 18} y={node.y - 28} width={28} height={18} fill="var(--accent-purple)" rx={4} />
                          <text x={node.x + 32} y={node.y - 19} textAnchor="middle" dominantBaseline="central" fill="white" fontSize="10" fontWeight="bold" fontFamily="monospace">{dist === Infinity ? "∞" : dist}</text>
                        </g>
                      )}
                    </g>
                  );
                })}
              </svg>
              <div className="absolute bottom-3 left-3 flex flex-wrap gap-3 text-xs text-[var(--text-muted)] bg-[var(--bg-secondary)]/90 px-3 py-2 rounded">
                <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-[var(--accent-green)]"></span> current</span>
                <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-[var(--accent-yellow)]"></span> relaxing</span>
                <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-[var(--accent-cyan)]"></span> visited</span>
                <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-[var(--accent-purple)]"></span> distance</span>
              </div>
            </div>
          </Section>

          <Section title="distances from source">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="text-[var(--text-muted)] text-xs uppercase">
                    <th className="p-2 text-center border-b border-[var(--border-color)]">node</th>
                    <th className="p-2 text-center border-b border-[var(--border-color)]">distance</th>
                    <th className="p-2 text-center border-b border-[var(--border-color)]">previous</th>
                    <th className="p-2 text-center border-b border-[var(--border-color)]">status</th>
                  </tr>
                </thead>
                <tbody>
                  {graph.nodes.map((node) => {
                    const dist = currentStep?.distances.get(node.id);
                    const prev = currentStep?.previous.get(node.id);
                    const isVisited = currentStep?.visited.has(node.id);
                    return (
                      <tr key={node.id} className={currentStep?.currentNode === node.id ? "bg-[var(--line-highlight)]" : ""}>
                        <td className="p-2 text-center border-b border-[var(--border-color)] text-[var(--accent-cyan)] font-bold">{node.id}</td>
                        <td className="p-2 text-center border-b border-[var(--border-color)] text-[var(--accent-purple)]">{dist === Infinity ? "∞" : dist ?? "—"}</td>
                        <td className="p-2 text-center border-b border-[var(--border-color)] text-[var(--text-secondary)]">{prev ?? "—"}</td>
                        <td className="p-2 text-center border-b border-[var(--border-color)]">{isVisited ? <span className="text-[var(--accent-green)]">✓</span> : <span className="text-[var(--text-muted)]">○</span>}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Section>

          <Section title="current action">
            <div className="text-sm bg-[var(--bg-primary)] border border-[var(--border-color)] p-3 min-h-[50px]">
              {currentStep ? (
                <><span className="text-[var(--accent-green)]">[{currentStepIndex + 1}/{steps.length}]</span> <span className="text-[var(--text-primary)]">{currentStep.action}</span></>
              ) : (
                <span className="text-[var(--text-muted)]">select a source node and click &quot;run&quot; to begin...</span>
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

