import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { 
  ReactFlow, 
  addEdge, 
  Background, 
  Controls, 
  MiniMap, 
  useNodesState, 
  useEdgesState, 
  Panel, 
  MarkerType, 
  Connection, 
  Edge, 
  Node, 
  ReactFlowProvider, 
  BackgroundVariant, 
  Handle, 
  Position,
  getBezierPath,
  BaseEdge,
  EdgeLabelRenderer
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import * as dagre from 'dagre';
import { PanelLeft, Play, Download, Trash2, Maximize2 } from 'lucide-react';

// --- CUSTOM EDGES ---

const SweepingEdge = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
  label,
  data
}: any) => {
  const isBackEdge = data?.isBackEdge;
  const curvature = data?.curvature ?? 0.5;

  let edgePath = '';
  let labelX = 0;
  let labelY = 0;

  if (isBackEdge) {
    // Manual Quadratic Sweep to avoid overlap
    const midX = Math.max(sourceX, targetX) + 100; // Slightly tighter sweep
    const midY = (sourceY + targetY) / 2;
    edgePath = `M ${sourceX},${sourceY} Q ${midX},${midY} ${targetX},${targetY}`;
    labelX = midX;
    labelY = midY;
  } else {
    const [path, lx, ly] = getBezierPath({
      sourceX,
      sourceY,
      sourcePosition,
      targetX,
      targetY,
      targetPosition,
      curvature,
    });
    edgePath = path;
    labelX = lx;
    labelY = ly;
  }

  return (
    <>
      <BaseEdge path={edgePath} markerEnd={markerEnd} style={style} />
      {label && (
        <EdgeLabelRenderer>
          <div
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
              background: '#6366f1',
              padding: '4px 10px',
              borderRadius: '6px',
              color: '#fff',
              fontSize: '11px',
              fontWeight: 800,
              pointerEvents: 'all',
              border: '2px solid #ffffff',
              boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
              zIndex: 9999,
              minWidth: '50px',
              textAlign: 'center',
              whiteSpace: 'nowrap'
            }}
            className="nodrag nopan"
          >
            {label}
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
};

const edgeTypes = {
  sweeping: SweepingEdge,
};

// --- CUSTOM NODES ---

const StateNode = ({ data }: any) => (
  <div style={{
    padding: '10px 20px',
    borderRadius: '12px',
    background: '#ffffff',
    border: '2px solid #0f172a',
    color: '#0f172a',
    fontWeight: 600,
    fontSize: '13px',
    textAlign: 'center',
    minWidth: '100px',
    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
  }}>
    <Handle type="target" position={Position.Top} style={{ background: '#6366f1' }} />
    <Handle type="target" position={Position.Left} id="target-left" style={{ background: '#6366f1', visibility: 'hidden' }} />
    <Handle type="source" position={Position.Left} id="source-left" style={{ background: '#6366f1', visibility: 'hidden' }} />
    {data.label}
    <Handle type="source" position={Position.Bottom} style={{ background: '#6366f1' }} />
    <Handle type="source" position={Position.Right} id="source-right" style={{ background: '#6366f1', visibility: 'hidden' }} />
    <Handle type="target" position={Position.Right} id="target-right" style={{ background: '#6366f1', visibility: 'hidden' }} />
  </div>
);

const ChoiceNode = () => (
  <div style={{
    width: '40px',
    height: '40px',
    background: '#ffffff',
    border: '2px solid #0f172a',
    transform: 'rotate(45deg)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
  }}>
    <Handle type="target" position={Position.Top} style={{ background: '#6366f1', transform: 'rotate(-45deg)' }} />
    <div style={{ transform: 'rotate(-45deg)', fontSize: '10px' }}></div>
    <Handle type="source" position={Position.Bottom} style={{ background: '#6366f1', transform: 'rotate(-45deg)' }} />
  </div>
);

const TerminalNode = ({ data }: any) => (
  <div style={{
    width: data.type === 'start' ? '20px' : '24px',
    height: data.type === 'start' ? '20px' : '24px',
    borderRadius: '50%',
    background: '#ffffff', // Changed to white for visibility
    border: '2px solid #0f172a',
    boxSizing: 'border-box',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative'
  }}>
    <Handle type="target" position={Position.Top} style={{ opacity: 0 }} />
    <div style={{ 
        width: '10px', 
        height: '10px', 
        borderRadius: '50%', 
        background: '#0f172a' 
    }} />
    <Handle type="source" position={Position.Bottom} style={{ opacity: 0 }} />
  </div>
);

const ForkNode = () => (
    <div style={{ width: '100px', height: '8px', background: '#0f172a', borderRadius: '4px' }}>
         <Handle type="target" position={Position.Top} style={{ background: '#6366f1' }} />
         <Handle type="source" position={Position.Bottom} style={{ background: '#6366f1' }} />
    </div>
);

const JoinNode = () => (
    <div style={{ width: '100px', height: '6px', background: '#0f172a', borderRadius: '4px' }}>
         <Handle type="target" position={Position.Top} style={{ background: '#6366f1', visibility: 'hidden' }} />
         <Handle type="source" position={Position.Bottom} style={{ background: '#6366f1', visibility: 'hidden' }} />
    </div>
);

const GroupNode = ({ data }: any) => (
  <div style={{
    width: '100%',
    height: '100%',
    background: 'rgba(99, 102, 241, 0.05)',
    border: '2px dashed #6366f1',
    borderRadius: '12px',
    padding: '10px',
    position: 'relative'
  }}>
    <div style={{
        position: 'absolute',
        top: '-12px',
        left: '12px',
        background: '#6366f1',
        color: '#fff',
        padding: '2px 10px',
        borderRadius: '6px',
        fontSize: '11px',
        fontWeight: 'bold',
        zIndex: 10
    }}>
        {data.label}
    </div>
    <Handle type="target" position={Position.Top} style={{ visibility: 'hidden' }} />
    <Handle type="source" position={Position.Bottom} style={{ visibility: 'hidden' }} />
  </div>
);

const nodeTypes = {
  state: StateNode,
  choice: ChoiceNode,
  terminal: TerminalNode,
  fork: ForkNode,
  join: JoinNode,
  group: GroupNode
};

// --- DAGRE LAYOUT ---

const dagreGraph = new dagre.graphlib.Graph();
dagreGraph.setDefaultEdgeLabel(() => ({}));

const getLayoutedElements = (nodes: Node[], edges: Edge[]) => {
  const nodeMap = new Map(nodes.map(n => [n.id, n]));
  const childrenMap = new Map<string | undefined, string[]>();
  
  nodes.forEach(node => {
    const parentId = node.parentId;
    if (!childrenMap.has(parentId)) childrenMap.set(parentId, []);
    childrenMap.get(parentId)!.push(node.id);
  });

  const layoutSubGraph = (parentId: string | undefined) => {
    const childrenIds = childrenMap.get(parentId) || [];
    if (childrenIds.length === 0) return { width: 120, height: 44 };

    const g = new dagre.graphlib.Graph();
    g.setGraph({ rankdir: 'TB', ranksep: 80, nodesep: 60 });
    g.setDefaultEdgeLabel(() => ({}));

    childrenIds.forEach(id => {
      const node = nodeMap.get(id)!;
      // If child is a group, layout it first to get its dimensions
      const dims = node.type === 'group' ? layoutSubGraph(id) : { width: 150, height: 60 };
      g.setNode(id, dims);
      if (node.type === 'group') {
        node.style = { ...node.style, width: dims.width, height: dims.height };
      }
    });

    edges.forEach(edge => {
      if (childrenIds.includes(edge.source) && childrenIds.includes(edge.target)) {
        // Find if this is a back-edge BEFORE layout to bypass Dagre
        // For simplicity, we assume nodes are defined in logical order in the text
        const srcIdx = childrenIds.indexOf(edge.source);
        const tgtIdx = childrenIds.indexOf(edge.target);
        const isBackEdge = tgtIdx < srcIdx;

        if (!isBackEdge) {
            g.setEdge(edge.source, edge.target);
        }
      }
    });

    dagre.layout(g);

    childrenIds.forEach(id => {
      const node = nodeMap.get(id)!;
      const pos = g.node(id);
      // Use standard alignment
      node.position = { x: pos.x - pos.width / 2, y: pos.y - pos.height / 2 + 40 };
    });

    // Post-layout edge refinement
    edges.forEach(edge => {
        const srcNode = nodeMap.get(edge.source);
        const tgtNode = nodeMap.get(edge.target);
        if (srcNode && tgtNode) {
            const isBackEdge = tgtNode.position.y < srcNode.position.y;
            const yDist = Math.abs(tgtNode.position.y - srcNode.position.y);
            const isLongEdge = yDist > 150; 
            
            edge.type = 'sweeping';
            // Set curvature and style to match baseline
            if (isBackEdge) {
                edge.data = { ...edge.data, isBackEdge, curvature: 1.5 };
                edge.sourceHandle = 'source-right';
                edge.targetHandle = 'target-right';
                edge.style = { ...edge.style, strokeWidth: 1.5, opacity: 0.9 };
            } else {
                edge.data = { ...edge.data, curvature: 0.3 };
                edge.style = { ...edge.style, strokeWidth: 1.5, opacity: 0.9 };
            }
        }
    });

    const graphDims = g.graph();
    return { 
        width: Math.max(300, (graphDims.width || 0) + 100), 
        height: Math.max(200, (graphDims.height || 0) + 100) 
    };
  };

  layoutSubGraph(undefined);
  return { nodes: [...nodes], edges };
};

// --- MAIN APP ---

const initialCode = `stateDiagram-v2
    [*] --> Still
    Still --> Moving
    state "Moving Phase" as Moving {
        [*] --> Walking
        Walking --> Running
        state "Running Phase" as Running {
            [*] --> Jogging
            Jogging --> Sprinting
        }
        Running --> Walking
    }
    state if_state <<choice>>
    Moving --> if_state
    if_state --> Crash : if heavy
    if_state --> Still : if light
    Crash --> [*]`;

function App() {
  const [code, setCode] = useState(initialCode);
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge({ 
      ...params, 
      markerEnd: { 
        type: MarkerType.ArrowClosed, 
        color: '#ffffff',
        width: 20,
        height: 20
      }, 
      style: { strokeWidth: 2, stroke: '#ffffff' } 
    }, eds)),
    [setEdges]
  );

  const parseMermaid = useCallback((inputCode: string) => {
    const lines = inputCode.split('\n');
    const newNodes: Node[] = [];
    const newEdges: Edge[] = [];
    const stack: string[] = [];
    const nodeIds = new Set<string>();
    let terminalId = 0;

    const getOrCreateNode = (name: string, id: string, type: string = 'state', parentId?: string) => {
        const fullId = id === '[*]' ? `terminal_${parentId || 'root'}_${terminalId++}` : id;
        if (nodeIds.has(fullId)) return fullId;
        
        let nodeType = type;
        const data = { label: name || id, type: '' };

        if (id === '[*]') {
            nodeType = 'terminal';
            const hasStart = newNodes.some(n => n.parentId === parentId && n.type === 'terminal' && n.data.type === 'start');
            data.type = hasStart ? 'end' : 'start';
        }

        newNodes.push({
            id: fullId,
            type: nodeType,
            data,
            position: { x: Math.random() * 400, y: Math.random() * 400 },
            parentId,
            extent: parentId ? 'parent' : undefined,
            // Removed hardcoded group style to let GroupNode component handle it
        });
        nodeIds.add(fullId);
        return fullId;
    };

    // Pass 1: Discover all Nodes and Groups
    lines.forEach(line => {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('stateDiagram') || trimmed.startsWith('%%')) return;

      const groupMatch = trimmed.match(/^state\s+(?:["'](.*?)["']\s+as\s+)?([a-zA-Z0-9_]+)\s*\{/);
      if (groupMatch) {
        getOrCreateNode(groupMatch[1] || "", groupMatch[2], 'group', stack[stack.length - 1]);
        stack.push(groupMatch[2]);
        return;
      }
      if (trimmed === '}') { stack.pop(); return; }

      const choiceMatch = trimmed.match(/^state\s+([a-zA-Z0-9_]+)\s+<<(choice|fork|join)>>/);
      if (choiceMatch) { 
        getOrCreateNode(choiceMatch[1], choiceMatch[1], choiceMatch[2], stack[stack.length - 1]); 
        return; 
      }

      const descMatch = trimmed.match(/^([a-zA-Z0-9_]+)\s*:\s*(.*)/);
      if (descMatch) { getOrCreateNode(descMatch[1], descMatch[1], 'state', stack[stack.length - 1]); }
    });

    // Reset stack for Pass 2
    stack.length = 0;

    // Pass 2: Discover Edges (and implied nodes)
    lines.forEach(line => {
      const trimmed = line.trim();
      if (trimmed.match(/^state\s+(?:["'](.*?)["']\s+as\s+)?([a-zA-Z0-9_]+)\s*\{/)) { 
        stack.push(trimmed.match(/([a-zA-Z0-9_]+)\s*\{/)![1]); 
        return; 
      }
      if (trimmed === '}') { stack.pop(); return; }

      if (trimmed.includes('-->')) {
        const parts = trimmed.split('-->');
        const srcRaw = parts[0].trim();
        const rest = parts[1].trim();
        const hasLabel = rest.includes(':');
        const tgtRaw = hasLabel ? rest.split(':')[0].trim() : rest;
        const label = hasLabel ? rest.split(':')[1].trim() : "";

        const currentParent = stack[stack.length - 1];
        const srcId = getOrCreateNode(srcRaw, srcRaw, 'state', currentParent);
        const tgtId = getOrCreateNode(tgtRaw, tgtRaw, 'state', currentParent);

        const edgeCount = newEdges.filter(e => 
          (e.source === srcId && e.target === tgtId) || 
          (e.source === tgtId && e.target === srcId)
        ).length;

        newEdges.push({
          id: `e-${srcId}-${tgtId}-${newEdges.length}`,
          source: srcId,
          target: tgtId,
          label,
          type: 'default', // Using default bezier for better routing in clusters
          markerEnd: { type: MarkerType.ArrowClosed, color: '#ffffff', width: 22, height: 22 },
          style: { strokeWidth: 2, stroke: '#ffffff', opacity: 0.9 },
          labelStyle: { fill: '#ffffff', fontWeight: 600, fontSize: '11px', transform: `translate(0, ${edgeCount * 20}px)` },
          labelBgStyle: { fill: '#6366f1', fillOpacity: 1 },
          labelBgPadding: [6, 4],
          labelBgBorderRadius: 4,
          labelShowBg: label ? true : false
        });
      }
    });

    const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(newNodes, newEdges);
    setNodes(layoutedNodes);
    setEdges(layoutedEdges);
  }, [setNodes, setEdges]);

  useEffect(() => {
    parseMermaid(code);
  }, []);

  const onSync = () => {
    parseMermaid(code);
  };

  return (
    <div style={{ width: '100vw', height: '100vh', display: 'flex', background: '#0f172a' }}>
      {/* Sidebar */}
      <div style={{ 
        width: '350px', 
        borderRight: '1px solid #334155', 
        display: 'flex', 
        flexDirection: 'column',
        background: '#1e293b',
        padding: '20px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '30px' }}>
          <div style={{ width: '32px', height: '32px', background: 'linear-gradient(135deg, #6366f1, #818cf8)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>M</div>
          <h1 style={{ fontSize: '18px', margin: 0, color: '#fff' }}>Visual Pro V2</h1>
        </div>

        <div style={{ fontSize: '11px', textTransform: 'uppercase', color: '#94a3b8', marginBottom: '10px', letterSpacing: '0.1em' }}>Mermaid Code</div>
        <textarea
          value={code}
          onChange={(e) => setCode(e.target.value)}
          style={{
            flex: 1,
            background: '#0b0f1a',
            border: '1px solid #334155',
            borderRadius: '12px',
            color: '#d1d5db',
            fontFamily: 'Fira Code, monospace',
            fontSize: '13px',
            padding: '15px',
            resize: 'none',
            outline: 'none',
            lineHeight: '1.6'
          }}
        />
        <button 
            onClick={onSync}
            style={{
                marginTop: '15px',
                padding: '12px',
                background: '#6366f1',
                color: '#white',
                border: 'none',
                borderRadius: '8px',
                fontWeight: 'bold',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
            }}
        >
          <Play size={16} /> Sync Canvas
        </button>
      </div>

      {/* Canvas Area */}
      <div style={{ flex: 1, position: 'relative' }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          fitView
          style={{ background: '#0f172a' }}
        >
          <Background color="#334155" variant={BackgroundVariant.Dots} gap={20} />
          <Controls />
          <MiniMap style={{ background: '#1e293b', border: '1px solid #334155' }} nodeColor="#6366f1" />
          
          <Panel position="top-right" style={{ display: 'flex', gap: '10px' }}>
             <button style={{ padding: '8px 16px', borderRadius: '8px', background: '#334155', color: '#f8fafc', border: 'none', cursor: 'pointer', fontWeight: 600 }}>Download PNG</button>
          </Panel>
        </ReactFlow>
        
        <div style={{ position: 'absolute', bottom: '12px', left: '20px', fontSize: '11px', color: '#94a3b8' }}>
          React Flow V12 | Pro Tier Ergonomics
        </div>
      </div>
    </div>
  );
}

export default function () {
  return (
    <ReactFlowProvider>
      <App />
    </ReactFlowProvider>
  );
}
