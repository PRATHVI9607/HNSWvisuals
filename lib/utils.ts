import { Point } from './types';

export function euclideanDistance(p1: Point, p2: Point): number {
  return Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));
}

export function randomLevel(Ml: number): number {
  return Math.floor(-Math.log(Math.random()) * Ml);
}

export function generateRandomPoint(width: number, height: number, id: number): Point {
  return {
    id,
    x: Math.random() * width,
    y: Math.random() * height,
  };
}

export function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}
