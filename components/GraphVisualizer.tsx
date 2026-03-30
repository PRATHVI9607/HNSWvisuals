'use client';

import { motion } from 'framer-motion';
import { Node, Point, Step } from '@/lib/types';
import { useState, useEffect } from 'react';

interface GraphVisualizerProps {
  nodes: Map<number, Node>;
  currentStep?: Step;
  queryPoint?: Point | null;
  width?: number;
  height?: number;
  currentLayer?: number;
  showAllLayers?: boolean;
}

export function GraphVisualizer({
  nodes,
  currentStep,
  queryPoint,
  width = 800,
  height = 600,
  currentLayer = 0,
  showAllLayers = false,
}: GraphVisualizerProps) {
  const [hoveredNode, setHoveredNode] = useState<number | null>(null);

  const isNodeVisible = (node: Node) => {
    if (showAllLayers) return true;
    return node.level >= currentLayer;
  };

  const isEdgeVisible = (node: Node, neighborId: number, layer: number) => {
    if (showAllLayers) return layer === currentLayer;
    const neighbor = nodes.get(neighborId);
    if (!neighbor) return false;
    return layer === currentLayer && isNodeVisible(node) && isNodeVisible(neighbor);
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

  const getNodeColor = (nodeId: number, node: Node) => {
    const highlighted = isHighlighted(nodeId);
    if (highlighted === 'current') return '#ef4444';
    if (highlighted === 'candidate') return '#10b981';
    if (highlighted === 'visited') return '#f59e0b';
    
    const levelColors = ['#3b82f6', '#8b5cf6', '#ec4899', '#f97316', '#14b8a6'];
    return levelColors[node.level % levelColors.length];
  };

  return (
    <div className="relative rounded-xl overflow-hidden border-4 border-amber-900 shadow-2xl bg-gradient-to-br from-amber-50 to-orange-50"
      style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z' fill='%23d97706' fill-opacity='0.05' fill-rule='evenodd'/%3E%3C/svg%3E")`
      }}
    >
      <svg width={width} height={height} className="w-full h-full">
        <defs>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
          
          <marker
            id="arrowhead"
            markerWidth="10"
            markerHeight="10"
            refX="9"
            refY="3"
            orient="auto"
          >
            <polygon points="0 0, 10 3, 0 6" fill="#92400e" opacity="0.6" />
          </marker>
        </defs>

        {Array.from(nodes.values()).map((node) => {
          if (!isNodeVisible(node)) return null;
          
          return (
            <g key={`edges-${node.id}`}>
              {Array.from(node.connections.entries()).map(([layer, neighbors]) => {
                if (!isEdgeVisible(node, neighbors[0], layer)) return null;
                
                return neighbors.map((neighborId) => {
                  const neighbor = nodes.get(neighborId);
                  if (!neighbor || !isNodeVisible(neighbor)) return null;

                  const highlighted = isEdgeHighlighted(node.id, neighborId);

                  return (
                    <motion.line
                      key={`edge-${node.id}-${neighborId}-${layer}`}
                      x1={node.point.x}
                      y1={node.point.y}
                      x2={neighbor.point.x}
                      y2={neighbor.point.y}
                      stroke={highlighted ? '#ef4444' : '#92400e'}
                      strokeWidth={highlighted ? 3 : 1.5}
                      strokeOpacity={highlighted ? 0.9 : 0.3}
                      markerEnd={highlighted ? 'url(#arrowhead)' : undefined}
                      initial={{ pathLength: 0, opacity: 0 }}
                      animate={{ pathLength: 1, opacity: highlighted ? 0.9 : 0.3 }}
                      transition={{ duration: 0.5 }}
                      filter={highlighted ? 'url(#glow)' : undefined}
                    />
                  );
                });
              })}
            </g>
          );
        })}

        {Array.from(nodes.values()).map((node) => {
          if (!isNodeVisible(node)) return null;
          
          const highlighted = isHighlighted(node.id);
          const baseRadius = 8;
          const radius = highlighted === 'current' ? baseRadius * 1.8 : baseRadius * 1.2;

          return (
            <g
              key={`node-${node.id}`}
              onMouseEnter={() => setHoveredNode(node.id)}
              onMouseLeave={() => setHoveredNode(null)}
              style={{ cursor: 'pointer' }}
            >
              {highlighted === 'current' && (
                <motion.circle
                  cx={node.point.x}
                  cy={node.point.y}
                  r={radius + 8}
                  fill="none"
                  stroke="#ef4444"
                  strokeWidth="2"
                  opacity="0.4"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: [1, 1.2, 1], opacity: [0.4, 0.2, 0.4] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              )}

              <motion.circle
                cx={node.point.x}
                cy={node.point.y}
                r={radius}
                fill={getNodeColor(node.id, node)}
                stroke="#fff"
                strokeWidth="3"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                whileHover={{ scale: 1.3 }}
                transition={{ type: 'spring', stiffness: 300 }}
                filter={highlighted ? 'url(#glow)' : undefined}
                style={{ 
                  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                }}
              />

              <text
                x={node.point.x}
                y={node.point.y}
                textAnchor="middle"
                dy=".3em"
                fill="white"
                fontSize="11"
                fontWeight="bold"
                pointerEvents="none"
              >
                {node.id}
              </text>

              {(hoveredNode === node.id || highlighted) && (
                <motion.text
                  x={node.point.x}
                  y={node.point.y - radius - 8}
                  textAnchor="middle"
                  fill="#78350f"
                  fontSize="10"
                  fontWeight="bold"
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  L{node.level}
                </motion.text>
              )}
            </g>
          );
        })}

        {queryPoint && (
          <g>
            <motion.circle
              cx={queryPoint.x}
              cy={queryPoint.y}
              r="20"
              fill="none"
              stroke="#dc2626"
              strokeWidth="2"
              strokeDasharray="5,5"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring' }}
            />
            <motion.circle
              cx={queryPoint.x}
              cy={queryPoint.y}
              r="10"
              fill="#dc2626"
              stroke="#fff"
              strokeWidth="2"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', delay: 0.1 }}
              filter="url(#glow)"
            />
            <text
              x={queryPoint.x}
              y={queryPoint.y}
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
        <div className="text-xs font-bold text-amber-900 mb-2">Legend</div>
        <div className="space-y-1 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-red-500 border-2 border-white"></div>
            <span>Current Node</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-green-500 border-2 border-white"></div>
            <span>Candidate</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-orange-500 border-2 border-white"></div>
            <span>Visited</span>
          </div>
          {queryPoint && (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-red-600 border-2 border-white"></div>
              <span>Query Point</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
