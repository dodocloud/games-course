import { Vector } from '../../../../libs/pixi-component';
import { mapToWorld } from '../utils';
import BaseComponent from './base-component';
import { Direction } from '../direction';

const eatingAnimFrames = 10;

/**
 * Walk animation component for pacman
 * Will animate only between two cells
 */
export default class PacmanWalkAnim extends BaseComponent {

  private position: Vector;
  private direction: Direction;

  private realPosFrom: Vector;
  private realPosTo: Vector;
  private duration: number;
  private timeSoFar: number;
  private distance: number;
  private distanceVec: Vector;
  private eatingAnim: boolean;

  constructor(position: Vector, direction: Direction, eatingAnim: boolean, duration: number) {
    super();
    this.position = position;
    this.direction = direction;
    this.duration = duration;
    this.eatingAnim = eatingAnim;
  }

  onInit() {
    super.onInit();
    this.timeSoFar = 0;
    this.realPosFrom = mapToWorld(this.position.x, this.position.y);
    switch(this.direction) {
      case Direction.LEFT:
        this.realPosTo = mapToWorld(this.position.x - 1, this.position.y);
        break;
      case Direction.RIGHT:
        this.realPosTo = mapToWorld(this.position.x + 1, this.position.y);
        break;
      case Direction.UP:
        this.realPosTo = mapToWorld(this.position.x, this.position.y-1);
        break;
      case Direction.DOWN:
        this.realPosTo = mapToWorld(this.position.x, this.position.y+1);
        break;
    }

    this.distance = this.realPosFrom.distance(this.realPosTo);
    this.distanceVec = this.realPosTo.subtract(this.realPosFrom);
  }

  onUpdate(delta: number, absolute: number) {

    let texture = (this.owner.pixiObj as PIXI.Sprite).texture;

    this.timeSoFar += delta;
    let objPos = this.owner.pixiObj.position;
    let distanceSoFar = Math.min(this.distance, (this.timeSoFar / this.duration) * this.distance); // todo depends on resolution

    objPos.x = this.realPosFrom.x + this.distanceVec.x * (distanceSoFar / this.distance);
    objPos.y = this.realPosFrom.y + this.distanceVec.y * (distanceSoFar / this.distance);


    if(this.eatingAnim) {
      let frameIndex = Math.floor((distanceSoFar / this.distance) * (eatingAnimFrames-1));
      // repeat last two frames reversed
      if(frameIndex === 8) {
        frameIndex = 6;
      }
      if(frameIndex === 9) {
        frameIndex = 0;
      }
      let spriteData;
      switch(this.direction) {
        case Direction.LEFT:
            spriteData = this.spriteSheetData.pacman_walk_left;
          break;
        case Direction.RIGHT:
            spriteData = this.spriteSheetData.pacman_walk_right;
          break;
        case Direction.DOWN:
            spriteData = this.spriteSheetData.pacman_walk_down;
        break;
        case Direction.UP:
            spriteData = this.spriteSheetData.pacman_walk_up;
          break;
      }
      texture.frame = new PIXI.Rectangle(spriteData.x + frameIndex*spriteData.w,
        spriteData.y, spriteData.w, spriteData.h);
    } else {
      switch(this.direction) {
        case Direction.LEFT:
            texture.frame = new PIXI.Rectangle(8*32, 0, 32, 32);
          break;
        case Direction.RIGHT:
            texture.frame = new PIXI.Rectangle(0, 0, 32, 32);
          break;
        case Direction.DOWN:
            texture.frame = new PIXI.Rectangle(0, 32, 32, 32);
        break;
        case Direction.UP:
            texture.frame = new PIXI.Rectangle(8*32, 32, 32, 32);
          break;
      }
    }

    if(distanceSoFar >= this.distance) {
      this.finish();
    }
  }
}