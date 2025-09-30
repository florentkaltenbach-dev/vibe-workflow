import * as fs from 'fs';
import * as path from 'path';

export class Dictionary {
  private words: Set<string>;

  constructor() {
    this.words = new Set();
  }

  load(filename: string): void {
    const filePath = path.join(__dirname, '..', filename);
    try {
      const content = fs.readFileSync(filePath, 'utf-8');
      const lines = content.split('\n');
      for (const line of lines) {
        const word = line.trim().toUpperCase();
        if (word.length > 0) {
          this.words.add(word);
        }
      }
      console.log(`Dictionary loaded: ${this.words.size} words`);
    } catch (error) {
      console.error(`Failed to load dictionary from ${filePath}:`, error);
      throw new Error('Dictionary file not found');
    }
  }

  has(word: string): boolean {
    return this.words.has(word.toUpperCase());
  }

  getWordSet(): Set<string> {
    return this.words;
  }
}
