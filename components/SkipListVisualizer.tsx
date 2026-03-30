'use client';

import { motion } from 'framer-motion';
import { Node, Point, Step } from '@/lib/types';
import { useState } from 'react';

interface SkipListVisualizerProps {
  nodes: Map<number, Node>;
  currentStep?: Step;
  queryPoint?: Point;
  width?: number;
  height?: number;
  currentLayer?: number;
}

export function SkipListVisualizer({
  nodes,
  currentStep,
  queryPoint,
  width = 800,
  height = 600,
  currentLayer = 0,
}: SkipListVisualizerProps) {
  const [hoveredNode, setHoveredNode] = useState<number | null>(null);

  const sortedNodes = Array.from(nodes.values()).sort((a, b) => a.point.x - b.point.x);
  const maxLevel = Math.max(...sortedNodes.map(n => n.level), 0);
  
  const layerHeight = height / (maxLevel + 2);
  const nodeSpacing = sortedNodes.length > 0 ? (width - 100) / sortedNodes.length : 50;
  
  const getNodePosition = (node: Node, layer: number) => {
    const index = sortedNodes.findIndex(n => n.id === node.id);
    return {
      x: 50 + index * nodeSpacing,
      y: height - layerHeight * (layer + 1),
    };
  };

  const isHighlighted = (nodeId: number) => {
    if (!currentStep) return false;
    if (currentStep.currentNode === nodeId) return 'current';
    if (currentStep.candidateNodes?.includes(nodeId)) return 'candidate';
    if (currentStep.visitedNodes?.includes(nodeId)) return 'visited';
    return false;
  };

  const isEdgeHighlighted = (from: number, to: number) => {
    if (!currentStep?.highlightedEdges) return false;
    return currentStep.highlightedEdges.some(
      ([a, b]) => (a === from && b === to) || (a === to && b === from)
    );
  };

  return (
    <div className="relative rounded-xl overflow-hidden border-4 border-amber-900 shadow-2xl bg-gradient-to-br from-amber-50 to-orange-50">
      <svg width={width} height={height} className="w-full h-full">
        <defs>
          <filter id="glow-skip">
            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
          <marker id="arrowhead-skip" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
            <polygon points="0 0, 10 3, 0 6" fill="#92400e" opacity="0.6" />
          </marker>
        </defs>

        {/* Layer labels */}
        {Array.from({ length: maxLevel + 1 }, (_, i) => (
          <g key={`layer-label-${i}`}>
            <rect
              x="5"
              y={height - layerHeight * (i + 1) - 15}
              width="35"
              height="25"
              fill="#78350f"
              rx="4"
              opacity="0.8"
            />
            <text
              x="22"
              y={height - layerHeight * (i + 1)}
              textAnchor="middle"
              fill="white"
              fontSize="12"
              fontWeight="bold"
            >
              L{i}
            </text>
          </g>
        ))}

        {/* Horizontal layer lines */}
        {Array.from({ length: maxLevel + 1 }, (_, i) => (
          <line
            key={`layer-line-${i}`}
            x1="45"
            y1={height - layerHeight * (i + 1)}
            x2={width - 20}
            y2={height - layerHeight * (i + 1)}
            stroke="#d97706"
            strokeWidth="1"
            strokeDasharray="4,4"
            opacity="0.3"
          />
        ))}

        {/* Draw edges first */}
        {sortedNodes.map((node) => {
          return Array.from(node.connections.entries()).map(([layer, neighbors]) => {
            if (neighbors.length === 0) return null;
            
            const fromPos = getNodePosition(node, layer);
            const toNode = nodes.get(neighbors[0]);
            if (!toNode) return null;
            
            const toPos = getNodePosition(toNode, layer);
            const highlighted = isEdgeHighlighted(node.id, neighbors[0]);

            return (
              <motion.g key={`edge-${node.id}-${neighbors[0]}-${layer}`}>
                <motion.line
                  x1={fromPos.x + 15}
                  y1={fromPos.y}
                  x2={toPos.x - 15}
                  y2={toPos.y}
                  stroke={highlighted ? '#ef4444' : '#92400e'}
                  strokeWidth={highlighted ? 3 : 1.5}
                  strokeOpacity={highlighted ? 0.9 : 0.4}
                  markerEnd={highlighted ? 'url(#arrowhead-skip)' : undefined}
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 0.5 }}
                  filter={highlighted ? 'url(#glow-skip)' : undefined}
                />
              </motion.g>
            );
          });
        })}

        {/* Draw vertical connections showing node height */}
        {sortedNodes.map((node) => {
          if (node.level === 0) return null;
          const basePos = getNodePosition(node, 0);
          const topPos = getNodePosition(node, node.level);
          
          return (
            <line
              key={`vertical-${node.id}`}
              x1={basePos.x}
              y1={basePos.y}
              x2={topPos.x}
              y2={topPos.y}
              stroke="#d97706"
              strokeWidth="2"
              strokeDasharray="2,2"
              opacity="0.3"
            />
          );
        })}

        {/* Draw nodes */}
        {sortedNodes.map((node) => {
          return Array.from({ length: node.level + 1 }, (_, layer) => {
            const pos = getNodePosition(node, layer);
            const highlighted = isHighlighted(node.id);
            const radius = highlighted === 'current' ? 14 : 12;

            return (
              <g
                key={`node-${node.id}-${layer}`}
                onMouseEnter={() => setHoveredNode(node.id)}
                onMouseLeave={() => setHoveredNode(null)}
                style={{ cursor: 'pointer' }}
              >
                {highlighted === 'current' && (
                  <motion.circle
                    cx={pos.x}
                    cy={pos.y}
                    r={radius + 8}
                    fill="none"
                    stroke="#ef4444"
                    strokeWidth="2"
                    opacity="0.4"
                    animate={{ scale: [1, 1.2, 1], opacity: [0.4, 0.2, 0.4] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                )}

                <motion.rect
                  x={pos.x - radius}
                  y={pos.y - radius}
                  width={radius * 2}
                  height={radius * 2}
                  rx="4"
                  fill={
                    highlighted === 'current' ? '#ef4444' :
                    highlighted === 'candidate' ? '#10b981' :
                    highlighted === 'visited' ? '#f59e0b' :
                    '#3b82f6'
                  }
                  stroke="#fff"
                  strokeWidth="2"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  whileHover={{ scale: 1.2 }}
                  transition={{ type: 'spring', stiffness: 300 }}
                  filter={highlighted ? 'url(#glow-skip)' : undefined}
                />

                <text
                  x={pos.x}
                  y={pos.y}
                  textAnchor="middle"
                  dy=".3em"
                  fill="white"
                  fontSize="10"
                  fontWeight="bold"
                  pointerEvents="none"
                >
                  {node.id}
                </text>

                {(hoveredNode === node.id || highlighted) && layer === node.level && (
                  <motion.text
                    x={pos.x}
                    y={pos.y - radius - 12}
                    textAnchor="middle"
                    fill="#78350f"
                    fontSize="10"
                    fontWeight="bold"
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    Max:L{node.level}
                  </motion.text>
                )}
              </g>
            );
          });
        })}

        {/* Query point */}
        {queryPoint && (
          <g>
            <motion.circle
              cx={50 + sortedNodes.length * nodeSpacing / 2}
              cy={height - layerHeight / 2}
              r="20"
              fill="none"
              stroke="#dc2626"
              strokeWidth="2"
              strokeDasharray="5,5"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
            />
            <motion.circle
              cx={50 + sortedNodes.length * nodeSpacing / 2}
              cy={height - layerHeight / 2}
              r="10"
              fill="#dc2626"
              stroke="#fff"
              strokeWidth="2"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              filter="url(#glow-skip)"
            />
            <text
              x={50 + sortedNodes.length * nodeSpacing / 2}
              y={height - layerHeight / 2}
              textAnchor="middle"
              dy=".3em"
              fill="white"
              fontSize="12"
              fontWeight="bold"
            >
              Q
            </text>
          </g>
        )}
      </svg>

      <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-4 py-3 rounded-lg shadow-lg border-2 border-amber-900">
        <div className="text-xs font-bold text-amber-900 mb-2">Skip List Structure</div>
        <div className="space-y-1 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-blue-500 border-2 border-white"></div>
            <span>Node</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-red-500 border-2 border-white"></div>
            <span>Current</span>
          </div>
          <div className="text-amber-700 mt-2">L0 = Base Layer</div>
          <div className="text-amber-700">L{maxLevel} = Top Layer</div>
        </div>
      </div>
    </div>
  );
}
