import { Tile } from '../types';

export function initializeTileBag(): Tile[] {
  const tiles: Tile[] = [];

  // Standard Scrabble tile distribution
  const distribution: Array<[string, number, number]> = [
    ['A', 1, 9],
    ['B', 3, 2],
    ['C', 3, 2],
    ['D', 2, 4],
    ['E', 1, 12],
    ['F', 4, 2],
    ['G', 2, 3],
    ['H', 4, 2],
    ['I', 1, 9],
    ['J', 8, 1],
    ['K', 5, 1],
    ['L', 1, 4],
    ['M', 3, 2],
    ['N', 1, 6],
    ['O', 1, 8],
    ['P', 3, 2],
    ['Q', 10, 1],
    ['R', 1, 6],
    ['S', 1, 4],
    ['T', 1, 6],
    ['U', 1, 4],
    ['V', 4, 2],
    ['W', 4, 2],
    ['X', 8, 1],
    ['Y', 4, 2],
    ['Z', 10, 1],
    ['_', 0, 2], // Blanks
  ];

  for (const [letter, points, count] of distribution) {
    for (let i = 0; i < count; i++) {
      tiles.push({
        letter,
        points,
        isBlank: letter === '_',
      });
    }
  }

  // Shuffle tiles
  for (let i = tiles.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [tiles[i], tiles[j]] = [tiles[j], tiles[i]];
  }

  return tiles;
}

export function drawTiles(tileBag: Tile[], count: number): Tile[] {
  const actualCount = Math.min(count, tileBag.length);
  return tileBag.splice(0, actualCount);
}
