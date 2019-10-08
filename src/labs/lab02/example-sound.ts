import * as PIXI from "pixi.js";

// workaround for pixi-sound library
window.PIXI = PIXI;
import * as PIXISound from '../../../libs/pixi-sound/pixi-sound';
(<any>PIXI).sound = PIXISound.PIXI.sound;


export class ExampleSound extends PIXI.Application  {
  sonic: PIXI.Sprite;
  constructor(view: HTMLCanvasElement) {
    super({
      view,
      transparent: true,
      antialias: true,
      resolution: 1,
      width: view.clientWidth,
      height: view.clientHeight,
    });

    this.init();
  }

  init() {
    this.sonic = PIXI.Sprite.from("./assets/lab02/sonic.png"); 
    this.sonic.position.set(this.screen.width / 2, this.screen.height / 2);
    this.sonic.anchor.set(0.5);

    // set interactivity
    this.sonic.interactive = true;
    // will display hand icon
    this.sonic.buttonMode = true;

    (<any>PIXI).sound.add("sound", "./assets/lab02/sound.mp3");

    this.sonic.on('pointerdown', () => {
      (<any>PIXI).sound.play('sound');
    });

    this.stage.addChild(this.sonic);
    this.ticker.add(deltaTime => {});
  }
}