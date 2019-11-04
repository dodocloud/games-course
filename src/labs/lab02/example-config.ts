import * as PIXI from 'pixi.js';

class BaseConfig extends PIXI.Application {

  constructor(view: HTMLCanvasElement, options: any) {
    super({
      view,
      width: view.clientWidth,
      height: view.clientHeight,
      ...options, // take the rest from the options
    });

    let creature = PIXI.Sprite.from('./assets/lab01/crash.png');
    creature.anchor.set(0.5);
    creature.position.set(this.screen.width / 2, this.screen.height / 2);
    this.stage.addChild(creature);
    this.ticker.add(deltaTime => creature.rotation += 0.01*deltaTime);
  }
}

export class ExampleConfig1 extends BaseConfig {
  constructor(view: HTMLCanvasElement) {
    super(view, {
      transparent: false,
      backgroundColor: 0x000000,
      antialias: false,
      resolution: 1,
    });
  }
}

export class ExampleConfig2 extends BaseConfig {
  constructor(view: HTMLCanvasElement) {
    super(view, {
      transparent: false,
      backgroundColor: 0x000000,
      antialias: true,
      resolution: 1,
    });
  }
}

export class ExampleConfig3 extends BaseConfig {
  constructor(view: HTMLCanvasElement) {
    super(view, {
      transparent: true,
      antialias: true,
      resolution: 0.2,
    });
  }
}