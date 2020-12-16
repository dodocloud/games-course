import * as ECS from '../../libs/pixi-ecs';
import { ECSExample, getBaseUrl } from '../utils/APHExample';

export class BitmapText extends ECSExample {

	load() {
		this.engine.app.loader
			.reset()
			.add(`${getBaseUrl()}/assets/02-pixi-intro/bitmap-font/jupiter.fnt`)
			.load(() => {
				const text = new ECS.BitmapText('test', 'hello world', 'Jupiter Crash BRK', 80, 0xFF0000);
				text.position.set(this.engine.app.screen.width / 2, this.engine.app.screen.height / 2);
				text.anchor = 0.5;
				text.addComponent(new ECS.FuncComponent('').doOnUpdate(() => text.rotation += 0.1));
				this.engine.scene.stage.addChild(text);
			});
	}
}
