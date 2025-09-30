import { initializeTileBag, drawTiles } from './tile-bag';

describe('initializeTileBag', () => {
  it('should create exactly 100 tiles', () => {
    const bag = initializeTileBag();
    expect(bag).toHaveLength(100);
  });

  it('should have correct number of each letter', () => {
    const bag = initializeTileBag();
    const letterCounts: Record<string, number> = {};

    bag.forEach((tile) => {
      letterCounts[tile.letter] = (letterCounts[tile.letter] || 0) + 1;
    });

    expect(letterCounts['A']).toBe(9);
    expect(letterCounts['E']).toBe(12);
    expect(letterCounts['Q']).toBe(1);
    expect(letterCounts['_']).toBe(2); // Blanks
  });

  it('should assign correct point values', () => {
    const bag = initializeTileBag();
    const aTile = bag.find((t) => t.letter === 'A' && !t.isBlank);
    const qTile = bag.find((t) => t.letter === 'Q');
    const blankTile = bag.find((t) => t.isBlank);

    expect(aTile?.points).toBe(1);
    expect(qTile?.points).toBe(10);
    expect(blankTile?.points).toBe(0);
  });

  it('should shuffle tiles randomly', () => {
    const bag1 = initializeTileBag();
    const bag2 = initializeTileBag();

    // Bags should not be identical (very unlikely with random shuffle)
    const identical = bag1.every(
      (tile, i) => tile.letter === bag2[i].letter && tile.points === bag2[i].points
    );

    expect(identical).toBe(false);
  });
});

describe('drawTiles', () => {
  it('should draw requested number of tiles', () => {
    const bag = initializeTileBag();
    const drawn = drawTiles(bag, 7);

    expect(drawn).toHaveLength(7);
    expect(bag).toHaveLength(93);
  });

  it('should draw only available tiles when count exceeds bag size', () => {
    const bag = [{ letter: 'A', points: 1, isBlank: false }];
    const drawn = drawTiles(bag, 7);

    expect(drawn).toHaveLength(1);
    expect(bag).toHaveLength(0);
  });

  it('should return empty array when bag is empty', () => {
    const bag: any[] = [];
    const drawn = drawTiles(bag, 7);

    expect(drawn).toHaveLength(0);
  });
});
