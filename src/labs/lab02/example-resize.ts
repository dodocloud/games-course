import * as PIXI from "pixi.js";
import { resizeContainer } from '../../utils';

class ExampleResize extends PIXI.Application {

  constructor(view: HTMLCanvasElement) {
    super({ view,
      backgroundColor: 0x172b95,
      width: 800,
      height: 450,
    });

    this.initResizeHandler(view);

    // use an asynchronous loader
    this.loader
    .add("./assets/lab02/warrior.json")
    .load(() => { // wait for the spritesheet to be loaded
      let sheet = this.loader.resources["./assets/lab02/warrior.json"].spritesheet;
      // select an animation
      let animation = new PIXI.AnimatedSprite(sheet.animations["warrior"]);
      animation.animationSpeed = 0.167;
      animation.loop = true;
      animation.play();
      animation.scale.set(0.5);
      animation.position.set(this.screen.width/2, this.screen.height/2);
      animation.anchor.set(0.5);
      this.stage.addChild(animation);

      // no game loop needed, the animation will attach itself to the shared Ticker
    });
  }

  private initResizeHandler(view: HTMLCanvasElement) {
    let virtualWidth = this.screen.width;
    let virtualHeight = this.screen.height;
    resizeContainer(view as HTMLElement, virtualWidth, virtualHeight);
    window.addEventListener('resize', (evt) => resizeContainer(view, 800, 450));
  }
}

// auto-init
new ExampleResize(document.getElementById("gameCanvas") as HTMLCanvasElement);