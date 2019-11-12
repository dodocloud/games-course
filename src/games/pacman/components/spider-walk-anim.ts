import { Vector } from '../../../../libs/pixi-component';
import { mapToWorld } from '../utils';
import BaseComponent from './base-component';
import { Direction } from '../direction';
import SpriteData from '../sprite-data';


export default class SpiderWalkAnim extends BaseComponent {

  private position: Vector;
  private direction: Direction;

  private realPosFrom: Vector;
  private realPosTo: Vector;
  private duration: number;
  private timeSoFar: number;
  private distance: number;
  private distanceVec: Vector;

  constructor(position: Vector, direction: Direction, duration: number) {
    super();
    this.position = position;
    this.direction = direction;
    this.duration = duration;
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
    let distanceSoFar = Math.min(this.distance, (this.timeSoFar / (this.duration)) * this.distance); // todo depends on resolution

    objPos.x = this.realPosFrom.x + this.distanceVec.x * (distanceSoFar / this.distance);
    objPos.y = this.realPosFrom.y + this.distanceVec.y * (distanceSoFar / this.distance);

    let frameIndex = Math.floor((distanceSoFar / this.distance) * (8-1)) % (8 - 1);
    let yOffset = this.model.isRushMode ? 2 : 0;
    let spriteData: SpriteData;

    switch(this.direction) {
      case Direction.LEFT:
          spriteData = this.spriteSheetData.spider_walk_left;
        break;
      case Direction.RIGHT:
          spriteData = this.spriteSheetData.spider_walk_right;
        break;
      case Direction.DOWN:
          spriteData = this.spriteSheetData.spider_walk_down;
      break;
      case Direction.UP:
          spriteData = this.spriteSheetData.spider_walk_up;
        break;
    }

    texture.frame = new PIXI.Rectangle(spriteData.x + frameIndex*spriteData.w, spriteData.y +yOffset*spriteData.h, spriteData.w, spriteData.h);

    if(distanceSoFar >= this.distance) {
      this.finish();
    }
  }
}