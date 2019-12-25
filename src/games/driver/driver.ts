
import * as ECSA from '../../../libs/pixi-component';
import { Assets } from './constants';
import { DriverModel } from './driver-model';
import DriverFactory from './driver-factory';

class Driver {
  engine: ECSA.GameLoop;

  // Start a new game
  constructor() {
    this.engine = new ECSA.GameLoop();
    let canvas = (document.getElementById('gameCanvas') as HTMLCanvasElement);

    this.engine.init(canvas, 500, 630, 1);

    this.engine.app.loader
      .reset()    // necessary for hot reload
      .add(Assets.SPRITES, './assets/game_driver/sprites.json')
      .add(Assets.SPRITESHEET, './assets/game_driver/sprites.png')
      .load(() => this.onAssetsLoaded());
  }

  onAssetsLoaded() {
    // init factory and model
    let resources = this.engine.app.loader.resources;
    let factory = new DriverFactory(resources[Assets.SPRITES].data);
    let model = new DriverModel();
    factory.initializeLevel(this.engine.scene, model);

    // for debugging from the terminal
    (<any>window).scene = this.engine.scene;
  }
}

export default new Driver();

