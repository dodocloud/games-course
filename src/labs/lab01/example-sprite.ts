import * as PIXI from "pixi.js";


class PixiBoot extends PIXI.Application {

  private creature: PIXI.Sprite;

  constructor() {
    super({
      view: <HTMLCanvasElement>document.getElementById("gameCanvas"),
      backgroundColor: 0x000000,
      width: 800,
      height: 450
    });

    // load a sprite
    this.creature = PIXI.Sprite.from("./assets/lecture01/crash.png");
    // set anchor to the center
    this.creature.anchor.set(0.5);
    // set position to the center of the screen
    this.creature.x = this.screen.width / 2;
    this.creature.y = this.screen.height / 2;

    // stage is a root element of the scene graph
    this.stage.addChild(this.creature);

    // initialize game loop
    this.ticker.add(deltaTime => this.update(deltaTime));
  }

  // game loop, invoked 60times per second
  update(deltaTime: number) {
    this.creature.rotation += 0.01 * deltaTime;
  }
}

new PixiBoot();