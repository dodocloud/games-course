import * as ECSA from '../../../libs/pixi-component';
import ParatrooperFactory from './paratrooper-factory';
import { Assets, SPRITES_RESOLUTION_HEIGHT, SCENE_HEIGHT } from './constants';


class Paratrooper {
  engine: ECSA.GameLoop;

  // Start a new game
  constructor() {
    this.engine = new ECSA.GameLoop();

    let canvas = (document.getElementById('gameCanvas') as HTMLCanvasElement);

    let screenHeight = canvas.height;

    // calculate ratio between intended resolution (here 400px of height) and real resolution
    // - this will set appropriate scale
    let gameScale = SPRITES_RESOLUTION_HEIGHT / screenHeight;
    // scale the scene to 50 units if height
    let resolution = screenHeight / SCENE_HEIGHT * gameScale;
    this.engine.init(canvas, 800, screenHeight, resolution / gameScale, { flagsSearchEnabled: true});

    // set global scale which has to be applied for ALL sprites as it will
    // scale them to defined unit size
    ParatrooperFactory.globalScale = 1 / resolution;

    // set resized width according to the current aspect ratio
    ParatrooperFactory.screenWidth = SCENE_HEIGHT * (canvas.width / canvas.height);

    this.engine.app.loader
      .reset()    // necessary for hot reload
      .add(Assets.TEX_CANNON, './assets/game_paratrooper/cannon.png')
      .add(Assets.TEX_COPTER_LEFT, './assets/game_paratrooper/copter_left.png')
      .add(Assets.TEX_COPTER_RIGHT, './assets/game_paratrooper/copter_right.png')
      .add(Assets.TEX_PARATROOPER_PARACHUTE, './assets/game_paratrooper/paratrooper_parachute.png')
      .add(Assets.TEX_PARATROOPER, './assets/game_paratrooper/paratrooper.png')
      .add(Assets.TEX_PROJECTILE, './assets/game_paratrooper/projectile.png')
      .add(Assets.TEX_TOWER, './assets/game_paratrooper/tower.png')
      .add(Assets.TEX_TURRET, './assets/game_paratrooper/turret.png')
      .add(Assets.TEX_LOGO, './assets/game_paratrooper/logo.png')
      .add(Assets.SND_FIRE, './assets/game_paratrooper/fire.mp3')
      .add(Assets.SND_GAMEOVER, './assets/game_paratrooper/gameover.mp3')
      .add(Assets.SND_KILL, './assets/game_paratrooper/kill.mp3')
      .add(Assets.DATA, './assets/game_paratrooper/config.json')
      .add(Assets.FONT, './assets/game_paratrooper/font.fnt')
      .load(() => this.onAssetsLoaded());
  }

  onAssetsLoaded() {
    let factory = new ParatrooperFactory();
    factory.resetGame(this.engine.scene);
  }
}

export default new Paratrooper();
