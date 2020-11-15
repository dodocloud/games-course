import * as PIXI from 'pixi.js';
import { PIXIExample, getBaseUrl } from '../utils/APHExample';

export class Button extends PIXIExample {
	private sonic: PIXI.Sprite;
	private animRunning = false;

	load() {
		let texture = PIXI.Texture.from(`${getBaseUrl()}/assets/02-pixi-intro/sonic.png`);
		this.sonic = new PIXI.Sprite(texture); // or PIXI.Sprite.from(<url>)
		this.sonic.position.set(this.app.screen.width / 2, this.app.screen.height / 2);
		this.sonic.anchor.set(0.5);

		
		this.sonic.interactive = true;
		this.sonic.buttonMode = true;

		this.sonic.on('pointerdown', () => {
			this.animRunning = !this.animRunning;
		});

		this.app.stage.addChild(this.sonic);
	}

	update(deltaTime: number) {
		if (this.animRunning) {
			this.sonic.rotation += deltaTime * 0.01;
		}
	}
}