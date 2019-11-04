import * as PIXI from 'pixi.js';
import * as ECSA from '../../../libs/pixi-component';


export class ExampleSpritePixi {
  engine: ECSA.GameLoop;

  constructor(view: HTMLCanvasElement) {
    this.engine = new ECSA.GameLoop({ transparent: true });

    this.engine.init(view, view.clientWidth, view.clientHeight, 1, null, false);


    // use an asynchronous loader
    this.engine.app.loader
    .add('./assets/lab02/warrior.json')
    .load(() => { // wait for the spritesheet to be loaded
      let sheet = this.engine.app.loader.resources['./assets/lab02/warrior.json'].spritesheet;
      // select an animation
      let animation = new PIXI.AnimatedSprite(sheet.animations['warrior']);
      animation.animationSpeed = 0.167;
      animation.loop = true;
      animation.play();
      animation.scale.set(0.5);
      animation.position.set(this.engine.app.screen.width/2, this.engine.app.screen.height/2);
      animation.anchor.set(0.5);
      this.engine.scene.stage.addChild(animation);
    });
  }
}