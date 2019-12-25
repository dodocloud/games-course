import BaseComponent from '../base-component';
import { Attributes } from '../constants';
import * as ECSA from '../../../../libs/pixi-component';

// component that renders number of lives
export default class LivesComponent extends BaseComponent {

  livesNum: number;

  onInit() {
    super.onInit();

    let spriteSheet = this.scene.getGlobalAttribute<PIXI.BaseTexture>(Attributes.SPRITESHEET);
    let builder = new ECSA.Builder(this.scene);

    this.livesNum = this.gameModel.lives;
    let sprite = this.spriteMgr.getLife();
    let texture = new PIXI.Texture(spriteSheet);
    texture.frame = new PIXI.Rectangle(sprite.x, sprite.y, sprite.w, sprite.h);

    for(let i = 0; i< this.livesNum; i++) {
      builder
      .withTag('life')
      .withAttribute('lifenum', i+1)
      .relativePos(0.05, 0.05)
      .localPos(i * sprite.w * 0.7, 0)
      .scale(0.7)
      .asSprite(texture)
      .withParent(this.owner)
      .build();
    }
  }

  onUpdate(delta: number, absolute: number) {
    if(this.livesNum !== this.gameModel.lives) {
      let allLives = this.scene.findObjectsByTag('life');
      allLives.forEach(obj => {
        if(obj.getAttribute<number>('lifenum') > this.gameModel.lives) {
          obj.remove();
        }
      });
      this.livesNum = this.gameModel.lives;
    }
  }
}