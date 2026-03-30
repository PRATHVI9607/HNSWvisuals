import { Point, Node, Step, Algorithm } from './types';
import { euclideanDistance, randomLevel } from './utils';

export class HNSWAlgorithm implements Algorithm {
  nodes: Map<number, Node> = new Map();
  entryPoint: number | null = null;
  maxLevel: number = 0;
  efConstruction: number = 200;
  M: number = 16;
  Ml: number = 1 / Math.log(2);

  insert(point: Point, recordSteps: boolean = true): Step[] {
    const steps: Step[] = [];
    const level = randomLevel(this.Ml);
    point.level = level;

    if (recordSteps) {
      steps.push({
        type: 'level_assignment',
        description: `Assigning level to new point ${point.id}`,
        explanation: `Using exponential decay: level = floor(-log(random()) * Ml)`,
        formula: `level = floor(-log(${Math.random().toFixed(3)}) * ${this.Ml.toFixed(3)}) = ${level}`,
        currentNode: point.id,
        decision: `Point will be inserted at level ${level}`,
      });
    }

    const newNode: Node = {
      id: point.id,
      point,
      connections: new Map(),
      level,
    };

    for (let l = 0; l <= level; l++) {
      newNode.connections.set(l, []);
    }

    if (this.entryPoint === null) {
      this.nodes.set(point.id, newNode);
      this.entryPoint = point.id;
      this.maxLevel = level;
      if (recordSteps) {
        steps.push({
          type: 'first_node',
          description: 'First node inserted',
          explanation: 'This is the first node, setting it as entry point',
          currentNode: point.id,
        });
      }
      return steps;
    }

    this.nodes.set(point.id, newNode);

    let currentNode = this.entryPoint;
    const visitedNodes: number[] = [];

    for (let lc = this.maxLevel; lc > level; lc--) {
      if (recordSteps) {
        steps.push({
          type: 'greedy_search',
          description: `Greedy search at layer ${lc}`,
          explanation: `Navigating through layer ${lc} to find entry point for level ${level}`,
          currentNode,
          layer: lc,
          visitedNodes: [...visitedNodes],
        });
      }

      let changed = true;
      while (changed) {
        changed = false;
        const currentNodeObj = this.nodes.get(currentNode)!;
        const neighbors = currentNodeObj.connections.get(lc) || [];
        const currentDist = euclideanDistance(this.nodes.get(currentNode)!.point, point);

        for (const neighborId of neighbors) {
          const neighbor = this.nodes.get(neighborId)!;
          const neighborDist = euclideanDistance(neighbor.point, point);

          if (neighborDist < currentDist) {
            currentNode = neighborId;
            visitedNodes.push(neighborId);
            changed = true;
            if (recordSteps) {
              steps.push({
                type: 'move_closer',
                description: `Moving to closer node ${neighborId}`,
                explanation: `Found neighbor with smaller distance`,
                formula: `dist(${neighborId}) = ${neighborDist.toFixed(2)} < dist(${currentNodeObj.id}) = ${currentDist.toFixed(2)}`,
                currentNode: neighborId,
                distance: neighborDist,
                layer: lc,
              });
            }
            break;
          }
        }
      }
    }

    for (let lc = level; lc >= 0; lc--) {
      const candidates = this.searchLayer(point, currentNode, this.efConstruction, lc, steps, recordSteps);
      const M = lc === 0 ? this.M * 2 : this.M;
      const neighbors = this.selectNeighbors(point, candidates, M, steps, recordSteps, lc);

      for (const neighborId of neighbors) {
        newNode.connections.get(lc)!.push(neighborId);
        const neighborNode = this.nodes.get(neighborId)!;
        if (!neighborNode.connections.has(lc)) {
          neighborNode.connections.set(lc, []);
        }
        neighborNode.connections.get(lc)!.push(point.id);

        if (recordSteps) {
          steps.push({
            type: 'add_connection',
            description: `Adding bidirectional edge at layer ${lc}`,
            explanation: `Connecting node ${point.id} ↔ node ${neighborId}`,
            highlightedEdges: [[point.id, neighborId]],
            layer: lc,
          });
        }

        const neighborConnections = this.nodes.get(neighborId)!.connections.get(lc)!;
        if (neighborConnections.length > M) {
          const newNeighborConnections = this.selectNeighbors(
            this.nodes.get(neighborId)!.point,
            neighborConnections.map(id => this.nodes.get(id)!.point),
            M,
            [],
            false,
            lc
          );
          this.nodes.get(neighborId)!.connections.set(lc, newNeighborConnections);
        }
      }
    }

    if (level > this.maxLevel) {
      this.maxLevel = level;
      this.entryPoint = point.id;
      if (recordSteps) {
        steps.push({
          type: 'new_entry',
          description: 'New entry point',
          explanation: `Node ${point.id} has highest level, becoming new entry point`,
          currentNode: point.id,
        });
      }
    }

    return steps;
  }

  searchLayer(
    query: Point,
    entryPoint: number,
    ef: number,
    layer: number,
    steps: Step[],
    recordSteps: boolean
  ): Point[] {
    const visited = new Set<number>([entryPoint]);
    const candidates: Array<{ point: Point; dist: number }> = [
      { point: this.nodes.get(entryPoint)!.point, dist: euclideanDistance(query, this.nodes.get(entryPoint)!.point) }
    ];
    const w: Array<{ point: Point; dist: number }> = [...candidates];

    while (candidates.length > 0) {
      candidates.sort((a, b) => a.dist - b.dist);
      const current = candidates.shift()!;

      if (current.dist > w[w.length - 1].dist) break;

      const neighbors = this.nodes.get(current.point.id)!.connections.get(layer) || [];

      for (const neighborId of neighbors) {
        if (!visited.has(neighborId)) {
          visited.add(neighborId);
          const neighborPoint = this.nodes.get(neighborId)!.point;
          const dist = euclideanDistance(query, neighborPoint);

          if (recordSteps) {
            steps.push({
              type: 'evaluate_neighbor',
              description: `Evaluating neighbor ${neighborId}`,
              explanation: `Computing distance to candidate node`,
              formula: `d = √((${query.x.toFixed(1)}-${neighborPoint.x.toFixed(1)})² + (${query.y.toFixed(1)}-${neighborPoint.y.toFixed(1)})²) = ${dist.toFixed(2)}`,
              currentNode: neighborId,
              distance: dist,
              layer,
            });
          }

          if (dist < w[w.length - 1].dist || w.length < ef) {
            candidates.push({ point: neighborPoint, dist });
            w.push({ point: neighborPoint, dist });
            w.sort((a, b) => a.dist - b.dist);
            if (w.length > ef) w.pop();
          }
        }
      }
    }

    return w.map(item => item.point);
  }

  selectNeighbors(
    point: Point,
    candidates: Point[] | number[],
    M: number,
    steps: Step[],
    recordSteps: boolean,
    layer: number
  ): number[] {
    const candidatePoints = candidates.map(c => typeof c === 'number' ? this.nodes.get(c)!.point : c);
    const distances = candidatePoints.map(p => ({
      id: p.id,
      dist: euclideanDistance(point, p)
    }));
    
    distances.sort((a, b) => a.dist - b.dist);
    
    if (recordSteps && distances.length > 0) {
      steps.push({
        type: 'select_neighbors',
        description: `Selecting ${Math.min(M, distances.length)} nearest neighbors`,
        explanation: `Using heuristic to select best M=${M} connections at layer ${layer}`,
        candidateNodes: distances.slice(0, M).map(d => d.id),
        layer,
      });
    }

    return distances.slice(0, M).map(d => d.id);
  }

  search(query: Point, k: number = 1, recordSteps: boolean = true): { result: Point[]; steps: Step[] } {
    const steps: Step[] = [];

    if (this.entryPoint === null) {
      return { result: [], steps };
    }

    let currentNode = this.entryPoint;
    let currentDist = euclideanDistance(query, this.nodes.get(currentNode)!.point);

    if (recordSteps) {
      steps.push({
        type: 'start_search',
        description: 'Starting search from entry point',
        explanation: `Beginning at entry point (node ${this.entryPoint}) at layer ${this.maxLevel}`,
        currentNode,
        distance: currentDist,
        layer: this.maxLevel,
      });
    }

    for (let lc = this.maxLevel; lc > 0; lc--) {
      let changed = true;
      while (changed) {
        changed = false;
        const neighbors = this.nodes.get(currentNode)!.connections.get(lc) || [];

        for (const neighborId of neighbors) {
          const dist = euclideanDistance(query, this.nodes.get(neighborId)!.point);
          
          if (dist < currentDist) {
            currentNode = neighborId;
            currentDist = dist;
            changed = true;

            if (recordSteps) {
              steps.push({
                type: 'greedy_move',
                description: `Moving to closer node at layer ${lc}`,
                explanation: `Found neighbor with distance ${dist.toFixed(2)} < ${currentDist.toFixed(2)}`,
                currentNode: neighborId,
                distance: dist,
                layer: lc,
                highlightedEdges: [[currentNode, neighborId]],
              });
            }
            break;
          }
        }
      }

      if (recordSteps) {
        steps.push({
          type: 'descend_layer',
          description: `Descending to layer ${lc - 1}`,
          explanation: `No closer neighbors found at layer ${lc}, moving down`,
          currentNode,
          layer: lc - 1,
        });
      }
    }

    const candidates = this.searchLayer(query, currentNode, Math.max(this.efConstruction, k), 0, steps, recordSteps);
    
    const results = candidates
      .map(p => ({ point: p, dist: euclideanDistance(query, p) }))
      .sort((a, b) => a.dist - b.dist)
      .slice(0, k)
      .map(item => item.point);

    if (recordSteps) {
      steps.push({
        type: 'search_complete',
        description: `Search complete! Found ${k} nearest neighbor(s)`,
        explanation: `Final result: node(s) ${results.map(r => r.id).join(', ')}`,
        candidateNodes: results.map(r => r.id),
        layer: 0,
      });
    }

    return { result: results, steps };
  }
}
