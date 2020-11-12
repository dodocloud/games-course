import * as PIXI from 'pixi.js';
import { PIXIExample, getBaseUrl } from '../utils/APHExample';

const ANIM_URL = `${getBaseUrl()}/assets/02-pixi-intro/warrior/warrior.json`;

export class Animation extends PIXIExample {

	load() {
		// use an asynchronous loader
		this.app.loader
			.add(ANIM_URL)
			.load(() => { // wait for the spritesheet to be loaded
				let sheet = this.app.loader.resources[ANIM_URL].spritesheet;
				// select an animation
				let animation = new PIXI.AnimatedSprite(sheet.animations['warrior']);
				animation.animationSpeed = 0.167;
				animation.loop = true;
				animation.play();
				animation.scale.set(0.5);
				animation.position.set(this.app.screen.width / 2, this.app.screen.height / 2);
				animation.anchor.set(0.5);
				this.app.stage.addChild(animation);
			});
	}

	update(deltaTime: number) {
		// no-op
	}
}