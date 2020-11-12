import * as PIXI from 'pixi.js';
import { PIXIExample } from '../utils/APHExample';
export class Loop extends PIXIExample {

	private lastTime = 0;
	private gameTime = 0;
	private running = true;


	gfx: PIXI.Graphics;
	animFrameRequest: number;

    init(canvas: HTMLCanvasElement | string) {
		super.init(canvas, true);
	}

	load() {
		this.gfx = new PIXI.Graphics();
		this.gfx.position.set(400, 300);
		this.gfx.pivot.set(100, 100);
		this.gfx.beginFill(0xFF0000);
		this.gfx.drawRect(0, 0, 200, 200);
		this.gfx.endFill();
		this.app.stage.addChild(this.gfx);

		this.app.ticker.autoStart = false;
		this.app.ticker.stop();
		this.loop(performance.now());
	}

	loop(time: number) {
		let dt = Math.min(time - this.lastTime, 100);
		this.lastTime = time;
		this.gameTime += dt;

		this.performUpdate(16, this.gameTime);

		if (this.running) {
			this.app.ticker.update(time);
			this.animFrameRequest = requestAnimationFrame((time) => this.loop(time));
		}
	}

	performUpdate(delta: number, absolute: number) {
		this.gfx.rotation += delta * 0.001;
	}

	destroy() {
		this.app.destroy();
		cancelAnimationFrame(this.animFrameRequest);
		this.running = false;
	}

	update(delta: number) {
		// no-op
	}
}