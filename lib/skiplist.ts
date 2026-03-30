import { Point, Node, Step } from './types';
import { euclideanDistance, randomLevel } from './utils';

export class SkipListAlgorithm {
  nodes: Map<number, Node> = new Map();
  maxLevel: number = 0;
  head: number | null = null;
  Ml: number = 1 / Math.log(2);

  insert(point: Point, recordSteps: boolean = true): Step[] {
    const steps: Step[] = [];
    const level = randomLevel(this.Ml);
    point.level = level;

    if (recordSteps) {
      steps.push({
        type: 'level_assignment',
        description: `Assigning level to point ${point.id}`,
        explanation: `Skip list uses probabilistic level assignment`,
        formula: `level = floor(-log(random()) * Ml) = ${level}`,
        currentNode: point.id,
        layer: level,
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

    if (this.head === null) {
      this.nodes.set(point.id, newNode);
      this.head = point.id;
      this.maxLevel = Math.max(this.maxLevel, level);
      
      if (recordSteps) {
        steps.push({
          type: 'first_node',
          description: 'First node in skip list',
          explanation: 'Setting as head node',
          currentNode: point.id,
        });
      }
      return steps;
    }

    const update: Map<number, number> = new Map();
    let current = this.head;

    for (let l = this.maxLevel; l >= 0; l--) {
      while (true) {
        const currentNode = this.nodes.get(current)!;
        const forwardNodes = currentNode.connections.get(l) || [];
        
        if (forwardNodes.length === 0) break;
        
        const nextId = forwardNodes[0];
        const nextNode = this.nodes.get(nextId);
        
        if (!nextNode || nextNode.point.x >= point.x) break;
        
        current = nextId;
        
        if (recordSteps) {
          steps.push({
            type: 'traverse',
            description: `Traversing at level ${l}`,
            explanation: `Moving forward while next.x < ${point.x.toFixed(2)}`,
            currentNode: current,
            layer: l,
          });
        }
      }
      
      update.set(l, current);
    }

    this.nodes.set(point.id, newNode);

    for (let l = 0; l <= level; l++) {
      const pred = update.get(l);
      if (pred !== undefined) {
        const predNode = this.nodes.get(pred)!;
        const predConnections = predNode.connections.get(l) || [];
        
        if (predConnections.length > 0) {
          newNode.connections.get(l)!.push(predConnections[0]);
        }
        
        predNode.connections.set(l, [point.id]);

        if (recordSteps) {
          steps.push({
            type: 'insert_connection',
            description: `Inserting connection at level ${l}`,
            explanation: `Linking node ${pred} → ${point.id}`,
            highlightedEdges: [[pred, point.id]],
            layer: l,
          });
        }
      }
    }

    this.maxLevel = Math.max(this.maxLevel, level);

    return steps;
  }

  search(query: Point, recordSteps: boolean = true): { result: Point | null; steps: Step[] } {
    const steps: Step[] = [];

    if (this.head === null) {
      return { result: null, steps };
    }

    let current = this.head;
    let closest = current;
    let closestDist = euclideanDistance(query, this.nodes.get(current)!.point);

    if (recordSteps) {
      steps.push({
        type: 'start_search',
        description: 'Starting search from head',
        explanation: `Beginning at head node ${this.head} at level ${this.maxLevel}`,
        currentNode: current,
        layer: this.maxLevel,
      });
    }

    for (let l = this.maxLevel; l >= 0; l--) {
      while (true) {
        const currentNode = this.nodes.get(current)!;
        const forwardNodes = currentNode.connections.get(l) || [];
        
        if (forwardNodes.length === 0) break;
        
        const nextId = forwardNodes[0];
        const nextNode = this.nodes.get(nextId)!;
        const dist = euclideanDistance(query, nextNode.point);

        if (recordSteps) {
          steps.push({
            type: 'evaluate',
            description: `Evaluating node ${nextId} at level ${l}`,
            explanation: `Computing distance to query point`,
            formula: `d = ${dist.toFixed(2)}`,
            currentNode: nextId,
            distance: dist,
            layer: l,
          });
        }

        if (nextNode.point.x > query.x) break;
        
        current = nextId;
        
        if (dist < closestDist) {
          closest = current;
          closestDist = dist;
        }
      }

      if (recordSteps && l > 0) {
        steps.push({
          type: 'descend',
          description: `Descending to level ${l - 1}`,
          explanation: 'Moving to lower level',
          currentNode: current,
          layer: l - 1,
        });
      }
    }

    if (recordSteps) {
      steps.push({
        type: 'search_complete',
        description: 'Search complete',
        explanation: `Found closest node ${closest}`,
        currentNode: closest,
        candidateNodes: [closest],
      });
    }

    return { result: this.nodes.get(closest)!.point, steps };
  }
}
