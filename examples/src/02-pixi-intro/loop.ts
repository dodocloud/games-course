import * as PIXI from 'pixi.js';

export class LoopExample extends PIXI.Application {

	private lastTime = 0;
	private gameTime = 0;
	private running = true;

	constructor(view: HTMLCanvasElement) {
		super({
			view,
			backgroundColor: 0x000000,
			width: 800,
			height: 600,
		});

		this.init();
	}

	gfx: PIXI.Graphics;

	init() {
		this.gfx = new PIXI.Graphics();
		this.gfx.position.set(400, 300);
		this.gfx.pivot.set(100, 100);
		this.gfx.beginFill(0xFF0000);
		this.gfx.drawRect(0, 0, 200, 200);
		this.gfx.endFill();
		this.stage.addChild(this.gfx);

		this.ticker.autoStart = false;
		this.ticker.stop();
		this.loop(performance.now());
	}

	loop(time: number) {
		let dt = Math.min(time - this.lastTime, 100);
		this.lastTime = time;
		this.gameTime += dt;

		this.update(16, this.gameTime);

		if (this.running) {
			this.ticker.update(time);
			requestAnimationFrame((time) => this.loop(time));
		}
	}

	update(delta: number, absolute: number) {
		this.gfx.rotation += delta * 0.001;
	}
}

new LoopExample(<HTMLCanvasElement>document.getElementById('gameCanvas'));