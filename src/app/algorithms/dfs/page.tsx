"use client";

/*
  🔍 DFS VISUALIZER PAGE
  Depth-First Search on an interactive graph.
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
}

interface Graph {
  nodes: Node[];
  edges: Edge[];
}

interface Step {
  line: number;
  action: string;
  type: "init" | "push" | "pop" | "visit" | "check" | "backtrack" | "complete";
  currentNode: string | null;
  stack: string[];
  visited: Set<string>;
  exploring: string | null;
  exploringEdge: [string, string] | null;
  parent: Map<string, string | null>;
  discoveryTime: Map<string, number>;
  finishTime: Map<string, number>;
  time: number;
}

// ============================================
// PRESET GRAPHS
// ============================================

const presetGraphs: Record<string, Graph> = {
  simple: {
    nodes: [
      { id: "A", x: 300, y: 80, label: "A" },
      { id: "B", x: 150, y: 180, label: "B" },
      { id: "C", x: 450, y: 180, label: "C" },
      { id: "D", x: 80, y: 300, label: "D" },
      { id: "E", x: 220, y: 300, label: "E" },
      { id: "F", x: 380, y: 300, label: "F" },
      { id: "G", x: 520, y: 300, label: "G" },
    ],
    edges: [
      { from: "A", to: "B" },
      { from: "A", to: "C" },
      { from: "B", to: "D" },
      { from: "B", to: "E" },
      { from: "C", to: "F" },
      { from: "C", to: "G" },
    ],
  },
  binary: {
    nodes: [
      { id: "1", x: 300, y: 60, label: "1" },
      { id: "2", x: 180, y: 150, label: "2" },
      { id: "3", x: 420, y: 150, label: "3" },
      { id: "4", x: 100, y: 250, label: "4" },
      { id: "5", x: 240, y: 250, label: "5" },
      { id: "6", x: 360, y: 250, label: "6" },
      { id: "7", x: 500, y: 250, label: "7" },
    ],
    edges: [
      { from: "1", to: "2" },
      { from: "1", to: "3" },
      { from: "2", to: "4" },
      { from: "2", to: "5" },
      { from: "3", to: "6" },
      { from: "3", to: "7" },
    ],
  },
  cyclic: {
    nodes: [
      { id: "A", x: 300, y: 80, label: "A" },
      { id: "B", x: 150, y: 180, label: "B" },
      { id: "C", x: 450, y: 180, label: "C" },
      { id: "D", x: 150, y: 320, label: "D" },
      { id: "E", x: 300, y: 380, label: "E" },
      { id: "F", x: 450, y: 320, label: "F" },
    ],
    edges: [
      { from: "A", to: "B" },
      { from: "A", to: "C" },
      { from: "B", to: "D" },
      { from: "C", to: "F" },
      { from: "D", to: "E" },
      { from: "F", to: "E" },
      { from: "B", to: "C" },
    ],
  },
  linear: {
    nodes: [
      { id: "A", x: 100, y: 200, label: "A" },
      { id: "B", x: 200, y: 200, label: "B" },
      { id: "C", x: 300, y: 200, label: "C" },
      { id: "D", x: 400, y: 200, label: "D" },
      { id: "E", x: 500, y: 200, label: "E" },
    ],
    edges: [
      { from: "A", to: "B" },
      { from: "B", to: "C" },
      { from: "C", to: "D" },
      { from: "D", to: "E" },
    ],
  },
};

// ============================================
// ALGORITHM LOGIC
// ============================================

function getAdjacencyList(graph: Graph): Map<string, string[]> {
  const adj = new Map<string, string[]>();
  
  for (const node of graph.nodes) {
    adj.set(node.id, []);
  }
  
  for (const edge of graph.edges) {
    adj.get(edge.from)?.push(edge.to);
    adj.get(edge.to)?.push(edge.from);
  }
  
  for (const [key, neighbors] of adj) {
    adj.set(key, neighbors.sort());
  }
  
  return adj;
}

function computeAllSteps(graph: Graph, startNode: string): Step[] {
  const adj = getAdjacencyList(graph);
  const allSteps: Step[] = [];
  
  const stack: string[] = [];
  const visited = new Set<string>();
  const parent = new Map<string, string | null>();
  const discoveryTime = new Map<string, number>();
  const finishTime = new Map<string, number>();
  let time = 0;
  
  // Initial step
  allSteps.push({
    line: 1,
    action: `Initialize DFS from node '${startNode}'`,
    type: "init",
    currentNode: null,
    stack: [...stack],
    visited: new Set(visited),
    exploring: null,
    exploringEdge: null,
    parent: new Map(parent),
    discoveryTime: new Map(discoveryTime),
    finishTime: new Map(finishTime),
    time,
  });

  function dfs(node: string) {
    visited.add(node);
    time++;
    discoveryTime.set(node, time);
    stack.push(node);

    allSteps.push({
      line: 3,
      action: `Visit '${node}': mark visited, discovery time = ${time}`,
      type: "visit",
      currentNode: node,
      stack: [...stack],
      visited: new Set(visited),
      exploring: null,
      exploringEdge: null,
      parent: new Map(parent),
      discoveryTime: new Map(discoveryTime),
      finishTime: new Map(finishTime),
      time,
    });

    const neighbors = adj.get(node) || [];
    
    for (const neighbor of neighbors) {
      allSteps.push({
        line: 5,
        action: `Check neighbor '${neighbor}' of '${node}'`,
        type: "check",
        currentNode: node,
        stack: [...stack],
        visited: new Set(visited),
        exploring: neighbor,
        exploringEdge: [node, neighbor],
        parent: new Map(parent),
        discoveryTime: new Map(discoveryTime),
        finishTime: new Map(finishTime),
        time,
      });

      if (!visited.has(neighbor)) {
        parent.set(neighbor, node);
        
        allSteps.push({
          line: 6,
          action: `'${neighbor}' not visited, recurse deeper`,
          type: "push",
          currentNode: node,
          stack: [...stack],
          visited: new Set(visited),
          exploring: neighbor,
          exploringEdge: [node, neighbor],
          parent: new Map(parent),
          discoveryTime: new Map(discoveryTime),
          finishTime: new Map(finishTime),
          time,
        });

        dfs(neighbor);
      } else {
        allSteps.push({
          line: 7,
          action: `'${neighbor}' already visited, skip`,
          type: "check",
          currentNode: node,
          stack: [...stack],
          visited: new Set(visited),
          exploring: neighbor,
          exploringEdge: [node, neighbor],
          parent: new Map(parent),
          discoveryTime: new Map(discoveryTime),
          finishTime: new Map(finishTime),
          time,
        });
      }
    }

    time++;
    finishTime.set(node, time);
    stack.pop();

    allSteps.push({
      line: 8,
      action: `Backtrack from '${node}': finish time = ${time}`,
      type: "backtrack",
      currentNode: stack.length > 0 ? stack[stack.length - 1] : null,
      stack: [...stack],
      visited: new Set(visited),
      exploring: null,
      exploringEdge: null,
      parent: new Map(parent),
      discoveryTime: new Map(discoveryTime),
      finishTime: new Map(finishTime),
      time,
    });
  }

  parent.set(startNode, null);
  dfs(startNode);

  allSteps.push({
    line: 9,
    action: "DFS complete! All reachable nodes visited.",
    type: "complete",
    currentNode: null,
    stack: [],
    visited: new Set(visited),
    exploring: null,
    exploringEdge: null,
    parent: new Map(parent),
    discoveryTime: new Map(discoveryTime),
    finishTime: new Map(finishTime),
    time,
  });

  return allSteps;
}

// ============================================
// ALGORITHM CODE
// ============================================

const algorithmCode = [
  { line: 1, content: "DFS(G, s)", tokens: [
    { type: "function", text: "DFS" },
    { type: "bracket", text: "(" },
    { type: "variable", text: "G" },
    { type: "plain", text: ", " },
    { type: "variable", text: "s" },
    { type: "bracket", text: ")" },
  ]},
  { line: 2, content: "begin", tokens: [
    { type: "keyword", text: "begin" },
  ]},
  { line: 3, content: "   visited[s] ← true; time++", tokens: [
    { type: "plain", text: "   " },
    { type: "variable", text: "visited" },
    { type: "bracket", text: "[" },
    { type: "variable", text: "s" },
    { type: "bracket", text: "]" },
    { type: "operator", text: " ← " },
    { type: "keyword", text: "true" },
    { type: "plain", text: "; " },
    { type: "variable", text: "time" },
    { type: "operator", text: "++" },
  ]},
  { line: 4, content: "   d[s] ← time", tokens: [
    { type: "plain", text: "   " },
    { type: "variable", text: "d" },
    { type: "bracket", text: "[" },
    { type: "variable", text: "s" },
    { type: "bracket", text: "]" },
    { type: "operator", text: " ← " },
    { type: "variable", text: "time" },
  ]},
  { line: 5, content: "   for each v ∈ adj(s) do", tokens: [
    { type: "plain", text: "   " },
    { type: "keyword", text: "for each" },
    { type: "plain", text: " " },
    { type: "variable", text: "v" },
    { type: "operator", text: " ∈ " },
    { type: "function", text: "adj" },
    { type: "bracket", text: "(" },
    { type: "variable", text: "s" },
    { type: "bracket", text: ")" },
    { type: "plain", text: " " },
    { type: "keyword", text: "do" },
  ]},
  { line: 6, content: "      if not visited[v] then", tokens: [
    { type: "plain", text: "      " },
    { type: "keyword", text: "if not" },
    { type: "plain", text: " " },
    { type: "variable", text: "visited" },
    { type: "bracket", text: "[" },
    { type: "variable", text: "v" },
    { type: "bracket", text: "]" },
    { type: "plain", text: " " },
    { type: "keyword", text: "then" },
  ]},
  { line: 7, content: "         DFS(G, v)  // recurse", tokens: [
    { type: "plain", text: "         " },
    { type: "function", text: "DFS" },
    { type: "bracket", text: "(" },
    { type: "variable", text: "G" },
    { type: "plain", text: ", " },
    { type: "variable", text: "v" },
    { type: "bracket", text: ")" },
    { type: "plain", text: "  " },
    { type: "comment", text: "// recurse" },
  ]},
  { line: 8, content: "   time++; f[s] ← time", tokens: [
    { type: "plain", text: "   " },
    { type: "variable", text: "time" },
    { type: "operator", text: "++" },
    { type: "plain", text: "; " },
    { type: "variable", text: "f" },
    { type: "bracket", text: "[" },
    { type: "variable", text: "s" },
    { type: "bracket", text: "]" },
    { type: "operator", text: " ← " },
    { type: "variable", text: "time" },
  ]},
  { line: 9, content: "end", tokens: [
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

export default function DFSPage() {
  const [selectedGraph, setSelectedGraph] = useState<string>("simple");
  const [graph, setGraph] = useState<Graph>(presetGraphs.simple);
  const [startNode, setStartNode] = useState<string>("A");
  const [steps, setSteps] = useState<Step[]>([]);
  const [currentStepIndex, setCurrentStepIndex] = useState(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1.5);
  const [codeWidth, setCodeWidth] = useState(380);
  const [isResizing, setIsResizing] = useState(false);
  const [draggingNode, setDraggingNode] = useState<string | null>(null);
  
  const playIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const codeContainerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const currentStep = currentStepIndex >= 0 ? steps[currentStepIndex] : null;

  const dfsTreeEdges = useMemo(() => {
    if (!currentStep) return new Set<string>();
    const edges = new Set<string>();
    for (const [child, parent] of currentStep.parent) {
      if (parent !== null) {
        edges.add(`${parent}-${child}`);
        edges.add(`${child}-${parent}`);
      }
    }
    return edges;
  }, [currentStep]);

  // Resize handler
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

  // Node drag handler
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!draggingNode || !svgRef.current) return;
      
      const svg = svgRef.current;
      const rect = svg.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      setGraph(prev => ({
        ...prev,
        nodes: prev.nodes.map(node => 
          node.id === draggingNode 
            ? { ...node, x: Math.max(30, Math.min(570, x)), y: Math.max(30, Math.min(420, y)) }
            : node
        ),
      }));
    };

    const handleMouseUp = () => setDraggingNode(null);

    if (draggingNode) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'grabbing';
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
    };
  }, [draggingNode]);

  const stopPlaying = useCallback(() => {
    setIsPlaying(false);
    if (playIntervalRef.current) {
      clearInterval(playIntervalRef.current);
      playIntervalRef.current = null;
    }
  }, []);

  const nextStep = useCallback(() => {
    setCurrentStepIndex((prev) => {
      if (prev < steps.length - 1) return prev + 1;
      stopPlaying();
      return prev;
    });
  }, [steps.length, stopPlaying]);

  const prevStep = useCallback(() => {
    setCurrentStepIndex((prev) => Math.max(0, prev - 1));
  }, []);

  const goToStart = useCallback(() => {
    stopPlaying();
    if (steps.length > 0) setCurrentStepIndex(0);
  }, [steps.length, stopPlaying]);

  const goToEnd = useCallback(() => {
    stopPlaying();
    if (steps.length > 0) setCurrentStepIndex(steps.length - 1);
  }, [steps.length, stopPlaying]);

  const startVisualization = useCallback(() => {
    if (!graph.nodes.find(n => n.id === startNode)) {
      alert("Please select a valid start node.");
      return;
    }
    stopPlaying();
    const newSteps = computeAllSteps(graph, startNode);
    setSteps(newSteps);
    setCurrentStepIndex(0);
  }, [graph, startNode, stopPlaying]);

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

  const handleGraphChange = useCallback((graphKey: string) => {
    setSelectedGraph(graphKey);
    setGraph(presetGraphs[graphKey]);
    setStartNode(presetGraphs[graphKey].nodes[0].id);
    resetVisualization();
  }, [resetVisualization]);

  const handleStartNodeClick = useCallback((nodeId: string) => {
    if (steps.length === 0) setStartNode(nodeId);
  }, [steps.length]);

  useEffect(() => {
    if (isPlaying) {
      const interval = setInterval(() => {
        setCurrentStepIndex((prev) => {
          if (prev < steps.length - 1) return prev + 1;
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
    if (currentStep.stack.includes(nodeId)) return "var(--accent-magenta)";
    if (currentStep.visited.has(nodeId)) return "var(--accent-cyan)";
    return "var(--bg-tertiary)";
  };

  const getEdgeStyle = (from: string, to: string) => {
    const edgeKey1 = `${from}-${to}`;
    const edgeKey2 = `${to}-${from}`;
    
    if (currentStep?.exploringEdge) {
      const [ef, et] = currentStep.exploringEdge;
      if ((ef === from && et === to) || (ef === to && et === from)) {
        return { stroke: "var(--accent-yellow)", strokeWidth: 3, opacity: 1 };
      }
    }
    
    if (dfsTreeEdges.has(edgeKey1) || dfsTreeEdges.has(edgeKey2)) {
      return { stroke: "var(--accent-cyan)", strokeWidth: 2.5, opacity: 1 };
    }
    
    return { stroke: "var(--border-color)", strokeWidth: 1.5, opacity: 0.5 };
  };

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] flex flex-col font-mono">
      {/* Header */}
      <header className="bg-[var(--bg-secondary)] border-b border-[var(--border-color)] px-4 py-3 flex items-center justify-between flex-wrap gap-4">
        <Link href="/algorithms" className="flex items-center gap-2 group">
          <span className="text-[var(--accent-green)]">$</span>
          <span className="text-[var(--text-secondary)]">./</span>
          <span className="text-[var(--text-primary)]">dfs</span>
        </Link>

        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="text-[var(--text-muted)] text-sm">graph:</span>
            <select
              value={selectedGraph}
              onChange={(e) => handleGraphChange(e.target.value)}
              className="px-3 py-1.5 text-sm bg-[var(--bg-primary)] border border-[var(--border-color)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-green)] transition-colors cursor-pointer"
            >
              <option value="simple">tree (7 nodes)</option>
              <option value="binary">binary tree (7)</option>
              <option value="cyclic">cyclic (6 nodes)</option>
              <option value="linear">linear (5 nodes)</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[var(--text-muted)] text-sm">start:</span>
            <select
              value={startNode}
              onChange={(e) => setStartNode(e.target.value)}
              disabled={steps.length > 0}
              className="px-3 py-1.5 text-sm bg-[var(--bg-primary)] border border-[var(--border-color)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-green)] transition-colors cursor-pointer disabled:opacity-50"
            >
              {graph.nodes.map(node => (
                <option key={node.id} value={node.id}>{node.label}</option>
              ))}
            </select>
          </div>
          <button onClick={startVisualization} className="px-4 py-1.5 border border-[var(--accent-green)] text-[var(--accent-green)] hover:bg-[var(--accent-green)] hover:text-[var(--bg-primary)] transition-colors text-sm">
            run
          </button>
          <button onClick={resetVisualization} className="px-4 py-1.5 border border-[var(--border-color)] text-[var(--text-secondary)] hover:border-[var(--text-muted)] transition-colors text-sm">
            reset
          </button>
        </div>

        <div className="flex items-center gap-1">
          <button onClick={goToStart} className="w-8 h-8 flex items-center justify-center border border-[var(--border-color)] hover:border-[var(--accent-green)] hover:text-[var(--accent-green)] transition-colors text-xs" title="Go to start">|◁</button>
          <button onClick={prevStep} className="w-8 h-8 flex items-center justify-center border border-[var(--border-color)] hover:border-[var(--accent-green)] hover:text-[var(--accent-green)] transition-colors text-xs" title="Previous step (←)">◁</button>
          <button onClick={playPause} className="w-8 h-8 flex items-center justify-center border border-[var(--accent-green)] text-[var(--accent-green)] hover:bg-[var(--accent-green)] hover:text-[var(--bg-primary)] transition-colors text-xs" title="Play/Pause (space)">{isPlaying ? "||" : "▷"}</button>
          <button onClick={nextStep} className="w-8 h-8 flex items-center justify-center border border-[var(--border-color)] hover:border-[var(--accent-green)] hover:text-[var(--accent-green)] transition-colors text-xs" title="Next step (→)">▷</button>
          <button onClick={goToEnd} className="w-8 h-8 flex items-center justify-center border border-[var(--border-color)] hover:border-[var(--accent-green)] hover:text-[var(--accent-green)] transition-colors text-xs" title="Go to end">▷|</button>
          <div className="flex items-center gap-2 ml-3 text-sm text-[var(--text-secondary)]">
            <input type="range" min="0.5" max="5" step="0.5" value={speed} onChange={(e) => setSpeed(parseFloat(e.target.value))} className="w-20 h-1 appearance-none bg-[var(--border-color)] cursor-pointer accent-[var(--accent-green)]" />
            <span className="text-xs text-[var(--text-muted)] w-16">{speed < 1 ? speed.toFixed(1) : Math.round(speed)} step/s</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Code Panel */}
        <div style={{ width: codeWidth }} className="bg-[var(--bg-code)] border-r border-[var(--border-color)] flex flex-col shrink-0 relative">
          <div className="px-4 py-2 bg-[var(--bg-secondary)] border-b border-[var(--border-color)] text-xs text-[var(--text-muted)] uppercase tracking-wider"># algorithm</div>
          <div ref={codeContainerRef} className="flex-1 overflow-auto">
            {algorithmCode.map((line) => (
              <div key={line.line} data-line={line.line} className={`flex text-sm leading-7 transition-colors ${currentStep?.line === line.line ? "bg-[var(--line-highlight)] border-l-2 border-[var(--accent-green)]" : "border-l-2 border-transparent"}`}>
                <span className={`w-8 px-2 text-right shrink-0 select-none ${currentStep?.line === line.line ? "text-[var(--accent-green)]" : "text-[var(--text-muted)]"}`}>{line.line}</span>
                <code className="px-3 py-0.5 whitespace-nowrap">
                  {line.tokens.map((token, i) => (<span key={i} className={tokenColors[token.type]}>{token.text}</span>))}
                </code>
              </div>
            ))}
          </div>
          <div onMouseDown={() => setIsResizing(true)} className="absolute top-0 right-0 w-1 h-full cursor-col-resize hover:bg-[var(--accent-green)]/30 transition-colors" />
        </div>

        {/* Visualization Panel */}
        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 min-w-[400px]">
          <Section title="graph visualization" className="flex-1">
            <div className="relative bg-[var(--bg-primary)] border border-[var(--border-color)] rounded overflow-hidden" style={{ minHeight: 450 }}>
              <svg ref={svgRef} width="100%" height="450" viewBox="0 0 600 450" className="block">
                {graph.edges.map((edge, idx) => {
                  const fromNode = graph.nodes.find(n => n.id === edge.from);
                  const toNode = graph.nodes.find(n => n.id === edge.to);
                  if (!fromNode || !toNode) return null;
                  const style = getEdgeStyle(edge.from, edge.to);
                  return <line key={idx} x1={fromNode.x} y1={fromNode.y} x2={toNode.x} y2={toNode.y} stroke={style.stroke} strokeWidth={style.strokeWidth} opacity={style.opacity} className="transition-all duration-300" />;
                })}
                {graph.nodes.map((node) => {
                  const fillColor = getNodeColor(node.id);
                  const dTime = currentStep?.discoveryTime.get(node.id);
                  const fTime = currentStep?.finishTime.get(node.id);
                  return (
                    <g key={node.id} className="cursor-pointer" onMouseDown={(e) => { if (steps.length === 0) { e.preventDefault(); setDraggingNode(node.id); } }} onClick={() => handleStartNodeClick(node.id)}>
                      <circle cx={node.x} cy={node.y} r={24} fill={fillColor} stroke={fillColor} strokeWidth={2} className="transition-all duration-300" />
                      <text x={node.x} y={node.y} textAnchor="middle" dominantBaseline="central" fill="var(--text-primary)" fontSize="14" fontWeight="bold" fontFamily="monospace" className="pointer-events-none select-none">{node.label}</text>
                      {dTime !== undefined && (
                        <g>
                          <circle cx={node.x + 20} cy={node.y - 20} r={12} fill="var(--accent-purple)" />
                          <text x={node.x + 20} y={node.y - 20} textAnchor="middle" dominantBaseline="central" fill="white" fontSize="9" fontWeight="bold" fontFamily="monospace" className="pointer-events-none select-none">
                            {fTime !== undefined ? `${dTime}/${fTime}` : dTime}
                          </text>
                        </g>
                      )}
                    </g>
                  );
                })}
              </svg>
              <div className="absolute bottom-3 left-3 flex flex-wrap gap-3 text-xs text-[var(--text-muted)] bg-[var(--bg-secondary)]/90 px-3 py-2 rounded">
                <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-[var(--accent-green)]"></span> current</span>
                <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-[var(--accent-yellow)]"></span> exploring</span>
                <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-[var(--accent-magenta)]"></span> in stack</span>
                <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-[var(--accent-cyan)]"></span> visited</span>
                <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-[var(--accent-purple)]"></span> d/f time</span>
              </div>
              {steps.length === 0 && <div className="absolute top-3 left-3 text-xs text-[var(--text-muted)] bg-[var(--bg-secondary)]/90 px-3 py-2 rounded">click a node to set as start, or drag to reposition</div>}
            </div>
          </Section>

          <div className="grid grid-cols-2 gap-4">
            <Section title="stack (recursion)">
              <div className="flex items-center gap-1 min-h-[50px] flex-wrap">
                {currentStep && currentStep.stack.length > 0 ? (
                  <>
                    <span className="text-[var(--text-muted)] text-sm mr-2">bottom →</span>
                    {currentStep.stack.map((nodeId, idx) => (
                      <div key={idx} className={`w-10 h-10 flex items-center justify-center border-2 font-bold transition-all ${idx === currentStep.stack.length - 1 ? "border-[var(--accent-green)] bg-[var(--accent-green)]/20 text-[var(--accent-green)]" : "border-[var(--accent-magenta)] bg-[var(--accent-magenta)]/10 text-[var(--text-primary)]"}`}>{nodeId}</div>
                    ))}
                    <span className="text-[var(--text-muted)] text-sm ml-2">← top</span>
                  </>
                ) : currentStep ? (
                  <span className="text-[var(--text-muted)] text-sm">empty</span>
                ) : (
                  <span className="text-[var(--text-muted)] text-sm">run to begin...</span>
                )}
              </div>
            </Section>

            <Section title="variables">
              <div className="grid grid-cols-3 gap-2">
                <VariableCard name="current" value={currentStep?.currentNode ?? "—"} active={currentStep?.type === "visit"} />
                <VariableCard name="exploring" value={currentStep?.exploring ?? "—"} active={currentStep?.type === "check"} />
                <VariableCard name="time" value={currentStep?.time ?? "—"} active={false} />
              </div>
            </Section>
          </div>

          <Section title="discovery / finish times">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="text-[var(--text-muted)] text-xs uppercase">
                    <th className="p-2 text-center border-b border-[var(--border-color)]">node</th>
                    <th className="p-2 text-center border-b border-[var(--border-color)]">discovery</th>
                    <th className="p-2 text-center border-b border-[var(--border-color)]">finish</th>
                  </tr>
                </thead>
                <tbody>
                  {currentStep && graph.nodes.map((node) => (
                    <tr key={node.id} className={currentStep.currentNode === node.id ? "bg-[var(--line-highlight)]" : ""}>
                      <td className="p-2 text-center border-b border-[var(--border-color)] text-[var(--accent-cyan)] font-bold">{node.id}</td>
                      <td className="p-2 text-center border-b border-[var(--border-color)] text-[var(--accent-purple)]">{currentStep.discoveryTime.get(node.id) ?? "—"}</td>
                      <td className="p-2 text-center border-b border-[var(--border-color)] text-[var(--accent-orange)]">{currentStep.finishTime.get(node.id) ?? "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Section>

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
      <div className="px-3 py-2 bg-[var(--bg-tertiary)] border-b border-[var(--border-color)] text-xs text-[var(--text-muted)] uppercase tracking-wider"># {title}</div>
      <div className="p-3">{children}</div>
    </div>
  );
}

function VariableCard({ name, value, active }: { name: string; value: string | number; active: boolean }) {
  return (
    <div className={`bg-[var(--bg-primary)] border p-2 text-center transition-all ${active ? "border-[var(--accent-yellow)]" : "border-[var(--border-color)]"}`}>
      <div className="text-[0.65rem] text-[var(--text-muted)] uppercase mb-0.5">{name}</div>
      <div className={`text-lg ${active ? "text-[var(--accent-yellow)]" : "text-[var(--text-primary)]"}`}>{value}</div>
    </div>
  );
}

