'use client';

import { useState } from 'react';
import { Play, RotateCcw, Plus, Search, Layers, BookOpen, ChevronRight, ChevronLeft, Pause } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { HNSWAlgorithm } from '@/lib/hnsw';
import { SkipListAlgorithm } from '@/lib/skiplist';
import { NSWAlgorithm } from '@/lib/nsw';
import { Point, Step } from '@/lib/types';
import { generateRandomPoint } from '@/lib/utils';
import { GraphVisualizer } from '@/components/GraphVisualizer';
import { SkipListVisualizer } from '@/components/SkipListVisualizer';
import { HNSWVisualizer } from '@/components/HNSWVisualizer';
import { StepCard } from '@/components/StepCard';

type AlgorithmType = 'skiplist' | 'nsw' | 'hnsw';
type Mode = 'insert' | 'search';

export default function Home() {
  const [algorithm, setAlgorithm] = useState<AlgorithmType>('hnsw');
  const [mode, setMode] = useState<Mode>('insert');
  
  const [skipList] = useState(() => new SkipListAlgorithm());
  const [nsw] = useState(() => new NSWAlgorithm());
  const [hnsw] = useState(() => new HNSWAlgorithm());
  
  const [steps, setSteps] = useState<Step[]>([]);
  const [currentStepIndex, setCurrentStepIndex] = useState(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [queryPoint, setQueryPoint] = useState<Point | null>(null);
  const [currentLayer, setCurrentLayer] = useState(0);
  const [showAllLayers, setShowAllLayers] = useState(false);
  const [pointCounter, setPointCounter] = useState(1);

  const getCurrentAlgorithm = () => {
    switch (algorithm) {
      case 'skiplist': return skipList;
      case 'nsw': return nsw;
      case 'hnsw': return hnsw;
    }
  };

  const handleInsert = () => {
    const algo = getCurrentAlgorithm();
    const point = generateRandomPoint(700, 500, pointCounter);
    setPointCounter(prev => prev + 1);
    
    const newSteps = algo.insert(point, true);
    setSteps(newSteps);
    setCurrentStepIndex(-1);
    setQueryPoint(null);
  };

  const handleSearch = () => {
    const algo = getCurrentAlgorithm();
    if (algo.nodes.size === 0) {
      alert('Please insert some nodes first!');
      return;
    }
    
    const query = generateRandomPoint(700, 500, -1);
    setQueryPoint(query);
    
    if (algorithm === 'skiplist') {
      const { steps: newSteps } = (algo as SkipListAlgorithm).search(query, true);
      setSteps(newSteps);
    } else {
      const { steps: newSteps } = algo.search(query, 1, true);
      setSteps(newSteps);
    }
    
    setCurrentStepIndex(-1);
  };

  const handleReset = () => {
    skipList.nodes.clear();
    skipList.head = null;
    skipList.maxLevel = 0;
    
    nsw.nodes.clear();
    nsw.entryPoint = null;
    
    hnsw.nodes.clear();
    hnsw.entryPoint = null;
    hnsw.maxLevel = 0;
    
    setSteps([]);
    setCurrentStepIndex(-1);
    setQueryPoint(null);
    setPointCounter(1);
    setCurrentLayer(0);
  };

  const handleNext = () => {
    if (currentStepIndex < steps.length - 1) {
      setCurrentStepIndex(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentStepIndex > -1) {
      setCurrentStepIndex(prev => prev - 1);
    }
  };

  const handlePlayPause = () => {
    if (isPlaying) {
      setIsPlaying(false);
    } else {
      setIsPlaying(true);
      playSteps();
    }
  };

  const playSteps = async () => {
    let index = currentStepIndex === -1 ? 0 : currentStepIndex + 1;
    
    while (index < steps.length) {
      setCurrentStepIndex(index);
      await new Promise(resolve => setTimeout(resolve, 1500));
      index++;
      
      if (!isPlaying) break;
    }
    
    setIsPlaying(false);
  };

  const getCurrentStep = () => {
    return currentStepIndex >= 0 ? steps[currentStepIndex] : undefined;
  };

  const getMaxLayer = () => {
    const algo = getCurrentAlgorithm();
    if (algorithm === 'hnsw') return (algo as HNSWAlgorithm).maxLevel;
    if (algorithm === 'skiplist') return (algo as SkipListAlgorithm).maxLevel;
    return 0;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 p-8"
      style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Cg fill-rule='evenodd'%3E%3Cg fill='%23d97706' fill-opacity='0.08'%3E%3Cpath opacity='.5' d='M96 95h4v1h-4v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h4v1h-4v9h4v1h-4v9h4v1h-4v9h4v1h-4v9h4v1h-4v9h4v1h-4v9h4v1h-4v9h4v1h-4v9zm-1 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-9-10h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm9-10v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-9-10h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm9-10v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-9-10h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm9-10v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-9-10h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9z'/%3E%3Cpath d='M6 5V0H5v5H0v1h5v94h1V6h94V5H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
      }}
    >
      <div className="max-w-[1800px] mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="flex items-center justify-center gap-3 mb-3">
            <BookOpen className="w-10 h-10 text-amber-900" />
            <h1 className="text-5xl font-bold text-amber-900" style={{ fontFamily: 'Georgia, serif' }}>
              HNSW Algorithm Visualizer
            </h1>
          </div>
          <p className="text-lg text-amber-800 italic">
            An Interactive Journey Through Proximity Search Data Structures
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
          {(['skiplist', 'nsw', 'hnsw'] as AlgorithmType[]).map((algo) => (
            <motion.button
              key={algo}
              onClick={() => {
                setAlgorithm(algo);
                setSteps([]);
                setCurrentStepIndex(-1);
                setQueryPoint(null);
              }}
              className={`p-6 rounded-xl border-4 transition-all ${
                algorithm === algo
                  ? 'bg-amber-900 text-white border-amber-900 shadow-2xl scale-105'
                  : 'bg-white text-amber-900 border-amber-300 hover:border-amber-500 hover:shadow-lg'
              }`}
              whileHover={{ scale: algorithm === algo ? 1.05 : 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <h3 className="text-2xl font-bold mb-2" style={{ fontFamily: 'Georgia, serif' }}>
                {algo === 'skiplist' ? 'Skip List' : algo === 'nsw' ? 'NSW' : 'HNSW'}
              </h3>
              <p className={`text-sm ${algorithm === algo ? 'text-amber-100' : 'text-amber-700'}`}>
                {algo === 'skiplist' && 'Probabilistic linked list with multiple levels'}
                {algo === 'nsw' && 'Navigable Small World graph structure'}
                {algo === 'hnsw' && 'Hierarchical Navigable Small World'}
              </p>
            </motion.button>
          ))}
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-6">
          <div className="bg-white rounded-xl shadow-xl border-4 border-amber-900 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-amber-900 flex items-center gap-2" style={{ fontFamily: 'Georgia, serif' }}>
                <Layers className="w-6 h-6" />
                Graph Visualization
              </h2>
              
              {algorithm !== 'nsw' && (
                <div className="flex items-center gap-2">
                  <label className="flex items-center gap-2 text-sm text-amber-900">
                    <input
                      type="checkbox"
                      checked={showAllLayers}
                      onChange={(e) => setShowAllLayers(e.target.checked)}
                      className="rounded"
                    />
                    All Layers
                  </label>
                </div>
              )}
            </div>

            {algorithm === 'skiplist' ? (
              <SkipListVisualizer
                nodes={getCurrentAlgorithm().nodes}
                currentStep={getCurrentStep()}
                queryPoint={queryPoint}
                currentLayer={currentLayer}
              />
            ) : algorithm === 'hnsw' ? (
              <HNSWVisualizer
                nodes={getCurrentAlgorithm().nodes}
                currentStep={getCurrentStep()}
                queryPoint={queryPoint}
                currentLayer={currentLayer}
                showAllLayers={showAllLayers}
              />
            ) : (
              <GraphVisualizer
                nodes={getCurrentAlgorithm().nodes}
                currentStep={getCurrentStep()}
                queryPoint={queryPoint}
                currentLayer={currentLayer}
                showAllLayers={showAllLayers}
              />
            )}

            {!showAllLayers && algorithm !== 'nsw' && getMaxLayer() > 0 && (
              <div className="mt-4 bg-amber-50 p-4 rounded-lg border-2 border-amber-200">
                <label className="block text-sm font-bold text-amber-900 mb-2">
                  Current Layer: {currentLayer}
                </label>
                <input
                  type="range"
                  min="0"
                  max={getMaxLayer()}
                  value={currentLayer}
                  onChange={(e) => setCurrentLayer(Number(e.target.value))}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-amber-700 mt-1">
                  <span>Layer 0 (Base)</span>
                  <span>Layer {getMaxLayer()} (Top)</span>
                </div>
              </div>
            )}
          </div>

          <div className="bg-white rounded-xl shadow-xl border-4 border-amber-900 p-6">
            <h2 className="text-2xl font-bold text-amber-900 mb-4" style={{ fontFamily: 'Georgia, serif' }}>
              Controls
            </h2>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => {
                    setMode('insert');
                    handleInsert();
                  }}
                  className="bg-gradient-to-r from-green-600 to-green-700 text-white px-6 py-4 rounded-lg font-bold flex items-center justify-center gap-2 hover:from-green-700 hover:to-green-800 transition-all shadow-lg hover:shadow-xl"
                >
                  <Plus className="w-5 h-5" />
                  Insert Node
                </button>

                <button
                  onClick={() => {
                    setMode('search');
                    handleSearch();
                  }}
                  className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-4 rounded-lg font-bold flex items-center justify-center gap-2 hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg hover:shadow-xl"
                >
                  <Search className="w-5 h-5" />
                  Search
                </button>

                <button
                  onClick={handleReset}
                  className="bg-gradient-to-r from-red-600 to-red-700 text-white px-6 py-4 rounded-lg font-bold flex items-center justify-center gap-2 hover:from-red-700 hover:to-red-800 transition-all shadow-lg hover:shadow-xl col-span-2"
                >
                  <RotateCcw className="w-5 h-5" />
                  Reset
                </button>
              </div>

              {steps.length > 0 && (
                <div className="bg-amber-50 p-4 rounded-lg border-2 border-amber-200">
                  <h3 className="font-bold text-amber-900 mb-3">Step Navigation</h3>
                  
                  <div className="flex items-center gap-2 mb-3">
                    <button
                      onClick={handlePrev}
                      disabled={currentStepIndex <= -1}
                      className="bg-amber-600 text-white p-2 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-amber-700 transition-all"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>

                    <button
                      onClick={handlePlayPause}
                      className="bg-amber-700 text-white px-4 py-2 rounded flex items-center gap-2 hover:bg-amber-800 transition-all flex-1 justify-center font-bold"
                    >
                      {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                      {isPlaying ? 'Pause' : 'Play'}
                    </button>

                    <button
                      onClick={handleNext}
                      disabled={currentStepIndex >= steps.length - 1}
                      className="bg-amber-600 text-white p-2 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-amber-700 transition-all"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="text-sm text-center text-amber-900 font-bold">
                    Step {currentStepIndex + 1} of {steps.length}
                  </div>

                  <div className="mt-3 bg-white p-2 rounded">
                    <input
                      type="range"
                      min="-1"
                      max={steps.length - 1}
                      value={currentStepIndex}
                      onChange={(e) => setCurrentStepIndex(Number(e.target.value))}
                      className="w-full"
                    />
                  </div>
                </div>
              )}

              <div className="bg-gradient-to-r from-amber-100 to-orange-100 p-4 rounded-lg border-2 border-amber-300">
                <h3 className="font-bold text-amber-900 mb-2">Statistics</h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="bg-white p-3 rounded shadow">
                    <div className="text-amber-700">Total Nodes</div>
                    <div className="text-2xl font-bold text-amber-900">
                      {getCurrentAlgorithm().nodes.size}
                    </div>
                  </div>
                  <div className="bg-white p-3 rounded shadow">
                    <div className="text-amber-700">Max Level</div>
                    <div className="text-2xl font-bold text-amber-900">
                      {getMaxLayer()}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-xl border-4 border-amber-900 p-6">
          <h2 className="text-2xl font-bold text-amber-900 mb-4 flex items-center gap-2" style={{ fontFamily: 'Georgia, serif' }}>
            <BookOpen className="w-6 h-6" />
            Step-by-Step Explanation
          </h2>

          <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
            <AnimatePresence>
              {steps.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-12 text-amber-700 italic"
                >
                  <p className="text-lg">Insert a node or perform a search to see the algorithm in action!</p>
                  <p className="text-sm mt-2">Each step will be explained with formulas, decisions, and calculations.</p>
                </motion.div>
              ) : currentStepIndex >= 0 ? (
                <StepCard
                  key={currentStepIndex}
                  step={steps[currentStepIndex]}
                  stepNumber={currentStepIndex + 1}
                />
              ) : (
                steps.slice(0, 3).map((step, index) => (
                  <StepCard key={index} step={step} stepNumber={index + 1} />
                ))
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
