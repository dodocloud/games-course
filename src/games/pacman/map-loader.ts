import { MapTile, GameMap } from './map';
import { Vector } from '../../../libs/pixi-component';

/**
 * Modes defined by their labels in the TXT file
 */
enum ParserMode {
  NONE = '',
  PATHS = ':paths',
  FUNCTIONS = ':functions'
}

class RawMap {
  gridWidth: number;
  gridHeight: number;
  blocks: Map<number, MapTile> = new Map();
}

abstract class Parser {
  protected gridWidth = 0;
  protected gridHeight = 0;
  protected tokens = [];

  public parseLine(line: string, linenum: number) {
    let parsedLetters = 0;

    for (let letter of line) {
      if(this.parseLetter(letter)) {
        parsedLetters++;
      } else if (letter !== ' ') { // ignore whitespaces
        throw new Error(`Unexpected token ${letter} on line ${linenum}:${parsedLetters+1}`);
      }
    }

    if (parsedLetters !== 0) {
      if (this.gridWidth === 0) {
        this.gridWidth = parsedLetters;
      } else if (this.gridWidth !== parsedLetters) {
        throw new Error(`Wrong number of tokens on line ${linenum}; expected ${this.gridWidth}, found ${parsedLetters}`);
      }

      this.gridHeight++;
    }
  }


  public finalize(output: RawMap) {
    // check the size
    if((output.gridWidth && output.gridWidth !== this.gridWidth)
    || (output.gridHeight && output.gridHeight !== this.gridHeight)) {
      throw new Error(`Error while parsing paths, unexpected size of the map: expected ${this.gridWidth}x${this.gridHeight}, found ${output.gridWidth}x${output.gridHeight}`);
    }

    output.gridWidth = this.gridWidth;
    output.gridHeight = this.gridHeight;

    // init maptiles
    let allBlocks = this.gridWidth * this.gridHeight;
    for(let i =0; i< allBlocks; i++) {
      if(!output.blocks.has(i)) {
        output.blocks.set(i, new MapTile());
        output.blocks.get(i).pos = new Vector(i % this.gridWidth, Math.floor(i / this.gridWidth));
      }
    }
  }

  protected abstract parseLetter(letter: string): boolean;
}

/**
 * Parser for walkable paths
 */
class PathParser extends Parser {

  public finalize(output: RawMap) {
    super.finalize(output);

    let mapBlocks = this.gridWidth * this.gridHeight;

    for(let i =0; i<mapBlocks; i++) {
      output.blocks.get(i).code = this.tokens[i];
    }
  }

  protected parseLetter(letter: string): boolean {
    if (/^[0-9a-fA-F]+$/.test(letter)) {
      this.tokens.push(parseInt(`0x${letter}`));
      return true;
    }
    return false;
  }
}

/**
 * Parser for special functions
 */
class FunctionsParser extends Parser {

  public finalize(output: RawMap) {
    super.finalize(output);

    let mapBlocks = this.gridWidth * this.gridHeight;

    for(let i =0; i<mapBlocks; i++) {
      output.blocks.get(i).specialFunction = this.tokens[i];
    }
  }

  protected parseLetter(letter: string): boolean {
    if (/^[0-9]+$/.test(letter)) {
      this.tokens.push(parseInt(letter));
      return true;
    }
    return false;
  }
}

/**
 * TXT Map file loader
 */
export class MapLoader {

  private parsers = {};
  private currentParser: Parser;

  public loadMap(content: string): GameMap {
    this.init();
    let output = new RawMap();

    let currentMode = ParserMode.NONE;
    let lineCounter = 0;

    // split the file into lines
    content.split('\n').forEach(line => {
      lineCounter++;
      const linetr = line.trim().toLowerCase();

      // skip comments
      if (linetr.startsWith('//')) {
        return;
      }

      let mode = this.checkModeLabel(linetr, currentMode);

      if(mode !== currentMode) {
        // new label detected -> switch to appropriate parser
        currentMode = mode;
        let newParser = this.parsers[currentMode];
        if(this.currentParser) {
          this.currentParser.finalize(output);
        }
        this.currentParser = newParser;
        return; // go to the next line
      }

      if(mode !== ParserMode.NONE) {
        this.currentParser.parseLine(linetr, lineCounter);
      }
    });

    if(!this.currentParser) {
      throw new Error('Error while parsing the map. No valid data found.');
    }

    // finalize last parser
    this.currentParser.finalize(output);
    return new GameMap(output.blocks, output.gridWidth, output.gridHeight);
  }

  private init() {
    this.parsers[ParserMode.PATHS] = new PathParser();
    this.parsers[ParserMode.FUNCTIONS] = new FunctionsParser();
  }

  private checkModeLabel(line: string, currentMode: ParserMode): ParserMode {
    // mode switch
    if (line.startsWith(':')) {
      switch (line) {
        case ParserMode.PATHS:
        case ParserMode.FUNCTIONS:
          return line as ParserMode;
      }
    }
    return currentMode;
  }
}