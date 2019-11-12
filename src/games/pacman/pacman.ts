
import * as ECSA from '../../../libs/pixi-component';
import { Assets } from './constants';
import PacmanFactory from './pacman-factory';
import PacmanModel from './pacman-model';

class Pacman {
  engine: ECSA.GameLoop;

  // Start a new game
  constructor() {
    this.engine = new ECSA.GameLoop();
    let canvas = (document.getElementById('gameCanvas') as HTMLCanvasElement);

    this.engine.init(canvas, 640, 360, 1, null, true);

    this.engine.app.loader
      .reset()    // necessary for hot reload
      .add(Assets.SPRITES, './assets/game_pacman/sprites.json')
      .add(Assets.MAP, './assets/game_pacman/map.txt')
      .add(Assets.SPRITESHEET, './assets/game_pacman/sprites.png')
      .add(Assets.BACKGROUND, './assets/game_pacman/map.png')
      .add(Assets.SND_DEATH, './assets/game_pacman/death.mp3')
      .add(Assets.SND_PACDOT, './assets/game_pacman/pacdot.mp3')
      .add(Assets.SND_PELLET, './assets/game_pacman/pellet.mp3')
      .add(Assets.SND_RUSHKILL, './assets/game_pacman/rushkill.mp3')
      .load(() => this.onAssetsLoaded());
  }

  onAssetsLoaded() {
    // init factory and model
    let resources = this.engine.app.loader.resources;
    let factory = new PacmanFactory(resources[Assets.SPRITES].data);
    let model = new PacmanModel();
    model.loadMap(resources[Assets.MAP].data);
    factory.initializeLevel(this.engine.scene, model);

    // for debugging
    (<any>window).scene = this.engine.scene;
  }
}

export default new Pacman();

