export interface Point {
  id: number;
  x: number;
  y: number;
  level?: number;
}

export interface Node {
  id: number;
  point: Point;
  connections: Map<number, number[]>;
  level: number;
}

export interface Step {
  type: string;
  description: string;
  explanation: string;
  currentNode?: number;
  visitedNodes?: number[];
  candidateNodes?: number[];
  highlightedEdges?: Array<[number, number]>;
  distance?: number;
  formula?: string;
  layer?: number;
  decision?: string;
}

export interface BaseAlgorithm {
  nodes: Map<number, Node>;
  maxLevel: number;
  insert(point: Point, recordSteps?: boolean): Step[];
}

export interface Algorithm extends BaseAlgorithm {
  entryPoint: number | null;
  efConstruction: number;
  M: number;
  Ml: number;
  search(query: Point, k?: number, recordSteps?: boolean): { result: Point[]; steps: Step[] };
}

