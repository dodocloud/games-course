import * as ECSA from '../../../libs/pixi-component';
import { Assets, SPRITES_RESOLUTION_HEIGHT, SCENE_HEIGHT } from './constants';
import { Factory } from './factory';
import { Model } from './model';

class Arkanoid {
  engine: ECSA.GameLoop;

  // Start a new game
  constructor() {
    this.engine = new ECSA.GameLoop();
    let canvas = (document.getElementById('gameCanvas') as HTMLCanvasElement);

    // scale the scene to 25 units if height
    this.engine.init(canvas, canvas.width, canvas.height, canvas.height / SCENE_HEIGHT);

    // set global scale which has to be applied for ALL sprites as it will
    // scale them to defined unit size
    Factory.globalScale = SCENE_HEIGHT / SPRITES_RESOLUTION_HEIGHT;

    this.engine.app.loader
      .reset()    // necessary for hot reload
      .add(Assets.TXT_ARKANOID, './assets/game_arkanoid/sprites.png')
      .add(Assets.SND_HIT, './assets/game_arkanoid/hit.mp3')
      .add(Assets.SND_GAMEOVER, './assets/game_arkanoid/gameover.mp3')
      .add(Assets.SND_INTRO, './assets/game_arkanoid/intro.mp3')
      .add(Assets.SND_ROUND, './assets/game_arkanoid/round.mp3')
      .add(Assets.DATA, './assets/game_arkanoid/data.json')
      .add(Assets.FONT, './assets/game_arkanoid/font.fnt')
      .load(() => this.onAssetsLoaded());
  }

  onAssetsLoaded() {
    // init factory and model
    let factory = new Factory();
    let model = new Model();
    model.loadModel(this.engine.app.loader.resources[Assets.DATA].data);
    factory.resetGame(this.engine.scene, model);
  }
}

export default new Arkanoid();

