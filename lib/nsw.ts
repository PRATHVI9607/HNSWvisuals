import { Point, Node, Step } from './types';
import { euclideanDistance } from './utils';

export class NSWAlgorithm {
  nodes: Map<number, Node> = new Map();
  entryPoint: number | null = null;
  M: number = 16;

  insert(point: Point, recordSteps: boolean = true): Step[] {
    const steps: Step[] = [];

    const newNode: Node = {
      id: point.id,
      point,
      connections: new Map([[0, []]]),
      level: 0,
    };

    if (this.entryPoint === null) {
      this.nodes.set(point.id, newNode);
      this.entryPoint = point.id;
      
      if (recordSteps) {
        steps.push({
          type: 'first_node',
          description: 'First node in NSW',
          explanation: 'Setting as entry point for the graph',
          currentNode: point.id,
        });
      }
      return steps;
    }

    let currentNode = this.entryPoint;
    const visited = new Set<number>();

    if (recordSteps) {
      steps.push({
        type: 'start_insertion',
        description: 'Starting NSW insertion',
        explanation: `Beginning greedy search from entry point ${this.entryPoint}`,
        currentNode: this.entryPoint,
      });
    }

    let changed = true;
    while (changed) {
      changed = false;
      visited.add(currentNode);
      
      const currentDist = euclideanDistance(this.nodes.get(currentNode)!.point, point);
      const neighbors = this.nodes.get(currentNode)!.connections.get(0) || [];

      for (const neighborId of neighbors) {
        if (visited.has(neighborId)) continue;
        
        const neighborDist = euclideanDistance(this.nodes.get(neighborId)!.point, point);

        if (recordSteps) {
          steps.push({
            type: 'evaluate_neighbor',
            description: `Evaluating neighbor ${neighborId}`,
            explanation: `Comparing distances to find closer node`,
            formula: `d(${neighborId}) = ${neighborDist.toFixed(2)} vs d(${currentNode}) = ${currentDist.toFixed(2)}`,
            currentNode: neighborId,
            distance: neighborDist,
          });
        }

        if (neighborDist < currentDist) {
          currentNode = neighborId;
          changed = true;
          
          if (recordSteps) {
            steps.push({
              type: 'move_closer',
              description: `Moving to closer node ${neighborId}`,
              explanation: `Found neighbor with smaller distance`,
              currentNode: neighborId,
              highlightedEdges: [[currentNode, neighborId]],
            });
          }
          break;
        }
      }
    }

    this.nodes.set(point.id, newNode);

    const candidates: number[] = [];
    const queue = [currentNode];
    const visitedForCandidates = new Set<number>();

    while (queue.length > 0 && candidates.length < this.M * 2) {
      const nodeId = queue.shift()!;
      if (visitedForCandidates.has(nodeId)) continue;
      
      visitedForCandidates.add(nodeId);
      candidates.push(nodeId);

      const neighbors = this.nodes.get(nodeId)!.connections.get(0) || [];
      for (const neighbor of neighbors) {
        if (!visitedForCandidates.has(neighbor)) {
          queue.push(neighbor);
        }
      }
    }

    const distances = candidates.map(id => ({
      id,
      dist: euclideanDistance(point, this.nodes.get(id)!.point)
    }));
    
    distances.sort((a, b) => a.dist - b.dist);
    const selected = distances.slice(0, this.M);

    if (recordSteps) {
      steps.push({
        type: 'select_neighbors',
        description: `Selecting ${selected.length} nearest neighbors`,
        explanation: `Creating connections to M=${this.M} closest nodes`,
        candidateNodes: selected.map(s => s.id),
      });
    }

    for (const { id: neighborId } of selected) {
      newNode.connections.get(0)!.push(neighborId);
      this.nodes.get(neighborId)!.connections.get(0)!.push(point.id);

      if (recordSteps) {
        steps.push({
          type: 'add_connection',
          description: `Adding bidirectional edge`,
          explanation: `Connecting node ${point.id} ↔ node ${neighborId}`,
          highlightedEdges: [[point.id, neighborId]],
        });
      }
    }

    return steps;
  }

  search(query: Point, k: number = 1, recordSteps: boolean = true): { result: Point[]; steps: Step[] } {
    const steps: Step[] = [];

    if (this.entryPoint === null) {
      return { result: [], steps };
    }

    let currentNode = this.entryPoint;
    const visited = new Set<number>();

    if (recordSteps) {
      steps.push({
        type: 'start_search',
        description: 'Starting NSW search',
        explanation: `Beginning greedy search from entry point ${this.entryPoint}`,
        currentNode: this.entryPoint,
      });
    }

    let changed = true;
    while (changed) {
      changed = false;
      visited.add(currentNode);
      
      const currentDist = euclideanDistance(this.nodes.get(currentNode)!.point, query);
      const neighbors = this.nodes.get(currentNode)!.connections.get(0) || [];

      for (const neighborId of neighbors) {
        if (visited.has(neighborId)) continue;
        
        const neighborDist = euclideanDistance(this.nodes.get(neighborId)!.point, query);

        if (recordSteps) {
          steps.push({
            type: 'evaluate',
            description: `Evaluating neighbor ${neighborId}`,
            explanation: `Checking if this neighbor is closer`,
            formula: `d = ${neighborDist.toFixed(2)}`,
            currentNode: neighborId,
            distance: neighborDist,
          });
        }

        if (neighborDist < currentDist) {
          currentNode = neighborId;
          changed = true;
          
          if (recordSteps) {
            steps.push({
              type: 'greedy_move',
              description: `Moving to closer node ${neighborId}`,
              explanation: `Found neighbor with distance ${neighborDist.toFixed(2)} < ${currentDist.toFixed(2)}`,
              currentNode: neighborId,
              highlightedEdges: [[currentNode, neighborId]],
            });
          }
          break;
        }
      }
    }

    const candidates: Array<{ id: number; dist: number }> = [];
    const queue = [currentNode];
    const visitedForSearch = new Set<number>();

    while (queue.length > 0) {
      const nodeId = queue.shift()!;
      if (visitedForSearch.has(nodeId)) continue;
      
      visitedForSearch.add(nodeId);
      const dist = euclideanDistance(query, this.nodes.get(nodeId)!.point);
      candidates.push({ id: nodeId, dist });

      const neighbors = this.nodes.get(nodeId)!.connections.get(0) || [];
      for (const neighbor of neighbors) {
        if (!visitedForSearch.has(neighbor) && visitedForSearch.size < 50) {
          queue.push(neighbor);
        }
      }
    }

    candidates.sort((a, b) => a.dist - b.dist);
    const results = candidates.slice(0, k).map(c => this.nodes.get(c.id)!.point);

    if (recordSteps) {
      steps.push({
        type: 'search_complete',
        description: `Search complete! Found ${k} nearest neighbor(s)`,
        explanation: `Result: node(s) ${results.map(r => r.id).join(', ')}`,
        candidateNodes: results.map(r => r.id),
      });
    }

    return { result: results, steps };
  }
}
