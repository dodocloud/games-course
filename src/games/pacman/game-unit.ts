import { UnitState } from './constants';
import { GameMap } from './map';
import { Direction } from './direction';
import { Vector } from '../../../libs/pixi-component';

export class GameUnit {

  pos: Vector; // position in the grid, only integers
  dir = Direction.LEFT; // current direction
  state = UnitState.STANDING; // current state

  private static idCounter = 0;
  private _tileMap: GameMap; // link to the map
  private _id: number;

  get id() {
    return this._id;
  }

  constructor(position: Vector, tileMap: GameMap) {
    this._id = GameUnit.idCounter++;
    this.pos = position;
    this._tileMap = tileMap;
  }

  getWalkableDirections(): Direction[] {
    let dirs: Direction[] = [];
    if(this.canGoLeft()) {
      dirs.push(Direction.LEFT);
    }
    if(this.canGoRight()) {
      dirs.push(Direction.RIGHT);
    }
    if(this.canGoUp()) {
      dirs.push(Direction.UP);
    }
    if(this.canGoDown()) {
      dirs.push(Direction.DOWN);
    }
    return dirs;
  }

  canGoLeft() {
    return this._tileMap.canGoLeft(this.pos);
  }

  canGoRight() {
    return this._tileMap.canGoRight(this.pos);
  }

  canGoUp() {
    return this._tileMap.canGoUp(this.pos);
  }

  canGoDown() {
    return this._tileMap.canGoDown(this.pos);
  }

  canMakeStep(): boolean {
    switch(this.dir) {
      case Direction.LEFT:
        return this.canGoLeft();
      case Direction.RIGHT:
        return this.canGoRight();
      case Direction.UP:
        return this.canGoUp();
      case Direction.DOWN:
        return this.canGoDown();
    }
    return false;
  }

  makeStep(): boolean {
    switch(this.dir) {
      case Direction.LEFT:
        if(this.canGoLeft()) {
          this.pos = new Vector(this.pos.x-1, this.pos.y);
          return true;
        }
        break;
      case Direction.RIGHT:
        if(this.canGoRight()) {
          this.pos = new Vector(this.pos.x+1, this.pos.y);
          return true;
        }
        break;
      case Direction.UP:
        if(this.canGoUp()) {
          this.pos = new Vector(this.pos.x, this.pos.y - 1);
          return true;
        }
        break;
      case Direction.DOWN:
        if(this.canGoDown()) {
          this.pos = new Vector(this.pos.x, this.pos.y + 1);
          return true;
        }
        break;
    }
    return false;
  }
}