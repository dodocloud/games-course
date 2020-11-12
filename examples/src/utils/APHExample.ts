import * as ECS from '../../libs/pixi-ecs';
import * as PIXI from 'pixi.js';
import * as THREE from 'three';

export const getBaseUrl = () => (window as any).BASE_URL || '.';

/**
 * Common interface for all examples
 */
export interface APHExample {
    /**
     * Initializes the game loop
     */
    init(canvas: HTMLCanvasElement | string);

    /**
     * Stops the game loop and destroys all resources
     */
    destroy();
}

/**
 * Template for ThreeJS
 */
export abstract class ThreeJSExample implements APHExample {
	
	renderer: THREE.WebGLRenderer;
	scene: THREE.Scene;
	canvas: HTMLCanvasElement;
	clock: THREE.Clock;
	animFrameRequest: number;
	lastTime = 0;
	gameTime = 0;
	running = true;

    init(canvas: HTMLCanvasElement | string) {
		if(typeof(canvas) === 'string') {
			this.canvas = document.getElementById(canvas) as HTMLCanvasElement;
		}  else {
			this.canvas = canvas as HTMLCanvasElement;
		}
		this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas });
		this.renderer.setSize(this.canvas.width, this.canvas.height);
		this.renderer.setPixelRatio(window.devicePixelRatio);
		this.scene = new THREE.Scene();
		this.clock = new THREE.Clock();

		this.load();
		this.clock.start();		
		this.loop(0);
    }

	loop(time: number) {
		let dt = Math.min(time - this.lastTime, 100);
		this.lastTime = time;
		this.gameTime += dt;

		this.update(16, this.gameTime);

		if(this.running) {
			this.animFrameRequest = requestAnimationFrame((time) => this.loop(time));
		}
	}

	abstract load();
	abstract update(delta: number, absolute: number);

    destroy() {
		cancelAnimationFrame(this.animFrameRequest);
		this.running = false;   
	}
}

/**
 * Template for PIXIJs
 */
export abstract class PIXIExample implements APHExample {
	app: PIXI.Application;
	canvas: HTMLCanvasElement;
	config: ECS.EngineConfig;

	constructor(config?: ECS.EngineConfig) {
		this.config = config;
	}

    init(canvas: HTMLCanvasElement | string, disableLoop = false) {
		if(typeof(canvas) === 'string') {
			this.canvas = document.getElementById(canvas) as HTMLCanvasElement;
		}  else {
			this.canvas = canvas as HTMLCanvasElement;
		}
        this.app = new PIXI.Application({
			view: this.canvas,
			...this.config,
        });

		this.load();

		if(!disableLoop) {
			this.app.ticker.add(deltaTime => this.update(deltaTime));
		}
    }

	abstract load();

	abstract update(delta: number);

    destroy() {
		this.app.destroy();        
    }
}

/**
 * Template for ECS examples
 */
export abstract class ECSExample implements APHExample {
    engine: ECS.Engine;
	canvas: HTMLCanvasElement;
	config: ECS.EngineConfig;

	constructor(config?: ECS.EngineConfig) {
		this.config = config;
	}

    init(canvas: HTMLCanvasElement | string) {
		this.engine = new ECS.Engine();
		if(typeof(canvas) === 'string') {
			this.canvas = document.getElementById(canvas) as HTMLCanvasElement;
		}  else {
			this.canvas = canvas as HTMLCanvasElement;
		}
		this.engine.init(this.canvas, this.config);
		this.load();
	}

    abstract load();

    destroy() {
		this.engine.destroy();
    }
}