import BaseComponent from '../base-component';
import { Attributes, MAXIMUM_SPEED } from '../constants';
import * as ECSA from '../../../../libs/pixi-component';

// component that displays speed bar
export default class SpeedbarComponent extends BaseComponent {

  car: ECSA.GameObject;

  onInit() {
    super.onInit();
    let spriteSheet = this.scene.getGlobalAttribute<PIXI.BaseTexture>(Attributes.SPRITESHEET);
    let builder = new ECSA.Builder(this.scene);
    builder
    .localPos(1, 0)
    .withTag('bar_fill')
    .asSprite(new PIXI.Texture(spriteSheet))
    .withParent(this.owner)
    .build();

    this.car = this.scene.findObjectByName('car');
  }

  onUpdate(delta: number, absolute: number) {
    let barFill = this.scene.findObjectByTag('bar_fill');
    let sprite = this.spriteMgr.getBarFill();

    let carSpeed = this.car.getAttribute<number>(Attributes.SPEED);
    let speedRatio = carSpeed / MAXIMUM_SPEED;

    let shift = sprite.h * (1 - speedRatio);
    barFill.asSprite().texture.frame = new PIXI.Rectangle(sprite.x, sprite.y + shift, sprite.w, sprite.h - shift);
    barFill.pixiObj.position.y = shift;
  }
}