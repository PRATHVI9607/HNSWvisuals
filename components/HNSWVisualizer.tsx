'use client';

import { motion } from 'framer-motion';
import { Node, Point, Step } from '@/lib/types';
import { useState, useMemo } from 'react';

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
  const layerSpacing = height / (maxLevel + 2);
  
  // Use actual node coordinates for positioning within each layer
  const getNodePosition = (node: Node, displayLayer: number) => {
    // Get all nodes visible at this layer
    const nodesAtLayer = Array.from(nodes.values()).filter(n => n.level >= displayLayer);
    
    // Calculate bounds for scaling
    const xCoords = nodesAtLayer.map(n => n.point.x);
    const yCoords = nodesAtLayer.map(n => n.point.y);
    const minX = Math.min(...xCoords);
    const maxX = Math.max(...xCoords);
    const minY = Math.min(...yCoords);
    const maxY = Math.max(...yCoords);
    
    // Add padding
    const padding = 80;
    const rangeX = maxX - minX || 1;
    const rangeY = maxY - minY || 1;
    
    // Scale to fit with 3D perspective (higher layers appear smaller)
    const layerDepth = (maxLevel - displayLayer) / (maxLevel + 1);
    const scale = 0.7 + (layerDepth * 0.3); // Higher layers are 70-100% size
    
    // Map node coordinates to screen space
    const scaledWidth = (width - padding * 2) * scale;
    const scaledHeight = (layerSpacing * 0.8) * scale;
    
    const x = padding + (width - padding * 2 - scaledWidth) / 2 + 
              ((node.point.x - minX) / rangeX) * scaledWidth;
    const y = layerSpacing * (maxLevel - displayLayer + 0.5);
    
    return { x, y };
  };

  const isNodeVisibleAtLayer = (node: Node, layer: number) => {
    return node.level >= layer;
  };

  const isHighlighted = (nodeId: number): false | 'current' | 'candidate' | 'visited' => {
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
    <div className="relative rounded-xl overflow-visible border-4 border-amber-900 shadow-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <svg width={width} height={height} className="w-full h-full" style={{ overflow: 'visible' }}>
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
          
          {/* 3D shadow filters */}
          <filter id="shadow-3d" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceAlpha" stdDeviation="3"/>
            <feOffset dx="2" dy="4" result="offsetblur"/>
            <feComponentTransfer>
              <feFuncA type="linear" slope="0.5"/>
            </feComponentTransfer>
            <feMerge>
              <feMergeNode/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>

        {/* Layer backgrounds with 3D effect */}
        {layers.map((layer) => {
          const layerY = layerSpacing * (maxLevel - layer + 0.5);
          const layerDepth = (maxLevel - layer) / (maxLevel + 1);
          const layerScale = 0.7 + (layerDepth * 0.3);
          const layerWidth = width * layerScale;
          const layerX = (width - layerWidth) / 2;
          
          const gradientColors = [
            ['#1e3a8a', '#1e40af'], // Deep blue
            ['#581c87', '#6b21a8'], // Deep purple
            ['#831843', '#9f1239'], // Deep rose
            ['#7c2d12', '#92400e'], // Deep orange
            ['#115e59', '#134e4a'], // Deep teal
          ];
          const [color1, color2] = gradientColors[layer % gradientColors.length];
          
          return (
            <g key={`layer-bg-${layer}`}>
              {/* 3D Platform effect */}
              <defs>
                <linearGradient id={`layerGrad-${layer}`} x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor={color1} stopOpacity="0.15" />
                  <stop offset="100%" stopColor={color2} stopOpacity="0.05" />
                </linearGradient>
                <radialGradient id={`layerRadial-${layer}`} cx="50%" cy="50%">
                  <stop offset="0%" stopColor={color1} stopOpacity="0.2" />
                  <stop offset="100%" stopColor={color2} stopOpacity="0.05" />
                </radialGradient>
              </defs>
              
              {/* Platform base */}
              <rect
                x={layerX}
                y={layerY - layerSpacing * 0.35}
                width={layerWidth}
                height={layerSpacing * 0.7}
                fill={`url(#layerGrad-${layer})`}
                rx="15"
                stroke={color1}
                strokeWidth="2"
                strokeOpacity="0.3"
                filter="url(#shadow-3d)"
              />
              
              {/* Grid pattern for depth */}
              <g opacity="0.1">
                {Array.from({ length: 5 }, (_, i) => (
                  <line
                    key={`grid-h-${i}`}
                    x1={layerX}
                    y1={layerY - layerSpacing * 0.3 + (i * layerSpacing * 0.15)}
                    x2={layerX + layerWidth}
                    y2={layerY - layerSpacing * 0.3 + (i * layerSpacing * 0.15)}
                    stroke="#94a3b8"
                    strokeWidth="1"
                  />
                ))}
                {Array.from({ length: 8 }, (_, i) => (
                  <line
                    key={`grid-v-${i}`}
                    x1={layerX + (i * layerWidth / 7)}
                    y1={layerY - layerSpacing * 0.35}
                    x2={layerX + (i * layerWidth / 7)}
                    y2={layerY + layerSpacing * 0.35}
                    stroke="#94a3b8"
                    strokeWidth="1"
                  />
                ))}
              </g>
              
              {/* Layer label with glow */}
              <text
                x={layerX + 30}
                y={layerY - layerSpacing * 0.25}
                fill="#e2e8f0"
                fontSize="18"
                fontWeight="bold"
                filter="url(#glow-hnsw)"
              >
                LAYER {layer}
              </text>
              
              {/* Node count badge */}
              <g>
                <rect
                  x={layerX + layerWidth - 100}
                  y={layerY - layerSpacing * 0.3}
                  width="70"
                  height="25"
                  fill={color1}
                  fillOpacity="0.3"
                  rx="12"
                  stroke={color1}
                  strokeWidth="1"
                />
                <text
                  x={layerX + layerWidth - 65}
                  y={layerY - layerSpacing * 0.3 + 17}
                  fill="#cbd5e1"
                  fontSize="12"
                  fontWeight="600"
                  textAnchor="middle"
                >
                  {Array.from(nodes.values()).filter(n => n.level >= layer).length} nodes
                </text>
              </g>
            </g>
          );
        })}

        {/* Draw edges with depth-based opacity */}
        {layers.map((displayLayer) => {
          return Array.from(nodes.values()).map((node) => {
            if (!isNodeVisibleAtLayer(node, displayLayer)) return null;
            
            const neighbors = node.connections.get(displayLayer) || [];
            const fromPos = getNodePosition(node, displayLayer);
            const layerDepth = (maxLevel - displayLayer) / (maxLevel + 1);

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
                  strokeWidth={highlighted ? 3 : (2 * (0.7 + layerDepth * 0.3))}
                  strokeOpacity={highlighted ? 0.9 : (0.4 + layerDepth * 0.2)}
                  markerEnd={highlighted ? 'url(#arrowhead-hnsw)' : undefined}
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: highlighted ? 0.9 : (0.4 + layerDepth * 0.2) }}
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
                stroke="#64748b"
                strokeWidth="2"
                strokeDasharray="5,5"
                opacity="0.25"
              />
            );
          });
        })}

        {/* Draw nodes with 3D effect */}
        {layers.map((displayLayer) => {
          return Array.from(nodes.values()).map((node) => {
            if (!isNodeVisibleAtLayer(node, displayLayer)) return null;
            
            const pos = getNodePosition(node, displayLayer);
            const highlightStatus = isHighlighted(node.id);
            const highlighted = (highlightStatus && (!currentStep?.layer || currentStep.layer === displayLayer)) ? highlightStatus : false;
            const layerDepth = (maxLevel - displayLayer) / (maxLevel + 1);
            const baseRadius = 10 + (layerDepth * 4); // Nodes on higher layers appear larger (perspective)
            const radius = highlighted === 'current' ? baseRadius + 4 : baseRadius;
            
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
                    r={radius + 12}
                    fill="none"
                    stroke="#ef4444"
                    strokeWidth="3"
                    opacity="0.4"
                    animate={{ scale: [1, 1.3, 1], opacity: [0.4, 0.1, 0.4] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                )}

                {/* 3D shadow effect */}
                <ellipse
                  cx={pos.x + 1}
                  cy={pos.y + 3}
                  rx={radius}
                  ry={radius * 0.5}
                  fill="#000"
                  opacity="0.3"
                />

                <motion.circle
                  cx={pos.x}
                  cy={pos.y}
                  r={radius}
                  fill={nodeColor}
                  stroke="#fff"
                  strokeWidth="3"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  whileHover={{ scale: 1.4 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 15 }}
                  filter={highlighted ? 'url(#glow-hnsw)' : 'url(#shadow-3d)'}
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
