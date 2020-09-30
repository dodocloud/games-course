import * as PIXI from 'pixi.js';


export class ParticlesExample extends PIXI.Application {
	container: PIXI.ParticleContainer;

	private static particlesNum = 250;

	constructor(view: HTMLCanvasElement) {
        super({
			view,
			backgroundColor: 0x000000,
			width: view.clientWidth,
			height: view.clientHeight,
		});

		this.init();
		this.ticker.add(deltaTime => this.update(deltaTime));
	}

	init() {
        // TODO put your code here
        // 1) create PIXI.ParticleContainer
        // 2) load assets/02-pixi-intro/ghost.png
        // 3) create ~200 random particles
        // 4) in the update loop, rotate the particles
	}

	update(deltaTime: number) {
		// TODO put your code here
	}
}

new ParticlesExample(<HTMLCanvasElement>document.getElementById('gameCanvas'));