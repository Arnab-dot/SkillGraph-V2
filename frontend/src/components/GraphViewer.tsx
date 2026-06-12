import { useMemo, useEffect } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
} from '@xyflow/react';
import type { Node, Edge } from '@xyflow/react';
import '@xyflow/react/dist/style.css';

interface GraphNode {
  id: string;
  label: string;
  frequency: number;
  degree: number;
  community: number;
  degree_centrality: number;
}

interface GraphEdge {
  source: string;
  target: string;
  weight: number;
}

interface GraphViewerProps {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

const COMMUNITY_COLORS = [
  '#6366f1', '#22d3ee', '#34d399', '#fbbf24', '#f43f5e',
  '#a855f7', '#ec4899', '#14b8a6', '#f97316', '#818cf8',
];

export default function GraphViewer({ nodes: graphNodes, edges: graphEdges }: GraphViewerProps) {
  const rfNodes: Node[] = useMemo(() => {
    if (!graphNodes?.length) return [];
    const maxDeg = Math.max(...graphNodes.map(n => n.degree), 1);
    const cols = Math.ceil(Math.sqrt(graphNodes.length));

    return graphNodes.slice(0, 80).map((node, i) => {
      const size = 30 + (node.degree / maxDeg) * 50;
      const col = i % cols;
      const row = Math.floor(i / cols);
      const color = COMMUNITY_COLORS[node.community % COMMUNITY_COLORS.length];

      return {
        id: node.id,
        position: {
          x: 100 + col * 180 + (Math.random() - 0.5) * 60,
          y: 100 + row * 140 + (Math.random() - 0.5) * 60,
        },
        data: { label: node.label },
        style: {
          background: color,
          color: 'white',
          border: `2px solid ${color}`,
          borderRadius: '50%',
          width: size,
          height: size,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: Math.max(8, 10 + (node.degree / maxDeg) * 4),
          fontWeight: 600,
          boxShadow: `0 0 ${10 + (node.degree / maxDeg) * 15}px ${color}40`,
          padding: '4px',
          textAlign: 'center' as const,
          lineHeight: '1.1',
          overflow: 'hidden',
        },
      };
    });
  }, [graphNodes]);

  const rfEdges: Edge[] = useMemo(() => {
    if (!graphEdges?.length || !rfNodes.length) return [];
    const nodeIds = new Set(rfNodes.map(n => n.id));
    const maxWeight = Math.max(...graphEdges.map(e => e.weight), 1);

    return graphEdges
      .filter(e => nodeIds.has(e.source) && nodeIds.has(e.target))
      .slice(0, 200)
      .map((edge, i) => ({
        id: `e-${i}`,
        source: edge.source,
        target: edge.target,
        style: {
          stroke: 'rgba(99, 102, 241, 0.2)',
          strokeWidth: 1 + (edge.weight / maxWeight) * 3,
        },
        animated: edge.weight / maxWeight > 0.5,
      }));
  }, [graphEdges, rfNodes]);

  const [nodes, setNodes, onNodesChange] = useNodesState(rfNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(rfEdges);

  useEffect(() => {
    setNodes(rfNodes);
  }, [rfNodes, setNodes]);

  useEffect(() => {
    setEdges(rfEdges);
  }, [rfEdges, setEdges]);

  if (!graphNodes?.length) {
    return <p style={{ color: 'var(--text-muted)', padding: '2rem' }}>No graph data available. Run the ML pipeline first.</p>;
  }

  return (
    <div style={{
      height: '600px',
      background: 'var(--bg-card)',
      border: '1px solid var(--border-color)',
      borderRadius: 'var(--radius-md)',
      overflow: 'hidden',
    }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        fitView
        minZoom={0.3}
        maxZoom={2}
      >
        <Background color="rgba(99, 102, 241, 0.05)" gap={20} />
        <Controls style={{ borderRadius: '8px', border: '1px solid var(--border-color)' }} />
        <MiniMap
          nodeColor={(n) => n.style?.background as string || '#6366f1'}
          maskColor="rgba(10, 10, 15, 0.8)"
          style={{ borderRadius: '8px', border: '1px solid var(--border-color)' }}
        />
      </ReactFlow>
    </div>
  );
}
