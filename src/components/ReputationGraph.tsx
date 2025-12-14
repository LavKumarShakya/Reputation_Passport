import { useRef, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { graphNodes, graphEdges, GraphNode } from '@/lib/mockData';
import { cn } from '@/lib/utils';

interface ReputationGraphProps {
  mode?: 'force' | 'radial';
}

export function ReputationGraph({ mode = 'force' }: ReputationGraphProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [nodes, setNodes] = useState<(GraphNode & { x: number; y: number })[]>([]);

  useEffect(() => {
    // Simple force-directed layout simulation
    const width = 800;
    const height = 500;
    const centerX = width / 2;
    const centerY = height / 2;

    const positioned = graphNodes.map((node, i) => {
      if (node.id === 'center') {
        return { ...node, x: centerX, y: centerY };
      }
      
      // Position nodes in a circle around center
      const angle = (i / (graphNodes.length - 1)) * 2 * Math.PI;
      const radius = 150 + Math.random() * 50;
      
      return {
        ...node,
        x: centerX + Math.cos(angle) * radius,
        y: centerY + Math.sin(angle) * radius,
      };
    });

    setNodes(positioned);
  }, [mode]);

  const nodeColors: Record<string, string> = {
    certificate: '#22C55E',
    project: '#8B5CF6',
    hackathon: '#F59E0B',
    endorsement: '#EC4899',
    skill: '#3B82F6',
  };

  const getNodeById = (id: string) => nodes.find(n => n.id === id);

  return (
    <div className="relative">
      {/* Filters */}
      <div className="mb-4 flex gap-2">
        {['All', 'Certificates', 'Projects', 'Hackathons', 'Skills'].map(filter => (
          <button
            key={filter}
            className="rounded-full bg-secondary px-3 py-1 text-sm font-medium text-secondary-foreground transition-colors hover:bg-primary hover:text-primary-foreground"
          >
            {filter}
          </button>
        ))}
      </div>

      <div className="overflow-hidden rounded-2xl border border-border bg-card/50">
        <svg
          ref={svgRef}
          viewBox="0 0 800 500"
          className="h-[500px] w-full"
        >
          {/* Background gradient */}
          <defs>
            <radialGradient id="bgGradient" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="hsl(var(--primary) / 0.1)" />
              <stop offset="100%" stopColor="transparent" />
            </radialGradient>
            
            {/* Glow filter */}
            <filter id="glow">
              <feGaussianBlur stdDeviation="3" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          <rect width="800" height="500" fill="url(#bgGradient)" />

          {/* Edges */}
          {graphEdges.map((edge, i) => {
            const source = getNodeById(edge.source);
            const target = getNodeById(edge.target);
            if (!source || !target) return null;

            return (
              <motion.line
                key={i}
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 0.3 }}
                transition={{ duration: 1, delay: i * 0.05 }}
                x1={source.x}
                y1={source.y}
                x2={target.x}
                y2={target.y}
                stroke="hsl(var(--muted-foreground))"
                strokeWidth={edge.weight * 0.5}
                strokeOpacity={hoveredNode === edge.source || hoveredNode === edge.target ? 0.8 : 0.2}
              />
            );
          })}

          {/* Nodes */}
          {nodes.map((node, i) => (
            <motion.g
              key={node.id}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ 
                type: "spring",
                stiffness: 300,
                damping: 20,
                delay: i * 0.1 
              }}
              onMouseEnter={() => setHoveredNode(node.id)}
              onMouseLeave={() => setHoveredNode(null)}
              onClick={() => setSelectedNode(node)}
              className="cursor-pointer"
            >
              {/* Node glow */}
              <circle
                cx={node.x}
                cy={node.y}
                r={node.value / 3 + 10}
                fill={nodeColors[node.type]}
                opacity={hoveredNode === node.id ? 0.4 : 0.2}
                filter="url(#glow)"
              />
              
              {/* Node circle */}
              <circle
                cx={node.x}
                cy={node.y}
                r={node.value / 4}
                fill={nodeColors[node.type]}
                stroke="white"
                strokeWidth={2}
                className="transition-all duration-200"
                style={{
                  transform: hoveredNode === node.id ? 'scale(1.2)' : 'scale(1)',
                  transformOrigin: `${node.x}px ${node.y}px`,
                }}
              />

              {/* Node label */}
              <text
                x={node.x}
                y={node.y + node.value / 4 + 20}
                textAnchor="middle"
                className="fill-foreground text-xs font-medium"
                opacity={hoveredNode === node.id || node.id === 'center' ? 1 : 0.6}
              >
                {node.label}
              </text>
            </motion.g>
          ))}
        </svg>
      </div>

      {/* Selected node tooltip */}
      {selectedNode && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute right-4 top-4 w-64 rounded-xl glass-strong p-4"
        >
          <div className="mb-2 flex items-center gap-2">
            <div 
              className="h-3 w-3 rounded-full" 
              style={{ backgroundColor: nodeColors[selectedNode.type] }}
            />
            <span className="text-xs font-medium uppercase text-muted-foreground">
              {selectedNode.type}
            </span>
          </div>
          <h4 className="font-heading text-lg font-semibold">{selectedNode.label}</h4>
          <p className="mt-1 text-sm text-muted-foreground">
            Value: {selectedNode.value}
          </p>
          <button 
            onClick={() => setSelectedNode(null)}
            className="mt-3 text-xs text-primary hover:underline"
          >
            Close
          </button>
        </motion.div>
      )}

      {/* Legend */}
      <div className="mt-4 flex flex-wrap gap-4">
        {Object.entries(nodeColors).map(([type, color]) => (
          <div key={type} className="flex items-center gap-2">
            <div 
              className="h-3 w-3 rounded-full"
              style={{ backgroundColor: color }}
            />
            <span className="text-sm capitalize text-muted-foreground">{type}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
