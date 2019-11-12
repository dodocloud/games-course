import { SpecFunctions, GateState, STATE_DEFAULT } from './constants';
import { Direction } from './direction';
import { Vector } from '../../../libs/pixi-component';

/**
 * Map cell
 */
export class MapTile {
  pos: Vector; // position in the grid
  code: number; // binary code for walking possibilities
  specialFunction: number; // special func (tunnel, gate, spawner,...)
  state = 0; // dynamic state, can be set during the game

  canGoLeft() {
    return (this.code & 0b0010) === 0b0010;
  }

  canGoRight() {
    return (this.code & 0b0001) === 0b0001;
  }

  canGoUp() {
    return (this.code & 0b1000) === 0b1000;
  }

  canGoDown() {
    return (this.code & 0b0100) === 0b0100;
  }
}

export class GameMap {
  private blocks = new Map<number, MapTile>();
  // helper for faster search of tiles by their functions
  private functions = new Map<number, MapTile[]>();
  private _gridWidth: number;
  private _gridHeight: number;

  constructor(blocks: Map<number, MapTile>, gridWidth: number, gridHeight: number) {
    this.blocks = blocks;
    this._gridWidth = gridWidth;
    this._gridHeight = gridHeight;
  }

  get gridWidth() {
    return this._gridWidth;
  }

  get gridHeight() {
    return this._gridHeight;
  }

  init() {
    this.functions.clear();
    for(let [,tile] of this.blocks) {
      tile.state = STATE_DEFAULT; // reset all states
      if(tile.specialFunction !== SpecFunctions.NONE) {
        if(!this.functions.has(tile.specialFunction)) {
          this.functions.set(tile.specialFunction, []);
        }
        this.functions.get(tile.specialFunction).push(tile);
      }
    }
  }

  getTileByFunction(specialFunction: number): MapTile {
    if(this.functions.has(specialFunction)) {
      return this.functions.get(specialFunction)[0];
    }
    return null;
  }

  getTilesByFunction(specialFunction: number): MapTile[] {
    if(this.functions.has(specialFunction)) {
      return [...this.functions.get(specialFunction)]; // make copy
    }
    return null;
  }

  getTile(x: number, y: number): MapTile {
    return this.blocks.get(y*this.gridWidth + x) as MapTile;
  }

  canGoAlongDirection(dir: Direction, pos: Vector) {
    switch(dir) {
      case Direction.LEFT: return this.canGoLeft(pos);
      case Direction.RIGHT: return this.canGoRight(pos);
      case Direction.UP: return this.canGoUp(pos);
      case Direction.DOWN: return this.canGoDown(pos);
    }
  }

  canGoLeft(pos: Vector): boolean {
    // TODO if the gate could be accessible from left or right, add the same condition as for canGoUp/down
    return this.getTile(pos.x, pos.y).canGoLeft();
  }

  canGoRight(pos: Vector): boolean {
    // TODO if the gate could be accessible from left or right, add the same condition as for canGoUp/down
    return this.getTile(pos.x, pos.y).canGoRight();
  }

  canGoUp(pos: Vector): boolean {
      let currentTile = this.getTile(pos.x, pos.y);
      let upTile = this.getTile(pos.x, pos.y - 1);
      return currentTile.canGoUp() && (upTile.specialFunction !== SpecFunctions.GATE || upTile.state === GateState.OPEN);
  }

  canGoDown(pos: Vector): boolean {
      let currentTile = this.getTile(pos.x, pos.y);
      let downTile = this.getTile(pos.x, pos.y + 1);
      return currentTile.canGoDown() && (downTile.specialFunction !== SpecFunctions.GATE || downTile.state === GateState.OPEN);
  }
}