export const GRID_SIZE = 20;

export function snapToGrid(value: number, grid: number = GRID_SIZE): number {
  return Math.round(value / grid) * grid;
}

export function snapPoint(
  point: { x: number; y: number },
  grid: number = GRID_SIZE
): { x: number; y: number } {
  return { x: snapToGrid(point.x, grid), y: snapToGrid(point.y, grid) };
}


