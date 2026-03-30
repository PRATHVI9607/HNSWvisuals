'use client';

import { motion } from 'framer-motion';
import { Info } from 'lucide-react';
import { Step } from '@/lib/types';

interface StepCardProps {
  step: Step;
  stepNumber: number;
}

export function StepCard({ step, stepNumber }: StepCardProps) {
  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      level_assignment: 'bg-blue-50 border-blue-200 text-blue-900',
      first_node: 'bg-green-50 border-green-200 text-green-900',
      greedy_search: 'bg-purple-50 border-purple-200 text-purple-900',
      move_closer: 'bg-orange-50 border-orange-200 text-orange-900',
      add_connection: 'bg-pink-50 border-pink-200 text-pink-900',
      select_neighbors: 'bg-indigo-50 border-indigo-200 text-indigo-900',
      start_search: 'bg-cyan-50 border-cyan-200 text-cyan-900',
      search_complete: 'bg-emerald-50 border-emerald-200 text-emerald-900',
      evaluate_neighbor: 'bg-amber-50 border-amber-200 text-amber-900',
      descend_layer: 'bg-violet-50 border-violet-200 text-violet-900',
    };
    return colors[type] || 'bg-gray-50 border-gray-200 text-gray-900';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className={`relative p-6 rounded-lg border-2 shadow-lg ${getTypeColor(step.type)} backdrop-blur-sm`}
      style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='0.02'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
      }}
    >
      <div className="absolute -top-3 -left-3 w-10 h-10 bg-gradient-to-br from-amber-400 to-amber-600 rounded-full flex items-center justify-center shadow-md font-bold text-white text-sm border-2 border-white">
        {stepNumber}
      </div>
      
      <div className="flex items-start gap-3">
        <div className="mt-1">
          <Info className="w-5 h-5 opacity-70" />
        </div>
        <div className="flex-1">
          <h3 className="font-bold text-lg mb-2">{step.description}</h3>
          <p className="text-sm opacity-80 mb-3">{step.explanation}</p>
          
          {step.formula && (
            <div className="mt-3 p-3 bg-white/60 rounded border border-current/20 font-mono text-sm backdrop-blur-sm">
              {step.formula}
            </div>
          )}
          
          {step.decision && (
            <div className="mt-3 p-3 bg-white/60 rounded border border-current/20 text-sm font-medium backdrop-blur-sm">
              <span className="font-bold">Decision:</span> {step.decision}
            </div>
          )}
          
          <div className="mt-4 flex flex-wrap gap-2 text-xs">
            {step.currentNode !== undefined && (
              <span className="px-3 py-1 bg-white/80 rounded-full font-semibold shadow-sm">
                Node: {step.currentNode}
              </span>
            )}
            {step.distance !== undefined && (
              <span className="px-3 py-1 bg-white/80 rounded-full font-semibold shadow-sm">
                Distance: {step.distance.toFixed(2)}
              </span>
            )}
            {step.layer !== undefined && (
              <span className="px-3 py-1 bg-white/80 rounded-full font-semibold shadow-sm">
                Layer: {step.layer}
              </span>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
