'use client';

import { motion } from 'framer-motion';
import { Node, Point, Step } from '@/lib/types';
import { useState } from 'react';

interface HNSWVisualizerProps {
  nodes: Map<number, Node>;
  currentStep?: Step;
  queryPoint?: Point | null;
  width?: number;
  height?: number;
  currentLayer?: number;
  showAllLayers?: boolean;
}

export function HNSWVisualizer({
  nodes,
  currentStep,
  queryPoint,
  width = 800,
  height = 600,
  currentLayer = 0,
  showAllLayers = false,
}: HNSWVisualizerProps) {
  const [hoveredNode, setHoveredNode] = useState<number | null>(null);

  const maxLevel = Math.max(...Array.from(nodes.values()).map(n => n.level), 0);
  const layerHeight = height / (maxLevel + 2);
  
  const getNodePosition = (node: Node, displayLayer: number) => {
    // Position nodes in a circle at each layer
    const nodesAtLayer = Array.from(nodes.values()).filter(n => n.level >= displayLayer);
    const index = nodesAtLayer.findIndex(n => n.id === node.id);
    const total = nodesAtLayer.length;
    
    if (total === 0) return { x: width / 2, y: layerHeight * (maxLevel - displayLayer + 1) };
    
    const angle = (index / total) * 2 * Math.PI - Math.PI / 2;
    const radius = Math.min(width, width) * 0.35;
    
    return {
      x: width / 2 + Math.cos(angle) * radius,
      y: layerHeight * (maxLevel - displayLayer + 1),
    };
  };

  const isNodeVisibleAtLayer = (node: Node, layer: number) => {
    return node.level >= layer;
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

  const layers = showAllLayers 
    ? Array.from({ length: maxLevel + 1 }, (_, i) => i)
    : [currentLayer];

  return (
    <div className="relative rounded-xl overflow-hidden border-4 border-amber-900 shadow-2xl bg-gradient-to-br from-slate-900 to-slate-800">
      <svg width={width} height={height} className="w-full h-full">
        <defs>
          <filter id="glow-hnsw">
            <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
          <marker id="arrowhead-hnsw" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
            <polygon points="0 0, 10 3, 0 6" fill="#94a3b8" />
          </marker>
        </defs>

        {/* Layer backgrounds */}
        {layers.map((layer) => {
          const layerY = layerHeight * (maxLevel - layer + 0.5);
          const layerColor = ['#1e293b', '#334155', '#475569', '#64748b', '#94a3b8'][layer % 5];
          
          return (
            <g key={`layer-bg-${layer}`}>
              <rect
                x="0"
                y={layerY - layerHeight / 2}
                width={width}
                height={layerHeight}
                fill={layerColor}
                opacity="0.1"
              />
              <text
                x="20"
                y={layerY}
                fill="#94a3b8"
                fontSize="14"
                fontWeight="bold"
              >
                LAYER {layer}
              </text>
              <line
                x1="0"
                y1={layerY + layerHeight / 2}
                x2={width}
                y2={layerY + layerHeight / 2}
                stroke="#475569"
                strokeWidth="2"
                strokeDasharray="5,5"
                opacity="0.3"
              />
            </g>
          );
        })}

        {/* Draw edges */}
        {layers.map((displayLayer) => {
          return Array.from(nodes.values()).map((node) => {
            if (!isNodeVisibleAtLayer(node, displayLayer)) return null;
            
            const neighbors = node.connections.get(displayLayer) || [];
            const fromPos = getNodePosition(node, displayLayer);

            return neighbors.map((neighborId) => {
              const neighbor = nodes.get(neighborId);
              if (!neighbor || !isNodeVisibleAtLayer(neighbor, displayLayer)) return null;

              const toPos = getNodePosition(neighbor, displayLayer);
              const highlighted = isEdgeHighlighted(node.id, neighborId) && 
                                 currentStep?.layer === displayLayer;

              return (
                <motion.line
                  key={`edge-${node.id}-${neighborId}-${displayLayer}`}
                  x1={fromPos.x}
                  y1={fromPos.y}
                  x2={toPos.x}
                  y2={toPos.y}
                  stroke={highlighted ? '#ef4444' : '#64748b'}
                  strokeWidth={highlighted ? 3 : 1.5}
                  strokeOpacity={highlighted ? 0.9 : 0.3}
                  markerEnd={highlighted ? 'url(#arrowhead-hnsw)' : undefined}
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 0.5 }}
                  filter={highlighted ? 'url(#glow-hnsw)' : undefined}
                />
              );
            });
          });
        })}

        {/* Draw vertical connections between layers */}
        {showAllLayers && Array.from(nodes.values()).map((node) => {
          return Array.from({ length: node.level }, (_, i) => {
            const fromPos = getNodePosition(node, i);
            const toPos = getNodePosition(node, i + 1);
            
            return (
              <line
                key={`vertical-${node.id}-${i}`}
                x1={fromPos.x}
                y1={fromPos.y}
                x2={toPos.x}
                y2={toPos.y}
                stroke="#475569"
                strokeWidth="1"
                strokeDasharray="3,3"
                opacity="0.2"
              />
            );
          });
        })}

        {/* Draw nodes */}
        {layers.map((displayLayer) => {
          return Array.from(nodes.values()).map((node) => {
            if (!isNodeVisibleAtLayer(node, displayLayer)) return null;
            
            const pos = getNodePosition(node, displayLayer);
            const highlightStatus = isHighlighted(node.id);
            const highlighted = (highlightStatus && (!currentStep?.layer || currentStep.layer === displayLayer)) ? highlightStatus : false;
            const radius = highlighted === 'current' ? 16 : 12;
            
            const levelColors = ['#3b82f6', '#8b5cf6', '#ec4899', '#f97316', '#14b8a6'];
            const nodeColor = 
              highlighted === 'current' ? '#ef4444' :
              highlighted === 'candidate' ? '#10b981' :
              highlighted === 'visited' ? '#f59e0b' :
              levelColors[node.level % levelColors.length];

            return (
              <g
                key={`node-${node.id}-${displayLayer}`}
                onMouseEnter={() => setHoveredNode(node.id)}
                onMouseLeave={() => setHoveredNode(null)}
                style={{ cursor: 'pointer' }}
              >
                {highlighted === 'current' && (
                  <motion.circle
                    cx={pos.x}
                    cy={pos.y}
                    r={radius + 10}
                    fill="none"
                    stroke="#ef4444"
                    strokeWidth="3"
                    opacity="0.4"
                    animate={{ scale: [1, 1.3, 1], opacity: [0.4, 0.1, 0.4] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                )}

                <motion.circle
                  cx={pos.x}
                  cy={pos.y}
                  r={radius}
                  fill={nodeColor}
                  stroke="#fff"
                  strokeWidth="3"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  whileHover={{ scale: 1.3 }}
                  transition={{ type: 'spring', stiffness: 300 }}
                  filter={highlighted ? 'url(#glow-hnsw)' : undefined}
                />

                <text
                  x={pos.x}
                  y={pos.y}
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
                    x={pos.x}
                    y={pos.y - radius - 12}
                    textAnchor="middle"
                    fill="#94a3b8"
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
          });
        })}

        {/* Query point */}
        {queryPoint && (
          <g>
            <motion.circle
              cx={width / 2}
              cy={height - 50}
              r="25"
              fill="none"
              stroke="#dc2626"
              strokeWidth="3"
              strokeDasharray="5,5"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
            />
            <motion.circle
              cx={width / 2}
              cy={height - 50}
              r="12"
              fill="#dc2626"
              stroke="#fff"
              strokeWidth="3"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              filter="url(#glow-hnsw)"
            />
            <text
              x={width / 2}
              y={height - 50}
              textAnchor="middle"
              dy=".3em"
              fill="white"
              fontSize="14"
              fontWeight="bold"
            >
              Q
            </text>
          </g>
        )}
      </svg>

      <div className="absolute top-4 right-4 bg-slate-800/90 backdrop-blur-sm px-4 py-3 rounded-lg shadow-lg border-2 border-slate-600">
        <div className="text-xs font-bold text-slate-200 mb-2">HNSW Hierarchy</div>
        <div className="space-y-1 text-xs text-slate-300">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-red-500 border-2 border-white"></div>
            <span>Current</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-green-500 border-2 border-white"></div>
            <span>Candidate</span>
          </div>
          <div className="mt-2 text-slate-400">Top → Bottom Search</div>
          <div className="text-slate-400">L{maxLevel} → L0</div>
        </div>
      </div>
    </div>
  );
}
