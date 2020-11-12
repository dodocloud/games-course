import * as PIXI from 'pixi.js';
window.PIXI = PIXI; // workaround for PIXISound

import Scene from './scene';
import { resizeContainer } from '../utils/helpers';
import { SceneConfig, defaultConfig as sceneDefaultConfig } from './scene';

/**
 * Type of the game loop
 */
export enum GameLoopType {
	FIXED = 'FIXED',
	VARIABLE = 'VARIABLE'
}

/**
 * Configuration interface for the engine
 */
export interface EngineConfig extends SceneConfig {
	// if true, the game will be automatically resized to fit the screen
	resizeToScreen?: boolean;
	// if true, the canvas will be transparent
	transparent?: boolean;
	// color of the canvas
	backgroundColor?: number;
	// will use antialias for rendering
	antialias?: boolean;
	// canvas width
	width?: number;
	// canvas height
	height?: number;
	// scale of all displayed objects
	resolution?: number;
	// type of the game loop
	gameLoopType?: GameLoopType;
	// upper threshold of game loop in ms
	gameLoopThreshold?: number;
	// number of ms for each frame (only for fixed game loop)
	gameLoopFixedTick?: number;
	// speed of the game (1 by default)
	speed?: number;
}

const defaultConfig: EngineConfig = {
	...sceneDefaultConfig,
	resizeToScreen: false,
	transparent: false,
	backgroundColor: 0x000000,
	antialias: true,
	resolution: 1,
	gameLoopThreshold: 300,
	gameLoopFixedTick: 16,
	speed: 1,
	gameLoopType: GameLoopType.VARIABLE
};

/**
 * Entry point to PIXI
 */
export default class Engine {
	app: PIXI.Application = null;
	
	lastFrameTime = 0;
	gameTime = 0;
	scene: Scene = null;
	ticker: PIXI.Ticker = null;
	// virtual size of the game (regardless of the canvas size)
	virtualWidth: number;
	virtualHeight: number;
	_running: boolean;
	config: EngineConfig;


	init(canvas: HTMLCanvasElement, engineConfig?: EngineConfig) {
		
		// merge config
		this.config = {
			...defaultConfig,
			...engineConfig
		};

		// enable debug if the query string contains ?debug
		this.config.debugEnabled = this.config.debugEnabled || /[?&]debug/.test(location.search);

		// do not resize to screen if debug window is on
		this.config.resizeToScreen = (this.config.resizeToScreen || /[?&]responsive/.test(location.search)) && !this.config.debugEnabled;

		this.virtualWidth = this.config.width || canvas.width;
		this.virtualHeight = this.config.height || canvas.height;

		this.app = new PIXI.Application({
			width: this.virtualWidth / this.config.resolution,
			height: this.virtualHeight / this.config.resolution,
			view: canvas,
			resolution: this.config.resolution, // resolution/device pixel ratio
			transparent: this.config.transparent,
			antialias: this.config.antialias,
			backgroundColor: this.config.backgroundColor,
		});

		this.scene = new Scene('default', this.app, this.config);

		if (this.config.resizeToScreen) {
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
		if (this.config.resizeToScreen) {
			window.removeEventListener('resize', this.resizeHandler);
		}
	}

	private loop(time: number) {
		
		let dt = Math.min(time - this.lastFrameTime, this.config.gameLoopThreshold) * this.config.speed;
		this.lastFrameTime = time;
		
		if (this.config.gameLoopType === GameLoopType.FIXED) {
			// fixed game loop
			this.gameTime += this.config.gameLoopFixedTick * this.config.speed;
			this.scene._update(this.config.gameLoopFixedTick * this.config.speed, this.gameTime); 
		} else {
			// variable game loop
			this.gameTime += dt;
			this.scene._update(dt, this.gameTime);
		}

		// update PIXI
		if (this._running) {
			this.ticker.update(this.gameTime);
			requestAnimationFrame((time) => this.loop(time));
		}
	}

	private initResizeHandler() {
		resizeContainer(this.app.view, this.virtualWidth, this.virtualHeight);
		window.addEventListener('resize', this.resizeHandler);
	}

	private resizeHandler = () => resizeContainer(this.app.view, this.virtualWidth, this.virtualHeight);
}