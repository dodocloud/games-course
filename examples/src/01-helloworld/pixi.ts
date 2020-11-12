import * as PIXI from 'pixi.js';
import { PIXIExample, getBaseUrl } from '../utils/APHExample';


export class PixiHelloWorld extends PIXIExample {

	private creature: PIXI.Sprite;

	load() {
		// load a sprite
		this.creature = PIXI.Sprite.from(`${getBaseUrl()}/assets/01-helloworld/crash.png`);
		// set anchor to the center
		this.creature.anchor.set(0.5);
		// set position to the center of the screen
		this.creature.x = this.app.screen.width / 2;
		this.creature.y = this.app.screen.height / 2;

		// stage is a root element of the scene graph
		this.app.stage.addChild(this.creature);
	}

	// game loop, invoked 60times per second
	update(deltaTime: number) {
		this.creature.rotation += 0.01 * deltaTime;
	}
}