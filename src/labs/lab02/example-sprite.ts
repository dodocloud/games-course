import * as PIXI from 'pixi.js';


export class ExampleSprite extends PIXI.Application {

  private creature: PIXI.Sprite;

  constructor(view: HTMLCanvasElement) {
    super({
      transparent: true,
      view,
    });

    this.creature = PIXI.Sprite.from('./assets/lecture01/crash.png');
    this.creature.anchor.set(0.5);
    this.creature.x = this.screen.width / 2;
    this.creature.y = this.screen.height / 2;
    this.stage.addChild(this.creature);
    this.ticker.add(deltaTime => this.update(deltaTime));
  }

  update(deltaTime: number) {
    this.creature.rotation += 0.01 * deltaTime;
  }
}