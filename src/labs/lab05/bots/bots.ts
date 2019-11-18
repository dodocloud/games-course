import * as ECSA from '../../../../libs/pixi-component';
import { Assets } from './constants';
import { BotFactory } from './bot-factory';
import { GameModel } from './model';

export class Bots {
  engine: ECSA.GameLoop;

  // Start a new game
  constructor() {
    this.engine = new ECSA.GameLoop({
      backgroundColor: 0xCDCDCD
    });
    let canvas = (document.getElementById('gameCanvas') as HTMLCanvasElement);

    this.engine.init(canvas, 800, 600);

    this.engine.app.loader
      .reset()    // necessary for hot reload
      .add(Assets.TEXTURE, './assets/lab05/aiexample.png')
      .load(() => this.onAssetsLoaded());
  }

  onAssetsLoaded() {
    let factory = new BotFactory();
    factory.initializeGame(this.engine.scene.stage, new GameModel());
  }
}
export default new Bots();