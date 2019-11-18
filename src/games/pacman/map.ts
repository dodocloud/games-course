import { SpecFunctions, GateState, STATE_DEFAULT } from './constants';
import { Direction } from './direction';
import { Vector } from '../../../libs/pixi-component';
import Queue from '../../../libs/pixi-math/structs/queue';

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

  getNeighbors(pos: Vector): Vector[] {
    let output = [];
    if(this.canGoLeft(pos)) {
      output.push(new Vector(pos.x - 1, pos.y));
    }
    if(this.canGoRight(pos)) {
      output.push(new Vector(pos.x + 1, pos.y));
    }
    if(this.canGoUp(pos)) {
      output.push(new Vector(pos.x, pos.y - 1));
    }
    if(this.canGoDown(pos)) {
      output.push(new Vector(pos.x, pos.y + 1));
    }
    return output;
  }

  search(start: Vector, goal: Vector): Direction[] {
    let indexer = (vec: Vector) => vec.y*this.gridWidth + vec.x;
    let frontier = new Queue<Vector>();
    frontier.add(start);
    let cameFrom = new Map<number, Vector>();
    cameFrom.set(indexer(start), start);
    let directionMapper = (vec1: Vector, vec2: Vector): Direction => {
      if(vec1.x < vec2.x) {
        return Direction.RIGHT;
      }
      if(vec1.x > vec2.x) {
        return Direction.LEFT;
      }
      if(vec1.y < vec2.y) {
        return Direction.DOWN;
      }
      if(vec1.y > vec2.y) {
        return Direction.UP;
      }
    };

    while (!frontier.isEmpty()) {
      let current = frontier.peek();
      frontier.dequeue();
      if (current.equals(goal)) {
        // the goal was achieved
        let current = goal;
        let previous = current;
        let output: Direction[] = [];
        while (!current.equals(start)) {
          previous = current;
          current = cameFrom.get(indexer(current));
          output.push(directionMapper(current, previous));
        }
        output = output.reverse();
        return output;
      }

      // get neighbors of the current grid block
      let neighbors = this.getNeighbors(current);

      for (let next of neighbors) {
        if (!cameFrom.has(indexer(next))) {
          frontier.enqueue(next);
          cameFrom.set(indexer(next), current);
        }
      }
    }
    return null;
  }
}