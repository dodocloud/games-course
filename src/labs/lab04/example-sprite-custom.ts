import * as PIXI from 'pixi.js';
import * as ECSA from '../../../libs/pixi-component';

const SPRITESHEET = './assets/lab04/sprites/mario.png';

export class ExampleSpriteCustom {
  engine: ECSA.GameLoop;

  constructor(view: HTMLCanvasElement) {
    this.engine = new ECSA.GameLoop({ transparent: true });
    this.engine.init(view, view.clientWidth, view.clientHeight, 1, null, false);

    this.engine.app.loader
    .add(SPRITESHEET)
    .load(() => {
      let texture = this.engine.app.loader.resources[SPRITESHEET].texture;
      let frames = 5, frameCounter = 0;
      new ECSA.Builder(this.engine.scene)
        .asSprite(texture)
        .withParent(this.engine.scene.stage)
        .localPos(this.engine.app.view.width / 2, this.engine.app.view.height / 2)
        .anchor(0.5)
        .withComponent(new ECSA.GenericComponent('animator').setFrequency(10)
          .doOnUpdate((cmp, delta, absolute) => {
            cmp.owner.asSprite().texture.frame = new PIXI.Rectangle(
              (texture.width / frames) * (frameCounter++ % frames), 0, texture.width / frames, texture.height);
          }))
        .build();
    });
  }
}