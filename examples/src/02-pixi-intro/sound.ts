import * as PIXI from 'pixi.js';
import PIXISound from 'pixi-sound';
import { PIXIExample, getBaseUrl } from '../utils/APHExample';
export class Sound extends PIXIExample {
	
	sonic: PIXI.Sprite;
	
	load() {
		this.sonic = PIXI.Sprite.from(`${getBaseUrl()}/assets/02-pixi-intro/sonic.png`);
		this.sonic.position.set(this.app.screen.width / 2, this.app.screen.height / 2);
		this.sonic.anchor.set(0.5);

		this.sonic.interactive = true;
		this.sonic.buttonMode = true;

		PIXISound.add('sound', `${getBaseUrl()}/assets/02-pixi-intro/sound.mp3`);

		this.sonic.on('pointerdown', () => {
			PIXISound.play('sound')
		});
		this.app.stage.addChild(this.sonic);
	}

	update() {
		// no-op
	}
}