import BaseComponent from '../base-component';
import { PerlinNoise } from '../../../../libs/pixi-math';
import * as ECSA from '../../../../libs/pixi-component';
import { Attributes } from '../constants';

// component that renders the road
export default class RoadRenderer extends BaseComponent {

  private noise = new PerlinNoise();

  constructor() {
    super();
    this.noise.seed(12345);
  }

  // gets random left background
  getLeftGrass(offset: number) {

    // use simplex noise for forest and grass
    if (this.noise.rawNoise(1, offset) >= 0) {
      return this.spriteMgr.getLeftBgr(3);
    }
    if (offset % 20 === 0) {
      return this.spriteMgr.getLeftBgr(2);
    }
    if (offset % 3 === 0) {
      return this.spriteMgr.getLeftBgr(1);
    }
    return this.spriteMgr.getLeftBgr(0);
  }

  // gets random right background
  getRightGrass(offset: number) {
    // use simplex noise for forest and grass
    if (this.noise.rawNoise(200, offset) >= 0) {
      return this.spriteMgr.getRightBgr(3);
    }
    if (offset % 20 === 0) {
      return this.spriteMgr.getRightBgr(2);
    }
    if (offset % 3 === 0) {
      return this.spriteMgr.getRightBgr(1);
    }
    return this.spriteMgr.getRightBgr(0);
  }

  onInit() {
    super.onInit();
    let spriteHeight = this.spriteMgr.getRoad().h;
    let canvasHeight = this.scene.app.screen.height;

    // calculate number of rendering cycles in order to fill the whole canvas
    let cycles = Math.round(canvasHeight / spriteHeight) + 2;
    // create 3x cycles objects
    let builder = new ECSA.Builder(this.scene);

    let spriteSheet = this.scene.getGlobalAttribute<PIXI.BaseTexture>(Attributes.SPRITESHEET);
    let texture = new PIXI.Texture(spriteSheet);

    for(let i =0; i< cycles; i++) {
      builder
        .withTag('road_sprite')
        .asSprite(texture)
        .withParent(this.owner)
        .build();
      builder
      .withTag('road_sprite')
      .asSprite(texture)
      .withParent(this.owner)
      .build();
      builder
      .withTag('road_sprite')
      .asSprite(texture)
      .withParent(this.owner)
      .build();
    }
  }

  // draws the road and the background
  onUpdate(delta: number, absolute: number) {

    let roadObjects = this.scene.findObjectsByTag('road_sprite');

    let cameraPosition = Math.floor(this.gameModel.cameraPosition);

    let spriteHeight = this.spriteMgr.getRoad().h;
    let canvasWidth = this.scene.app.screen.width;
    let canvasHeight = this.scene.app.screen.height;

    // calculate number of rendering cycles in order to fill the whole canvas
    let cycles = Math.round(canvasHeight / spriteHeight) + 2;
    let currentBlock = Math.floor(cameraPosition / spriteHeight) + cycles;

    let position = Math.min(spriteHeight, spriteHeight - cameraPosition % spriteHeight);
    let posY = 0;

    for (let i = 0; i < cycles; i++) {
      let sprite = this.spriteMgr.getRoad();
      if (sprite.h - position <= 0) {
        position = 0;
        continue;
      }
      // draw road
      let roadObj1 = (roadObjects[i*3+0].pixiObj as PIXI.Sprite);
      let roadObj2 = (roadObjects[i*3+1].pixiObj as PIXI.Sprite);
      let roadObj3 = (roadObjects[i*3+2].pixiObj as PIXI.Sprite);

      // draw left bgr
      let leftGrass = this.getLeftGrass(currentBlock - i);
      roadObj2.texture.frame = new PIXI.Rectangle(leftGrass.x, leftGrass.y + position, leftGrass.w, leftGrass.h - position);
      roadObj2.position.set(canvasWidth/2 - sprite.w/2 - leftGrass.w, posY);

      // draw road
      roadObj1.texture.frame = new PIXI.Rectangle(sprite.x, sprite.y + position, sprite.w, sprite.h - position);
      roadObj1.position.set(canvasWidth/2 - sprite.w/2, posY);

      // draw right bgr
      let rightGrass = this.getRightGrass(currentBlock - i);
      roadObj3.texture.frame = new PIXI.Rectangle(rightGrass.x, rightGrass.y + position, rightGrass.w, rightGrass.h - position);
      roadObj3.position.set(canvasWidth/2 + sprite.w/2, posY);

      posY += (sprite.h - position);
      position = 0;
    }
  }
}