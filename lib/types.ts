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

export interface Algorithm {
  nodes: Map<number, Node>;
  entryPoint: number | null;
  maxLevel: number;
  efConstruction: number;
  M: number;
  Ml: number;
}
