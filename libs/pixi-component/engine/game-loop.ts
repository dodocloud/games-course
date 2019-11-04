import * as PIXI from 'pixi.js';
window.PIXI = PIXI; // workaround for PIXISound
import Scene from './scene';
import { resizeContainer } from '../utils/functions';
import { SceneConfig } from './scene';

/**
 * Entry point to the PIXIJS
 */
export default class GameLoop {
  app: PIXI.Application = null;
  lastTime = 0;
  gameTime = 0;
  scene: Scene = null;
  ticker: PIXI.Ticker = null;
  width: number;
  height: number;
  _running: boolean;

  options: {
    transparent?: boolean;
    backgroundColor?: number;
    antialias?: boolean;
  };

  constructor(options?: { transparent?: boolean; backgroundColor?: number; antialias?: boolean; }) {
    this.options = options;
  }

  init(canvas: HTMLCanvasElement, width: number, height: number, resolution: number = 1, sceneConfig?: SceneConfig, resizeToScreen: boolean = true) {
    this.width = width;
    this.height = height;

    sceneConfig = sceneConfig || {};

    // enable debug if the query string contains ?debug
    sceneConfig.debugEnabled = sceneConfig.debugEnabled || /[?&]debug/.test(location.search);

    this.app = new PIXI.Application({
      width: width / resolution,
      height: height / resolution,
      view: canvas,
      resolution: resolution, // resolution/device pixel ratio
      transparent: (this.options && this.options.transparent !== undefined) ? this.options.transparent : false,
      antialias:  (this.options && this.options.antialias !== undefined) ? this.options.antialias : true,
      backgroundColor: (this.options && this.options.backgroundColor !== undefined) ? this.options.backgroundColor : 0x000000,
    });

    this.scene = new Scene('default', this.app, sceneConfig);
    if(resizeToScreen && (!sceneConfig || !sceneConfig.debugEnabled)) {
      this.initResizeHandler();
    }

    this.ticker = this.app.ticker;
    // stop the shared ticket and update it manually
    this.ticker.autoStart = false;
    this.ticker.stop();
    this._running = true;
    this.loop(performance.now());
  }

  get running() {
    return this._running;
  }

  destroy() {
    this.app.destroy(false);
    this._running = false;
  }

  private loop(time: number) {
    // update our component library
    let dt = (time - this.lastTime);
    this.lastTime = time;
    this.gameTime += dt;
    this.scene._update(dt, this.gameTime);

    // update PIXI
    if(this._running) {
      this.ticker.update(this.gameTime);
      requestAnimationFrame((time) => this.loop(time));
    }
  }

  private initResizeHandler() {
    let virtualWidth = this.width;
    let virtualHeight = this.height;
    resizeContainer(this.app.view, virtualWidth, virtualHeight);
    window.addEventListener('resize', (evt) => resizeContainer(this.app.view, virtualWidth, virtualHeight));
  }
}